# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🧠 MODO DE PENSAMENTO
**SEMPRE** usar ultrathink para:
- Análises de arquitetura e design patterns
- Debugging de problemas complexos
- Decisões técnicas importantes (libs, ferramentas, refactoring)
- Otimizações de performance
- Mudanças que afetam múltiplos arquivos/sistemas

**Thinking normal** para:
- Features simples e bem definidas
- Fixes rápidos
- Mudanças pontuais

## 🎯 FILOSOFIA DE TRABALHO
1. **Menos é Mais**: SEMPRE preferir editar arquivos existentes a criar novos
2. **Contexto Primeiro**: Ler arquivos relevantes ANTES de fazer mudanças
3. **Incremental**: Fazer mudanças pequenas e testáveis
4. **TodoWrite**: Usar SEMPRE para tarefas com 3+ etapas
5. **Delegação de Agentes Supabase**:
   - **LOCAL**: Usar `supabase-local-expert` para desenvolvimento local (Docker, VSCode, testes)
   - **LIVE**: Usar `supabase-mcp-expert` APENAS para produção/deploy remoto
6. **Validação**: Após mudanças críticas, explicar O QUÊ mudou e POR QUÊ

## 📋 PADRÕES DE CÓDIGO
- **TypeScript**: Tipos explícitos (evitar `any`, preferir `unknown`)
- **React**: Functional components com hooks
- **Styled Components**: Usar sistema de temas para cores/estilos
- **Imports**: Organizar (React → libs → local → types)
- **Comentários**: Só quando lógica não é óbvia
- **Naming**: camelCase (JS/TS), kebab-case (arquivos), UPPER_SNAKE (env vars)

## 🚨 REGRAS CRÍTICAS DE SEGURANÇA
- **NUNCA** coloque senhas ou credenciais em arquivos
- **SEMPRE** use variáveis de ambiente (.env)
- **SEMPRE** verifique antes de fazer commit
- Referencie credenciais como: `$SSH_PASSWORD`, `$API_KEY`

## Projeto WG CRM
**Stack**: React, TypeScript, Vite, Supabase
**Tipo**: Sistema CRM para gerenciamento de oportunidades, kanban, financeiro e pipeline de vendas
**Última atualização**: 02/11/2025

---

# 📚 Documentação Modular (carregada automaticamente)

@.claude/docs/CODE_STANDARDS.md
@.claude/docs/SUPABASE_WORKFLOW.md
@.claude/docs/ENVIRONMENT_GUIDE.md
@.claude/docs/DEPLOY_CHECKLIST.md
@.claude/docs/EDGE_FUNCTIONS.md
@.claude/docs/SECURITY.md
@.claude/docs/BRANCHING_STRATEGY.md

---

## 🌿 ESTRATÉGIA DE BRANCHES (CRÍTICO!)

**LEIA ANTES DE FAZER QUALQUER MERGE OU DEPLOY:**

Este projeto usa **2 branches Git** com propósitos DIFERENTES:

### `dev-supabase-local` (Desenvolvimento)
- ✅ Supabase rodando localmente (Docker)
- ✅ Edge Functions rodando localmente
- ✅ Frontend → http://127.0.0.1:54321
- ✅ DESENVOLVER TUDO AQUI (migrations, functions, React)

### `main` (Teste em Produção)
- ✅ Apenas React app
- ✅ Frontend → https://vyxscnevgeubfgfstmtf.supabase.co (LIVE)
- ❌ SEM Docker, SEM Edge Functions locais
- ✅ APENAS para testar se app funciona em LIVE

### ⚠️ DEPLOY SUPABASE ≠ GIT MERGE!

**IMPORTANTE**: Deploy de migrations/functions para Supabase LIVE é via **CLI/MCP direto**, NÃO via Git merge!

```bash
# ❌ ERRADO (esperar que merge faça deploy):
git checkout main
git merge dev-supabase-local  # ❌ Não deploya nada!

# ✅ CORRETO (deploy via MCP/CLI):
Task → supabase-live → "aplicar migration X no LIVE"
# OU
supabase db push --linked
```

**Fazer merge de `Supabase/` para `main` NÃO FAZ MAL**, são só arquivos. Mas **NÃO FAZ DEPLOY AUTOMÁTICO**.

**📖 Detalhes completos**: Veja `.claude/docs/BRANCHING_STRATEGY.md`

---

## 🖥️ Resumo de Ambientes

### Frontend
- **Local**: `wg-crm/` → `npm run dev` (localhost:5173 - Vite)
- **Produção**: Supabase LIVE → https://vyxscnevgeubfgfstmtf.supabase.co

### Backend
- **Supabase LOCAL**: Project ID `WG` (Docker containers)
- **Supabase LIVE**: Project ID `vyxscnevgeubfgfstmtf`

