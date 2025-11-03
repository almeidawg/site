# 📁 Organização de SQL Functions

## 🎯 Filosofia: SQL FIRST

**Preferência**:
1. ✅ **HTTP Request externo** (API REST)
2. ✅ **SQL Function** (lógica no banco)
3. ⚠️ **Edge Function** (APENAS se absolutamente necessário)

---

## 📂 Estrutura de Pastas

```
SQL_Functions/
├── 01-triggers/          # Triggers automáticos
│   ├── 01_handle_updated_at.sql
│   └── 02_handle_new_user.sql
├── 03-validation/        # Validação de dados
│   ├── 01_cpf_cnpj_validation.sql
│   └── 02_format_br.sql
├── api/                  # Funções de API (gestão de usuários, etc)
│   ├── users_invite.sql
│   ├── users_reset_password.sql
│   ├── users_role_toggle.sql
│   ├── users_list.sql
│   ├── users_deactivate.sql
│   └── users_activate.sql
└── triggers/             # Triggers de sistema
    └── (arquivos de triggers)
```

---

## ✅ FUNCTIONS CRIADAS EM PROD

### 01-triggers/

| # | Function | Status | Usado? | Criado? |
|---|----------|--------|--------|---------|
| 01 | `handle_updated_at()` | ✅ ESSENCIAL | Sim | ✅ PROD |
| 02 | `handle_new_user()` | ⚠️ DASHBOARD | Não | ⏳ Pendente |

**⚠️ handle_new_user()**: DEVE ser criado via Dashboard (acessa schema auth)

---

### api/ (GESTÃO DE USUÁRIOS - NOVO!)

| # | Function | Status | Usado? | Criado? | Migration |
|---|----------|--------|--------|---------|-----------|
| 01 | `users_invite()` | ✅ ESSENCIAL | Sim | ✅ Migration 014 | ✅ |
| 02 | `users_reset_password()` | ✅ ESSENCIAL | Sim | ✅ Migration 014 | ✅ |
| 03 | `users_role_toggle()` | ✅ ESSENCIAL | Sim | ✅ Migration 014 | ✅ |
| 04 | `users_list()` | ✅ ESSENCIAL | Sim | ✅ Migration 014 | ✅ |
| 05 | `users_deactivate()` | ✅ ESSENCIAL | Sim | ✅ Migration 014 | ✅ |
| 06 | `users_activate()` | ✅ ESSENCIAL | Sim | ✅ Migration 014 | ✅ |

**Funções de Gestão de Usuários**:
- `users_invite()`: Convida novo usuário criando perfil pré-configurado
- `users_reset_password()`: Valida usuário para reset de senha
- `users_role_toggle()`: Altera perfil/role e atualiza permissões automaticamente
- `users_list()`: Lista usuários com perfis e permissões
- `users_deactivate()`: Desativa usuário (soft delete)
- `users_activate()`: Reativa usuário previamente desativado

---

### 03-validation/ (OPCIONAL)

| # | Function | Status | Usado? | Criado? |
|---|----------|--------|--------|---------|
| 01 | `only_digits()` | 🟡 Opcional | Não | ❌ |
| 02 | `is_cpf_valid()` | 🟡 Opcional | Não | ❌ |
| 03 | `is_cnpj_valid()` | 🟡 Opcional | Não | ❌ |
| 04 | `is_cpf_cnpj_valid()` | 🟡 Opcional | Não | ❌ |
| 05 | `format_phone_br()` | 🟡 Opcional | Não | ❌ |
| 06 | `format_cep_br()` | 🟡 Opcional | Não | ❌ |

**Criar quando**: Frontend precisar validar CPF/CNPJ ou formatar dados

---

## 🗑️ FUNCTIONS IGNORADAS (DEV tinha mas não vamos usar)

### Relacionadas a Tabelas Deletadas:

- `fin_*` (7 functions) - Sistema financeiro alternativo não usado
- `log_audit()` - Tabela audit_logs não existe
- `get_party_org_id()` - Tabela parties não existe

### Funções de Negócio que NÃO são usadas no frontend:

- `on_oportunidade_concluida()` - Lógica complexa não implementada
- `cronograma_seed_from_proposta()` - Feature não usada
- `ensure_default_pipelines()` - Não é mais necessário
- `finance_report()` - Sistema financeiro diferente

### PostgreSQL Extensions (NÃO DELETAR - são do sistema):

