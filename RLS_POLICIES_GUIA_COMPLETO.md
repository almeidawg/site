# 📚 Guia Completo: Row Level Security (RLS) Policies - Supabase

**Baseado em**: Documentação oficial Supabase + Resolução de problema real
**Data**: 03/11/2025
**Versão**: 1.0

---

## 🎯 O Que É RLS?

**Row Level Security (RLS)** é um sistema do PostgreSQL que controla o acesso a **linhas individuais** de uma tabela baseado em políticas (policies).

### Analogia
Imagine um prédio com apartamentos:
- **Sem RLS**: Todos veem e acessam todos apartamentos
- **Com RLS**: Cada pessoa só vê/acessa seu próprio apartamento (ou conforme regras definidas)

---

## 📖 Conceitos Fundamentais

### 1. **Políticas (Policies)**

Uma policy define **quem** pode fazer **o quê** em uma tabela.

```sql
CREATE POLICY "nome_descritivo"
ON nome_tabela
FOR operacao          -- SELECT, INSERT, UPDATE, DELETE, ALL
TO role               -- authenticated, anon, etc
USING (condicao)      -- Filtra linhas (SELECT-like)
WITH CHECK (condicao) -- Valida novos valores (INSERT-like)
```

### 2. **Operações e Cláusulas**

| Operação | USING | WITH CHECK | Quando Usa |
|----------|-------|------------|------------|
| SELECT | ✅ Obrigatório | ❌ Não usa | Filtra linhas visíveis |
| INSERT | ❌ Não usa | ✅ Obrigatório | Valida novos dados |
| UPDATE | ✅ Obrigatório | ✅ Obrigatório | Filtra E valida |
| DELETE | ✅ Obrigatório | ❌ Não usa | Filtra linhas deletáveis |
| ALL | ✅ Obrigatório | ✅ Obrigatório | Aplica a todas operações |

### 3. **Roles (Papéis)**

- `authenticated`: Usuários logados
- `anon`: Usuários não logados (visitantes)
- `service_role`: Bypassa RLS (admin total)

---

## 🚨 DESCOBERTA CRÍTICA: UPDATE É ESPECIAL!

### O Problema

**UPDATE precisa de USING + WITH CHECK!**

```sql
-- ❌ ERRADO: Vai falhar silenciosamente!
CREATE POLICY "users_can_update"
ON my_table FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ✅ CORRETO: Funciona!
CREATE POLICY "users_can_update"
ON my_table FOR UPDATE
TO authenticated
USING (user_id = auth.uid())       -- ← Filtra linhas (SELECT)
WITH CHECK (user_id = auth.uid()); -- ← Valida novos valores (INSERT)
```

### Por Quê?

Segundo a documentação oficial:

> UPDATE statements actually use SELECT as well, meaning if you don't have both set up it will error out unless you add `{ returning: 'minimal' }` to the UPDATE request.

**Explicação:**
1. `USING` filtra quais linhas podem ser atualizadas (como SELECT)
2. `WITH CHECK` valida os novos valores antes de salvar (como INSERT)
3. **Ambos são necessários!**

---

## ✅ Exemplos Práticos

### 1. SELECT: Todos Podem Ver

```sql
CREATE POLICY "anyone_can_view"
ON profiles FOR SELECT
TO authenticated
USING (true); -- Sem filtro = todos veem tudo
```

### 2. INSERT: Apenas Próprio Perfil

```sql
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid()); -- Só pode criar seu próprio perfil
```

### 3. UPDATE: Apenas Próprio Perfil

```sql
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())       -- Só pode atualizar seu perfil
WITH CHECK (id = auth.uid()); -- E não pode mudar o ID
```

### 4. DELETE: Apenas Admins

```sql
CREATE POLICY "admins_can_delete"
ON profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

### 5. UPDATE: Permissivo (Todos Autenticados)

```sql
-- Caso de uso: Kanban colaborativo
CREATE POLICY "authenticated_can_update_cards"
ON kanban_cards FOR UPDATE
TO authenticated
USING (true)       -- Qualquer linha
WITH CHECK (true); -- Qualquer valor
```

---

## 🎓 Padrões Comuns

### Padrão 1: Dados Privados (User-Owned)

```sql
-- Cada usuário vê/edita apenas seus dados
CREATE POLICY "users_own_data" ON my_table
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

### Padrão 2: Dados Públicos + Edição Privada

