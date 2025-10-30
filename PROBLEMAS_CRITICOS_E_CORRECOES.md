# 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS E CORREÇÕES NECESSÁRIAS

**Data da Análise:** 30 de Outubro de 2025
**Status:** URGENTE - Sistema com funcionalidades quebradas

---

## 📊 RESUMO EXECUTIVO

### Status Geral
- **Tabelas Criadas:** 13/15 (87%)
- **Tabelas Faltando:** 2/15 (13%) - **CRÍTICO!**
- **Queries com Erro:** 6+ queries quebradas
- **Campos Inexistentes:** 8+ referências a campos que não existem
- **Integridade:** 62% ✓

### Impacto
🔴 **ALTO** - 2 funcionalidades completamente quebradas (Assistência e Produtos)
🟠 **MÉDIO** - 4 queries com erros de campo
🟡 **BAIXO** - Campos opcionais faltando

---

## 🚨 PROBLEMAS CRÍTICOS

### 1. TABELA `assistencias` NÃO EXISTE (🔴 CRÍTICO)

**Arquivo afetado:** `/home/user/WG/wg-crm/src-new/features/obras/Assistencia.jsx`

**Queries quebradas:**
```javascript
// TODAS essas queries FALHAM porque tabela não existe:
supabase.from('assistencias').select('*')  // ❌ ERRO
supabase.from('assistencias').insert({...}) // ❌ ERRO
supabase.from('assistencias').update({...}) // ❌ ERRO
supabase.from('assistencias').delete()      // ❌ ERRO
```

**Solução:**
```bash
# Executar migration:
psql $DATABASE_URL -f Supabase/migrations/006_criar_tabelas_faltando.sql
```

**Funcionalidade afetada:**
- ❌ Página de Assistência (`/assistencia`) NÃO FUNCIONA
- ❌ Criar ordem de serviço NÃO FUNCIONA
- ❌ Listar assistências NÃO FUNCIONA
- ❌ Editar/deletar assistências NÃO FUNCIONA

---

### 2. TABELA `produtos_servicos` NÃO EXISTE (🔴 CRÍTICO)

**Arquivos afetados:**
- `/home/user/WG/wg-crm/src-new/core/config/Configuracoes.jsx`
- `/home/user/WG/wg-crm/src-new/features/propostas/NovaPropostaDialog.jsx`

**Queries quebradas:**
```javascript
// TODAS essas queries FALHAM:
supabase.from('produtos_servicos').select('*')    // ❌ ERRO
supabase.from('produtos_servicos').insert({...})  // ❌ ERRO
supabase.from('produtos_servicos').upsert({...})  // ❌ ERRO
supabase.from('produtos_servicos').delete()       // ❌ ERRO
```

**Solução:**
```bash
# Executar migration:
psql $DATABASE_URL -f Supabase/migrations/006_criar_tabelas_faltando.sql
```

**Funcionalidade afetada:**
- ❌ Configuração de Produtos (`/configuracoes`) NÃO FUNCIONA
- ❌ Criar proposta com produtos NÃO FUNCIONA
- ❌ Listar produtos NÃO FUNCIONA

---

### 3. CAMPO `apelido` em `contas_financeiras` NÃO EXISTE (🟠 MÉDIO)

**Arquivo afetado:** `/home/user/WG/wg-crm/src-new/features/financeiro/NovoTituloDialog.jsx` (linha 39)

**Query quebrada:**
```javascript
// Esta query FALHA:
const { data: contas } = await supabase
  .from('contas_financeiras')
  .select('id, apelido, empresa_id');  // ❌ Campo 'apelido' não existe
```

**Solução Opção A (Recomendada):**
```bash
# Adicionar campo à tabela:
psql $DATABASE_URL -f Supabase/migrations/007_corrigir_campos_faltando.sql
```

**Solução Opção B (Rápida):**
```javascript
// Corrigir query no código:
const { data: contas } = await supabase
  .from('contas_financeiras')
  .select('id, banco, agencia, conta, empresa_id');  // ✅ Campos existentes
```

**Funcionalidade afetada:**
- 🟠 Criar novo título financeiro (dropdown de contas não carrega)

---

### 4. CAMPO `empresa_id` em `plano_contas` NÃO EXISTE (🟠 MÉDIO)

**Arquivo afetado:** `/home/user/WG/wg-crm/src-new/features/financeiro/NovoTituloDialog.jsx` (linha 40)

**Query quebrada:**
```javascript
// Esta query FALHA parcialmente:
const { data: categorias } = await supabase
  .from('plano_contas')
  .select('id, grupo, conta, empresa_id');  // ⚠️ Campo 'empresa_id' não existe
```

**Solução Opção A (Recomendada):**
```bash
# Adicionar campo à tabela:
psql $DATABASE_URL -f Supabase/migrations/007_corrigir_campos_faltando.sql
```

**Solução Opção B (Rápida):**
```javascript
// Remover campo do SELECT:
const { data: categorias } = await supabase
  .from('plano_contas')
  .select('id, grupo, conta');  // ✅ Sem empresa_id
```

