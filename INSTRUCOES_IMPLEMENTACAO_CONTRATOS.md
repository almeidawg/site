# 📋 INSTRUÇÕES DE IMPLEMENTAÇÃO - MÓDULO CONTRATOS INTEGRADO

**Data:** 2025-11-26
**Objetivo:** Implementar fluxo completo de contratos com aprovação automática e integração com Financeiro e Cronograma

---

## 🎯 RESUMO DO QUE FOI IMPLEMENTADO

### ✅ 1. **Sistema de Avatar para Entities**
- Componente reutilizável `AvatarUpload.jsx`
- Upload direto para Supabase Storage
- Bucket configurado com RLS
- Integrado em `NovaPessoaDialog.jsx`

### ✅ 2. **Módulo de Contratos com Aprovação**
- Campos de aprovação em `project_contracts`
- Condições de pagamento configuráveis (JSONB)
- Status de aprovação com histórico
- Hook `useContratos.js` para gerenciar contratos
- Componente `ContratosSupabase.jsx` com UI completa

### ✅ 3. **Fluxo Automático de Aprovação**
Quando um contrato é **aprovado**:
1. ✅ Gera **Projeto** automaticamente no módulo Cronograma (`projects`)
2. ✅ Cria **Tarefa inicial** (marco de início do projeto)
3. ✅ Gera **Cobranças** no módulo Financeiro baseado em condições de pagamento
4. ✅ Atualiza status do contrato para "assinado"

### ✅ 4. **Funções SQL Criadas**
- `api_aprovar_contrato()` - Aprova e integra
- `api_gerar_projeto_contrato()` - Cria projeto
- `api_gerar_cobrancas_contrato()` - Cria cobranças
- `api_rejeitar_contrato()` - Rejeita com motivo

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### **Migrations (SQL)**
```
supabase/supabase/migrations/
├── 20251126150000_cronograma_financeiro_contratos_completo.sql  ← Script consolidado (PRINCIPAL)
├── 20251126151000_funcoes_aprovacao_contratos.sql               ← Funções de aprovação
└── 20251126141000_storage_avatars_bucket.sql                    ← Bucket Supabase Storage
```

**⚠️ IMPORTANTE:** Use o script `20251126150000_cronograma_financeiro_contratos_completo.sql` que é **idempotente** e resolve problemas de colunas faltantes.

### **Componentes React**
```
wg-crm/src/
├── components/
│   ├── shared/
│   │   └── AvatarUpload.jsx                          ← Componente de upload
│   ├── pages/
│   │   └── ContratosSupabase.jsx                     ← Página de contratos (nova)
│   └── pessoas/
│       └── NovaPessoaDialog.jsx                      ← Modificado (avatar)
└── hooks/
    └── useContratos.js                                ← Hook para contratos
```

---

## 🚀 PASSO A PASSO PARA APLICAR

### **PASSO 1: Aplicar Migrations no Banco Local**

1. **Iniciar Supabase Local:**
   ```bash
   cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\supabase"
   supabase start
   ```

2. **Resetar banco (reaplicar todas migrations):**
   ```bash
   supabase db reset
   ```

   **Ou aplicar migrations específicas manualmente (RECOMENDADO):**
   ```bash
   # Via Docker exec - Aplicar na ordem:

   # 1. Script principal (cronograma + financeiro + contratos)
   docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase/migrations/20251126150000_cronograma_financeiro_contratos_completo.sql"

   # 2. Funções de aprovação
   docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase/migrations/20251126151000_funcoes_aprovacao_contratos.sql"

   # 3. Storage de avatars
   docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase/migrations/20251126141000_storage_avatars_bucket.sql"
   ```

   **✅ VANTAGEM:** O script `20251126150000` é **idempotente** (pode ser executado múltiplas vezes sem erro)

3. **Verificar se migrations foram aplicadas:**
   ```bash
   docker exec -it supabase_db_WG psql -U postgres -d postgres
   ```

   Executar no psql:
   ```sql
   -- Verificar campos novos em project_contracts
   \d project_contracts

   -- Listar funções criadas
   \df api_aprovar_contrato
   \df api_gerar_projeto_contrato
   \df api_gerar_cobrancas_contrato

   -- Verificar bucket de avatars
   SELECT * FROM storage.buckets WHERE id = 'avatars';
   ```