### Estrutura do Projeto
```
William WG/
├── wg-crm/                    ← Frontend React + Vite
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── Supabase/                  ← Backend + Database
│   ├── migrations/            ← Schema + SQL functions
│   ├── functions_backup/      ← Histórico de funções
│   ├── backup/                ← Backups e snippets
│   └── config.toml            ← Config Supabase local
└── .claude/                   ← Docs e agentes
    ├── agents/                ← Agentes especializados
    └── docs/                  ← Documentação modular
```

## 🤖 Agentes Especializados Supabase

### supabase-local-expert (DESENVOLVIMENTO LOCAL)
**Quando usar:** SEMPRE que estiver desenvolvendo localmente
- ✅ Criar/testar funções SQL no Docker local (porta 54322)
- ✅ Executar queries direto via `docker exec`
- ✅ Criar arquivos .sql e .test.sql
- ✅ Debugging com VSCode PostgreSQL Extension
- ✅ BEGIN/ROLLBACK para testes seguros
- ✅ Usa ultrathink para análises complexas
- ✅ Acesso total: Docker, Bash, Read, Write, Edit

**Comando:** `Task → supabase-local-expert → "cria função X localmente"`

### supabase-mcp-expert (PRODUÇÃO/LIVE)
**Quando usar:** APENAS para operações remotas em produção
- ✅ Deploy no Supabase LIVE (project_id: vyxscnevgeubfgfstmtf)
- ✅ Verificar logs de produção
- ✅ Operações que PRECISAM ser remotas via MCP
- ❌ NUNCA para desenvolvimento local
- ❌ NUNCA quando trabalhando com Docker local

**Comando:** `Task → supabase-mcp-expert → "deploy função X no LIVE"`

### Workflow Recomendado:
1. **Desenvolver LOCAL** com `supabase-local-expert`
2. **Testar LOCAL** com Docker + VSCode
3. **Commit no Git** quando aprovado
4. **Deploy LIVE** com `supabase-mcp-expert`

## 🌿 Supabase Branching Workflow

### Estrutura de Branches
- **dev-supabase-local** (Git branch): Desenvolvimento 100% local, Supabase rodando via Docker (localhost)
- **main** (Git + Supabase): Produção, apenas updates manuais, 100% estável

### 💻 Ambiente Local (Branch: dev-supabase-local)

**Setup Completo:**
- **Supabase Local**: Docker rodando 12 containers
- **SQL Functions**: Importadas via migrations
- **React App**: Conecta em http://127.0.0.1:54321 (variáveis em `.env.local`)
- **Studio**: http://127.0.0.1:54323
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

**🛡️ Sistema de Proteção de Ambientes:**
- **`.env.local`**: Arquivo EXCLUSIVO para desenvolvimento local (prioridade máxima no React)
- **Isolamento Total**: Quando existe `.env.local`, React ignora outros `.env` files
- **Docker Local**: Todas URLs apontam para localhost (impossível afetar produção)
- **Gitignored**: `.env.local` nunca vai para o GitHub
- **Failsafe**: Mesmo com erro de configuração, sempre usa localhost

**Como Usar (Workflow Completo - 2 Terminais):**
```bash
# TERMINAL 1: Trocar branch e iniciar Supabase
git checkout dev-supabase-local
cd Supabase && supabase start
# Aguardar até ver "Started supabase local development setup"
# ✅ PostgreSQL + SQL Functions rodando

# TERMINAL 2: Iniciar React App
cd wg-crm
npm run dev  # Usa .env.local AUTOMATICAMENTE!
# ✅ App abre em http://localhost:5173
# ✅ Conectado em http://127.0.0.1:54321 (tudo local!)
```

**Vantagens:**
- ✅ Zero risco ao ambiente LIVE
- ✅ Testes de schema/funções isolados
- ✅ Desenvolvimento offline
- ✅ Dados de teste sem afetar produção

### Versionamento e Controle

**Estrutura Oficial:**
```
/Supabase/                          ← Fonte de verdade oficial
├── migrations/                     ← Schema + SQL functions (versionado)
│   ├── 001_criar_tabelas_base.sql
│   ├── 002_criar_tabelas_financeiro.sql
│   └── ...
├── functions_backup/               ← Histórico e referência
│   ├── SQL_Functions/              ← Backups de funções
│   └── Edge_Functions/             ← Edge functions (futuro)
├── backup/                         ← Snippets e templates
└── config.toml                     ← Config Supabase local
```

**IMPORTANTE:**
- ✅ `/Supabase/migrations/` é source of truth (Git tracking completo)
- ✅ `functions_backup/` são backups históricos (referência)
- ✅ Agente LOCAL SEMPRE desenvolve localmente primeiro
- ✅ LIVE só recebe mudanças após aprovação manual

### Benefícios do Sistema
- ✅ Git tracking completo (histórico, blame, revert)
- ✅ Code review antes de produção
- ✅ Rollback trivial (git revert)
- ✅ Zero risco de quebrar produção
- ✅ Desenvolvimento isolado e seguro

---

## 🗄️ Estrutura do Banco de Dados WG