**Funcionalidade afetada:**
- 🟠 Criar novo título financeiro (dropdown de categorias pode não filtrar por empresa)

---

### 5. CAMPO `empresa_id` em `centros_custo` NÃO EXISTE (🟠 MÉDIO)

**Arquivo afetado:** `/home/user/WG/wg-crm/src-new/features/financeiro/NovoTituloDialog.jsx` (linha 41)

**Query quebrada:**
```javascript
// Esta query FALHA parcialmente:
const { data: centrosCusto } = await supabase
  .from('centros_custo')
  .select('id, nome, empresa_id');  // ⚠️ Campo 'empresa_id' não existe
```

**Solução Opção A (Recomendada):**
```bash
# Adicionar campo à tabela:
psql $DATABASE_URL -f Supabase/migrations/007_corrigir_campos_faltando.sql
```

**Solução Opção B (Rápida):**
```javascript
// Remover campo do SELECT:
const { data: centrosCusto } = await supabase
  .from('centros_custo')
  .select('id, nome');  // ✅ Sem empresa_id
```

**Funcionalidade afetada:**
- 🟠 Criar novo título financeiro (dropdown de centros de custo pode não filtrar por empresa)

---

### 6. CAMPO `nome_razao_social` em `entities` NÃO EXISTE (🟠 MÉDIO)

**Arquivo afetado:** `/home/user/WG/wg-crm/src-new/features/obras/Assistencia.jsx` (linha 56)

**Query quebrada:**
```javascript
// Esta query FALHA:
const { data: clientes } = await supabase
  .from('entities')
  .select('id, nome_razao_social')  // ❌ Campo 'nome_razao_social' não existe
  .eq('tipo', 'cliente')
  .order('nome_razao_social');
```

**Solução (FÁCIL):**
```javascript
// Corrigir para 'nome':
const { data: clientes } = await supabase
  .from('entities')
  .select('id, nome')  // ✅ Campo correto
  .eq('tipo', 'cliente')
  .order('nome');  // ✅ Ordenar por 'nome'
```

**Funcionalidade afetada:**
- 🟠 Criar assistência (dropdown de clientes não carrega)

---

### 7. QUERY COMPLEXA QUEBRADA em `lancamentos` (🔴 CRÍTICO)

**Arquivo afetado:** `/home/user/WG/wg-crm/src-new/features/financeiro/Financeiro.jsx` (linhas 89-96)

**Query quebrada:**
```javascript
// Esta query está COMPLETAMENTE quebrada:
const { data, error } = await supabase
  .from('lancamentos')
  .select(`
    *,
    centro_custo:centro_custo_cliente_id ( nome_razao_social ),  // ❌ Campo não existe
    categoria:categoria_id ( nome )  // ⚠️ Plano_contas tem 'conta', não 'nome'
  `)
  .order('criado_em', { ascending: false });  // ❌ Campo 'criado_em' não existe (é 'created_at')
```

**Problemas múltiplos:**
1. Campo `nome_razao_social` não existe em `centros_custo` (só tem `nome`)
2. Campo `nome` não existe em `plano_contas` (deveria ser `conta`)
3. Campo `criado_em` não existe em `lancamentos` (é `created_at`)

**Solução:**
```javascript
// Query corrigida:
const { data, error } = await supabase
  .from('lancamentos')
  .select(`
    *,
    centro_custo:centro_custo_cliente_id ( nome ),  // ✅ Campo correto
    categoria:categoria_id ( conta )  // ✅ Campo correto
  `)
  .order('created_at', { ascending: false });  // ✅ Campo correto
```

**Funcionalidade afetada:**
- 🔴 Página Financeiro - Aba "Lançamentos" NÃO CARREGA

---

## 📋 ORDEM DE EXECUÇÃO DAS CORREÇÕES

### **PASSO 1: Executar Migrations (URGENTE)**

```bash
# No projeto Supabase via Dashboard ou CLI:

# 1. Criar tabelas faltando (CRÍTICO!)
psql $DATABASE_URL -f Supabase/migrations/006_criar_tabelas_faltando.sql

# 2. Adicionar campos faltando
psql $DATABASE_URL -f Supabase/migrations/007_corrigir_campos_faltando.sql
```

### **PASSO 2: Corrigir Código Frontend**

#### **Arquivo 1:** `wg-crm/src-new/features/obras/Assistencia.jsx`

```javascript
// Linha 56 - ANTES (quebrado):
.select('id, nome_razao_social')

// Linha 56 - DEPOIS (corrigido):
.select('id, nome')
```

```javascript
// Linha 58 - ANTES (quebrado):
.order('nome_razao_social')

// Linha 58 - DEPOIS (corrigido):
.order('nome')
```

#### **Arquivo 2:** `wg-crm/src-new/features/financeiro/Financeiro.jsx`

```javascript
// Linhas 89-96 - ANTES (quebrado):
.from('lancamentos')
.select(`
  *,
  centro_custo:centro_custo_cliente_id ( nome_razao_social ),
  categoria:categoria_id ( nome )
