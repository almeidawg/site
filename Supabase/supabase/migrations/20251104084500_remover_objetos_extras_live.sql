-- =============================================
-- Migration: Remover objetos do LIVE que não existem no LOCAL
-- Descrição: Sincronizar LIVE = LOCAL removendo policies, triggers, functions extras
-- Data: 2025-11-04
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. REMOVER TRIGGERS (4 triggers)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP TRIGGER IF EXISTS "calculate_valor_venda" ON "public"."propostas";
DROP TRIGGER IF EXISTS "trg_proposta_itens_after_change" ON "public"."propostas";
DROP TRIGGER IF EXISTS "trg_propostas_before_insert" ON "public"."propostas";
DROP TRIGGER IF EXISTS "trg_propostas_itens_before_change" ON "public"."propostas";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. REMOVER POLÍTICAS RLS (29 policies)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Contratos
DROP POLICY IF EXISTS "Admins e gestores podem criar contratos" ON "public"."contratos";
DROP POLICY IF EXISTS "Admins, gestores e responsáveis podem atualizar contratos" ON "public"."contratos";
DROP POLICY IF EXISTS "Apenas admins podem deletar contratos" ON "public"."contratos";
DROP POLICY IF EXISTS "Usuários podem ver contratos" ON "public"."contratos";

-- Lançamentos
DROP POLICY IF EXISTS "Users can view lancamentos" ON "public"."lancamentos";
DROP POLICY IF EXISTS "Admins, gestores e financeiro podem atualizar lançamentos" ON "public"."lancamentos_financeiros";
DROP POLICY IF EXISTS "Admins, gestores e financeiro podem criar lançamentos" ON "public"."lancamentos_financeiros";
DROP POLICY IF EXISTS "Apenas admins podem deletar lançamentos financeiros" ON "public"."lancamentos_financeiros";
DROP POLICY IF EXISTS "Usuários podem ver lançamentos financeiros" ON "public"."lancamentos_financeiros";

-- Obras
DROP POLICY IF EXISTS "Admins, gestores e arquitetos podem criar obras" ON "public"."obras";
DROP POLICY IF EXISTS "Admins, gestores, arquitetos e responsáveis podem atualizar ob" ON "public"."obras";
DROP POLICY IF EXISTS "Apenas admins podem deletar obras" ON "public"."obras";
DROP POLICY IF EXISTS "Usuários podem ver obras" ON "public"."obras";

-- Propostas
DROP POLICY IF EXISTS "Admins, gestores e vendedores podem criar propostas" ON "public"."propostas";
DROP POLICY IF EXISTS "Admins, gestores, vendedores e responsáveis podem atualizar pr" ON "public"."propostas";
DROP POLICY IF EXISTS "Apenas admins podem deletar propostas" ON "public"."propostas";
DROP POLICY IF EXISTS "Usuários podem ver propostas" ON "public"."propostas";

-- Categorias de Registro
DROP POLICY IF EXISTS "Admins e gestores podem atualizar categorias" ON "public"."registro_categorias";
DROP POLICY IF EXISTS "Admins e gestores podem criar categorias" ON "public"."registro_categorias";
DROP POLICY IF EXISTS "Apenas admins podem deletar categorias" ON "public"."registro_categorias";
DROP POLICY IF EXISTS "Usuários podem ver categorias de registro" ON "public"."registro_categorias";

-- Registros de Trabalho
DROP POLICY IF EXISTS "Usuários podem atualizar seus registros de trabalho" ON "public"."registros_trabalho";
DROP POLICY IF EXISTS "Usuários podem criar seus registros de trabalho" ON "public"."registros_trabalho";
DROP POLICY IF EXISTS "Usuários podem deletar seus registros não aprovados" ON "public"."registros_trabalho";
DROP POLICY IF EXISTS "Usuários podem ver seus registros de trabalho" ON "public"."registros_trabalho";

-- Títulos Financeiros
DROP POLICY IF EXISTS "Users can view titles of accessible companies" ON "public"."titulos_financeiros";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. REMOVER FUNCTIONS (10 functions + trigger functions)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP FUNCTION IF EXISTS "public"."cronograma_reordenar_tarefas"(p_board_id uuid);
DROP FUNCTION IF EXISTS "public"."cronograma_seed_from_proposta"(p_cronograma_id uuid, p_proposta_id uuid);
DROP FUNCTION IF EXISTS "public"."proposta_gerar_titulos"(p_proposta_id uuid, p_parcelas integer);
DROP FUNCTION IF EXISTS "public"."purchase_order_create"(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb);
DROP FUNCTION IF EXISTS "public"."recalc_proposta_total"(p_proposta_id uuid);
DROP FUNCTION IF EXISTS "public"."recompute_invoice_status"(p_invoice_id uuid);
DROP FUNCTION IF EXISTS "public"."trigger_calculate_valor_venda"();
DROP FUNCTION IF EXISTS "public"."trigger_proposta_itens_after_change"();
DROP FUNCTION IF EXISTS "public"."trigger_propostas_before_insert"();
DROP FUNCTION IF EXISTS "public"."trigger_propostas_itens_before_change"();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- IMPORTANTE: Esta migration REMOVE do LIVE objetos que não existem no LOCAL
-- Após aplicar, LIVE = LOCAL (sem as políticas/triggers/functions extras)
