# 🔥 Edge Functions - WG CRM

## 📊 Status: 20 Funções Ativas

### ✅ O que foi feito:
- Baixadas **25 Edge Functions** do WG DEV
- **5 funções migradas para SQL** (Migration 014) → Movidas para `_deprecated/`
- **20 funções ativas** organizadas e prontas para uso

---

## 📋 Funções Disponíveis por Categoria

### 👥 Gestão de Usuários (3 funções)

| Função | Descrição | Prioridade |
|--------|-----------|------------|
| `admin-list-users` | Lista todos os usuários do sistema | ⚠️ Baixa (pode migrar para SQL) |
| `admin-update-user` | Atualiza dados de usuário | ⚠️ Baixa (pode migrar para SQL) |
| `create-user` | Cria novo usuário | ⚠️ Baixa (pode migrar para SQL) |

> **📝 Nota**: Essas 3 funções ainda estão como Edge Functions, mas **podem ser migradas para SQL** seguindo o padrão da Migration 014.

---

### 📄 Geração de PDFs (8 funções)

| Função | Descrição | Prioridade |
|--------|-----------|------------|
| `proposta-pdf` | Gera PDF de proposta comercial | 🔴 ALTA |
| `contrato-pdf` | Gera PDF de contrato | 🔴 ALTA |
| `pedido-compra-pdf` | Gera PDF de pedido de compra | 🔴 ALTA |
| `ficha-cadastral-pdf` | Gera PDF de ficha cadastral | 🟡 MÉDIA |
| `assistencia-pdf` | Gera PDF de assistência técnica | 🟡 MÉDIA |
| `finance-report` | Gera relatório financeiro em PDF | 🟡 MÉDIA |
| `people-card` | Gera cartão de visita em PDF | 🟢 BAIXA |
| `pdf-generate` | Gerador genérico de PDF | 🟢 BAIXA |

> **⚠️ Importante**: PDFs **NÃO PODEM ser migrados para SQL**. Requerem bibliotecas JavaScript (jsPDF, PDFKit).

---

### 📊 Google Sheets (4 funções)

| Função | Descrição | Prioridade |
|--------|-----------|------------|
| `sheets-export-clientes` | Exporta clientes para Google Sheets | 🟡 MÉDIA |
| `sheets-export-lancamentos` | Exporta lançamentos financeiros | 🟡 MÉDIA |
| `sheets-export-produtos` | Exporta produtos | 🟢 BAIXA |
| `sheets-import-clientes` | Importa clientes do Google Sheets | 🟢 BAIXA |

> **⚠️ Importante**: Google Sheets API **não funciona bem em SQL**. OAuth2, refresh tokens, etc. são complexos demais.

---

### 📧 Notificações (2 funções)

| Função | Descrição | Prioridade |
|--------|-----------|------------|
| `notify-email` | Envia notificações por e-mail | 🟡 MÉDIA |
| `notify-whatsapp` | Envia notificações por WhatsApp | 🟡 MÉDIA |

> **📝 Nota**: `notify-email` poderia usar `pg_notify` + worker, mas Edge Function é mais prático.

---

### 🔍 Scraping e APIs Externas (2 funções)

| Função | Descrição | Prioridade |
|--------|-----------|------------|
| `scrape-leroy` | Scraping de produtos da Leroy Merlin | 🔴 ALTA |
| `get-feriados` | Busca feriados de API externa | 🟢 BAIXA |

> **⚠️ Importante**: Web scraping **NÃO PODE ser SQL**. Requer parsing de HTML com Cheerio.

---

### ⏰ CRON e Processamento (1 função)

| Função | Descrição | Prioridade |
|--------|-----------|------------|
| `cron-due-payments` | CRON para cobranças vencidas | 🟡 MÉDIA |

> **📝 Nota**: Poderia ser `pg_cron`, mas `supabase functions schedule` é mais fácil.

---

## 🚀 Como Iniciar

### Opção 1: Script Automático (Recomendado)

```bash
cd "/Users/valdair/Documents/Projetos/William WG"
./start-supabase-full.sh
```

### Opção 2: Manual

```bash
# 1. Iniciar Supabase
supabase start

# 2. Servir Edge Functions (exemplos)
supabase functions serve scrape-leroy --no-verify-jwt
supabase functions serve proposta-pdf --no-verify-jwt
supabase functions serve contrato-pdf --no-verify-jwt
```

