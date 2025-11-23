-- =============================================
-- MIGRATION: 023
-- Descrição: Funções Propostas/Cronograma (gestão de propostas comerciais)
-- Data: 2025-11-03
-- =============================================

-- =================================================================
-- FUNÇÃO: recalc_proposta_total
-- Descrição: Recalcular total da proposta baseado nos itens JSONB
-- =================================================================

DROP FUNCTION IF EXISTS recalc_proposta_total(uuid);

CREATE OR REPLACE FUNCTION recalc_proposta_total(
    p_proposta_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total numeric := 0;
    v_itens jsonb;
    v_item jsonb;
BEGIN
    RAISE NOTICE 'recalc_proposta_total - Recalculando proposta: %', p_proposta_id;

    -- Obter itens da proposta
    SELECT itens INTO v_itens
    FROM propostas
    WHERE id = p_proposta_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;
    END IF;

    -- Calcular total dos itens
    IF v_itens IS NOT NULL AND jsonb_array_length(v_itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_itens)
        LOOP
            -- Somar: quantidade * valor_unitario
            v_total := v_total + COALESCE(
                (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                0
            );
        END LOOP;
    END IF;

    -- Atualizar total na proposta
    UPDATE propostas
    SET
        valor_total = v_total,
        updated_at = NOW()
    WHERE id = p_proposta_id;

    RAISE NOTICE 'Total recalculado: R$ %', v_total;

END;
$$;

COMMENT ON FUNCTION recalc_proposta_total IS
'Recalcula o valor total da proposta baseado nos itens (campo JSONB)';

-- =================================================================
-- FUNÇÃO: purchase_order_create
-- Descrição: Criar pedido de compra (ordem de compra)
-- =================================================================

DROP FUNCTION IF EXISTS purchase_order_create(uuid, uuid, text, jsonb);

CREATE OR REPLACE FUNCTION purchase_order_create(
    p_entity_id uuid,
    p_fornecedor_id uuid,
    p_status text DEFAULT 'pendente',
    p_itens jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ordem_id uuid;
    v_numero text;
    v_total numeric := 0;
    v_item jsonb;
BEGIN
    RAISE NOTICE 'purchase_order_create - Entity: %, Fornecedor: %', p_entity_id, p_fornecedor_id;

    -- Gerar número único
    v_numero := 'OC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
        LPAD(NEXTVAL('pg_catalog.pg_dist_node_group_id_seq')::text, 4, '0');

    -- Calcular total dos itens
    IF p_itens IS NOT NULL AND jsonb_array_length(p_itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
        LOOP
            v_total := v_total + COALESCE(
                (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                0
            );
        END LOOP;
    END IF;

    -- Criar nova proposta como ordem de compra
    INSERT INTO propostas (
        numero,
        cliente_id,
        titulo,
        descricao,
        valor_total,
        status,
        tipo,
        itens,
        dados,
        data_emissao
    ) VALUES (
        v_numero,
        p_entity_id,
        'Ordem de Compra - ' || v_numero,
        'Pedido de compra para fornecedor',
        v_total,
        p_status,
        'ordem_compra',
        p_itens,
        jsonb_build_object(
            'fornecedor_id', p_fornecedor_id,
            'tipo_documento', 'ordem_compra',
            'criado_por', auth.uid(),
            'criado_em', NOW()
        ),
        CURRENT_DATE
    )
    RETURNING id INTO v_ordem_id;

    RAISE NOTICE 'Ordem de compra criada: % (Total: R$ %)', v_numero, v_total;
    RETURN v_ordem_id;

END;
$$;

COMMENT ON FUNCTION purchase_order_create IS
'Cria uma ordem de compra (pedido de compra) com itens e fornecedor';

-- =================================================================
-- FUNÇÃO: recompute_invoice_status
-- Descrição: Recalcular status de nota fiscal baseado em títulos
-- =================================================================

DROP FUNCTION IF EXISTS recompute_invoice_status(uuid);

CREATE OR REPLACE FUNCTION recompute_invoice_status(
    p_invoice_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_proposta RECORD;
    v_titulos_pagos integer;
    v_titulos_total integer;
    v_novo_status text;
BEGIN
    RAISE NOTICE 'recompute_invoice_status - Invoice: %', p_invoice_id;

    -- Buscar proposta/invoice
    SELECT * INTO v_proposta
    FROM propostas
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice/Proposta não encontrada: %', p_invoice_id;
    END IF;

    -- Contar títulos relacionados (buscar no campo dados->invoice_id ou documento)
    SELECT
        COUNT(*) FILTER (WHERE status = 'Pago'),
        COUNT(*)
    INTO v_titulos_pagos, v_titulos_total
    FROM titulos_financeiros
    WHERE documento = v_proposta.numero
        OR (dados->>'invoice_id')::uuid = p_invoice_id;

    -- Determinar novo status
    IF v_titulos_total = 0 THEN
        v_novo_status := 'pendente';
    ELSIF v_titulos_pagos = 0 THEN
        v_novo_status := 'em_aberto';
    ELSIF v_titulos_pagos < v_titulos_total THEN
        v_novo_status := 'parcialmente_pago';
    ELSE
        v_novo_status := 'pago';
    END IF;

    -- Atualizar status se mudou
    IF v_proposta.status IS DISTINCT FROM v_novo_status THEN
        UPDATE propostas
        SET
            status = v_novo_status,
            updated_at = NOW(),
            dados = dados || jsonb_build_object(
                'status_atualizado_em', NOW(),
                'titulos_pagos', v_titulos_pagos,
                'titulos_total', v_titulos_total
            )
        WHERE id = p_invoice_id;

        RAISE NOTICE 'Status atualizado de % para % (Pagos: %/%)',
            v_proposta.status, v_novo_status, v_titulos_pagos, v_titulos_total;
    ELSE
        RAISE NOTICE 'Status mantido: % (Pagos: %/%)',
            v_novo_status, v_titulos_pagos, v_titulos_total;
    END IF;

END;
$$;

COMMENT ON FUNCTION recompute_invoice_status IS
'Recalcula o status de uma nota fiscal/proposta baseado nos títulos financeiros relacionados';

-- =================================================================
-- FUNÇÃO: cronograma_seed_from_proposta (ADAPTADA)
-- Descrição: Criar cronograma baseado em proposta
-- Nota: Como não existe tabela cronograma, vamos criar cards no kanban
-- =================================================================

DROP FUNCTION IF EXISTS cronograma_seed_from_proposta(uuid, uuid);

CREATE OR REPLACE FUNCTION cronograma_seed_from_proposta(
    p_cronograma_id uuid,  -- Será o board_id do kanban
    p_proposta_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_proposta RECORD;
    v_itens jsonb;
    v_item jsonb;
    v_cards_criados integer := 0;
    v_coluna_id uuid;
BEGIN
    RAISE NOTICE 'cronograma_seed_from_proposta - Proposta: %', p_proposta_id;

    -- Buscar proposta
    SELECT * INTO v_proposta
    FROM propostas
    WHERE id = p_proposta_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;
    END IF;

    -- Buscar primeira coluna do board (A Fazer)
    SELECT id INTO v_coluna_id
    FROM kanban_colunas
    WHERE board_id = p_cronograma_id
    ORDER BY posicao
    LIMIT 1;

    IF NOT FOUND THEN
        -- Criar coluna padrão se não existir
        INSERT INTO kanban_colunas (board_id, titulo, posicao, cor)
        VALUES (p_cronograma_id, 'A Executar', 1, '#94a3b8')
        RETURNING id INTO v_coluna_id;
    END IF;

    -- Processar itens da proposta
    v_itens := v_proposta.itens;

    IF v_itens IS NOT NULL AND jsonb_array_length(v_itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_itens)
        LOOP
            -- Criar card para cada item
            INSERT INTO kanban_cards (
                coluna_id,
                titulo,
                descricao,
                valor,
                entity_id,
                posicao,
                dados
            ) VALUES (
                v_coluna_id,
                COALESCE(v_item->>'descricao', 'Item da proposta'),
                'Quantidade: ' || COALESCE(v_item->>'quantidade', '1') ||
                ' - Valor Unit.: R$ ' || COALESCE(v_item->>'valor_unitario', '0'),
                COALESCE(
                    (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                    0
                ),
                v_proposta.cliente_id,
                (v_cards_criados + 1) * 10,
                jsonb_build_object(
                    'proposta_id', p_proposta_id,
                    'proposta_numero', v_proposta.numero,
                    'item_original', v_item,
                    'tipo', 'cronograma_tarefa'
                )
            );

            v_cards_criados := v_cards_criados + 1;
        END LOOP;
    END IF;

    RAISE NOTICE 'Cronograma criado com % tarefas/cards', v_cards_criados;
    RETURN v_cards_criados;

END;
$$;

COMMENT ON FUNCTION cronograma_seed_from_proposta IS
'Cria cards no kanban (cronograma) baseado nos itens de uma proposta. Adaptado para usar kanban_cards em vez de tabela cronograma';

-- =================================================================
-- TRIGGER: trg_proposta_itens_after_change
-- Descrição: Recalcular total após mudar itens
-- =================================================================

DROP TRIGGER IF EXISTS trg_proposta_itens_after_change ON propostas;
DROP FUNCTION IF EXISTS trigger_proposta_itens_after_change();

CREATE OR REPLACE FUNCTION trigger_proposta_itens_after_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_total numeric := 0;
    v_item jsonb;
BEGIN
    -- Só recalcular se itens mudaram
    IF OLD.itens IS DISTINCT FROM NEW.itens THEN
        -- Calcular novo total
        IF NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN
            FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)
            LOOP
                v_total := v_total + COALESCE(
                    (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                    0
                );
            END LOOP;
        END IF;

        NEW.valor_total := v_total;
        RAISE NOTICE 'Total da proposta recalculado: R$ %', v_total;
    END IF;

    -- Atualizar timestamp
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proposta_itens_after_change
    BEFORE UPDATE ON propostas
    FOR EACH ROW
    WHEN (OLD.itens IS DISTINCT FROM NEW.itens)
    EXECUTE FUNCTION trigger_proposta_itens_after_change();

COMMENT ON TRIGGER trg_proposta_itens_after_change ON propostas IS
'Recalcula automaticamente o valor total da proposta quando os itens são modificados';

-- =================================================================
-- TRIGGER: trg_propostas_before_insert
-- Descrição: Validações e defaults antes de inserir proposta
-- =================================================================

DROP TRIGGER IF EXISTS trg_propostas_before_insert ON propostas;
DROP FUNCTION IF EXISTS trigger_propostas_before_insert();

CREATE OR REPLACE FUNCTION trigger_propostas_before_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_seq_numero integer;
BEGIN
    -- Gerar número automático se não informado
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        -- Buscar próximo número sequencial
        SELECT COALESCE(MAX(
            CASE
                WHEN numero ~ '^PROP-[0-9]+$'
                THEN SUBSTRING(numero FROM 'PROP-([0-9]+)')::integer
                ELSE 0
            END
        ), 0) + 1
        INTO v_seq_numero
        FROM propostas;

        NEW.numero := 'PROP-' || LPAD(v_seq_numero::text, 6, '0');
        RAISE NOTICE 'Número da proposta gerado: %', NEW.numero;
    END IF;

    -- Status padrão
    IF NEW.status IS NULL THEN
        NEW.status := 'pendente';
    END IF;

    -- Data de emissão padrão
    IF NEW.data_emissao IS NULL THEN
        NEW.data_emissao := CURRENT_DATE;
    END IF;

    -- Data de validade padrão (30 dias)
    IF NEW.data_validade IS NULL AND NEW.validade_dias IS NOT NULL THEN
        NEW.data_validade := NEW.data_emissao + (NEW.validade_dias || ' days')::interval;
    END IF;

    -- Responsável padrão (usuário atual)
    IF NEW.responsavel_id IS NULL THEN
        NEW.responsavel_id := auth.uid();
    END IF;

    -- Inicializar arrays JSONB
    IF NEW.itens IS NULL THEN
        NEW.itens := '[]'::jsonb;
    END IF;

    IF NEW.anexos IS NULL THEN
        NEW.anexos := '[]'::jsonb;
    END IF;

    IF NEW.dados IS NULL THEN
        NEW.dados := '{}'::jsonb;
    END IF;

    -- Timestamps
    NEW.created_at := NOW();
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_propostas_before_insert
    BEFORE INSERT ON propostas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_propostas_before_insert();

COMMENT ON TRIGGER trg_propostas_before_insert ON propostas IS
'Define valores padrão e valida dados antes de inserir uma nova proposta';

-- =================================================================
-- TRIGGER: trg_propostas_itens_before_change
-- Descrição: Validações antes de mudar itens
-- =================================================================

DROP TRIGGER IF EXISTS trg_propostas_itens_before_change ON propostas;
DROP FUNCTION IF EXISTS trigger_propostas_itens_before_change();

CREATE OR REPLACE FUNCTION trigger_propostas_itens_before_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_item jsonb;
    v_item_validado jsonb;
    v_itens_validados jsonb := '[]'::jsonb;
BEGIN
    -- Validar estrutura dos itens
    IF NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)
        LOOP
            -- Garantir campos obrigatórios
            v_item_validado := jsonb_build_object(
                'descricao', COALESCE(v_item->>'descricao', 'Item sem descrição'),
                'quantidade', COALESCE((v_item->>'quantidade')::numeric, 1),
                'valor_unitario', COALESCE((v_item->>'valor_unitario')::numeric, 0),
                'unidade', COALESCE(v_item->>'unidade', 'UN'),
                'observacao', v_item->>'observacao'
            );

            -- Adicionar campos extras se existirem
            IF v_item ? 'codigo' THEN
                v_item_validado := v_item_validado || jsonb_build_object('codigo', v_item->>'codigo');
            END IF;

            IF v_item ? 'categoria' THEN
                v_item_validado := v_item_validado || jsonb_build_object('categoria', v_item->>'categoria');
            END IF;

            v_itens_validados := v_itens_validados || v_item_validado;
        END LOOP;

        NEW.itens := v_itens_validados;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_propostas_itens_before_change
    BEFORE INSERT OR UPDATE ON propostas
    FOR EACH ROW
    WHEN (NEW.itens IS NOT NULL)
    EXECUTE FUNCTION trigger_propostas_itens_before_change();

COMMENT ON TRIGGER trg_propostas_itens_before_change ON propostas IS
'Valida e normaliza a estrutura dos itens da proposta antes de salvar';

-- =================================================================
-- TRIGGER: calculate_valor_venda
-- Descrição: Calcular valor de venda com margem
-- =================================================================

DROP TRIGGER IF EXISTS calculate_valor_venda ON propostas;
DROP FUNCTION IF EXISTS trigger_calculate_valor_venda();

CREATE OR REPLACE FUNCTION trigger_calculate_valor_venda()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_margem_padrao numeric := 1.3; -- 30% de margem padrão
    v_custo_total numeric := 0;
    v_item jsonb;
BEGIN
    -- Se tipo = 'venda' e há itens com custo, calcular preço de venda
    IF NEW.tipo = 'venda' AND NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)
        LOOP
            -- Se tem custo mas não tem valor de venda, calcular
            IF (v_item ? 'custo') AND NOT (v_item ? 'valor_venda') THEN
                v_custo_total := v_custo_total + COALESCE(
                    (v_item->>'quantidade')::numeric * (v_item->>'custo')::numeric,
                    0
                );
            END IF;
        END LOOP;

        -- Aplicar margem se calculou custo
        IF v_custo_total > 0 AND NEW.valor_total = 0 THEN
            NEW.valor_total := ROUND(v_custo_total * v_margem_padrao, 2);
            NEW.dados := NEW.dados || jsonb_build_object(
                'custo_total', v_custo_total,
                'margem_aplicada', v_margem_padrao,
                'calculo_automatico', true
            );
            RAISE NOTICE 'Valor de venda calculado: R$ % (Custo: R$ %, Margem: %)',
                NEW.valor_total, v_custo_total, ((v_margem_padrao - 1) * 100)::text || '%';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_valor_venda
    BEFORE INSERT OR UPDATE ON propostas
    FOR EACH ROW
    WHEN (NEW.tipo = 'venda')
    EXECUTE FUNCTION trigger_calculate_valor_venda();

COMMENT ON TRIGGER calculate_valor_venda ON propostas IS
'Calcula automaticamente o valor de venda aplicando margem sobre o custo dos itens';

-- =================================================================
-- TRIGGER: cronograma_tarefas_auto_ordem (ADAPTADO)
-- Descrição: Auto-ordenar tarefas do cronograma (kanban cards)
-- Nota: Usando kanban_cards como proxy para cronograma_tarefas
-- =================================================================

-- Este trigger já existe em kanban_cards_autordem_ins/upd
-- Vamos criar um alias ou função auxiliar

DROP FUNCTION IF EXISTS cronograma_reordenar_tarefas(uuid);

CREATE OR REPLACE FUNCTION cronograma_reordenar_tarefas(
    p_board_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_card RECORD;
    v_posicao integer;
    v_coluna_atual uuid;
BEGIN
    RAISE NOTICE 'cronograma_reordenar_tarefas - Board: %', p_board_id;

    v_coluna_atual := NULL;
    v_posicao := 0;

    -- Reordenar cards por coluna e posição
    FOR v_card IN
        SELECT kc.id, kc.coluna_id
        FROM kanban_cards kc
        INNER JOIN kanban_colunas col ON col.id = kc.coluna_id
        WHERE col.board_id = p_board_id
            AND kc.dados->>'tipo' = 'cronograma_tarefa'
        ORDER BY col.posicao, kc.posicao, kc.created_at
    LOOP
        -- Reset contador ao mudar de coluna
        IF v_coluna_atual IS DISTINCT FROM v_card.coluna_id THEN
            v_coluna_atual := v_card.coluna_id;
            v_posicao := 0;
        END IF;

        v_posicao := v_posicao + 10;

        UPDATE kanban_cards
        SET posicao = v_posicao
        WHERE id = v_card.id;
    END LOOP;

    RAISE NOTICE 'Tarefas do cronograma reordenadas';

END;
$$;

COMMENT ON FUNCTION cronograma_reordenar_tarefas IS
'Reordena tarefas do cronograma (cards marcados como tipo cronograma_tarefa no kanban)';

-- =================================================================
-- FUNÇÃO AUXILIAR: proposta_gerar_titulos
-- Descrição: Gerar títulos financeiros a partir de proposta aprovada
-- =================================================================

DROP FUNCTION IF EXISTS proposta_gerar_titulos(uuid, integer);

CREATE OR REPLACE FUNCTION proposta_gerar_titulos(
    p_proposta_id uuid,
    p_parcelas integer DEFAULT 1
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_proposta RECORD;
    v_valor_parcela numeric;
    v_data_base date;
    v_titulos_criados integer := 0;
    i integer;
BEGIN
    RAISE NOTICE 'proposta_gerar_titulos - Proposta: %, Parcelas: %', p_proposta_id, p_parcelas;

    -- Buscar proposta
    SELECT * INTO v_proposta
    FROM propostas
    WHERE id = p_proposta_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;
    END IF;

    IF v_proposta.valor_total <= 0 THEN
        RAISE EXCEPTION 'Proposta sem valor total definido';
    END IF;

    -- Calcular valor da parcela
    v_valor_parcela := ROUND(v_proposta.valor_total / p_parcelas, 2);
    v_data_base := COALESCE(v_proposta.data_emissao, CURRENT_DATE);

    -- Criar títulos
    FOR i IN 1..p_parcelas LOOP
        INSERT INTO titulos_financeiros (
            empresa_id,
            tipo,
            descricao,
            valor,
            data_emissao,
            data_vencimento,
            status,
            documento,
            fornecedor_cliente
        ) VALUES (
            (SELECT empresa_id FROM entities WHERE id = v_proposta.cliente_id),
            'Receber',
            v_proposta.titulo || ' - Parcela ' || i || '/' || p_parcelas,
            CASE
                WHEN i = p_parcelas
                THEN v_proposta.valor_total - (v_valor_parcela * (p_parcelas - 1)) -- Ajustar última parcela
                ELSE v_valor_parcela
            END,
            v_data_base,
            v_data_base + (30 * i || ' days')::interval,
            'Previsto',
            v_proposta.numero,
            (SELECT nome FROM entities WHERE id = v_proposta.cliente_id)
        );

        v_titulos_criados := v_titulos_criados + 1;
    END LOOP;

    -- Atualizar status da proposta
    UPDATE propostas
    SET
        status = 'aprovada',
        dados = dados || jsonb_build_object(
            'titulos_gerados', v_titulos_criados,
            'titulos_gerados_em', NOW(),
            'parcelas', p_parcelas
        ),
        updated_at = NOW()
    WHERE id = p_proposta_id;

    RAISE NOTICE '% títulos financeiros criados para a proposta %', v_titulos_criados, v_proposta.numero;
    RETURN v_titulos_criados;

END;
$$;

COMMENT ON FUNCTION proposta_gerar_titulos IS
'Gera títulos financeiros (contas a receber) a partir de uma proposta aprovada, com opção de parcelamento';

-- =================================================================
-- FIM DA MIGRATION 023
-- =================================================================

DO $$ BEGIN RAISE NOTICE 'Migration 023 - Funções Propostas/Cronograma criadas com sucesso!'; END $$ ;