### **PASSO 2: Criar Bucket no Supabase Storage (se necessário)**

Caso o bucket não tenha sido criado automaticamente:

1. Acessar Supabase Studio Local: http://127.0.0.1:54323
2. Ir em **Storage** → **Create bucket**
3. Nome: `avatars`
4. Public: ✅ **SIM**
5. Salvar

### **PASSO 3: Iniciar Frontend React**

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\wg-crm"
npm run dev
```

App abrirá em: http://localhost:5173

### **PASSO 4: Atualizar Rotas para usar novo componente**

Substituir referência ao componente antigo pelo novo:

**Arquivo:** `wg-crm/src/App.jsx` (ou onde as rotas estão definidas)

```jsx
// Antes
import Contratos from '@/components/pages/Contratos';

// Depois
import Contratos from '@/components/pages/ContratosSupabase';
```

---

## 🧪 COMO TESTAR O FLUXO COMPLETO

### **Teste 1: Upload de Avatar**

1. Ir em **Pessoas** → **Nova Pessoa**
2. Clicar em **"Carregar Foto"**
3. Selecionar uma imagem (JPG/PNG, máx. 2MB)
4. ✅ Verificar que imagem é enviada para Supabase Storage
5. Salvar cadastro
6. Verificar que `avatar_url` foi salvo no banco

**Verificar no banco:**
```sql
SELECT id, nome, avatar_url, avatar_source FROM entities WHERE avatar_url IS NOT NULL LIMIT 5;
```

### **Teste 2: Criar Contrato**

1. Ir em **Contratos** → **Novo Contrato**
2. Preencher dados:
   - Cliente (entities com tipo 'cliente')
   - Número do contrato
   - Valor total
   - Data de assinatura
3. (**Opcional**) Adicionar condições de pagamento:
   ```json
   [
     {"parcela": 1, "percentual": 30, "dias": 0, "descricao": "Entrada"},
     {"parcela": 2, "percentual": 40, "dias": 30, "descricao": "30 dias"},
     {"parcela": 3, "percentual": 30, "dias": 60, "descricao": "60 dias"}
   ]
   ```
4. Salvar
5. ✅ Verificar que contrato foi criado com status "em_negociacao"

**Verificar no banco:**
```sql
SELECT * FROM project_contracts ORDER BY created_at DESC LIMIT 1;
```

### **Teste 3: Aprovar Contrato (Fluxo Automático)**

1. Na lista de contratos, clicar no ícone **✓ (CheckCircle)** do contrato
2. Confirmar aprovação
3. ✅ **Verificar que foi gerado automaticamente:**
   - ✅ Projeto no cronograma
   - ✅ Tarefa inicial (marco)
   - ✅ Cobranças no financeiro

**Verificar no banco:**
```sql
-- Verificar contrato aprovado
SELECT
  id,
  numero_contrato,
  aprovado,
  cronograma_gerado,
  financeiro_gerado,
  aprovado_em
FROM project_contracts
WHERE aprovado = TRUE
ORDER BY aprovado_em DESC
LIMIT 1;

-- Verificar projeto gerado
SELECT * FROM projects ORDER BY created_at DESC LIMIT 1;

-- Verificar tarefa inicial
SELECT * FROM tasks WHERE tipo = 'marco' ORDER BY created_at DESC LIMIT 1;

-- Verificar cobranças geradas
SELECT
  id,
  descricao,
  valor,
  vencimento,
  status
FROM cobrancas
ORDER BY created_at DESC;
```

### **Teste 4: Rejeitar Contrato**

1. Criar um novo contrato
2. Clicar no ícone **✗ (XCircle)**
3. Informar motivo da rejeição
4. Confirmar
5. ✅ Verificar que status mudou para "cancelado"
6. ✅ Verificar que motivo foi registrado

**Verificar no banco:**
```sql
SELECT
  id,
  numero_contrato,
  status,
  motivo_rejeicao
