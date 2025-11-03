# 📊 INVENTÁRIO DE FUNÇÕES SQL - 03/11/2025

## SITUAÇÃO ENCONTRADA

**PROBLEMA:** Projeto LOCAL tinha apenas 4 funções vs Cliente com 70+ funções

## AÇÃO REALIZADA

### ✅ Funções Aplicadas (20 total)

#### 1. Helpers de Sistema (8)
- `current_user_id()` - UUID do usuário autenticado
- `current_user_email()` - Email do usuário
- `current_user_role()` - Role do usuário
- `current_empresa_id()` - Empresa do usuário (multi-tenancy)
- `has_role(role)` - Verifica se tem cargo
- `is_admin()` - Verifica se é admin
- `get_jwt_claim(claim)` - Extrai claim do JWT
- `handle_new_user()` - Cria profile ao cadastrar (trigger manual)

#### 2. Validação Brasil (8)
- `only_digits(text)` - Remove não numéricos
- `is_cpf_valid(text)` - Valida CPF
- `is_cnpj_valid(text)` - Valida CNPJ
- `is_cpf_cnpj_valid(text)` - Valida CPF ou CNPJ
- `format_phone_br(text)` - Formata telefone
- `format_cep_br(text)` - Formata CEP
- `format_cpf(text)` - Formata CPF
- `format_cnpj(text)` - Formata CNPJ

#### 3. Sistema (4)
- `get_api_url()` - URL dinâmica (local/live)
- `get_environment()` - Ambiente atual
- `is_local_environment()` - Verifica se é local
- `update_updated_at_column()` - Trigger para updated_at

### 📦 Extensões Instaladas
- `pg_trgm` - Busca por similaridade
- `unaccent` - Normalização de acentos

## PENDÊNCIAS IDENTIFICADAS

### 🔴 Migration 014 (Desativada)
Contém 6 funções de gestão de usuários:
- `users_invite()`
- `users_reset_password()`
- `users_role_toggle()`
- `users_list()`
- `users_deactivate()`
- `users_activate()`

**Ação:** Reativar quando necessário

### 🟡 Funções em Backup (não aplicadas)
Em `/Supabase/backup/SQL_Functions/`:
- `api_criar_oportunidade()`
- `api_mover_card_kanban()`
- `api_resumo_financeiro()`
- `api_criar_assistencia_com_codigo()`
- `api_atualizar_status_assistencia()`

**Ação:** Aplicar conforme necessidade

### 🔴 Funções Perdidas (do Cliente)
Não encontradas no projeto local:
- `finance_report()` - Relatório financeiro
- `fn_cashflow_daily()` - Fluxo de caixa
- `fn_dre()` - DRE
- `kanban_ensure_board()` - Gestão kanban
- `reorder_cards()` - Reordenar cards
- `cronograma_seed_from_proposta()` - Cronograma
- `purchase_order_create()` - Ordem de compra
- ~20 outras funções

**Ação:** Recuperar do cliente via sync-manager ou recriar

## ESTRUTURA ORGANIZADA

```
/Supabase/
├── migrations/              ← SOURCE OF TRUTH
│   ├── 001-017_*.sql       ← Schema base
│   ├── 018_extensoes.sql   ← ✅ Aplicada
│   ├── 019_triggers.sql    ← ✅ Aplicada
│   └── 020_validacao.sql   ← ✅ Aplicada
├── backup/                  ← REFERÊNCIA
│   └── SQL_Functions/       ← Funções não aplicadas
└── supabase/               ← CLI Supabase
    └── migrations/          ← Usado pelo CLI

## PRÓXIMOS PASSOS

1. **URGENTE:** Verificar se funções perdidas são necessárias
2. **IMPORTANTE:** Reativar migration 014 se gestão de usuários for necessária
3. **FUTURO:** Aplicar funções de negócio do backup conforme demanda
4. **MANUTENÇÃO:** Manter inventário atualizado

## COMANDOS ÚTEIS

### Listar funções atuais
```sql
SELECT proname, pg_get_function_identity_arguments(oid)
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;
```

### Verificar extensões
```sql
SELECT extname, extversion FROM pg_extension;
```

### Aplicar migration
```bash
docker exec -i supabase_db_WG psql -U postgres -d postgres < migration.sql
```

## RESUMO EXECUTIVO

✅ **PROGRESSO:** De 4 para 20 funções (400% aumento)
✅ **ORGANIZAÇÃO:** Todas em migrations versionadas
⚠️ **PENDENTE:** ~50 funções do cliente ainda não recuperadas
📋 **AÇÃO:** Priorizar funções conforme necessidade do frontend

---

**Criado em:** 03/11/2025
**Por:** supabase-local-expert
**Status:** Em progresso