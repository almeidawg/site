# 🔄 Workflow Supabase - Projeto WG CRM

**Objetivo**: Documentar processo completo de desenvolvimento LOCAL → GIT → DEPLOY

---

## ⚠️ IMPORTANTE: Estratégia de Branches

**LEIA PRIMEIRO**: `.claude/docs/BRANCHING_STRATEGY.md`

**Resumo rápido:**
- Branch `dev-supabase-local` = Desenvolvimento completo (Docker + Edge Functions + React)
- Branch `main` = Apenas React conectado ao LIVE
- **Deploy Supabase LIVE = CLI/MCP direto, NÃO via Git merge!**

Se você quer fazer merge Git para sincronizar código, tudo bem! Mas **NÃO espere que isso faça deploy automático no Supabase LIVE**. Deploy é via CLI/MCP.

---

## 🎯 Filosofia: Segurança Primeiro

### Regra de Ouro
**NUNCA** trabalhe direto em produção. **SEMPRE** siga o fluxo:

```
LOCAL (Docker) → GIT (controle de versão) → LIVE (produção)
     ↓               ↓                          ↓
  Teste         Code Review                 Deploy
```

---

## 🏗️ Arquitetura de Ambientes

### 1. **LOCAL** (Desenvolvimento)
- **Branch Git**: `dev-supabase-local`
- **Supabase**: Docker containers (project_id: `WG`)
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323
- **Finalidade**: Desenvolvimento isolado, testes, experimentos

### 2. **LIVE** (Produção)
- **Branch Git**: `main`
- **Supabase**: Cloud (project_id: `vyxscnevgeubfgfstmtf`)
- **Database**: https://vyxscnevgeubfgfstmtf.supabase.co
- **Finalidade**: Ambiente de produção, dados reais

---

## 🤖 Agentes Especializados

### supabase-local-expert (DESENVOLVIMENTO)
**Use para:**
- ✅ Criar funções SQL localmente
- ✅ Testar queries no Docker
- ✅ Debugging de problemas
- ✅ Experimentos e protótipos
- ✅ Criar arquivos .sql e .test.sql

**Comando:**
```
Task → supabase-local-expert → "criar função api_calcular_total"
```

### supabase-mcp-expert (PRODUÇÃO)
**Use para:**
- ✅ Deploy em produção (LIVE)
- ✅ Verificar logs de produção
- ✅ Operações via MCP tools

**Comando:**
```
Task → supabase-mcp-expert → "deploy função api_calcular_total no LIVE"
```

---

## 📋 Workflows Completos

### 1. Criar Nova Função SQL

#### PASSO 1: Desenvolvimento Local
```bash
# 1. Certificar que está na branch correta
git checkout dev-supabase-local

# 2. Iniciar Supabase local
cd Supabase
supabase start

# 3. Delegar para agente local
Task → supabase-local-expert → "criar função api_criar_oportunidade que
recebe p_titulo, p_valor, p_entity_id e retorna uuid da oportunidade criada"
```

**O agente faz:**
- ✅ Cria arquivo em `Supabase/migrations/XXX_nome_funcao.sql`
- ✅ Cria arquivo de teste `.test.sql`
- ✅ Executa no Docker local
- ✅ Testa com BEGIN/ROLLBACK
- ✅ Valida que funciona

#### PASSO 2: Validação Manual (Opcional)
```bash
# Testar no Studio
# 1. Abrir http://127.0.0.1:54323
# 2. SQL Editor → colar query
# 3. Executar e validar resultado

# Ou testar via Docker
docker exec -it supabase_db_WG psql -U postgres -d postgres << 'EOF'
BEGIN;
  SELECT api_criar_oportunidade(
    'Teste',
    15000.00,
    'uuid-entity'
  );
ROLLBACK; -- Não salva dados
EOF
```

#### PASSO 3: Git Commit
```bash
# 1. Verificar mudanças
git status

# 2. Adicionar migrations
git add Supabase/migrations/

# 3. Commit seguindo Conventional Commits
git commit -m "feat: Adiciona api_criar_oportunidade

- Cria oportunidade no pipeline
- Valida inputs (titulo, valor, entity_id)
- Retorna uuid da oportunidade criada
- Testes validados localmente"

# 4. Push
git push origin dev-supabase-local
```

#### PASSO 4: Deploy em Produção
```bash
# IMPORTANTE: Só fazer quando APROVADO e TESTADO!

# 1. Trocar para main
git checkout main

# 2. Merge da dev-supabase-local
git merge dev-supabase-local

# 3. Push (dispara code review se configurado)
git push origin main

# 4. Deploy via agente MCP
Task → supabase-mcp-expert → "deploy função api_criar_oportunidade
do arquivo Supabase/migrations/XXX_nome.sql no LIVE"
```

