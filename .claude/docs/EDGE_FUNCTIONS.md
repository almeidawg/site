# 🚀 Edge Functions - Guia Completo - Projeto WG CRM

**Objetivo**: Documentar o uso completo de Edge Functions com sistema de URL dinâmica

---

## 📁 Estrutura de Pastas (Atualizada - Padrão Liftlio)

```
/Users/valdair/Documents/Projetos/William WG/Supabase/
├── functions/                    ← EDGE FUNCTIONS (TypeScript/Deno)
│   ├── _shared/                  ← Código compartilhado
│   │   ├── cors.ts               ← CORS headers
│   │   ├── database.ts           ← Helpers DB + URL dinâmica
│   │   ├── auth.ts               ← Helpers autenticação
│   │   └── types.ts              ← Types TypeScript
│   ├── integrations/             ← Integrações externas (webhooks, APIs)
│   ├── processing/               ← Processamento pesado
│   ├── api/                      ← APIs customizadas
│   │   └── hello-world/          ← Exemplo completo
│   │       ├── index.ts
│   │       └── README.md
│   └── README.md                 ← Docs das Edge Functions
│
├── migrations/                   ← MIGRATIONS CUSTOMIZADAS (histórico)
│   └── 20251102_*.sql
│
├── supabase/                    ← CONFIGURAÇÃO DO SUPABASE CLI
│   ├── migrations/              ← Migrations do CLI (db pull/push)
│   │   ├── 001_criar_tabelas.sql
│   │   ├── 20251102200927_criar_sistema_url_dinamica.sql
│   │   └── ...
│   ├── config.toml              ← Configuração Supabase
│   └── .gitignore
│
├── backup/                      ← Backups e referências
└── snippets/                    ← Templates
```

**IMPORTANTE**: Comandos `supabase` são executados DE `/Supabase/` (raiz), NÃO de dentro de `supabase/`!

---

## 🎯 SQL Functions vs Edge Functions

### ✅ Use SQL Functions (90% dos casos)

**Quando usar:**
- Queries simples e complexas
- Lógica de negócio
- Validações
- Transformações de dados
- Cálculos
- RLS (Row Level Security)

**Benefícios:**
- Performance superior (executa direto no PostgreSQL)
- Menos overhead
- Transações ACID
- Fácil de testar

**Exemplo:**
```sql
-- Criar em: Supabase/supabase/migrations/XXX_api_calcular_total.sql
CREATE OR REPLACE FUNCTION api_calcular_total(p_entity_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    v_total numeric;
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO v_total
    FROM oportunidades
    WHERE entity_id = p_entity_id AND status = 'fechada';

    RETURN v_total;
END;
$$;
```

### ✅ Use Edge Functions (10% dos casos)

**Quando usar:**
- ❗ Integrações externas (Stripe, SendGrid, APIs terceiras)
- ❗ Webhooks de serviços externos
- ❗ Upload/processamento de arquivos
- ❗ Operações que demoram >60 segundos
- ❗ Lógica complexa em TypeScript/Deno
- ❗ Necessidade de bibliotecas NPM específicas

**Exemplo:**
```typescript
// Criar em: Supabase/functions/integrations/webhook-stripe/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'npm:stripe@^14.0.0'

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
  // ... lógica de webhook
})
```

---

## 🌍 Sistema de URL Dinâmica

### Como Funciona

O projeto usa uma **tabela de configuração** (`app_config`) e **função SQL** (`get_api_url()`) para detectar automaticamente o ambiente:

```sql
-- Função SQL (já criada pela migration)
SELECT get_api_url();
-- LOCAL:  http://127.0.0.1:54321
-- LIVE:   https://vyxscnevgeubfgfstmtf.supabase.co
```

### Benefícios

- ✅ **Deploy sem preocupação**: Mesma Edge Function funciona em LOCAL e LIVE
- ✅ **Sem hardcode**: URL nunca está no código
- ✅ **Fácil manutenção**: Mudar ambiente = UPDATE na tabela
- ✅ **Type-safe**: Helpers TypeScript prontos

### Uso em Edge Functions

```typescript
import { createSupabaseClient, getApiUrl } from '../_shared/database.ts'

Deno.serve(async (req) => {
  const supabase = createSupabaseClient()

  // Buscar URL dinâmica
  const apiUrl = await getApiUrl(supabase)
  console.log('API URL:', apiUrl)
  // LOCAL: http://127.0.0.1:54321
  // LIVE:  https://vyxscnevgeubfgfstmtf.supabase.co

  // Usar em requisições fetch, etc
  const response = await fetch(`${apiUrl}/rest/v1/oportunidades`)
})
```

### Configurar Ambiente

**LOCAL** (já configurado):
```sql
-- Já está assim por padrão
SELECT * FROM app_config WHERE key IN ('environment', 'api_url');
-- environment | local
-- api_url     | http://127.0.0.1:54321
```

