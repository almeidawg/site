# 📂 Estrutura de Pastas Supabase - Projeto WG

Organização completa dos arquivos SQL do projeto.

---

## 🗂️ Estrutura Visual

```
Supabase/
│
├── migrations/                          ← MIGRATIONS (ordem cronológica)
│   ├── 001_criar_tabelas_base.sql      ← Profiles, empresas
│   ├── 002_criar_tabelas_financeiro.sql ← Financeiro completo
│   ├── 003_criar_tabelas_kanban_pipeline.sql ← Kanban e entities
│   ├── 004_criar_views.sql             ← Views para consultas
│   └── 005_habilitar_rls.sql           ← Row Level Security
│
├── backup/                              ← FUNÇÕES E BACKUPS
│   │
│   ├── SQL_Functions/                   ← Funções SQL organizadas
│   │   │
│   │   ├── api/                         ← Funções HTTP (RPC)
│   │   │   ├── 001_api_criar_oportunidade.sql
│   │   │   ├── 002_api_mover_card_kanban.sql
│   │   │   └── 003_api_resumo_financeiro.sql
│   │   │
│   │   ├── triggers/                    ← Triggers automáticos
│   │   │   ├── 001_trigger_atualizar_status_titulo.sql
│   │   │   └── 002_trigger_criar_profile_apos_signup.sql
│   │   │
│   │   ├── views/                       ← Views customizadas
│   │   │   └── (incluídas em migrations/004)
│   │   │
│   │   └── edge_functions/              ← Edge Functions (futuro)
│   │       └── (vazio - usar APENAS quando necessário)
│   │
│   └── RLS_Policies/                    ← Políticas de segurança
│       └── README.md                    ← Documentação RLS
│
├── snippets/                            ← TEMPLATES REUTILIZÁVEIS
│   ├── templates/
│   │   └── api_function_template.sql    ← Template base
│   └── common/
│       └── jsonb_operations.sql         ← Snippets JSONB
│
└── README_ESTRUTURA.md                  ← Este arquivo
```

---

## 📋 Ordem de Execução

### **1. Migrations (executar em ordem)**

```sql
-- Projeto Supabase NOVO e LIMPO:

-- 1. Tabelas base
\i migrations/001_criar_tabelas_base.sql

-- 2. Tabelas financeiro
\i migrations/002_criar_tabelas_financeiro.sql

-- 3. Tabelas Kanban/Pipeline
\i migrations/003_criar_tabelas_kanban_pipeline.sql

-- 4. Views
\i migrations/004_criar_views.sql

-- 5. RLS Policies
\i migrations/005_habilitar_rls.sql
```

### **2. Funções SQL (instalar conforme necessário)**

```sql
-- API Functions
\i backup/SQL_Functions/api/001_api_criar_oportunidade.sql
\i backup/SQL_Functions/api/002_api_mover_card_kanban.sql
\i backup/SQL_Functions/api/003_api_resumo_financeiro.sql

-- Triggers
\i backup/SQL_Functions/triggers/001_trigger_atualizar_status_titulo.sql
-- Trigger 002 requer permissão SUPERUSER (executar manualmente)
```

---

## 🚀 Como Rodar em um Novo Projeto Supabase

### **Método 1: Via Supabase Dashboard** (Recomendado)

```
1. Acesse: https://app.supabase.com
2. Crie novo projeto
3. Vá em: SQL Editor → New Query
4. Copie conteúdo de migrations/001_criar_tabelas_base.sql
5. Execute (Run)
6. Repita para migrations/002, 003, 004, 005
7. Copie e execute funções de backup/SQL_Functions/api/
```

### **Método 2: Via CLI (Supabase CLI)**

```bash
# 1. Instalar CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref seu-projeto-ref

# 4. Aplicar migrations
supabase db push

# 5. Executar funções SQL
psql $DATABASE_URL -f backup/SQL_Functions/api/001_api_criar_oportunidade.sql
psql $DATABASE_URL -f backup/SQL_Functions/api/002_api_mover_card_kanban.sql
```

### **Método 3: Script Bash Automatizado**

```bash
#!/bin/bash
# Arquivo: Supabase/deploy.sh

SUPABASE_URL="sua-url"
SUPABASE_SERVICE_KEY="sua-service-key"

echo "🚀 Iniciando deploy do banco de dados..."

# Migrations
for file in migrations/*.sql; do
  echo "📄 Executando: $file"
  psql $SUPABASE_URL -f $file
done

# Funções API
for file in backup/SQL_Functions/api/*.sql; do
  echo "📄 Executando: $file"
  psql $SUPABASE_URL -f $file
done

# Triggers
for file in backup/SQL_Functions/triggers/*.sql; do
  echo "📄 Executando: $file"
  psql $SUPABASE_URL -f $file
done

echo "✅ Deploy concluído!"
```

---

## 📚 Descrição das Pastas

### **migrations/**

Contém **migrations do banco de dados** em ordem cronológica.

