# 🌍 Guia de Ambientes - Projeto WG CRM

**Objetivo**: Gerenciar variáveis de ambiente e proteger credenciais entre LOCAL e LIVE

---

## 🎯 Princípio Fundamental

**NUNCA** misture credenciais de LOCAL com LIVE!

Cada ambiente tem suas próprias credenciais, completamente isoladas.

---

## 📋 Hierarquia de Arquivos .env

### Ordem de Precedência (React/Vite)

```
1. .env.local           ← MAIOR PRIORIDADE (desenvolvimento local)
2. .env.development     ← Desenvolvimento (não usado se .env.local existe)
3. .env.production      ← Produção (build)
4. .env                 ← Fallback geral
```

**Regra de Ouro:** Se `.env.local` existe, React/Vite **IGNORA** todos outros arquivos!

---

## 🏗️ Estrutura de Ambientes

### 1. **LOCAL** (Desenvolvimento no Docker)

**Branch Git:** `dev-supabase-local`

**Arquivo:** `.env.local` (raiz do projeto)

```bash
# =============================================
# 🔵 AMBIENTE LOCAL - SUPABASE DOCKER 🔵
# =============================================
# Branch: dev-supabase-local
# Servidor: Supabase rodando localmente no Docker
# =============================================

# Supabase Local (Docker)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PROJECT_ID=WG

# Public Key (Frontend) - Local
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Service Role Key (Backend/Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

# User Access Token (para MCP e operações CLI)
SUPABASE_ACCESS_TOKEN=sbp_82d066516e8384fd327c2a340523455fc817c260

# Database Password (Local)
SUPABASE_DB_PASSWORD=postgres
```

**⚠️ IMPORTANTE:**
- `.env.local` está no `.gitignore` (NUNCA commitado)
- Sobrescreve qualquer outro `.env*`
- Usado APENAS para desenvolvimento local

**Onde obter credenciais locais:**
```bash
# Após supabase start, rodar:
supabase status

# Copiar:
# - API URL → VITE_SUPABASE_URL
# - Publishable key → VITE_SUPABASE_ANON_KEY
# - Secret key → SUPABASE_SERVICE_ROLE_KEY
```

---

### 2. **LIVE** (Produção na Nuvem)

**Branch Git:** `main`

**Arquivo:** `wg-crm/.env.local` (dentro do diretório do app)

```bash
# =============================================
# 🟢 PROJETO PRODUÇÃO - AMBIENTE DE TRABALHO 🟢
# =============================================
# IMPORTANTE: Este arquivo contém credenciais sensíveis
# NÃO compartilhe ou comite este arquivo no Git
# =============================================
# ✅ Este é o ambiente de PRODUÇÃO
# ✅ Aqui você PODE executar migrations
# ✅ Aqui você PODE modificar estrutura e dados
# =============================================

# Supabase Project Details
VITE_SUPABASE_URL=https://vyxscnevgeubfgfstmtf.supabase.co
VITE_SUPABASE_PROJECT_ID=vyxscnevgeubfgfstmtf

# Public Key (Frontend)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (Backend/Edge Functions - NUNCA expor no frontend!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# User Access Token (para MCP e operações CLI)
SUPABASE_ACCESS_TOKEN=sbp_82d066516e8384fd327c2a340523455fc817c260

# Database Password
SUPABASE_DB_PASSWORD=SuaSenhaSegura123
```

**⚠️ IMPORTANTE:**
- `.env.local` está no `.gitignore` (NUNCA commitado)
- Usado quando faz build para produção
- Credenciais do Supabase LIVE (cloud)

**Onde obter credenciais LIVE:**
```bash
# 1. Dashboard Supabase: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf
# 2. Settings → API
# 3. Copiar:
#    - URL → VITE_SUPABASE_URL
#    - anon/public key → VITE_SUPABASE_ANON_KEY
#    - service_role key → SUPABASE_SERVICE_ROLE_KEY
```

---

## 🛡️ Sistema de Proteção

### Como Funciona

```
┌─────────────────────────────────────────┐
│ git checkout dev-supabase-local         │
│ cd wg-crm && npm run dev                │
├─────────────────────────────────────────┤
│ 1. Vite procura .env.local (raiz)       │
│ 2. Encontra!                            │
│ 3. Usa credenciais locais (Docker)      │
│ 4. IGNORA todos outros .env             │
│ ✅ Impossível conectar em LIVE!         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ git checkout main                       │
│ cd wg-crm && npm run build              │
├─────────────────────────────────────────┤
│ 1. Vite procura .env.local              │
│ 2. Não encontra (outro path)            │
│ 3. Usa wg-crm/.env.local (produção)     │
│ ✅ Conecta no LIVE correto!             │
└─────────────────────────────────────────┘
```

### Failsafe

**Mesmo se você errar configuração:**
- Arquivos `.env.local` apontam para localhost
- Docker só aceita conexões locais
- Supabase LIVE rejeita tokens inválidos

---

## 🔄 Trocar de Ambiente

### Método Manual

```bash
# LOCAL → LIVE
git checkout main
cd wg-crm
# Verificar que .env.local tem credenciais LIVE
cat .env.local | grep VITE_SUPABASE_URL
# Deve mostrar: https://vyxscnevgeubfgfstmtf.supabase.co

npm run dev

# LIVE → LOCAL
git checkout dev-supabase-local
cd Supabase && supabase start
cd ../wg-crm
# Verificar que .env.local tem credenciais LOCAL
cat ../.env.local | grep VITE_SUPABASE_URL
# Deve mostrar: http://127.0.0.1:54321

npm run dev
```

### Script Automático (Futuro)