```sql
-- Todos veem, apenas dono edita
CREATE POLICY "public_read" ON posts
FOR SELECT TO authenticated USING (true);

CREATE POLICY "author_write" ON posts
FOR UPDATE TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());
```

### Padrão 3: Verificação de Perfil/Role

```sql
-- Apenas admins/gestores fazem X
CREATE POLICY "admins_only" ON sensitive_data
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
  )
);
```

### Padrão 4: Multi-Tenancy (Organizações)

```sql
-- Usuários veem dados de sua organização
CREATE POLICY "org_members_only" ON documents
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT org_id FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

---

## 🔧 Boas Práticas

### 1. SEMPRE Especifique o Role

```sql
-- ❌ RUIM: Aplica para todos (anon + authenticated)
CREATE POLICY "my_policy" ON table
USING (true);

-- ✅ BOM: Aplica apenas autenticados
CREATE POLICY "my_policy" ON table
TO authenticated
USING (true);
```

**Por quê?** Evita processamento desnecessário e melhora performance.

### 2. Nomes Descritivos

```sql
-- ❌ RUIM
CREATE POLICY "policy1" ON table...
CREATE POLICY "select_policy" ON table...

-- ✅ BOM
CREATE POLICY "authenticated_users_can_view_own_posts" ON posts...
CREATE POLICY "admins_can_delete_any_comment" ON comments...
```

### 3. Índices em Campos de RLS

```sql
-- Se policy usa user_id:
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Melhora performance 10-100x em tabelas grandes!
```

### 4. Documentação com Comentários

```sql
CREATE POLICY "..." ON table...

COMMENT ON POLICY "..." ON table IS
  'Permite que usuários autenticados atualizem apenas seus próprios dados.
   Usado em: dashboard, perfil de usuário.
   Performance: índice em user_id garante <10ms.';
```

### 5. Testar Antes de Aplicar

```sql
-- SEMPRE usar BEGIN/ROLLBACK em testes!
BEGIN;
  -- Criar/modificar policy
  -- Testar SELECT, INSERT, UPDATE, DELETE
  -- Verificar que funciona como esperado
ROLLBACK; -- Não salvar teste
```

---

## 🐛 Debugging RLS

### Problema 1: UPDATE Não Funciona

**Sintomas:**
- Frontend não mostra erros
- UPDATE parece funcionar mas dados voltam ao recarregar

**Causa:** Faltando `USING` ou `WITH CHECK`

**Solução:**
```sql
-- Verificar policy
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'minha_tabela'
AND cmd = 'UPDATE';

-- Se with_check é NULL ou qual é NULL, adicionar:
DROP POLICY IF EXISTS "policy_name" ON minha_tabela;
CREATE POLICY "policy_name" ON minha_tabela
FOR UPDATE TO authenticated
USING (true)       -- ← ADICIONAR
WITH CHECK (true); -- ← ADICIONAR
```

### Problema 2: Policy Não Se Aplica

**Causa:** Role errado (policy é `TO anon` mas usuário é `authenticated`)

**Solução:**
```sql
-- Verificar role da policy
SELECT policyname, roles
FROM pg_policies
WHERE tablename = 'minha_tabela';

-- Corrigir se necessário
DROP POLICY IF EXISTS "policy_name" ON minha_tabela;
CREATE POLICY "policy_name" ON minha_tabela
TO authenticated -- ← Corrigir role
USING (...);
```

### Problema 3: auth.uid() Retorna NULL

**Causa:** Usuário não está autenticado ou sessão expirou

**Verificar:**
```sql
-- No SQL Editor do Supabase Studio:
SELECT auth.uid(); -- Deve retornar UUID

-- Se NULL, verificar frontend:
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user) // Deve ter dados
```

### Problema 4: Policy Muito Lenta

**Causa:** Falta índice em campos usados na policy

**Solução:**
```sql
-- Identificar campos usados
-- Exemplo: USING (user_id = auth.uid())

-- Criar índice
CREATE INDEX idx_table_user_id ON my_table(user_id);

-- Testar performance
EXPLAIN ANALYZE
SELECT * FROM my_table WHERE user_id = '<uuid>';
```

---

## 📊 Comandos Úteis

### Ver Todas as Policies de uma Tabela

```sql
SELECT
  policyname,
  cmd,
  roles,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'minha_tabela'