- **Numeração:** 001, 002, 003... (ordem de execução)
- **Conteúdo:** CREATE TABLE, ALTER TABLE, CREATE INDEX
- **Idempotente:** Usa `IF NOT EXISTS` para evitar erros em re-execução
- **Seed data:** Dados iniciais (empresas, colunas Kanban, plano de contas)

**Quando adicionar nova migration:**
```bash
# Criar novo arquivo
touch migrations/006_adicionar_campo_avatar.sql

# Conteúdo:
-- =============================================
-- MIGRATION: 006
-- Descrição: Adicionar campo avatar em profiles
-- Data: YYYY-MM-DD
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

---

### **backup/SQL_Functions/api/**

Contém **funções HTTP (RPC)** que podem ser chamadas via API REST.

- **Numeração:** 001, 002, 003...
- **Uso:** `POST /rest/v1/rpc/api_nome_funcao`
- **Padrão:** Sempre com `DROP FUNCTION IF EXISTS` antes de `CREATE`
- **Segurança:** `SECURITY DEFINER` quando necessário

**Como chamar do frontend:**
```javascript
const { data, error } = await supabase.rpc('api_criar_oportunidade', {
  p_titulo: 'Projeto Silva',
  p_entity_id: 'uuid-cliente',
  p_valor: 150000.00
});
```

---

### **backup/SQL_Functions/triggers/**

Contém **triggers** que executam automaticamente em eventos.

- **Numeração:** 001, 002, 003...
- **Eventos:** BEFORE/AFTER INSERT/UPDATE/DELETE
- **Uso:** Automações, validações, atualizações em cascata

**Exemplo de uso:**
```sql
-- Quando inserir lançamento, atualizar status do título automaticamente
INSERT INTO lancamentos (titulo_id, valor, data)
VALUES ('titulo-id', 5000.00, '2025-10-30');
-- Trigger dispara e atualiza status se necessário
```

---

### **backup/SQL_Functions/views/**

Views estão incluídas em `migrations/004_criar_views.sql`, mas podem ser modificadas aqui.

---

### **backup/SQL_Functions/edge_functions/**

**❌ ATENÇÃO:** Edge Functions devem ser usadas APENAS quando SQL não resolve!

**Casos de uso válidos:**
- Webhooks externos (Stripe, PayPal, etc)
- Cron jobs agendados
- Integração com APIs de terceiros
- Processamento pesado que não deve rodar no banco

**Como NÃO usar:**
```javascript
// ❌ NÃO FAZER: Lógica simples em Edge Function
export default async (req) => {
  const { titulo_id } = await req.json();
  const { data } = await supabase
    .from('titulos_financeiros')
    .select('*')
    .eq('id', titulo_id);
  return new Response(JSON.stringify(data));
};

// ✅ FAZER: Usar SQL Function
CREATE FUNCTION api_get_titulo(p_titulo_id uuid)
RETURNS json AS $$
  SELECT row_to_json(t.*)
  FROM titulos_financeiros t
  WHERE t.id = p_titulo_id;
$$ LANGUAGE sql;
```

---

### **backup/RLS_Policies/**

Documentação sobre as políticas de segurança (Row Level Security).

Policies estão em `migrations/005_habilitar_rls.sql`.

---

### **snippets/**

Templates e snippets reutilizáveis para acelerar desenvolvimento.

- **templates/**: Templates base para criar novas funções
- **common/**: Snippets comuns (JSONB, datas, text search)

---

## 🎯 Boas Práticas

### ✅ DO (Fazer)

1. **Sempre numerar arquivos:** `001_`, `002_`, `003_`...
2. **Sempre documentar:** Cabeçalho com descrição, data, autor
3. **Sempre usar DROP antes de CREATE:** Para evitar erros em re-execução
4. **Sempre testar localmente** antes de rodar em produção
5. **Sempre fazer backup** antes de grandes mudanças
6. **Sempre preferir SQL:** 90% do backend deve ser SQL

### ❌ DON'T (Não Fazer)

1. **Nunca pular numeração:** Se tem 001 e 003, onde está 002?
2. **Nunca deletar migrations antigas:** Pode quebrar histórico
3. **Nunca usar Edge Function** quando SQL resolve
4. **Nunca rodar migrations** sem testar antes
5. **Nunca executar DROP TABLE** em produção sem backup

---

## 🔧 Comandos Úteis

### **Verificar estrutura do banco**

```sql
-- Listar todas as tabelas
\dt

-- Listar todas as funções
\df

-- Listar todas as views
\dv

-- Descrever tabela
\d+ nome_tabela

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### **Backup do banco**

```bash
# Backup completo
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup apenas schema (sem dados)
pg_dump $DATABASE_URL --schema-only > schema_$(date +%Y%m%d).sql

# Backup apenas dados
pg_dump $DATABASE_URL --data-only > data_$(date +%Y%m%d).sql
```

### **Restaurar backup**

```bash
psql $DATABASE_URL < backup_20251030.sql
```

---

## 📞 Suporte

Para dúvidas sobre esta estrutura:

- **Documentação Supabase:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Agente Claude:** `@supabase-mcp-expert`

---

**Última atualização:** 30 Out 2025
**Versão:** 1.0
