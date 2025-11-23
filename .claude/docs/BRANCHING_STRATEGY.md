# 🌿 Estratégia de Branches - Projeto WG CRM

**Objetivo**: Documentar a estratégia de branches e ambientes do projeto

---

## 🎯 FILOSOFIA DO PROJETO

Este projeto usa **2 branches Git** para gerenciar **2 ambientes diferentes**:

1. **`dev-supabase-local`** - Desenvolvimento completo com Supabase local (Docker)
2. **`main`** - Frontend conectado ao Supabase LIVE para testes

**IMPORTANTE**: Deploy do Supabase **NÃO É VIA GIT**, é via **CLI/MCP direto**.

---

## 📊 COMPARAÇÃO DE BRANCHES

| Aspecto | `dev-supabase-local` | `main` |
|---------|---------------------|--------|
| **Supabase** | 🐳 Docker local (porta 54322) | ☁️ LIVE (Cloud) |
| **Frontend URL** | http://127.0.0.1:54321 | https://vyxscnevgeubfgfstmtf.supabase.co |
| **Migrations** | ✅ Desenvolvidas aqui | ❌ Não tem (deploy via CLI) |
| **Edge Functions** | ✅ Rodando localmente | ❌ Não roda local |
| **Docker** | ✅ Supabase start | ❌ Sem Docker |
| **config.toml** | ✅ project_id = "WG" | ❌ Não precisa |
| **Finalidade** | Desenvolvimento FULL | Testar frontend em LIVE |

---

## 🔄 WORKFLOWS

### 🔵 Desenvolvimento (Branch `dev-supabase-local`)

```bash
# 1. Trocar branch
git checkout dev-supabase-local

# 2. Iniciar Supabase local (Docker)
cd Supabase
supabase start
# ✅ PostgreSQL rodando na porta 54322
# ✅ API rodando em http://127.0.0.1:54321
# ✅ Studio em http://127.0.0.1:54323

# 3. Iniciar frontend
cd ../wg-crm
npm run dev
# ✅ App em http://localhost:5173
# ✅ Conectado em Supabase LOCAL (via .env.local)

# 4. Desenvolver
# - Criar migrations em Supabase/supabase/migrations/
# - Criar Edge Functions em Supabase/functions/
# - Desenvolver frontend em wg-crm/src/
# - Tudo conectado localmente!

# 5. Commit
git add .
git commit -m "feat: Nova funcionalidade X"
git push origin dev-supabase-local
```

---

### 🟢 Deploy para LIVE (Via MCP/CLI, NÃO via Git)

```bash
# ❌ NÃO É ASSIM (via merge):
git checkout main
git merge dev-supabase-local  # ❌ Não precisa!

# ✅ É ASSIM (via MCP/CLI):
# OPÇÃO 1 - Via agente MCP (recomendado)
Task → supabase-live → "aplicar migration [nome] no LIVE"

# OPÇÃO 2 - Via CLI manualmente
supabase db push --linked --project-ref vyxscnevgeubfgfstmtf

# OPÇÃO 3 - Edge Functions
supabase functions deploy [nome] --project-ref vyxscnevgeubfgfstmtf
```

**IMPORTANTE**: Migrations e Functions vão para LIVE via **CLI direto**, NÃO via Git push!

---

### 🟡 Testar em Produção (Branch `main`)