### Parar Tudo:

```bash
./stop-supabase-full.sh
```

---

## 📁 Estrutura de Pastas

```
Supabase/functions/
├── _deprecated/           # 5 funções migradas para SQL (NÃO USAR)
│   ├── README.md         # Explicação detalhada
│   ├── users-invite/
│   ├── users-reset/
│   ├── users-role-toggle/
│   ├── users-create/
│   └── secure-signup/
│
├── _shared/              # Helpers compartilhados
│   ├── auth.ts
│   ├── cors.ts
│   ├── database.ts
│   └── types.ts
│
├── api/                  # APIs internas
│   └── hello-world/
│
├── integrations/         # Integrações externas (futuro)
├── processing/           # Processamento de dados (futuro)
│
├── scrape-leroy/         # 🔴 ALTA prioridade
├── proposta-pdf/         # 🔴 ALTA prioridade
├── contrato-pdf/         # 🔴 ALTA prioridade
├── pedido-compra-pdf/    # 🔴 ALTA prioridade
│
├── sheets-export-clientes/    # 🟡 MÉDIA prioridade
├── sheets-export-lancamentos/ # 🟡 MÉDIA prioridade
├── notify-email/              # 🟡 MÉDIA prioridade
├── notify-whatsapp/           # 🟡 MÉDIA prioridade
├── cron-due-payments/         # 🟡 MÉDIA prioridade
│
└── ... (demais funções)
```

---

## 🧪 Exemplos de Uso

### 1. Scrape Leroy Merlin

```bash
curl -X POST "http://localhost:54321/functions/v1/scrape-leroy" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.leroymerlin.com.br/toalheiro-eletrico-aquece-ate-50-c-branco-110v_91252685"}'
```

**Resposta:**
```json
{
  "description": "Toalheiro Elétrico...",
  "price": 250.50,
  "image": "https://..."
}
```

### 2. Gerar PDF de Proposta

```bash
curl -X POST "http://localhost:54321/functions/v1/proposta-pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"proposta_id": "uuid-aqui"}'
```

### 3. Exportar Clientes para Google Sheets

```bash
curl -X POST "http://localhost:54321/functions/v1/sheets-export-clientes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🔧 Desenvolvimento

### Criar Nova Edge Function:

```bash
supabase functions new nome-da-funcao
```

### Testar Localmente:

```bash
supabase functions serve nome-da-funcao --no-verify-jwt
```

### Deploy para Produção:

```bash
supabase functions deploy nome-da-funcao --project-ref ahlqzzkxuutwoepirpzr
```

---

## 📝 Logs

Logs das Edge Functions são salvos em:

```
/tmp/supabase-function-*.log
```

Ver logs em tempo real:

```bash
tail -f /tmp/supabase-function-scrape-leroy.log
```

---

## ⚙️ Configuração

Edge Functions são configuradas em:

```
Supabase/supabase/config.toml
```

Seção relevante:

```toml
[edge_runtime]
enabled = true
policy = "per_worker"  # Hot reload habilitado
inspector_port = 8083
deno_version = 2
```

---

## 🐛 Troubleshooting

### Função não inicia:

```bash
# Ver logs
cat /tmp/supabase-function-scrape-leroy.log

# Reiniciar
pkill -f "supabase functions serve scrape-leroy"
supabase functions serve scrape-leroy --no-verify-jwt
```

### Erro de porta ocupada:

```bash
# Verificar processos
lsof -i :54321

# Matar processo
pkill -f "supabase functions serve"
```

### Função não encontrada (404):

```bash
# Verificar se está servindo
ps aux | grep "supabase functions serve"

# Verificar se existe
ls -la Supabase/functions/nome-da-funcao/
```

---

## 📚 Documentação Relacionada

- **ANALISE_EDGE_FUNCTIONS.md** - Análise completa de todas as 25 funções
- **Migration 014** - SQL Functions que substituem 5 Edge Functions
- **start-supabase-full.sh** - Script de inicialização automática
- **_deprecated/README.md** - Funções descontinuadas

---

**Última atualização:** 03/Nov/2025
**Total de funções:** 20 ativas + 5 deprecated
**Status:** ✅ Todas baixadas e organizadas
