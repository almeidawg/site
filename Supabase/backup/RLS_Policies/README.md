# 🔒 RLS Policies - Row Level Security

Políticas de segurança em nível de linha para controlar acesso aos dados.

---

## 📋 O que são RLS Policies?

**Row Level Security (RLS)** é um recurso do PostgreSQL que permite controlar quem pode acessar quais linhas de uma tabela.

### Como funciona:

```
Usuário faz query → RLS verifica policy → Retorna apenas linhas permitidas
```

### Exemplo:

```sql
-- SEM RLS: Usuário vê TODOS os títulos
SELECT * FROM titulos_financeiros;
→ Retorna 1000 títulos (de todas as empresas)

-- COM RLS: Usuário vê APENAS títulos da sua empresa
SELECT * FROM titulos_financeiros;
→ Retorna 50 títulos (apenas da empresa do usuário)
```

---

## 🎯 Políticas Implementadas

### **profiles**

```sql
✅ "Users can view own profile"
   → Usuários veem apenas seu próprio perfil

✅ "Users can update own profile"
   → Usuários editam apenas seu próprio perfil

✅ "Admins can view all profiles"
   → Admins veem todos os perfis
```

### **empresas**

```sql
✅ "Authenticated users can view companies"
   → Todos usuários autenticados podem ver empresas

✅ "Admins can manage companies"
   → Apenas admins podem criar/editar empresas
```

### **titulos_financeiros**

```sql
✅ "Users can view titles of accessible companies"
   → Usuários veem títulos de empresas que têm acesso
   → Admins veem tudo

✅ "Financial users can manage titles"
   → Perfis 'financeiro', 'gestor' e 'admin' podem criar/editar
```

### **entities**

```sql
✅ "Authenticated users can view entities"
   → Todos usuários autenticados podem ver clientes/leads

✅ "Authenticated users can create entities"
   → Todos usuários autenticados podem criar entities

✅ "Authenticated users can update entities"
   → Todos usuários autenticados podem editar entities
```

### **kanban_cards**

```sql
✅ "Authenticated users can view cards"
   → Todos veem cards do Kanban

✅ "Responsible user can edit own cards"
   → Responsável pode editar seus cards

✅ "Managers can edit any card"
   → Gestores e admins podem editar qualquer card

✅ "Sellers can create cards"
   → Vendedores, arquitetos, gestores e admins podem criar cards
```

---

## 🔐 Perfis de Usuário

Sistema de perfis definido em `usuarios_perfis.perfil`:

| Perfil | Permissões |
|--------|-----------|
| **admin** | Acesso total a tudo |
| **gestor** | Acesso a pipeline, financeiro, relatórios |
| **vendedor** | Criar/editar oportunidades, propostas |
| **arquiteto** | Criar/editar oportunidades, gerenciar obras |
| **financeiro** | Acesso completo ao módulo financeiro |
| **readonly** | Apenas visualização (padrão novos usuários) |

---

## 🛠️ Como Testar RLS

### 1. Habilitar RLS em uma tabela:

```sql
ALTER TABLE minha_tabela ENABLE ROW LEVEL SECURITY;
```

### 2. Criar policy:

```sql
CREATE POLICY "Users can view own data"
  ON minha_tabela
  FOR SELECT
  USING (user_id = auth.uid());
```

### 3. Testar no SQL Editor:

```sql
-- Logar como usuário (substitua o UUID)
SELECT set_config('request.jwt.claims', '{"sub": "uuid-do-usuario"}', true);

-- Fazer query
SELECT * FROM minha_tabela;
-- Retorna apenas linhas onde user_id = uuid-do-usuario
```

### 4. Testar no frontend:

```javascript
const { data, error } = await supabase
  .from('minha_tabela')
  .select('*');

// RLS é aplicado automaticamente!
// Usuário vê apenas dados permitidos
```

---

## 🚨 Importante

### ⚠️ Service Role Key

A **service_role_key** do Supabase **IGNORA RLS**!

```javascript
// ❌ NUNCA use service_role_key no frontend
const supabase = createClient(url, SERVICE_ROLE_KEY);
// Este cliente tem acesso TOTAL ao banco

// ✅ Use anon_key no frontend
const supabase = createClient(url, ANON_KEY);
// Este cliente respeita RLS
```

### 🔒 Quando usar SECURITY DEFINER

Funções com `SECURITY DEFINER` executam com permissões do dono (geralmente superuser).

```sql
-- ✅ Usar SECURITY DEFINER quando a função precisa:
-- - Acessar tabelas que o usuário não tem permissão
-- - Fazer operações administrativas
-- - Executar lógica que ignora RLS temporariamente

CREATE FUNCTION minha_funcao()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Executa com permissões elevadas
SET search_path = public  -- ← Importante para segurança
AS $$ ... $$;
```

---

## 📚 Referências

- [Documentação RLS PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Documentação RLS Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Exemplos de Policies](https://supabase.com/docs/guides/auth/row-level-security#examples)

---

**Última atualização:** 30 Out 2025