```bash
# ./switch-environment.sh [local|live]

./switch-environment.sh local
# ✅ Troca para dev-supabase-local
# ✅ Inicia Supabase Docker
# ✅ Verifica .env.local
# ✅ Mostra indicador visual

./switch-environment.sh live
# ✅ Troca para main
# ✅ Para Supabase Docker
# ✅ Verifica .env.local
# ✅ Mostra aviso de PRODUÇÃO
```

---

## 📊 Variáveis Importantes

### Frontend (Vite)

```bash
# URL base da API Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321

# Project ID (para identificação)
VITE_SUPABASE_PROJECT_ID=WG

# Chave pública (seguro expor no frontend)
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

**⚠️ Apenas variáveis com prefixo `VITE_` são expostas no frontend!**

### Backend (Edge Functions, CLI)

```bash
# Service Role Key (NUNCA expor no frontend!)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Access Token (para CLI e MCP)
SUPABASE_ACCESS_TOKEN=sbp_...

# Database Password
SUPABASE_DB_PASSWORD=postgres
```

---

## 🚨 Checklist de Segurança

### Antes de Commitar

- [ ] `.env.local` está no `.gitignore`
- [ ] Nenhum arquivo `.env*` tem credentials hardcoded
- [ ] `git status` não mostra `.env.local`
- [ ] Nenhum `console.log` com tokens/senhas

### Antes de Fazer Build

- [ ] Ambiente correto (LOCAL ou LIVE)
- [ ] `.env.local` tem credenciais corretas
- [ ] `VITE_SUPABASE_URL` aponta para servidor certo
- [ ] `VITE_SUPABASE_ANON_KEY` corresponde ao projeto

### Verificar Ambiente Ativo

```bash
# Verificar qual Supabase está rodando
docker ps | grep supabase_db

# Deve mostrar:
# supabase_db_WG           ← LOCAL
# (vazio se nenhum)        ← Nenhum local rodando

# Verificar URL no .env
grep VITE_SUPABASE_URL .env.local

# Deve mostrar:
# http://127.0.0.1:54321         ← LOCAL
# https://vyxscnevgeubfgfstmtf...  ← LIVE
```

---

## 🎓 Melhores Práticas

### 1. Nunca Comitar Credenciais

```bash
# ✅ BOM: .gitignore configurado
echo ".env.local" >> .gitignore
echo "wg-crm/.env.local" >> .gitignore

# ✅ BOM: Exemplo sem credenciais
cat > .env.example << 'EOF'
VITE_SUPABASE_URL=<sua-url-aqui>
VITE_SUPABASE_ANON_KEY=<sua-chave-aqui>
EOF

# ❌ RUIM: Commitar .env com credenciais
git add .env.local  # ❌ NUNCA FAZER!
```

### 2. Usar Variáveis de Ambiente no Código

```typescript
// ✅ BOM: Usar variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ❌ RUIM: Hardcoded
const supabaseUrl = 'https://vyxscnevgeubfgfstmtf.supabase.co';
```

### 3. Validar Ambiente na Inicialização

```typescript
// src/lib/customSupabaseClient.js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials! Check .env.local');
}

// Mostrar ambiente no console (dev only)
if (import.meta.env.DEV) {
  const isLocal = supabaseUrl.includes('127.0.0.1');
  console.log(`🔵 Supabase: ${isLocal ? 'LOCAL' : 'LIVE'} (${supabaseUrl})`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. Indicadores Visuais (Futuro)

```typescript
// Mostrar badge de ambiente na UI
function EnvironmentBadge() {
  const isLocal = import.meta.env.VITE_SUPABASE_URL?.includes('127.0.0.1');

  if (!import.meta.env.DEV) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      padding: '4px 8px',
      background: isLocal ? '#3B82F6' : '#EF4444',
      color: 'white',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 'bold',
      zIndex: 9999
    }}>
      {isLocal ? '🔵 LOCAL' : '🔴 LIVE'}
    </div>
  );
}
```

---

## 🔍 Troubleshooting

### "Cannot connect to Supabase"

```bash
# 1. Verificar Supabase rodando
docker ps | grep supabase

# 2. Verificar .env.local
cat .env.local | grep VITE_SUPABASE_URL

# 3. Verificar portas
lsof -i :54321  # API
lsof -i :54322  # Database

# 4. Reiniciar Supabase
cd Supabase
supabase stop
supabase start
```

### "Invalid API key"

```bash
# 1. Verificar chave no .env.local
cat .env.local | grep VITE_SUPABASE_ANON_KEY

# 2. Comparar com Supabase
supabase status | grep "Publishable key"

# 3. Se diferente, atualizar .env.local
# Copiar chave correta de: supabase status
```

### "Connecting to wrong environment"

```bash
# 1. Verificar branch
git branch --show-current

# 2. Verificar .env.local
cat .env.local | head -20

# 3. Se errado, trocar de branch
git checkout dev-supabase-local  # ou main

# 4. Limpar cache do Vite
rm -rf wg-crm/node_modules/.vite
npm run dev
```

---

## 📝 Referências

### Arquivos .env Atuais

```
/Users/valdair/Documents/Projetos/William WG/
├── .env.local              ← LOCAL (Docker)
├── .env.dev.readonly       ← Referência DEV (não usado)
├── wg-crm/
│   └── .env.local          ← LIVE (produção)
└── Supabase/
    └── config.toml         ← Config Supabase local
```

### Documentação Oficial

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase CLI Config](https://supabase.com/docs/reference/cli/config)

---

**Lembre-se**: Proteja suas credenciais! Nunca comite `.env.local`!

**Última atualização**: 02/11/2025
