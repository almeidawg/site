# Hello World - Edge Function de Exemplo

Edge Function demonstrando o uso completo do sistema de helpers e URL dinâmica.

## 🎯 O Que Demonstra

- ✅ CORS headers (_shared/cors.ts)
- ✅ Cliente Supabase (_shared/database.ts)
- ✅ Sistema de URL dinâmica (get_api_url)
- ✅ Detecção de ambiente (LOCAL/LIVE)
- ✅ Types padronizados (_shared/types.ts)
- ✅ Tratamento de erros
- ✅ Logging

## 🚀 Teste Local

### 1. Iniciar Edge Runtime

```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase
supabase functions serve hello-world
```

### 2. Testar com curl

```bash
# Requisição básica
curl -X POST http://localhost:54321/functions/v1/hello-world \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json"

# Com parâmetro name
curl -X POST http://localhost:54321/functions/v1/hello-world \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Valdair"}'
```

### 3. Testar via Frontend

```typescript
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'Valdair' }
})

console.log(data)
// {
//   success: true,
//   data: {
//     message: "Hello, Valdair!",
//     environment: "LOCAL (Docker)",
//     api_url: "http://127.0.0.1:54321",
//     timestamp: "2025-11-02T20:10:00.000Z",
//     config_sample: [...]
//   },
//   message: "Hello, Valdair!"
// }
```

## 📊 Response Esperado

```json
{
  "success": true,
  "data": {
    "message": "Hello, Valdair!",
    "environment": "LOCAL (Docker)",
    "api_url": "http://127.0.0.1:54321",
    "timestamp": "2025-11-02T20:10:00.000Z",
    "config_sample": [
      { "key": "environment", "value": "local" },
      { "key": "api_url", "value": "http://127.0.0.1:54321" }
    ]
  },
  "message": "Hello, Valdair!"
}
```

## 🌍 Deploy em Produção

```bash
# Via CLI
supabase functions deploy hello-world --project-ref vyxscnevgeubfgfstmtf

# Ou via agente MCP
Task → supabase-mcp-expert → "deploy edge function hello-world"
```

Após deploy em LIVE, a response mudará automaticamente:
```json
{
  "environment": "LIVE (Cloud)",
  "api_url": "https://vyxscnevgeubfgfstmtf.supabase.co",
  ...
}
```

## 🔍 Logs

```bash
# Local
supabase logs --follow

# LIVE
supabase logs --project-ref vyxscnevgeubfgfstmtf --filter edge_runtime
```

## 📚 Arquitetura

```
hello-world/
├── index.ts       ← Lógica principal
└── README.md      ← Esta documentação

Usa helpers de:
├── _shared/cors.ts         ← CORS
├── _shared/database.ts     ← Supabase client + URL dinâmica
└── _shared/types.ts        ← Response types
```

## ✨ Use Como Template

Copie esta estrutura para criar novas Edge Functions:

```bash
# Criar nova function
cp -r functions/api/hello-world functions/api/minha-funcao

# Editar
code functions/api/minha-funcao/index.ts
```