```bash
# 1. Trocar branch
git checkout main

# 2. Iniciar frontend (SEM Docker!)
cd wg-crm
npm run dev
# ✅ App em http://localhost:5173
# ✅ Conectado em Supabase LIVE (via .env.local)

# 3. Testar funcionalidades
# - Login/logout
# - CRUD de entities, obras, títulos
# - Kanbans
# - Validar que tudo funciona em LIVE

# 4. Se tudo OK, continuar desenvolvimento
git checkout dev-supabase-local
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### Branch `dev-supabase-local` (COMPLETA)

```
William WG/
├── .env.local              ← LOCAL (Docker)
├── wg-crm/
│   ├── .env.local          ← LOCAL (http://127.0.0.1:54321)
│   └── src/
├── Supabase/
│   ├── functions/          ← Edge Functions
│   ├── supabase/
│   │   ├── migrations/     ← ✅ Migrations desenvolvidas aqui
│   │   ├── config.toml     ← ✅ project_id = "WG"
│   │   └── .env            ← Google OAuth, etc
│   └── backup/
└── .claude/
```

### Branch `main` (APENAS Frontend)

```
William WG/
├── wg-crm/
│   ├── .env.local          ← LIVE (https://vyxscnevgeubfgfstmtf.supabase.co)
│   └── src/
└── .claude/

# ❌ SEM Supabase/supabase/ (não precisa!)
# ❌ SEM Docker
# ❌ SEM Edge Functions locais
```

---

## 🚨 REGRAS IMPORTANTES

### ✅ PODE:
- ✅ Desenvolver frontend em **QUALQUER** branch (dev ou main)
- ✅ Fazer merge de código React de dev → main
- ✅ Fazer merge de Supabase/ para main (não afeta nada, é só arquivo)
- ✅ Commitar qualquer coisa em `dev-supabase-local`

### ❌ NUNCA:
- ❌ Esperar que merge Git faça deploy no Supabase LIVE
- ❌ Commitar `.env.local` com credenciais (já está no .gitignore)
- ❌ Confundir: Git ≠ Supabase Deploy

### 🎯 LEMBRE-SE:
**Deploy Supabase = CLI/MCP, NÃO Git!**

---

## 🔐 ARQUIVO .env.local (Controla Ambiente)

### Em `dev-supabase-local`:

```bash
# wg-crm/.env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Chave LOCAL
```

### Em `main`:

```bash
# wg-crm/.env.local
VITE_SUPABASE_URL=https://vyxscnevgeubfgfstmtf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Chave LIVE
```

**O .env.local determina para onde o frontend conecta!**

---

## 🤔 PERGUNTAS FREQUENTES

### Q: Se eu fizer merge de dev → main, afeta o Supabase LIVE?
**R:** ❌ NÃO! Deploy Supabase é via CLI, não via Git.

### Q: Posso desenvolver frontend em `main`?
**R:** ✅ SIM! Pode desenvolver em qualquer branch. `main` é só React conectado ao LIVE.

### Q: Onde criar migrations?
**R:** ✅ Sempre em `dev-supabase-local` → testar localmente → deploy via CLI para LIVE.

### Q: Preciso fazer merge de `Supabase/` para `main`?
**R:** ❌ NÃO PRECISA! Mas se fizer, não tem problema (são só arquivos).

### Q: Como sei qual ambiente estou usando?
**R:** ✅ Olhe o `.env.local` do `wg-crm/`. Se tiver `127.0.0.1` = LOCAL, se tiver `vyxscnevgeubfgfstmtf` = LIVE.

### Q: Posso rodar Supabase local na `main`?
**R:** ✅ PODE, mas não faz sentido. `main` é para testar contra LIVE.

---

## 📝 CHECKLIST RÁPIDO

### Quando trabalhar em **Nova Feature**:
- [ ] `git checkout dev-supabase-local`
- [ ] `cd Supabase && supabase start`
- [ ] `cd ../wg-crm && npm run dev`
- [ ] Desenvolver (migrations, functions, React)
- [ ] Testar localmente
- [ ] Commit na `dev-supabase-local`

### Quando fazer **Deploy**:
- [ ] Testar tudo localmente primeiro
- [ ] Deploy via CLI/MCP: `supabase db push` ou agente MCP
- [ ] **NÃO** fazer merge Git esperando deploy automático

### Quando **Testar em LIVE**:
- [ ] `git checkout main`
- [ ] `cd wg-crm && npm run dev`
- [ ] Testar funcionalidades
- [ ] Se OK, voltar para dev: `git checkout dev-supabase-local`

---

## 🎯 RESUMO DE 1 LINHA

**`dev-supabase-local` = Desenvolvimento FULL (Docker + Edge Functions + React).**
**`main` = React conectado ao LIVE para testar.**
**Deploy Supabase = CLI/MCP, NÃO Git merge!**

---

**Última Atualização**: 04/11/2025
**Versão**: 1.0
**Autor**: Documentado com Claude Code