`)
.order('criado_em', { ascending: false })

// Linhas 89-96 - DEPOIS (corrigido):
.from('lancamentos')
.select(`
  *,
  centro_custo:centro_custo_cliente_id ( nome ),
  categoria:categoria_id ( conta, grupo )
`)
.order('created_at', { ascending: false })
```

#### **Arquivo 3 (Opcional):** `wg-crm/src-new/features/financeiro/NovoTituloDialog.jsx`

Se NÃO executou a migration 007, corrija manualmente:

```javascript
// Linha 39 - Remover 'apelido' (ou executar migration 007):
.select('id, banco, conta, empresa_id')  // Sem 'apelido'

// Linha 40 - Remover 'empresa_id':
.select('id, grupo, conta')  // Sem 'empresa_id'

// Linha 41 - Remover 'empresa_id':
.select('id, nome')  // Sem 'empresa_id'
```

---

## 🎯 NOVAS FUNÇÕES SQL CRIADAS

### **1. Criar Assistência com Código Sequencial**

```javascript
// Uso no frontend (substitui INSERT direto):
const { data, error } = await supabase.rpc('api_criar_assistencia_com_codigo', {
  p_cliente_id: clienteId,
  p_cliente_nome: clienteNome,
  p_descricao: descricao,
  p_prioridade: 'alta'  // baixa, media, alta, urgente
});

// Retorna:
{
  success: true,
  data: {
    id: 'uuid',
    codigo: 'AST-2025-000001',  // Código gerado automaticamente!
    status: 'aberta',
    ...
  }
}
```

**Arquivo:** `Supabase/backup/SQL_Functions/api/004_api_criar_assistencia_com_codigo.sql`

### **2. Atualizar Status de Assistência**

```javascript
// Uso no frontend:
const { data, error } = await supabase.rpc('api_atualizar_status_assistencia', {
  p_assistencia_id: assistenciaId,
  p_novo_status: 'atendido',  // aberta, agendado, em_atendimento, atendido
  p_observacao: 'Problema resolvido com sucesso'  // opcional
});

// Registra log automático + data_conclusao se status = 'atendido'
```

**Arquivo:** `Supabase/backup/SQL_Functions/api/005_api_atualizar_status_assistencia.sql`

---

## 📊 CHECKLIST DE CORREÇÕES

### Migrations

- [ ] ✅ Executar `006_criar_tabelas_faltando.sql` (assistencias, produtos_servicos)
- [ ] ✅ Executar `007_corrigir_campos_faltando.sql` (apelido, empresa_id)
- [ ] ✅ Executar funções SQL:
  - [ ] `004_api_criar_assistencia_com_codigo.sql`
  - [ ] `005_api_atualizar_status_assistencia.sql`

### Correções de Código

- [ ] 🔧 `Assistencia.jsx` linha 56: `nome_razao_social` → `nome`
- [ ] 🔧 `Assistencia.jsx` linha 58: `order('nome_razao_social')` → `order('nome')`
- [ ] 🔧 `Financeiro.jsx` linhas 89-96: Corrigir query completa de lancamentos
- [ ] 🔧 `NovoTituloDialog.jsx` linha 39: Remover `apelido` ou executar migration
- [ ] 🔧 `NovoTituloDialog.jsx` linha 40: Remover `empresa_id` de plano_contas
- [ ] 🔧 `NovoTituloDialog.jsx` linha 41: Remover `empresa_id` de centros_custo

### Testes

- [ ] ✅ Testar página `/assistencia` (criar, listar, editar, deletar)
- [ ] ✅ Testar página `/configuracoes` (produtos)
- [ ] ✅ Testar página `/financeiro` (aba Lançamentos)
- [ ] ✅ Testar criação de título financeiro
- [ ] ✅ Testar criação de proposta com produtos

---

## 🚀 SCRIPT DE DEPLOY COMPLETO

```bash
#!/bin/bash
# deploy-correcoes.sh

echo "🚀 Iniciando deploy das correções..."

# 1. Migrations
echo "📄 Executando migrations..."
psql $DATABASE_URL -f Supabase/migrations/006_criar_tabelas_faltando.sql
psql $DATABASE_URL -f Supabase/migrations/007_corrigir_campos_faltando.sql

# 2. Funções SQL
echo "📄 Executando funções SQL..."
psql $DATABASE_URL -f Supabase/backup/SQL_Functions/api/004_api_criar_assistencia_com_codigo.sql
psql $DATABASE_URL -f Supabase/backup/SQL_Functions/api/005_api_atualizar_status_assistencia.sql

echo "✅ Deploy concluído!"
echo "⚠️  Agora corrija o código frontend manualmente (ver arquivo PROBLEMAS_CRITICOS_E_CORRECOES.md)"
```

---

## 📞 SUPORTE

Para dúvidas ou problemas:

1. **Ler este documento completo**
2. **Executar migrations em ordem**
3. **Corrigir código frontend conforme indicado**
4. **Testar funcionalidades afetadas**
5. **Reportar problemas restantes**

---

**Última atualização:** 30 Out 2025
**Versão:** 1.0
**Status:** URGENTE - Requer ação imediata
