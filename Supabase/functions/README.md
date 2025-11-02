# 🚀 Edge Functions - Projeto WG CRM

Este diretório contém todas as Edge Functions do projeto (Deno runtime).

## 📁 Estrutura de Pastas

```
functions/
├── _shared/          ← Código compartilhado entre functions
│   ├── database.ts   ← Helpers para database
│   ├── auth.ts       ← Helpers para autenticação
│   ├── types.ts      ← Types TypeScript compartilhados
│   └── cors.ts       ← CORS headers
│
├── integrations/     ← Integrações externas (APIs, webhooks)
│   ├── webhook-stripe/
│   └── send-email/
│
├── processing/       ← Processamento pesado/demorado
│   ├── generate-pdf/
│   └── resize-images/
│
└── api/              ← APIs customizadas
    ├── analytics/
    └── reports/
```

---

## 🎯 Quando Usar Edge Functions?

### ✅ USE Edge Functions para:
- Integrações externas (Stripe, SendGrid, APIs terceiras)
- Webhooks
- Upload/processamento de arquivos
- Operações que demoram >60 segundos
- Lógica complexa em TypeScript/Deno
- Bibliotecas NPM específicas

### ❌ NÃO USE Edge Functions para:
- Queries simples (use SQL Functions!)
- Lógica de negócio básica (use SQL Functions!)
- Validações (use SQL Functions!)
- Transformações de dados (use SQL Functions!)

**REGRA DE OURO**: SQL FIRST! 90% das operações devem ser SQL Functions.

---

## 🛠️ Desenvolvimento Local

### Iniciar Edge Runtime
```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase

# Iniciar Supabase (inclui Edge Runtime)
supabase start

# Servir todas as functions (hot reload)
supabase functions serve

# Ou servir função específica
supabase functions serve nome-funcao
```

### Criar Nova Function
```bash
cd Supabase
supabase functions new nome-funcao

# Cria: functions/nome-funcao/index.ts
```

### Testar Function Local
```bash
# Terminal 1: Servir function
supabase functions serve nome-funcao

# Terminal 2: Testar com curl
curl -X POST http://localhost:54321/functions/v1/nome-funcao \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'
```

### Ver Logs
```bash
# Logs em tempo real
supabase logs --follow

# Logs específicos de Edge Functions
supabase logs --filter edge_runtime
```

---

## 🌍 Sistema de URL Dinâmica

Todas as Edge Functions devem usar a função SQL `get_api_url()` para obter a URL base:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  // Buscar URL dinamicamente (detecta LOCAL ou LIVE)
  const { data: apiUrl } = await supabase.rpc('get_api_url')

  console.log('API URL:', apiUrl)
  // LOCAL:  http://127.0.0.1:54321
  // LIVE:   https://vyxscnevgeubfgfstmtf.supabase.co

  // Usar apiUrl para fazer requisições...
})
```

**Benefício**: Deploy sem preocupação! A URL é detectada automaticamente.

---

## 🚀 Deploy em Produção

### Via MCP Agent (Recomendado)
```
Task → supabase-mcp-expert → "deploy edge function nome-funcao"
```

### Via CLI (Manual)
```bash
supabase functions deploy nome-funcao --project-ref vyxscnevgeubfgfstmtf
```

### Verificar Deploy
```bash
# Listar functions em LIVE
supabase functions list --project-ref vyxscnevgeubfgfstmtf

# Ver logs em LIVE
supabase logs --project-ref vyxscnevgeubfgfstmtf --filter edge_runtime
```

---

## 🔐 Secrets e Variáveis de Ambiente

### LOCAL (Desenvolvimento)
Criar `.env` na raiz do projeto:
```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_test_...
```

### LIVE (Produção)
```bash
# Configurar secrets via CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx --project-ref vyxscnevgeubfgfstmtf

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
```

---

## 📋 Template Básico

```typescript
// functions/nome-funcao/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar URL dinâmica
    const { data: apiUrl } = await supabase.rpc('get_api_url')

    // Parse body
    const body = await req.json()

    // Lógica da função...
    const result = { success: true, apiUrl, data: body }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    )
  } catch (error) {
    console.error('Erro:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
```

---

## 🧪 Testes

### Teste Manual (curl)
```bash
curl -X POST http://localhost:54321/functions/v1/nome-funcao \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Teste via Frontend
```typescript
const { data, error } = await supabase.functions.invoke('nome-funcao', {
  body: { test: 'data' }
})
```

---

## 📚 Documentação Oficial

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)
- [Deno Standard Library](https://deno.land/std)

---

## 🎯 Comandos Rápidos

```bash
# Criar function
supabase functions new <nome>

# Servir local (hot reload)
supabase functions serve [nome]

# Deploy
supabase functions deploy <nome> --project-ref vyxscnevgeubfgfstmtf

# Logs
supabase logs --follow

# Listar functions
supabase functions list

# Deletar function
supabase functions delete <nome> --project-ref vyxscnevgeubfgfstmtf
```

---

**Última atualização**: 02/11/2025
**Versão**: 1.0
**Projeto**: WG CRM
