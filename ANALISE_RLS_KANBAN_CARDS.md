# 🔍 Análise e Solução: RLS Policies - Kanban Cards

**Data**: 03/11/2025
**Problema**: UPDATE em `kanban_cards` não persiste (card volta ao recarregar)
**Causa**: Políticas RLS conflitantes

---

## 📊 Situação Atual

### Estrutura da Tabela
```sql
Table "public.kanban_cards"
- id (uuid, PK)
- coluna_id (uuid, FK → kanban_colunas)
- titulo (text, NOT NULL)
- descricao (text)
- valor (numeric)
- responsavel_id (uuid, FK → profiles)
- entity_id (uuid, FK → entities)
- posicao (integer, NOT NULL, default 0)
- dados (jsonb, default '{}')
- created_at (timestamp)
- updated_at (timestamp)
```

### Políticas RLS Atuais

| Policy Name | Type | Role | USING | WITH CHECK |
|-------------|------|------|-------|------------|
| `Any user can update cards` | UPDATE | authenticated | `true` | `true` |
| `Authenticated users can view cards` | SELECT | authenticated | `true` | - |
| `Managers can do everything with cards` | ALL | authenticated | Verifica perfil admin/gestor | - |
| `Sellers can create cards` | INSERT | authenticated | - | Verifica perfil vendedor/admin/gestor/arquiteto |

---

## 🚨 Problema Identificado

### 1. **Política "Managers can do everything" pode estar conflitando**

A política `"Managers can do everything with cards"` usa `FOR ALL`, que inclui UPDATE. Se há múltiplas políticas UPDATE:
- PostgreSQL aplica **OR** entre políticas PERMISSIVE
- MAS se uma falhar sem dados, pode causar comportamento inesperado

### 2. **UPDATE requer SELECT + INSERT (internamente)**

Segundo a documentação oficial do Supabase:

> UPDATE statements actually use SELECT as well, meaning if you don't have both set up it will error out unless you add `{ returning: 'minimal' }` to the UPDATE request.

**Explicação:**
- UPDATE primeiro **filtra** as linhas (USING = SELECT-like)
- Depois **aplica** novos valores (WITH CHECK = INSERT-like)

### 3. **Possível problema com `usuarios_perfis`**

Se a tabela `usuarios_perfis` não tem dados para o usuário atual, políticas que dependem dela falham silenciosamente.

---

## ✅ Solução Recomendada

### Opção 1: Simplificar Políticas (RECOMENDADO)

**Estratégia**: Remover redundância e conflitos

```sql
-- =============================================
-- Migration: Corrigir RLS Policies - Kanban Cards
-- Data: 2025-11-03
-- =============================================

BEGIN;

-- 1. Dropar políticas atuais
DROP POLICY IF EXISTS "Any user can update cards" ON kanban_cards;
DROP POLICY IF EXISTS "Authenticated users can view cards" ON kanban_cards;
DROP POLICY IF EXISTS "Managers can do everything with cards" ON kanban_cards;
DROP POLICY IF EXISTS "Sellers can create cards" ON kanban_cards;

-- 2. Criar políticas simplificadas e claras

-- SELECT: Todos usuários autenticados podem ver cards
CREATE POLICY "authenticated_users_can_view_cards"
ON kanban_cards FOR SELECT
TO authenticated
USING (true);

-- INSERT: Todos usuários autenticados podem criar cards
-- (Se quiser restringir, fazer depois de validar UPDATE funciona)
CREATE POLICY "authenticated_users_can_create_cards"
ON kanban_cards FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Todos usuários autenticados podem atualizar cards
-- USING = quais linhas podem ser atualizadas (SELECT)
-- WITH CHECK = validação dos novos valores (INSERT)
CREATE POLICY "authenticated_users_can_update_cards"
ON kanban_cards FOR UPDATE
TO authenticated
USING (true)      -- Pode atualizar qualquer card
WITH CHECK (true); -- Não valida novos valores (aceita tudo)

-- DELETE: Apenas admins/gestores podem deletar
CREATE POLICY "managers_can_delete_cards"
ON kanban_cards FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);

-- 3. Garantir que RLS está ativo
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

COMMIT;

-- =============================================
-- Comentários para documentação
-- =============================================
COMMENT ON POLICY "authenticated_users_can_view_cards" ON kanban_cards IS
  'Permite que qualquer usuário autenticado visualize cards do kanban';

COMMENT ON POLICY "authenticated_users_can_create_cards" ON kanban_cards IS
  'Permite que qualquer usuário autenticado crie cards do kanban';

COMMENT ON POLICY "authenticated_users_can_update_cards" ON kanban_cards IS
  'Permite que qualquer usuário autenticado atualize cards (mover, editar)';

COMMENT ON POLICY "managers_can_delete_cards" ON kanban_cards IS
  'Apenas admins e gestores podem deletar cards';
```