**O agente MCP faz:**
- ✅ Lê arquivo da migration
- ✅ Executa via `apply_migration` no LIVE
- ✅ Verifica logs de erro
- ✅ Confirma sucesso

---

### 2. Modificar Função Existente

#### PASSO 1: Identificar Versão Atual
```bash
# Via agente local
Task → supabase-local-expert → "mostrar código da função api_calcular_total"

# Ou via Docker
docker exec -it supabase_db_WG psql -U postgres -d postgres << 'EOF'
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'api_calcular_total';
EOF
```

#### PASSO 2: Criar Nova Versão
```bash
# Estratégia A: Versionar (recomendado se mudança grande)
Task → supabase-local-expert → "criar api_calcular_total_v2
com melhorias X, Y, Z"

# Estratégia B: Modificar em place (se mudança pequena)
Task → supabase-local-expert → "modificar api_calcular_total
para adicionar validação de campo X"
```

#### PASSO 3: Migração Gradual (se versionou)
```sql
-- 1. Deploy v2 no LIVE (não quebra v1)
-- 2. Atualizar frontend para usar v2
-- 3. Validar em produção
-- 4. Deletar v1 quando v2 estável

-- Migration: XXX_delete_api_calcular_total_v1.sql
DROP FUNCTION IF EXISTS api_calcular_total(...); -- params v1
```

#### PASSO 4: Git Commit e Deploy
```bash
git add Supabase/migrations/
git commit -m "feat: Melhora api_calcular_total com validações extras"
git push origin dev-supabase-local

# Após aprovação
git checkout main
git merge dev-supabase-local
git push origin main

Task → supabase-mcp-expert → "deploy modificação api_calcular_total"
```

---

### 3. Debugging de Erro em Função

#### PASSO 1: Reproduzir Localmente
```bash
# 1. Obter dados que causam erro (de logs ou reports)
# 2. Testar localmente com dados reais

Task → supabase-local-expert → "debugar api_calcular_total
usando ultrathink. Erro: 'division by zero'"
```

**Agente faz:**
- ✅ Usa ultrathink para analisar código
- ✅ Identifica causa raiz
- ✅ Propõe correção
- ✅ Testa correção localmente
- ✅ Valida que fix funciona

#### PASSO 2: Aplicar Fix
```bash
# Agente já aplicou fix localmente
# Validar manualmente (opcional)

# Commit
git commit -m "fix: Previne division by zero em api_calcular_total"

# Deploy
Task → supabase-mcp-expert → "deploy fix api_calcular_total no LIVE"
```

#### PASSO 3: Monitorar Logs
```bash
# Via agente MCP
Task → supabase-mcp-expert → "verificar logs postgres últimos 5min
procurando por api_calcular_total"

# Ou via Supabase Dashboard
# https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/logs
```

---

### 4. Criar Migration de Schema (Tabela Nova)

#### PASSO 1: Desenvolvimento Local
```bash
# Criar migration manualmente (migrations são DDL, não via função)
cat > Supabase/migrations/$(date +%Y%m%d%H%M%S)_criar_tabela_produtos.sql << 'EOF'
-- =============================================
-- Migration: Criar tabela produtos
-- Data: 2025-11-02
-- =============================================

CREATE TABLE IF NOT EXISTS public.produtos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  preco numeric(10,2) NOT NULL CHECK (preco >= 0),
  categoria text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produtos_categoria
  ON produtos(categoria);

-- RLS (Row Level Security)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ler
CREATE POLICY "Usuários podem ver produtos"
  ON produtos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Comentário
COMMENT ON TABLE produtos IS 'Cadastro de produtos do sistema';
EOF

# 2. Aplicar localmente
supabase db reset  # Reaplicar todas migrations
```

#### PASSO 2: Validar
```bash
# Via Studio: http://127.0.0.1:54323 → Table Editor
# Ou via SQL:

docker exec -it supabase_db_WG psql -U postgres -d postgres << 'EOF'
-- Verificar estrutura
\d produtos

-- Testar insert
INSERT INTO produtos (nome, preco) VALUES ('Teste', 100.00);
SELECT * FROM produtos;
EOF
```

#### PASSO 3: Git e Deploy
```bash
git add Supabase/migrations/
git commit -m "feat: Adiciona tabela produtos

- Campos: nome, descricao, preco, categoria
- RLS habilitado
- Índice em categoria
- Validação: preco >= 0"

git push origin dev-supabase-local

# Após aprovação, deploy via MCP
Task → supabase-mcp-expert → "aplicar migration criar_tabela_produtos no LIVE"
```

---

## 🛡️ Proteções e Validações

### Checklist Antes de Deploy em LIVE

