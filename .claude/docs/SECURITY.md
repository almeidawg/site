# 🔐 Guia de Segurança - Projeto WG CRM

**Objetivo**: Garantir que credenciais e chaves de API nunca sejam expostas

---

## 🚨 REGRAS DE OURO

### ❌ NUNCA faça:

1. **Commitar arquivos .env**
   ```bash
   # ❌ NUNCA!
   git add .env.local
   git add .env
   ```

2. **Hardcode de credenciais**
   ```typescript
   // ❌ NUNCA!
   const apiKey = "sk_live_abc123..."
   const supabaseUrl = "https://vyxscnevgeubfgfstmtf.supabase.co"
   ```

3. **Expor Service Role Key no frontend**
   ```typescript
   // ❌ NUNCA! Service Role Key só no backend/Edge Functions
   const supabase = createClient(url, SERVICE_ROLE_KEY) // Frontend = PERIGO!
   ```

4. **Commitar secrets em Edge Functions**
   ```typescript
   // ❌ NUNCA!
   const stripeKey = "sk_live_abc123..." // Hardcoded = PERIGO!
   ```

5. **Logs com dados sensíveis**
   ```typescript
   // ❌ NUNCA!
   console.log('User password:', password)
   console.log('Credit card:', creditCard)
   ```

### ✅ SEMPRE faça:

1. **Use variáveis de ambiente**
   ```typescript
   // ✅ BOM!
   const apiKey = Deno.env.get('STRIPE_SECRET_KEY')
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   ```

2. **Verifique .gitignore**
   ```bash
   # ✅ .gitignore deve ter:
   .env
   .env.local
   .env.*.local
   *.key
   secrets/
   ```

3. **Frontend: APENAS Anon Key**
   ```typescript
   // ✅ BOM! Anon Key é segura para frontend
   const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY // OK expor
   )
   ```

4. **Backend/Edge: Service Role Key**
   ```typescript
   // ✅ BOM! Service Role só em Edge Functions/Backend
   const supabase = createClient(
     Deno.env.get('SUPABASE_URL'),
     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Nunca expor!
   )
   ```

---

## 🔑 Tipos de Chaves - Entenda a Diferença

### 1. ANON_KEY (Publishable Key)

**O que é:**
- Chave pública do Supabase
- PODE ser exposta no frontend
- Protegida por RLS (Row Level Security)

**Onde usar:**
- ✅ Frontend React
- ✅ Código do cliente
- ✅ Apps mobile

**Formato:**
```
sb_publishable_XXX  (novo formato)
eyJhbGciOiJIUzI1... (JWT - formato antigo)
```

**Segurança:**
- ✅ Seguro expor (é pública)
- ⚠️ RLS DEVE estar ativo nas tabelas

### 2. SERVICE_ROLE_KEY (Secret Key)

**O que é:**
- Chave SECRETA do Supabase
- BYPASSA RLS (acesso total!)
- NUNCA deve ser exposta

**Onde usar:**
- ✅ Edge Functions
- ✅ Backend (Node.js, etc)
- ✅ Scripts internos
- ❌ NUNCA no frontend!

**Formato:**
```
sb_secret_XXX  (novo formato)
eyJhbGciOiJIUzI1... (JWT - formato antigo)
```

**Segurança:**
- ❌ NUNCA expor no código
- ❌ NUNCA commitar
- ❌ NUNCA enviar para cliente

### 3. ACCESS_TOKEN (User Token)

**O que é:**
- Token pessoal do usuário Supabase
- Usado para CLI e MCP
- Acesso às APIs de management

**Onde usar:**
- ✅ CLI local
- ✅ MCP Server
- ✅ Scripts de deploy
- ❌ NUNCA no código da aplicação

**Formato:**
```
sbp_XXXXX
```

**Segurança:**
- ❌ NUNCA expor
- ❌ NUNCA commitar
- ⚠️ Rotacionar se comprometido

---

## 🔒 Chaves Locais vs LIVE

### LOCAL (Docker) - NÃO SENSÍVEIS

Quando você roda `supabase start`, são geradas chaves PADRÃO:

```bash
Publishable key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

**✅ ESTAS CHAVES SÃO SEGURAS PARA DOCUMENTAÇÃO!**

**Por quê?**
- São as MESMAS para TODOS que rodam Supabase local
- Só funcionam em localhost (127.0.0.1)
- NÃO têm acesso ao projeto LIVE
- São públicas na documentação oficial do Supabase

**Fonte**: [Supabase Local Development](https://supabase.com/docs/guides/local-development)

### LIVE (Produção) - SENSÍVEIS!

Chaves do projeto LIVE (`vyxscnevgeubfgfstmtf`):

```bash
# ❌ NUNCA expor estas chaves!
Publishable key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (LIVE)
Secret key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (LIVE)
```

**⚠️ ESTAS CHAVES SÃO SENSÍVEIS!**

**Proteção:**
- ❌ NUNCA commitar no Git
- ❌ NUNCA incluir em documentação
- ✅ Armazenar em `.env.local` (já está no .gitignore)
- ✅ Rotacionar se comprometidas

---

## 📋 Checklist de Segurança

### Antes de Commitar

- [ ] ✅ Nenhum arquivo `.env*` está staged
- [ ] ✅ Nenhuma chave hardcoded no código
- [ ] ✅ Service Role Key NÃO está no frontend
- [ ] ✅ Secrets de Edge Functions via `Deno.env.get()`
- [ ] ✅ Logs não contêm dados sensíveis
- [ ] ✅ `.gitignore` está atualizado

```bash
# Verificar antes de commit
git status | grep -i "env"  # Não deve retornar nada!
git diff | grep -i "key\|secret\|password"  # Revisar tudo!
```

### Antes de Deploy

- [ ] ✅ Secrets configurados no Supabase LIVE
- [ ] ✅ RLS ativo em todas as tabelas
- [ ] ✅ Anon Key usada no frontend
- [ ] ✅ Service Role Key APENAS em Edge Functions
- [ ] ✅ Nenhuma credencial exposta

### Revisar Periodicamente

- [ ] ✅ Rotacionar Access Token (a cada 3-6 meses)
- [ ] ✅ Revisar secrets ativos no LIVE
- [ ] ✅ Auditar logs por vazamentos
- [ ] ✅ Verificar RLS policies

---

## 🚨 O Que Fazer se Expôs uma Chave

### 1. IDENTIFICAR A CHAVE

**Chave LOCAL (Docker)?**
- ✅ Não precisa fazer nada! São públicas.
- Exemplo: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`

**Chave LIVE (Produção)?**
- 🚨 AÇÃO IMEDIATA NECESSÁRIA!

### 2. ROTACIONAR IMEDIATAMENTE

**Service Role Key comprometida:**
```bash
# Via Dashboard Supabase
# 1. Settings → API
# 2. Reset service_role key
# 3. Atualizar .env.local
# 4. Atualizar secrets nas Edge Functions
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<nova> --project-ref vyxscnevgeubfgfstmtf
```

**Anon Key comprometida:**
- Menos crítico (é pública)
- Mas pode rotacionar se quiser:
  - Dashboard → Settings → API → Reset

**Access Token comprometido:**
```bash
# Via Dashboard
# 1. Account → Access Tokens
# 2. Revoke token comprometido
# 3. Criar novo token
# 4. Atualizar .env.local
```

### 3. REMOVER DO HISTÓRICO DO GIT

```bash
# Se commitou credencial por engano
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (CUIDADO!)
git push origin --force --all
```

**⚠️ Melhor:** Rotacionar a chave do que tentar limpar Git!

### 4. NOTIFICAR

- Informar equipe
- Revisar acessos suspeitos
- Monitorar logs do Supabase

---

## 🛡️ Proteções Implementadas

### 1. .gitignore Configurado

```bash
# Arquivo: .gitignore
.env
.env.local
.env.dev.readonly
.env.development.local
.env.test.local
.env.production.local
*.key
secrets/
.secrets
```

### 2. Separação de Ambientes

```
LOCAL:  .env.local → sb_publishable_ACJWlzQHlZjBrEguHvfOxg... (Docker)
LIVE:   wg-crm/.env.local → chaves do projeto LIVE (não commitado)
```

### 3. Helpers com Env Vars

```typescript
// Edge Functions usam Deno.env.get()
const supabase = createSupabaseClient() // Pega de env automaticamente
const apiUrl = await getApiUrl(supabase) // Busca do banco, não hardcode
```

### 4. RLS Ativo

- Todas tabelas devem ter RLS ativo
- Anon Key só acessa dados permitidos por RLS
- Service Role Key bypassa RLS (por isso NUNCA expor!)

---

## 📚 Referências

### Documentação Oficial

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Local Development Keys](https://supabase.com/docs/guides/local-development)

### Documentos do Projeto

- `@.claude/docs/ENVIRONMENT_GUIDE.md` - Gestão de .env
- `@.claude/docs/DEPLOY_CHECKLIST.md` - Validações pré-deploy
- `@CLAUDE.md` - Filosofia e padrões do projeto

---

## ✅ Resumo: Está Seguro?

**SIM! ✅**

1. ✅ `.env.local` está no .gitignore
2. ✅ Nenhuma chave LIVE commitada
3. ✅ Chaves locais (Docker) são públicas - OK expor
4. ✅ Frontend usa apenas Anon Key
5. ✅ Service Role Key apenas em Edge Functions via env
6. ✅ Sistema de URL dinâmica (sem hardcode)

**Chaves na documentação:**
- `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH` → ✅ LOCAL (pública)
- `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz` → ✅ LOCAL (pública)

**Projeto LIVE:** Nenhuma chave exposta! ✅

---

**Mantenha-se seguro! 🔒**

**Última atualização**: 02/11/2025
**Versão**: 1.0
**Projeto**: WG CRM