### Tabelas Principais

**Gestão de Usuários e Empresas:**
- `profiles` - Perfis de usuários
- `empresas` - Empresas cadastradas

**Entidades de Negócio:**
- `entities` - Clientes, fornecedores, prospects
- `oportunidades` - Pipeline de vendas

**Kanban e Pipeline:**
- `kanban_cards` - Cards do kanban
- `kanban_colunas` - Colunas do kanban
- `pipeline_stages` - Etapas do pipeline

**Financeiro:**
- `titulos_financeiros` - Contas a pagar/receber
- `lancamentos` - Lançamentos financeiros
- `categorias` - Categorias financeiras
- `plano_contas` - Plano de contas contábil

**Assistência Técnica:**
- `assistencias` - Ordens de serviço
- `assistencia_historico` - Histórico de assistências

### Convenções de Nomenclatura

**Tabelas:**
- Plural em português: `oportunidades`, `empresas`
- Snake_case para compostos: `kanban_cards`, `titulos_financeiros`

**Campos:**
- Snake_case: `created_at`, `user_id`
- Timestamps padrão: `created_at`, `updated_at`
- Foreign keys: `{tabela}_id` (ex: `empresa_id`, `user_id`)

**Funções SQL:**
- Prefixo descritivo: `api_criar_oportunidade`, `calcular_total_titulo`
- Verbos em português: `criar`, `atualizar`, `calcular`, `buscar`

---

## 📝 Workflow de Desenvolvimento

### 1. Nova Função SQL
```bash
# 1. Desenvolver localmente com supabase-local-expert
Task → supabase-local-expert → "criar função api_criar_oportunidade"

# 2. Testar no Docker local
# Agente cria função e testa automaticamente

# 3. Salvar migration
# Função salva em Supabase/migrations/XXX_nome.sql

# 4. Git commit
git add Supabase/migrations/
git commit -m "feat: Adiciona api_criar_oportunidade"

# 5. Deploy LIVE (quando aprovado)
Task → supabase-mcp-expert → "deploy função api_criar_oportunidade no LIVE"
```

### 2. Nova Feature Frontend
```bash
# 1. Desenvolver em dev-supabase-local
git checkout dev-supabase-local
cd wg-crm && npm run dev

# 2. Criar componente/página
# Seguir padrões CODE_STANDARDS.md

# 3. Testar localmente
# Conectado no Supabase local (http://127.0.0.1:54321)

# 4. Git commit
git add .
git commit -m "feat: Adiciona página de oportunidades"

# 5. Merge para main quando aprovado
git checkout main
git merge dev-supabase-local
```

### 3. Debug de Problemas
```bash
# 1. Usar supabase-local-expert com ultrathink
Task → supabase-local-expert → "debugar erro na função X usando ultrathink"

# 2. Verificar logs do Supabase local
docker logs supabase_db_WG --tail 50

# 3. Testar query no Studio
# http://127.0.0.1:54323 → SQL Editor

# 4. Corrigir e validar
# Agente testa e valida correção
```

---

## 🔧 Comandos Úteis

### Supabase Local
```bash
# Status
supabase status

# Iniciar
cd Supabase && supabase start

# Parar
supabase stop

# Resetar (reaplicar migrations)
supabase db reset

# Ver logs
docker logs supabase_db_WG -f

# Acessar PostgreSQL direto
docker exec -it supabase_db_WG psql -U postgres -d postgres
```

### Frontend
```bash
cd wg-crm

# Dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

### Git Workflow
```bash
# Trocar para desenvolvimento local
git checkout dev-supabase-local

# Ver status
git status

# Commit
git add .
git commit -m "tipo: mensagem"

# Push
git push origin dev-supabase-local
```

---

## 🎨 Sistema de Design

### Cores Principais
- **Primária**: Roxo/Violeta (sistema WG)
- **Secundária**: Cinza escuro
- **Sucesso**: Verde
- **Aviso**: Amarelo
- **Erro**: Vermelho
- **Info**: Azul

### Componentes Padrão
- Usar componentes do `/wg-crm/src/components/`
- Seguir estrutura de pastas modular
- Separar lógica (hooks) de apresentação (components)

---

## Histórico de Sessões Relevantes

- **28/10/2025**: Criação de agentes especializados (app-migration-expert, doc-research-expert, supabase-mcp-expert)
- **02/11/2025**: Setup completo Supabase local, branch dev-supabase-local configurada, containers rodando, migrations aplicadas
- **02/11/2025**: Reestruturação baseada em Liftlio - Criação de CLAUDE.md, docs modulares, agentes atualizados, sistema de proteção de ambientes implementado

---

**Lembre-se**: Este é um sistema vivo! Atualize conforme o projeto evolui.

**Para dúvidas ou melhorias:** Consulte `.claude/docs/` ou os agentes especializados.

---

**Última atualização**: 02/11/2025
**Versão**: 1.0
**Baseado em**: Projeto Liftlio (best practices)