- `gin_*` (4 functions) - pg_trgm extension
- `gtrgm_*` (14 functions) - pg_trgm extension

---

## 📋 COMO USAR

### Para criar em PROD:

```bash
# 1. Abrir arquivo SQL
code Supabase/backup/SQL_Functions/api/users_invite.sql

# 2. Copiar conteúdo

# 3. Executar via Supabase MCP Expert ou Dashboard
```

### Para adicionar nova function:

1. Decidir categoria (triggers, api, validation, business)
2. Criar arquivo com nome descritivo: `nome_funcao.sql`
3. Usar template:

```sql
-- =============================================
-- FUNÇÃO: nome_funcao
-- Descrição: O que faz
-- Filosofia: SQL-First
-- Data: YYYY-MM-DD
-- =============================================

DROP FUNCTION IF EXISTS nome_funcao(parametros) CASCADE;

CREATE OR REPLACE FUNCTION nome_funcao(parametros)
RETURNS tipo
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- código aqui
END;
$$;

COMMENT ON FUNCTION nome_funcao IS 'Descrição curta';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================
-- SELECT nome_funcao(parametros);
```

4. Atualizar este README
5. Testar em DEV primeiro
6. Criar migration se necessário
7. Criar em PROD via agent

---

## 🎯 DECISÕES DE DESIGN

### Por que SQL Functions em vez de Edge Functions?

✅ **Vantagens SQL**:
- Roda no banco (mais rápido)
- Usa índices nativamente
- Transacional (ACID)
- Sem cold start
- Sem deploy separado

⚠️ **Quando usar Edge Function**:
- Integração com APIs externas (HTTP requests)
- Processamento de arquivos
- Webhooks
- Operações > 60 segundos
- Lógica que muda frequentemente

### Por que HTTP externo em vez de Edge Function?

✅ **Preferir HTTP direto do frontend quando**:
- API simples de terceiros
- Não precisa esconder API key (usar backend variables)
- Não precisa transformar dados
- Latência aceitável

**Exemplo**: Buscar CEP via ViaCEP → fazer direto do frontend

---

## 📊 STATUS ATUAL (Atualizado 2025-11-02)

**Total de SQL Functions**:
- ✅ Em PROD (Migration 014): 6 (users_invite, users_reset_password, users_role_toggle, users_list, users_deactivate, users_activate)
- ✅ Em PROD (Anteriores): 1 (handle_updated_at)
- ⏳ Pendente: 1 (handle_new_user - via Dashboard)
- 🟡 Opcionais: 6 (validação/formatação)
- 🗑️ Ignoradas: ~30 (DEV tinha mas não usamos)

**Edge Functions**:
- DEV: 0
- PROD: 0
- Planejadas: 0

**Filosofia mantida**: SQL FIRST ✅

---

## 🚨 MIGRATIONS CRIADAS (Sistema Completo)

### Migration 012: Tabelas e Views
- ✅ 4 Tabelas Base: contratos, propostas, obras, lancamentos_financeiros
- ✅ 2 Tabelas Registros: registros_trabalho, registro_categorias
- ✅ 7 Views SQL Críticas:
  - v_clientes_ativos_contratos
  - v_fluxo_caixa
  - v_despesas_mes_categoria
  - v_top10_clientes_receita
  - vw_pipeline_oportunidades (atualizada)
  - v_kanban_cards_board
  - v_registros_trabalho

### Migration 013: Storage
- ✅ Bucket 'registros' (para anexos)
- ✅ RLS Policies para storage

### Migration 014: SQL Functions
- ✅ 6 Funções de gestão de usuários (api/)

### Migration 015: RLS Policies
- ✅ Políticas completas para todas as tabelas novas

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Criar handle_updated_at em PROD
2. ⏳ Criar handle_new_user via Dashboard
3. ✅ Criar funções de gestão de usuários (Migration 014)
4. ⏳ Aplicar migrations 012-015 em LOCAL
5. ⏳ Testar todas as views criadas
6. 🟡 Avaliar se precisa validações BR (CPF/CNPJ)
7. 🟡 Avaliar se precisa formatações BR (Phone/CEP)
8. 📝 Documentar qualquer nova function aqui

---

**Última atualização**: 2025-11-02
**Mantido por**: Claude Code + Supabase MCP Expert
**Migrations criadas**: 012, 013, 014, 015