ORDER BY cmd;
```

### Ver Políticas Formatadas (Mais Legível)

```sql
SELECT
  policyname AS "Policy",
  cmd AS "Op",
  array_to_string(roles, ', ') AS "Roles",
  CASE
    WHEN qual IS NULL THEN 'N/A'
    ELSE left(qual, 50) || '...'
  END AS "USING",
  CASE
    WHEN with_check IS NULL THEN 'N/A'
    ELSE left(with_check, 50) || '...'
  END AS "WITH CHECK"
FROM pg_policies
WHERE tablename = 'minha_tabela';
```

### Verificar se RLS Está Ativo

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'minha_tabela';
-- rowsecurity = true → RLS ativo
```

### Ativar RLS

```sql
ALTER TABLE minha_tabela ENABLE ROW LEVEL SECURITY;
```

### Desativar RLS (CUIDADO!)

```sql
ALTER TABLE minha_tabela DISABLE ROW LEVEL SECURITY;
-- ⚠️ Só fazer em desenvolvimento/testes!
```

---

## 🧪 Template de Teste

```sql
-- =============================================
-- Teste: Nome da Feature
-- =============================================

BEGIN;

-- Setup
INSERT INTO my_table (id, user_id, data)
VALUES (gen_random_uuid(), '<user_id>', 'teste');

-- Teste 1: SELECT deve retornar 1 linha
DO $$
DECLARE
  row_count integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM my_table;
  IF row_count = 1 THEN
    RAISE NOTICE '✅ SELECT OK';
  ELSE
    RAISE EXCEPTION '❌ SELECT falhou';
  END IF;
END $$;

-- Teste 2: UPDATE deve funcionar
UPDATE my_table SET data = 'atualizado';

DO $$
DECLARE
  updated_data text;
BEGIN
  SELECT data INTO updated_data FROM my_table LIMIT 1;
  IF updated_data = 'atualizado' THEN
    RAISE NOTICE '✅ UPDATE OK';
  ELSE
    RAISE EXCEPTION '❌ UPDATE falhou';
  END IF;
END $$;

-- Cleanup
ROLLBACK;
```

---

## 🎯 Checklist de RLS

### Ao Criar uma Tabela

- [ ] Habilitar RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- [ ] Criar policy SELECT (quem vê?)
- [ ] Criar policy INSERT (quem cria?)
- [ ] Criar policy UPDATE (quem atualiza?)
- [ ] Criar policy DELETE (quem deleta?)
- [ ] **UPDATE deve ter USING + WITH CHECK!**
- [ ] Especificar role: `TO authenticated`
- [ ] Criar índices em campos usados nas policies
- [ ] Adicionar comentários explicativos
- [ ] Criar testes `.test.sql`
- [ ] Validar com BEGIN/ROLLBACK

### Ao Modificar Policies

- [ ] Dropar policy antiga: `DROP POLICY IF EXISTS ...`
- [ ] Criar policy nova
- [ ] Testar SELECT, INSERT, UPDATE, DELETE
- [ ] Verificar que não quebrou funcionalidades existentes
- [ ] Commitar migration

---

## 📚 Referências

### Documentação Oficial
- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [RLS Troubleshooting](https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8)
- [RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)

### Exemplos Práticos
- [Supabase Examples - RLS](https://github.com/supabase/supabase/tree/master/examples)
- [GitHub Discussions - RLS](https://github.com/orgs/supabase/discussions?discussions_q=label%3Arls)

### Caso Real Resolvido
- `SOLUCAO_RLS_KANBAN_CARDS.md` - Problema de UPDATE não persistindo
- `20251103140000_corrigir_rls_kanban_cards.sql` - Migration aplicada

---

## 🎓 Resumo Executivo

### O Mínimo que Você Precisa Saber

1. **RLS controla acesso a LINHAS** (não tabelas inteiras)
2. **UPDATE precisa de USING + WITH CHECK** (não esqueça!)
3. **SEMPRE especifique role**: `TO authenticated`
4. **Crie índices** em campos usados nas policies
5. **Teste com BEGIN/ROLLBACK** antes de aplicar
6. **Use auth.uid()** para identificar usuário atual
7. **Políticas são aplicadas com OR** (múltiplas policies permissive)

---

**Última atualização**: 03/11/2025
**Baseado em**: Documentação oficial + Caso real resolvido
**Projeto**: WG CRM
**Autor**: Claude Code
