-- =============================================
-- MIGRATION: 021
-- Descrição: Funções Finance (relatórios, DRE, fluxo caixa)
-- Data: 2025-11-03
-- =============================================

-- =================================================================
-- FUNÇÃO: finance_report
-- Descrição: Relatório financeiro completo com filtros avançados
-- =================================================================

DROP FUNCTION IF EXISTS finance_report(date, date, text, text, uuid, uuid, text);

CREATE OR REPLACE FUNCTION finance_report(
    p_data_ini date DEFAULT NULL,
    p_data_fim date DEFAULT NULL,
    p_tipo text DEFAULT NULL,         -- 'Pagar' ou 'Receber'
    p_status text DEFAULT NULL,       -- 'Previsto', 'Aprovado', 'Pago', 'Cancelado', 'Vencido'
    p_categoria_id uuid DEFAULT NULL,
    p_empresa_id uuid DEFAULT NULL,
    p_conta_id uuid DEFAULT NULL
)
RETURNS TABLE(
    titulo text,
    tipo text,
    categoria text,
    valor numeric,
    data_vencimento date,
    data_pagamento date,
    status text,
    fornecedor_cliente text,
    conta_financeira text,
    dias_atraso integer,
    observacao text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE NOTICE 'finance_report - Iniciando com filtros: data_ini=%, data_fim=%, tipo=%, status=%',
        p_data_ini, p_data_fim, p_tipo, p_status;

    RETURN QUERY
    SELECT
        t.descricao AS titulo,
        t.tipo,
        c.nome AS categoria,
        t.valor,
        t.data_vencimento,
        NULL::date AS data_pagamento, -- TODO: campo data_pagamento não existe, usar campo adequado
        t.status,
        t.fornecedor_cliente,
        cf.apelido AS conta_financeira,
        CASE
            WHEN t.status IN ('Previsto', 'Aprovado') AND t.data_vencimento < CURRENT_DATE
            THEN (CURRENT_DATE - t.data_vencimento)::integer
            ELSE 0
        END AS dias_atraso,
        t.observacao
    FROM titulos_financeiros t
    LEFT JOIN categorias c ON c.id = t.categoria_id
    LEFT JOIN contas_financeiras cf ON cf.id = t.conta_financeira_id
    WHERE
        (p_data_ini IS NULL OR t.data_vencimento >= p_data_ini)
        AND (p_data_fim IS NULL OR t.data_vencimento <= p_data_fim)
        AND (p_tipo IS NULL OR t.tipo = p_tipo)
        AND (p_status IS NULL OR t.status = p_status)
        AND (p_categoria_id IS NULL OR t.categoria_id = p_categoria_id)
        AND (p_empresa_id IS NULL OR t.empresa_id = p_empresa_id)
        AND (p_conta_id IS NULL OR t.conta_financeira_id = p_conta_id)
    ORDER BY t.data_vencimento DESC, t.created_at DESC;

END;
$$;

COMMENT ON FUNCTION finance_report IS
'Relatório financeiro completo com filtros avançados por período, tipo, status, categoria, empresa e conta financeira';

-- =================================================================
-- FUNÇÃO: fn_cashflow_daily
-- Descrição: Fluxo de caixa diário
-- =================================================================

DROP FUNCTION IF EXISTS fn_cashflow_daily(uuid, date, date);

CREATE OR REPLACE FUNCTION fn_cashflow_daily(
    p_org uuid DEFAULT NULL,
    p_d1 date DEFAULT (CURRENT_DATE - INTERVAL '30 days')::date,
    p_d2 date DEFAULT (CURRENT_DATE + INTERVAL '30 days')::date
)
RETURNS TABLE(
    dia date,
    entradas numeric,
    saidas numeric,
    saldo_dia numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_saldo_anterior numeric := 0;
    v_dia date;
BEGIN
    RAISE NOTICE 'fn_cashflow_daily - Período: % a %', p_d1, p_d2;

    -- Calcular saldo anterior (títulos pagos antes do período)
    SELECT
        COALESCE(SUM(
            CASE
                WHEN tipo = 'Receber' THEN valor
                WHEN tipo = 'Pagar' THEN -valor
                ELSE 0
            END
        ), 0)
    INTO v_saldo_anterior
    FROM titulos_financeiros
    WHERE status = 'Pago'
        AND data_vencimento < p_d1
        AND (p_org IS NULL OR empresa_id = p_org);

    RAISE NOTICE 'Saldo anterior: %', v_saldo_anterior;

    -- Gerar série de dias e calcular fluxo
    FOR v_dia IN
        SELECT generate_series(p_d1, p_d2, '1 day'::interval)::date
    LOOP
        RETURN QUERY
        SELECT
            v_dia AS dia,
            COALESCE(SUM(
                CASE WHEN tipo = 'Receber' THEN valor ELSE 0 END
            ), 0) AS entradas,
            COALESCE(SUM(
                CASE WHEN tipo = 'Pagar' THEN valor ELSE 0 END
            ), 0) AS saidas,
            v_saldo_anterior + COALESCE(SUM(
                CASE
                    WHEN tipo = 'Receber' THEN valor
                    WHEN tipo = 'Pagar' THEN -valor
                    ELSE 0
                END
            ), 0) AS saldo_dia
        FROM titulos_financeiros
        WHERE data_vencimento = v_dia
            AND status IN ('Previsto', 'Aprovado', 'Pago')
            AND (p_org IS NULL OR empresa_id = p_org);

        -- Atualizar saldo acumulado para próximo dia
        SELECT
            v_saldo_anterior + COALESCE(SUM(
                CASE
                    WHEN tipo = 'Receber' THEN valor
                    WHEN tipo = 'Pagar' THEN -valor
                    ELSE 0
                END
            ), 0)
        INTO v_saldo_anterior
        FROM titulos_financeiros
        WHERE data_vencimento = v_dia
            AND status IN ('Previsto', 'Aprovado', 'Pago')
            AND (p_org IS NULL OR empresa_id = p_org);
    END LOOP;

END;
$$;

COMMENT ON FUNCTION fn_cashflow_daily IS
'Retorna o fluxo de caixa diário com entradas, saídas e saldo acumulado por dia';

-- =================================================================
-- FUNÇÃO: fn_dre
-- Descrição: Demonstrativo de Resultado do Exercício (DRE)
-- =================================================================

DROP FUNCTION IF EXISTS fn_dre(uuid, date, date);

CREATE OR REPLACE FUNCTION fn_dre(
    p_org uuid DEFAULT NULL,
    p_d1 date DEFAULT date_trunc('month', CURRENT_DATE)::date,
    p_d2 date DEFAULT (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date
)
RETURNS TABLE(
    total_receitas numeric,
    total_despesas numeric,
    resultado numeric,
    margem_lucro numeric,
    qtd_receitas integer,
    qtd_despesas integer,
    ticket_medio_receitas numeric,
    ticket_medio_despesas numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_receitas numeric;
    v_despesas numeric;
    v_qtd_receitas integer;
    v_qtd_despesas integer;
BEGIN
    RAISE NOTICE 'fn_dre - Período: % a %', p_d1, p_d2;

    -- Calcular receitas
    SELECT
        COALESCE(SUM(valor), 0),
        COUNT(*)
    INTO v_receitas, v_qtd_receitas
    FROM titulos_financeiros
    WHERE tipo = 'Receber'
        AND status = 'Pago'
        AND data_vencimento BETWEEN p_d1 AND p_d2
        AND (p_org IS NULL OR empresa_id = p_org);

    -- Calcular despesas
    SELECT
        COALESCE(SUM(valor), 0),
        COUNT(*)
    INTO v_despesas, v_qtd_despesas
    FROM titulos_financeiros
    WHERE tipo = 'Pagar'
        AND status = 'Pago'
        AND data_vencimento BETWEEN p_d1 AND p_d2
        AND (p_org IS NULL OR empresa_id = p_org);

    RETURN QUERY
    SELECT
        v_receitas AS total_receitas,
        v_despesas AS total_despesas,
        (v_receitas - v_despesas) AS resultado,
        CASE
            WHEN v_receitas > 0
            THEN ROUND(((v_receitas - v_despesas) / v_receitas * 100)::numeric, 2)
            ELSE 0
        END AS margem_lucro,
        v_qtd_receitas AS qtd_receitas,
        v_qtd_despesas AS qtd_despesas,
        CASE
            WHEN v_qtd_receitas > 0
            THEN ROUND((v_receitas / v_qtd_receitas)::numeric, 2)
            ELSE 0
        END AS ticket_medio_receitas,
        CASE
            WHEN v_qtd_despesas > 0
            THEN ROUND((v_despesas / v_qtd_despesas)::numeric, 2)
            ELSE 0
        END AS ticket_medio_despesas;

END;
$$;

COMMENT ON FUNCTION fn_dre IS
'Demonstrativo de Resultado do Exercício com métricas de receitas, despesas e margens';

-- =================================================================
-- FUNÇÃO: get_finance_dashboard_data
-- Descrição: Dados agregados para dashboard financeiro
-- =================================================================

DROP FUNCTION IF EXISTS get_finance_dashboard_data(uuid);

CREATE OR REPLACE FUNCTION get_finance_dashboard_data(
    p_empresa_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result json;
    v_receitas_mes numeric;
    v_despesas_mes numeric;
    v_receitas_previstas numeric;
    v_despesas_previstas numeric;
    v_saldo_contas numeric;
    v_titulos_vencidos integer;
    v_titulos_vencer_7d integer;
BEGIN
    RAISE NOTICE 'get_finance_dashboard_data - empresa_id: %', p_empresa_id;

    -- Receitas do mês atual (pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_receitas_mes
    FROM titulos_financeiros
    WHERE tipo = 'Receber'
        AND status = 'Pago'
        AND date_trunc('month', data_vencimento) = date_trunc('month', CURRENT_DATE)
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Despesas do mês atual (pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_despesas_mes
    FROM titulos_financeiros
    WHERE tipo = 'Pagar'
        AND status = 'Pago'
        AND date_trunc('month', data_vencimento) = date_trunc('month', CURRENT_DATE)
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Receitas previstas (não pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_receitas_previstas
    FROM titulos_financeiros
    WHERE tipo = 'Receber'
        AND status IN ('Previsto', 'Aprovado')
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Despesas previstas (não pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_despesas_previstas
    FROM titulos_financeiros
    WHERE tipo = 'Pagar'
        AND status IN ('Previsto', 'Aprovado')
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Saldo das contas financeiras
    SELECT COALESCE(SUM(saldo_atual), 0)
    INTO v_saldo_contas
    FROM contas_financeiras
    WHERE ativo = true
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Títulos vencidos
    SELECT COUNT(*)
    INTO v_titulos_vencidos
    FROM titulos_financeiros
    WHERE status IN ('Previsto', 'Aprovado')
        AND data_vencimento < CURRENT_DATE
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Títulos a vencer nos próximos 7 dias
    SELECT COUNT(*)
    INTO v_titulos_vencer_7d
    FROM titulos_financeiros
    WHERE status IN ('Previsto', 'Aprovado')
        AND data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Montar JSON de resultado
    v_result := json_build_object(
        'mes_atual', json_build_object(
            'receitas_pagas', v_receitas_mes,
            'despesas_pagas', v_despesas_mes,
            'saldo_mes', v_receitas_mes - v_despesas_mes,
            'lucratividade', CASE
                WHEN v_receitas_mes > 0
                THEN ROUND(((v_receitas_mes - v_despesas_mes) / v_receitas_mes * 100)::numeric, 2)
                ELSE 0
            END
        ),
        'previstos', json_build_object(
            'receitas', v_receitas_previstas,
            'despesas', v_despesas_previstas,
            'saldo_previsto', v_receitas_previstas - v_despesas_previstas
        ),
        'contas', json_build_object(
            'saldo_total', v_saldo_contas
        ),
        'alertas', json_build_object(
            'titulos_vencidos', v_titulos_vencidos,
            'titulos_vencer_7d', v_titulos_vencer_7d
        ),
        'timestamp', NOW()
    );

    RETURN v_result;

END;
$$;

COMMENT ON FUNCTION get_finance_dashboard_data IS
'Retorna dados agregados para dashboard financeiro incluindo receitas, despesas, saldos e alertas';

-- =================================================================
-- FUNÇÃO: fin_txn_duplicate
-- Descrição: Duplicar transação financeira
-- =================================================================

DROP FUNCTION IF EXISTS fin_txn_duplicate(uuid);

CREATE OR REPLACE FUNCTION fin_txn_duplicate(
    p_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_id uuid;
    v_record RECORD;
BEGIN
    RAISE NOTICE 'fin_txn_duplicate - Duplicando título: %', p_id;

    -- Buscar registro original
    SELECT * INTO v_record
    FROM titulos_financeiros
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Título financeiro não encontrado: %', p_id;
    END IF;

    -- Criar cópia
    INSERT INTO titulos_financeiros (
        empresa_id,
        tipo,
        descricao,
        valor,
        data_emissao,
        data_vencimento,
        status,
        categoria_id,
        centro_custo_id,
        conta_financeira_id,
        observacao,
        documento,
        fornecedor_cliente
    ) VALUES (
        v_record.empresa_id,
        v_record.tipo,
        v_record.descricao || ' (Cópia)',
        v_record.valor,
        CURRENT_DATE,
        v_record.data_vencimento + INTERVAL '1 month', -- Vencimento próximo mês
        'Previsto', -- Status inicial
        v_record.categoria_id,
        v_record.centro_custo_id,
        v_record.conta_financeira_id,
        v_record.observacao,
        v_record.documento,
        v_record.fornecedor_cliente
    )
    RETURNING id INTO v_new_id;

    RAISE NOTICE 'Título duplicado com sucesso. Novo ID: %', v_new_id;
    RETURN v_new_id;

END;
$$;

COMMENT ON FUNCTION fin_txn_duplicate IS
'Duplica uma transação financeira, útil para títulos recorrentes';

-- =================================================================
-- FUNÇÃO: fin_txn_soft_delete
-- Descrição: Soft delete de transação financeira
-- =================================================================

DROP FUNCTION IF EXISTS fin_txn_soft_delete(uuid);

CREATE OR REPLACE FUNCTION fin_txn_soft_delete(
    p_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status text;
BEGIN
    RAISE NOTICE 'fin_txn_soft_delete - Cancelando título: %', p_id;

    -- Verificar status atual
    SELECT status INTO v_status
    FROM titulos_financeiros
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Título financeiro não encontrado: %', p_id;
    END IF;

    IF v_status = 'Pago' THEN
        RAISE EXCEPTION 'Não é possível cancelar título já pago';
    END IF;

    IF v_status = 'Cancelado' THEN
        RAISE WARNING 'Título já está cancelado';
        RETURN FALSE;
    END IF;

    -- Marcar como cancelado
    UPDATE titulos_financeiros
    SET
        status = 'Cancelado',
        updated_at = NOW(),
        observacao = COALESCE(observacao || E'\n', '') ||
            'Cancelado em ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || ' por ' || COALESCE(auth.uid()::text, 'sistema')
    WHERE id = p_id;

    RAISE NOTICE 'Título cancelado com sucesso';
    RETURN TRUE;

END;
$$;

COMMENT ON FUNCTION fin_txn_soft_delete IS
'Cancela uma transação financeira (soft delete), não permite cancelar títulos já pagos';

-- =================================================================
-- FUNÇÃO: fin_card_soft_delete
-- Descrição: Soft delete de cartão (contas_financeiras)
-- =================================================================

DROP FUNCTION IF EXISTS fin_card_soft_delete(uuid);

CREATE OR REPLACE FUNCTION fin_card_soft_delete(
    p_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ativo boolean;
    v_saldo numeric;
BEGIN
    RAISE NOTICE 'fin_card_soft_delete - Desativando conta: %', p_id;

    -- Verificar conta
    SELECT ativo, saldo_atual INTO v_ativo, v_saldo
    FROM contas_financeiras
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta financeira não encontrada: %', p_id;
    END IF;

    IF NOT v_ativo THEN
        RAISE WARNING 'Conta já está desativada';
        RETURN FALSE;
    END IF;

    IF v_saldo != 0 THEN
        RAISE WARNING 'Conta possui saldo: %. Considere zerar antes de desativar', v_saldo;
    END IF;

    -- Desativar conta
    UPDATE contas_financeiras
    SET
        ativo = FALSE,
        updated_at = NOW()
    WHERE id = p_id;

    RAISE NOTICE 'Conta desativada com sucesso';
    RETURN TRUE;

END;
$$;

COMMENT ON FUNCTION fin_card_soft_delete IS
'Desativa uma conta financeira (soft delete), alerta se houver saldo';

-- =================================================================
-- TRIGGER: fin_txn_compute_amount
-- Descrição: Calcular valor automaticamente (se houver lógica)
-- =================================================================

DROP TRIGGER IF EXISTS fin_txn_compute_amount ON titulos_financeiros;
DROP FUNCTION IF EXISTS trigger_fin_txn_compute_amount();

CREATE OR REPLACE FUNCTION trigger_fin_txn_compute_amount()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calcular valor se necessário (exemplo: desconto ou juros)
    -- Por enquanto, apenas validar valor positivo
    IF NEW.valor IS NOT NULL AND NEW.valor < 0 THEN
        RAISE EXCEPTION 'Valor não pode ser negativo';
    END IF;

    -- Se não houver data de emissão, usar data atual
    IF NEW.data_emissao IS NULL THEN
        NEW.data_emissao := CURRENT_DATE;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER fin_txn_compute_amount
    BEFORE INSERT OR UPDATE ON titulos_financeiros
    FOR EACH ROW
    EXECUTE FUNCTION trigger_fin_txn_compute_amount();

COMMENT ON TRIGGER fin_txn_compute_amount ON titulos_financeiros IS
'Valida e calcula valores antes de inserir ou atualizar títulos';

-- =================================================================
-- TRIGGER: fin_txn_defaults
-- Descrição: Preencher valores padrão
-- =================================================================

DROP TRIGGER IF EXISTS fin_txn_defaults ON titulos_financeiros;
DROP FUNCTION IF EXISTS trigger_fin_txn_defaults();

CREATE OR REPLACE FUNCTION trigger_fin_txn_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Status padrão
    IF NEW.status IS NULL THEN
        NEW.status := 'Previsto';
    END IF;

    -- Data de emissão padrão
    IF NEW.data_emissao IS NULL THEN
        NEW.data_emissao := CURRENT_DATE;
    END IF;

    -- Se data de vencimento for passada e status for Previsto/Aprovado, marcar como Vencido
    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status IN ('Previsto', 'Aprovado') THEN
        NEW.status := 'Vencido';
    END IF;

    -- Timestamps
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := NOW();
    END IF;
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER fin_txn_defaults
    BEFORE INSERT OR UPDATE ON titulos_financeiros
    FOR EACH ROW
    EXECUTE FUNCTION trigger_fin_txn_defaults();

COMMENT ON TRIGGER fin_txn_defaults ON titulos_financeiros IS
'Preenche valores padrão e atualiza status automaticamente';

-- =================================================================
-- FIM DA MIGRATION 021
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 021 - Funções Finance criadas com sucesso!';
END $$;