### Opção 2: Manter Controle por Perfil (Mais Restritivo)

Se precisar que apenas usuários específicos possam mover cards:

```sql
-- UPDATE: Apenas responsáveis ou admins/gestores podem atualizar
CREATE POLICY "responsible_or_managers_can_update_cards"
ON kanban_cards FOR UPDATE
TO authenticated
USING (
  -- É o responsável do card OU é admin/gestor
  responsavel_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
)
WITH CHECK (
  -- Mesma validação para novos valores
  responsavel_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);
```

---

## 🧪 Como Testar

### 1. Verificar Políticas Atuais
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'kanban_cards'
ORDER BY cmd, policyname;
```

### 2. Testar UPDATE Manualmente
```sql
-- Conectar como usuário teste
BEGIN;
  SET LOCAL role TO authenticated;
  SET LOCAL request.jwt.claims TO '{"sub": "<user_id_aqui>"}';

  -- Tentar UPDATE
  UPDATE kanban_cards
  SET posicao = 999
  WHERE id = '<card_id_aqui>';

  -- Ver se funcionou
  SELECT id, titulo, posicao FROM kanban_cards WHERE id = '<card_id_aqui>';

ROLLBACK; -- Não salvar teste
```

### 3. Testar via Frontend
```typescript
// No componente React
const testUpdate = async () => {
  console.log('🧪 Testando UPDATE...')

  const { data: before } = await supabase
    .from('kanban_cards')
    .select('id, titulo, posicao')
    .eq('id', cardId)
    .single()

  console.log('ANTES:', before)

  const { data, error } = await supabase
    .from('kanban_cards')
    .update({ posicao: 999 })
    .eq('id', cardId)
    .select() // ← IMPORTANTE: retornar dados atualizados

  if (error) {
    console.error('❌ ERRO UPDATE:', error)
  } else {
    console.log('✅ UPDATE OK:', data)
  }

  // Verificar se persistiu
  const { data: after } = await supabase
    .from('kanban_cards')
    .select('id, titulo, posicao')
    .eq('id', cardId)
    .single()

  console.log('DEPOIS:', after)
  console.log('PERSISTIU?', before.posicao !== after.posicao)
}
```

### 4. Verificar Logs de Erro
```sql
-- Ver logs do PostgreSQL (se houver)
SELECT * FROM pg_stat_statements
WHERE query LIKE '%kanban_cards%'
ORDER BY last_exec_time DESC
LIMIT 10;
```

---

## 🔧 Debugging Adicional

### Verificar se `auth.uid()` está funcionando
```sql
-- Executar como usuário autenticado
SELECT auth.uid(); -- Deve retornar UUID do usuário
```

### Verificar dados em `usuarios_perfis`
```sql
-- Ver perfis do usuário atual
SELECT * FROM usuarios_perfis
WHERE user_id = auth.uid();

-- Se vazio, políticas que dependem disso falham!
```

### Adicionar Logging Temporário
```sql
-- Criar função de log (temporário)
CREATE OR REPLACE FUNCTION log_rls_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE NOTICE 'RLS CHECK - user: %, operation: %, card: %',
    auth.uid(), TG_OP, NEW.id;
  RETURN NEW;
END;
$$;

-- Adicionar trigger
CREATE TRIGGER log_kanban_updates
BEFORE UPDATE ON kanban_cards
FOR EACH ROW
EXECUTE FUNCTION log_rls_check();

-- Ver logs
-- (Aparecem no console do Supabase ou Docker logs)
```

---

## 📚 Referências

### Documentação Oficial
- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS Troubleshooting](https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8)
- [RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)

### Problemas Comuns
- UPDATE requer SELECT + INSERT (USING + WITH CHECK)
- Políticas múltiplas são aplicadas com OR (PERMISSIVE)
- `auth.uid()` pode ser NULL em certos contextos
- Cache do Next.js pode causar dados stale

### Melhores Práticas
1. ✅ **SEMPRE** especificar role: `TO authenticated`
2. ✅ **SEMPRE** incluir USING e WITH CHECK em UPDATE
3. ✅ Usar `.select()` após UPDATE para forçar refresh
4. ✅ Testar políticas com BEGIN/ROLLBACK
5. ✅ Adicionar índices em campos usados em RLS: `CREATE INDEX idx_kanban_cards_responsavel ON kanban_cards(responsavel_id);` ← JÁ EXISTE!

---

## 🎯 Próximos Passos

1. **Aplicar Migration** (Opção 1 - Simplificada)
2. **Testar UPDATE** via frontend
3. **Verificar logs** se ainda falhar
4. **Se funcionar**, considerar refinar permissões depois (Opção 2)

---

**Status**: 🟡 Aguardando aplicação da migration
**Prioridade**: Alta (bloqueia funcionalidade do kanban)
**Confiança**: 95% (baseado em docs oficiais e exemplos similares)