- [ ] ✅ Testado localmente (Docker)
- [ ] ✅ Arquivo `.sql` salvo em `Supabase/migrations/`
- [ ] ✅ Arquivo `.test.sql` criado e validado
- [ ] ✅ Commit no Git com mensagem descritiva
- [ ] ✅ Code review aprovado (se aplicável)
- [ ] ✅ **DROP IF EXISTS** antes de **CREATE** (funções)
- [ ] ✅ Validações de input implementadas
- [ ] ✅ Documentação/comentários adequados
- [ ] ✅ Sem hardcoded credentials ou dados sensíveis
- [ ] ✅ RLS configurado (se tabela nova)

### Validações Automáticas dos Agentes

**supabase-local-expert:**
- ✅ SEMPRE cria DROP IF EXISTS
- ✅ SEMPRE testa com BEGIN/ROLLBACK
- ✅ SEMPRE salva arquivo local
- ✅ SEMPRE valida sintaxe SQL

**supabase-mcp-expert:**
- ✅ SEMPRE verifica logs após deploy
- ✅ SEMPRE confirma sucesso
- ✅ SEMPRE registra no DEPLOY_LOG (futuro)

---

## 📊 Monitoramento Pós-Deploy

### Verificar Sucesso
```bash
# 1. Logs do Supabase
Task → supabase-mcp-expert → "verificar logs postgres
últimos 2min procurando por erros"

# 2. Dashboard Supabase
# https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/logs

# 3. Testar função manualmente
Task → supabase-mcp-expert → "executar teste básico
da função api_criar_oportunidade no LIVE"
```

### Rollback se Necessário
```bash
# Opção 1: Git revert
git revert <commit-hash>
git push origin main

# Opção 2: Migration de rollback
cat > Supabase/migrations/$(date +%Y%m%d%H%M%S)_rollback_funcao_X.sql << 'EOF'
-- Rollback para versão anterior
DROP FUNCTION IF EXISTS api_funcao_nova;
-- Recriar versão antiga...
EOF

Task → supabase-mcp-expert → "aplicar rollback"
```

---

## 🚀 Comandos Rápidos

### Iniciar Ambiente Local
```bash
# Terminal 1: Supabase
cd Supabase && supabase start

# Terminal 2: Frontend
cd wg-crm && npm run dev
```

### Verificar Status
```bash
# Supabase local
supabase status

# Containers Docker
docker ps | grep supabase

# Migrations aplicadas
supabase db diff
```

### Resetar Banco Local (Reaplicar Migrations)
```bash
cd Supabase
supabase db reset  # CUIDADO: Apaga dados locais!
```

### Acessar PostgreSQL Direto
```bash
docker exec -it supabase_db_WG psql -U postgres -d postgres
```

---

## 🎓 Melhores Práticas

### 1. Nomenclatura de Funções
```sql
-- ✅ BOM: Prefixo descritivo + verbo + substantivo
api_criar_oportunidade
api_atualizar_kanban_card
api_calcular_total_titulo
helper_validar_cpf
trigger_atualizar_updated_at

-- ❌ RUIM: Genérico, sem contexto
create
update_data
function1
```

### 2. Versionamento
```sql
-- Se mudança grande/breaking:
calcular_metricas_v1  -- Versão original
calcular_metricas_v2  -- Nova versão

-- Migração gradual:
-- 1. Deploy v2
-- 2. Atualizar frontend para v2
-- 3. Deletar v1 quando estável
```

### 3. Documentação
```sql
-- SEMPRE incluir header:
-- =============================================
-- Função: nome_funcao
-- Descrição: O que faz
-- Parâmetros: descrição de cada um
-- Retorno: tipo e descrição
-- Exemplos: casos de uso
-- Criado: data
-- Modificado: data (se aplicável)
-- =============================================
```

### 4. Testes
```sql
-- Criar arquivo .test.sql para cada .sql:

-- 🧪 Teste 1: Caso de sucesso
BEGIN;
  SELECT api_criar_oportunidade('Teste', 1000, 'uuid');
  -- Verificar resultado
ROLLBACK;

-- 🧪 Teste 2: Validação de erro
BEGIN;
  SELECT api_criar_oportunidade('', 1000, 'uuid');
  -- Deve dar erro
ROLLBACK;
```

---

## 🔍 Troubleshooting Comum

### "Função não encontrada"
```bash
# 1. Verificar se migration foi aplicada
supabase db diff

# 2. Verificar logs
docker logs supabase_db_WG --tail 50

# 3. Resetar e reaplicar
supabase db reset
```

### "Permission denied"
```sql
-- Adicionar SECURITY DEFINER
CREATE OR REPLACE FUNCTION minha_funcao()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Executa com permissões do dono
SET search_path = public
AS $$
...
$$;
```

### "Migration já existe"
```bash
# Supabase CLI gera timestamps únicos
# Se conflito, renomear manualmente:
mv 20251102120000_nome.sql 20251102120001_nome.sql
```

---

**Lembre-se**: Este workflow existe para proteger produção. Siga sempre!

**Última atualização**: 02/11/2025