**LIVE** (ao fazer deploy):
```sql
-- Executar no LIVE via agente MCP
UPDATE app_config SET value = 'live' WHERE key = 'environment';
UPDATE app_config SET value = 'https://vyxscnevgeubfgfstmtf.supabase.co' WHERE key = 'api_url';
UPDATE app_config SET value = 'vyxscnevgeubfgfstmtf' WHERE key = 'project_id';
```

---

## 🚀 Desenvolvimento Local

### Inicialização Completa (3 Servidores)

**Terminal 1: Supabase + Edge Runtime**
```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase
supabase start

# Aguardar: "Started supabase local development setup"
# Todos serviços disponíveis:
# - PostgreSQL (porta 54322)
# - API (porta 54321)
# - Studio (porta 54323)
# - Edge Runtime (porta 8083 - inspector)
# - Mailpit (porta 54324)
```

**Terminal 2: Edge Functions (se tiver functions para desenvolver)**
```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase

# Servir todas as functions (hot reload)
supabase functions serve

# Ou servir função específica
supabase functions serve hello-world

# Disponível em: http://localhost:54321/functions/v1/hello-world
```

**Terminal 3: Frontend React**
```bash
cd /Users/valdair/Documents/Projetos/William\ WG/wg-crm
npm run dev

# App em: http://localhost:5173
```

### Criar Nova Edge Function

```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase

# Criar function
supabase functions new minha-funcao

# Organizar por categoria (mover manualmente)
# Se for integração: mv functions/minha-funcao functions/integrations/
# Se for processing: mv functions/minha-funcao functions/processing/
# Se for API:        mv functions/minha-funcao functions/api/
```

### Testar Edge Function

**Via curl:**
```bash
# Obter ANON_KEY
supabase status | grep "Publishable key"

# Testar
curl -X POST http://localhost:54321/functions/v1/hello-world \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Valdair"}'
```

**Via Frontend:**
```typescript
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'Valdair' }
})

console.log(data)
```

### Ver Logs

```bash
# Logs em tempo real (todas as functions)
supabase logs --follow

# Filtrar apenas Edge Functions
supabase logs --filter edge_runtime --follow

# Filtrar função específica
supabase logs --filter edge_runtime | grep "hello-world"
```

---

## 📦 Deploy em Produção

### Workflow Completo

**1. Desenvolvimento LOCAL:**
```bash
# Branch dev-supabase-local
git checkout dev-supabase-local

# Criar/modificar Edge Function
cd Supabase
# ... editar functions/minha-funcao/index.ts

# Testar localmente
supabase functions serve minha-funcao
# Testar com curl...

# Commit
git add functions/
git commit -m "feat: Adiciona Edge Function minha-funcao"
git push origin dev-supabase-local
```

**2. Code Review e Merge:**
```bash
# Após aprovação
git checkout main
git merge dev-supabase-local
git push origin main
```

**3. Deploy via MCP Agent:**
```
Task → supabase-mcp-expert → "deploy edge function minha-funcao"
```

**4. Configurar URL no LIVE (primeira vez):**
```
Task → supabase-mcp-expert → "executar no LIVE:
UPDATE app_config SET value = 'live' WHERE key = 'environment';
UPDATE app_config SET value = 'https://vyxscnevgeubfgfstmtf.supabase.co' WHERE key = 'api_url';
"
```

**5. Verificar Deploy:**
```
Task → supabase-mcp-expert → "verificar logs edge function minha-funcao últimos 5min"
```

### Deploy Manual (CLI)

```bash
# Deploy
supabase functions deploy minha-funcao --project-ref vyxscnevgeubfgfstmtf

# Verificar
supabase functions list --project-ref vyxscnevgeubfgfstmtf

# Ver logs
supabase logs --project-ref vyxscnevgeubfgfstmtf --filter edge_runtime
```

---

## 🔐 Secrets e Variáveis de Ambiente

### LOCAL (Desenvolvimento)

Criar `.env` na raiz do projeto WG:
```bash
# /Users/valdair/Documents/Projetos/William WG/.env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

# Secrets de terceiros (exemplo)
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG....
```

### LIVE (Produção)

```bash
# Configurar secrets via CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx --project-ref vyxscnevgeubfgfstmtf
supabase secrets set SENDGRID_API_KEY=SG.xxx --project-ref vyxscnevgeubfgfstmtf

# Listar secrets
supabase secrets list --project-ref vyxscnevgeubfgfstmtf

# Deletar secret
supabase secrets unset STRIPE_SECRET_KEY --project-ref vyxscnevgeubfgfstmtf
```

### Acessar em Edge Function

```typescript
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurado!')
}

const stripe = new Stripe(stripeKey)
```

