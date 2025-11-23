# 📚 Snippets SQL - Biblioteca de Código Reutilizável

Coleção de templates e snippets SQL para acelerar desenvolvimento seguindo a **Filosofia SQL-First**.

---

## 📂 Estrutura

```
snippets/
├── templates/              ← Templates base para criar novas funções
│   ├── api_function_template.sql
│   ├── trigger_template.sql (futuro)
│   └── view_template.sql (futuro)
├── common/                 ← Snippets comuns reutilizáveis
│   ├── jsonb_operations.sql
│   ├── date_calculations.sql (futuro)
│   └── text_search.sql (futuro)
└── README.md
```

---

## 🚀 Como Usar

### 1. Criar Nova Função API

```bash
# Copiar template
cp snippets/templates/api_function_template.sql \
   backup/SQL_Functions/api/api_minha_funcao.sql

# Editar e personalizar
code backup/SQL_Functions/api/api_minha_funcao.sql

# Rodar no Supabase Dashboard
```

### 2. Usar Snippet JSONB

```bash
# Abrir arquivo de snippets
cat snippets/common/jsonb_operations.sql

# Copiar snippet desejado
# Colar e adaptar para seu caso
```

---

## 📋 Templates Disponíveis

### `api_function_template.sql`
Template completo para criar função API (HTTP):
- ✅ DROP de versões antigas
- ✅ Validação de parâmetros
- ✅ Tratamento de exceções
- ✅ Retorno JSON padronizado
- ✅ Documentação completa
- ✅ Exemplo de chamada HTTP

**Quando usar:**
- Criar endpoints HTTP para serem chamados do frontend
- Funções que retornam dados (SELECT)
- Funções que modificam dados (INSERT/UPDATE/DELETE)

---

## 🔧 Snippets Comuns Disponíveis

### `jsonb_operations.sql`
10 snippets para trabalhar com JSONB:
1. Adicionar item a array
2. Atualizar item específico
3. Remover item
4. Buscar em JSONB
5. Agregar dados
6. Criar índices
7. Validar estrutura
8. Merge de objects
9. Transformar tabela em JSONB
10. Filtrar arrays

**Quando usar:**
- Ao invés de criar tabela nova (preferir JSONB!)
- Para configurações, metadados, listas pequenas
- Dados semi-estruturados

---

## 💡 Exemplos Práticos

### Exemplo 1: Criar API para Buscar Usuário

```bash
# 1. Copiar template
cp snippets/templates/api_function_template.sql \
   backup/SQL_Functions/api/api_get_user.sql

# 2. Editar:
# - Trocar "api_nome_da_operacao" por "api_get_user"
# - Adicionar lógica de busca
# - Ajustar parâmetros

# 3. Resultado:
```

```sql
DROP FUNCTION IF EXISTS api_get_user(text);

CREATE OR REPLACE FUNCTION api_get_user(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'success', true,
    'user', row_to_json(u.*)
  ) INTO v_result
  FROM users u
  WHERE u.email = p_email;

  RETURN v_result;
END;
$$;
```

### Exemplo 2: Adicionar Notificações (JSONB ao invés de tabela)

```sql
-- ❌ NÃO FAZER: Criar tabela notifications
-- CREATE TABLE notifications (...);

-- ✅ FAZER: Usar JSONB em users (copiar de jsonb_operations.sql)

-- Adicionar notificação
UPDATE users
SET notifications = notifications || jsonb_build_object(
  'id', gen_random_uuid(),
  'message', 'Bem-vindo!',
  'type', 'success',
  'read', false,
  'created_at', now()
)
WHERE email = 'user@example.com';

-- Buscar notificações não lidas
SELECT
  (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(notifications) elem
    WHERE (elem->>'read')::boolean = false
  ) as unread
FROM users
WHERE email = 'user@example.com';
```

---

## 🎯 Filosofia SQL-First

**Lembre-se sempre:**
1. **SQL resolve 90%** dos problemas de backend
2. **JSONB** é melhor que criar tabela nova (na maioria dos casos)
3. **DROP antes de CREATE** (sempre!)
4. **Menos tabelas** = melhor
5. **Edge Functions** só quando REALMENTE necessário

---

## 📖 Ver Também

- `/FILOSOFIA_DESENVOLVIMENTO.md` - Filosofia completa
- `/Supabase/backup/SQL_Functions/` - Funções criadas
- `@supabase-mcp-expert` - Agente que segue esta filosofia

---

## 🚀 Contribuir

Ao criar função útil e reutilizável:
1. Generalize o código
2. Adicione comentários
3. Salve em `snippets/common/`
4. Atualize este README

---

**Última atualização:** 28 Out 2025