FROM project_contracts
WHERE status = 'cancelado';
```

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### **Problema: "Função api_aprovar_contrato não encontrada"**

**Causa:** Migration não foi aplicada

**Solução:**
```bash
cd supabase
supabase db reset
# Ou aplicar migration manualmente via Docker
```

### **Problema: "Bucket avatars não existe"**

**Causa:** Storage bucket não foi criado

**Solução:**
1. Criar manualmente via Supabase Studio
2. Ou executar migration novamente
3. Verificar policies do bucket

### **Problema: "Erro ao fazer upload de avatar"**

**Causa:** Falta de permissões no bucket

**Solução:**
```sql
-- Verificar policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Recriar policies se necessário (executar migration novamente)
```

### **Problema: "Projeto/Cobranças não foram gerados"**

**Causa:** Possível erro na função SQL

**Solução:**
1. Verificar logs do PostgreSQL:
   ```bash
   docker logs supabase_db_WG --tail 50
   ```

2. Executar função manualmente:
   ```sql
   SELECT api_aprovar_contrato(
     'ID_DO_CONTRATO_AQUI'::uuid,
     TRUE
   );
   ```

3. Verificar mensagens de erro

---

## 📊 ESTRUTURA DE DADOS

### **project_contracts (NOVOS CAMPOS)**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `aprovado` | BOOLEAN | Se foi aprovado |
| `aprovado_por` | UUID | Quem aprovou |
| `aprovado_em` | TIMESTAMPTZ | Quando foi aprovado |
| `motivo_rejeicao` | TEXT | Motivo se rejeitado |
| `condicoes_pagamento` | JSONB | Array de condições |
| `forma_pagamento` | TEXT | Forma de pagamento |
| `parcelas` | INTEGER | Número de parcelas |
| `cronograma_gerado` | BOOLEAN | Se gerou projeto |
| `financeiro_gerado` | BOOLEAN | Se gerou cobranças |
| `conteudo_contrato` | TEXT | Texto do contrato |

### **Exemplo de condicoes_pagamento (JSONB)**

```json
[
  {
    "parcela": 1,
    "percentual": 30,
    "dias": 0,
    "descricao": "Entrada (30% no ato)"
  },
  {
    "parcela": 2,
    "percentual": 40,
    "dias": 30,
    "descricao": "2ª parcela (40% em 30 dias)"
  },
  {
    "parcela": 3,
    "percentual": 30,
    "dias": 60,
    "descricao": "3ª parcela (30% em 60 dias)"
  }
]
```

---

## 🎯 CHECKLIST DE VALIDAÇÃO

Antes de considerar completo, validar:

- [ ] ✅ Migrations aplicadas com sucesso
- [ ] ✅ Bucket `avatars` criado no Storage
- [ ] ✅ Upload de avatar funciona
- [ ] ✅ Avatar salvo em `entities.avatar_url`
- [ ] ✅ Contrato criado em `project_contracts`
- [ ] ✅ Aprovação de contrato funciona
- [ ] ✅ Projeto gerado em `projects`
- [ ] ✅ Tarefa criada em `tasks`
- [ ] ✅ Cobranças criadas em `cobrancas`
- [ ] ✅ Rejeição de contrato funciona
- [ ] ✅ Motivo de rejeição salvo
- [ ] ✅ UI mostra status correto (Pendente/Aprovado/Rejeitado)
- [ ] ✅ Ícones de aprovação/rejeição aparecem

---

## 🚀 PRÓXIMOS PASSOS (FUTURO)

1. **Deploy em LIVE:**
   ```bash
   # Via MCP Agent
   Task → supabase-live → "aplicar migrations contratos e storage"

   # Ou via CLI
   supabase db push --linked --project-ref vyxscnevgeubfgfstmtf
   ```

2. **Melhorias Futuras:**
   - [ ] Assinatura eletrônica de contratos
   - [ ] Envio de contrato por email
   - [ ] Histórico de alterações
   - [ ] Notificações de aprovação
   - [ ] Dashboard de contratos (métricas)

---

## 📞 SUPORTE

Se encontrar problemas, verificar:
1. Logs do Supabase: `docker logs supabase_db_WG -f`
2. Console do navegador (F12)
3. Network tab (verificar requests falhando)

---

**✅ Implementação Completa!**

**Autor:** Claude Code
**Data:** 2025-11-26
**Versão:** 1.0