---

## 📚 Helpers Disponíveis

### CORS (_shared/cors.ts)

```typescript
import { corsHeaders, handleCorsPreFlight } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight()
  }

  // ... lógica

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  })
})
```

### Database (_shared/database.ts)

```typescript
import { createSupabaseClient, getApiUrl, isLocalEnvironment } from '../_shared/database.ts'

serve(async (req) => {
  const supabase = createSupabaseClient() // Com Service Role Key
  const apiUrl = await getApiUrl(supabase) // URL dinâmica
  const isLocal = await isLocalEnvironment(supabase) // true/false

  // Query no banco
  const { data } = await supabase.from('oportunidades').select('*')
})
```

### Auth (_shared/auth.ts)

```typescript
import { requireAuth } from '../_shared/auth.ts'

serve(async (req) => {
  const supabase = createSupabaseClient()

  // Verificar autenticação
  const { user, error } = await requireAuth(req, supabase)
  if (error) return error // 401 Unauthorized

  console.log('User:', user.email)
  // ... lógica autenticada
})
```

### Types (_shared/types.ts)

```typescript
import { createSuccessResponse, createErrorResponse } from '../_shared/types.ts'

serve(async (req) => {
  try {
    const data = { message: 'Success!' }
    return new Response(
      JSON.stringify(createSuccessResponse(data, 'Operação concluída')),
      { headers: corsHeaders }
    )
  } catch (error) {
    return new Response(
      JSON.stringify(createErrorResponse(error.message, { details: error })),
      { status: 500, headers: corsHeaders }
    )
  }
})
```

---

## ✅ Checklist de Deploy

Antes de fazer deploy de Edge Function em LIVE:

- [ ] ✅ Testada localmente (`supabase functions serve`)
- [ ] ✅ Testada com curl e/ou frontend
- [ ] ✅ Usa helpers de `_shared/` (CORS, database, etc)
- [ ] ✅ Usa `getApiUrl()` ao invés de URL hardcoded
- [ ] ✅ Tratamento de erros implementado
- [ ] ✅ Logs adequados (console.log)
- [ ] ✅ Secrets configurados (se necessário)
- [ ] ✅ Sem dados sensíveis no código
- [ ] ✅ Git commit com mensagem descritiva
- [ ] ✅ Code review aprovado (se aplicável)

---

## 🔍 Troubleshooting

### "Function not found"

```bash
# Verificar se function existe
cd Supabase
ls -la functions/

# Verificar se está servindo
supabase functions serve <nome>

# Verificar logs
supabase logs --filter edge_runtime
```

### "CORS error"

Certifique-se de:
1. Importar `corsHeaders` de `_shared/cors.ts`
2. Tratar requisições OPTIONS: `if (req.method === 'OPTIONS') return handleCorsPreFlight()`
3. Incluir headers na response: `headers: { ...corsHeaders, ... }`

### "Cannot connect to Supabase"

```bash
# Verificar se Supabase está rodando
supabase status

# Reiniciar
supabase stop
supabase start
```

### "get_api_url() not found"

```bash
# Verificar se migration foi aplicada
docker exec -i supabase_db_WG psql -U postgres -d postgres -c "SELECT get_api_url();"

# Se não existe, aplicar migration
supabase db reset
```

---

## 📋 Comandos Rápidos

```bash
# Criar function
supabase functions new <nome>

# Servir localmente (hot reload)
supabase functions serve [nome]

# Logs em tempo real
supabase logs --follow

# Deploy LIVE
supabase functions deploy <nome> --project-ref vyxscnevgeubfgfstmtf

# Listar functions LIVE
supabase functions list --project-ref vyxscnevgeubfgfstmtf

# Secrets LIVE
supabase secrets set KEY=value --project-ref vyxscnevgeubfgfstmtf
supabase secrets list --project-ref vyxscnevgeubfgfstmtf
```

---

## 🎓 Referências

### Documentação do Projeto

- `@.claude/docs/CODE_STANDARDS.md` - Padrões TypeScript/Deno
- `@.claude/docs/SUPABASE_WORKFLOW.md` - Workflow LOCAL → DEPLOY
- `@.claude/docs/ENVIRONMENT_GUIDE.md` - Gestão de ambientes
- `@.claude/docs/DEPLOY_CHECKLIST.md` - Validações de deploy

### Documentação Oficial

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)
- [Deno Standard Library](https://deno.land/std)

### Exemplos no Projeto

- `Supabase/functions/api/hello-world/` - Exemplo completo com todos helpers
- `Supabase/functions/README.md` - Docs locais das functions

---

**Lembre-se**: SQL FIRST! Só use Edge Function quando realmente necessário.

**Última atualização**: 02/11/2025
**Versão**: 2.0 (estrutura atualizada)
**Projeto**: WG CRM
