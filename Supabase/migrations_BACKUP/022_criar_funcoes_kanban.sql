-- =============================================
-- MIGRATION: 022
-- Descrição: Funções Kanban (boards, colunas, cards)
-- Data: 2025-11-03
-- =============================================

-- =================================================================
-- FUNÇÃO: kanban_ensure_board
-- Descrição: Criar board se não existir, retorna ID
-- =================================================================

DROP FUNCTION IF EXISTS kanban_ensure_board(text);

CREATE OR REPLACE FUNCTION kanban_ensure_board(
    p_modulo text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_board_id uuid;
    v_board_id_bigint bigint;
BEGIN
    RAISE NOTICE 'kanban_ensure_board - Garantindo board para módulo: %', p_modulo;

    -- Verificar se o board já existe
    SELECT id INTO v_board_id
    FROM kanban_boards
    WHERE ambiente = p_modulo;

    IF NOT FOUND THEN
        -- Criar novo board
        INSERT INTO kanban_boards (ambiente, titulo, descricao)
        VALUES (
            p_modulo,
            'Kanban ' || p_modulo,
            'Board do módulo ' || p_modulo
        )
        RETURNING id INTO v_board_id;

        RAISE NOTICE 'Board criado: %', v_board_id;

        -- Criar colunas padrão
        PERFORM _ensure_coluna(
            v_board_id,
            'A Fazer',
            1,
            '#94a3b8' -- Cinza
        );

        PERFORM _ensure_coluna(
            v_board_id,
            'Em Progresso',
            2,
            '#60a5fa' -- Azul
        );

        PERFORM _ensure_coluna(
            v_board_id,
            'Em Revisão',
            3,
            '#fbbf24' -- Amarelo
        );

        PERFORM _ensure_coluna(
            v_board_id,
            'Concluído',
            4,
            '#34d399' -- Verde
        );

        RAISE NOTICE 'Colunas padrão criadas para o board';
    ELSE
        RAISE NOTICE 'Board já existe: %', v_board_id;
    END IF;

    -- Converter UUID para bigint (hash simples do primeiro segment)
    -- Nota: Esta conversão é simplificada, em produção usar outra estratégia
    v_board_id_bigint := ('x' || substr(v_board_id::text, 1, 8))::bit(32)::bigint;

    RETURN v_board_id_bigint;

END;
$$;

COMMENT ON FUNCTION kanban_ensure_board IS
'Garante que um board existe para o módulo especificado, cria se necessário com colunas padrão';

-- =================================================================
-- FUNÇÃO: _ensure_coluna
-- Descrição: Criar coluna em board se não existir
-- =================================================================

DROP FUNCTION IF EXISTS _ensure_coluna(uuid, text, integer, text);

CREATE OR REPLACE FUNCTION _ensure_coluna(
    p_board_id uuid,
    p_titulo text,
    p_posicao integer,
    p_cor text DEFAULT '#94a3b8'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coluna_id uuid;
BEGIN
    RAISE NOTICE '_ensure_coluna - Board: %, Título: %, Posição: %', p_board_id, p_titulo, p_posicao;

    -- Verificar se a coluna já existe
    SELECT id INTO v_coluna_id
    FROM kanban_colunas
    WHERE board_id = p_board_id AND titulo = p_titulo;

    IF NOT FOUND THEN
        -- Criar nova coluna
        INSERT INTO kanban_colunas (board_id, titulo, posicao, cor)
        VALUES (p_board_id, p_titulo, p_posicao, p_cor)
        ON CONFLICT (board_id, posicao) DO UPDATE
        SET titulo = EXCLUDED.titulo, cor = EXCLUDED.cor;

        RAISE NOTICE 'Coluna criada: %', p_titulo;
    ELSE
        -- Atualizar posição e cor se diferente
        UPDATE kanban_colunas
        SET posicao = p_posicao, cor = p_cor
        WHERE id = v_coluna_id
            AND (posicao != p_posicao OR cor != p_cor);

        IF FOUND THEN
            RAISE NOTICE 'Coluna atualizada: %', p_titulo;
        END IF;
    END IF;

END;
$$;

COMMENT ON FUNCTION _ensure_coluna IS
'Cria ou atualiza uma coluna no board especificado (função auxiliar interna)';

-- =================================================================
-- FUNÇÃO: reorder_cards
-- Descrição: Reordenar cards por posição
-- =================================================================

DROP FUNCTION IF EXISTS reorder_cards(text, uuid);

CREATE OR REPLACE FUNCTION reorder_cards(
    p_modulo text,
    p_stage_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_board_id uuid;
    v_card RECORD;
    v_posicao integer := 0;
BEGIN
    RAISE NOTICE 'reorder_cards - Módulo: %, Stage: %', p_modulo, p_stage_id;

    -- Obter board_id do módulo
    SELECT id INTO v_board_id
    FROM kanban_boards
    WHERE ambiente = p_modulo;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Board não encontrado para módulo: %', p_modulo;
    END IF;

    -- Se stage_id especificado, reordenar apenas cards dessa coluna
    IF p_stage_id IS NOT NULL THEN
        FOR v_card IN
            SELECT id
            FROM kanban_cards
            WHERE coluna_id = p_stage_id
            ORDER BY posicao, created_at
        LOOP
            v_posicao := v_posicao + 10;
            UPDATE kanban_cards
            SET posicao = v_posicao
            WHERE id = v_card.id;
        END LOOP;

        RAISE NOTICE 'Reordenados % cards na coluna %', v_posicao / 10, p_stage_id;
    ELSE
        -- Reordenar todas as colunas do board
        FOR v_card IN
            SELECT kc.id, kc.coluna_id
            FROM kanban_cards kc
            INNER JOIN kanban_colunas col ON col.id = kc.coluna_id
            WHERE col.board_id = v_board_id
            ORDER BY col.posicao, kc.posicao, kc.created_at
        LOOP
            -- Reset posição quando mudar de coluna
            IF v_card.coluna_id IS DISTINCT FROM lag(v_card.coluna_id) OVER () THEN
                v_posicao := 0;
            END IF;

            v_posicao := v_posicao + 10;
            UPDATE kanban_cards
            SET posicao = v_posicao
            WHERE id = v_card.id;
        END LOOP;

        RAISE NOTICE 'Reordenados todos os cards do board %', p_modulo;
    END IF;

END;
$$;

COMMENT ON FUNCTION reorder_cards IS
'Reordena cards do kanban por posição, opcionalmente filtrando por coluna';

-- =================================================================
-- TRIGGER: kanban_cards_autordem_ins
-- Descrição: Auto-ordenar ao inserir card
-- =================================================================

DROP TRIGGER IF EXISTS kanban_cards_autordem_ins ON kanban_cards;
DROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_ins();

CREATE OR REPLACE FUNCTION trigger_kanban_cards_autordem_ins()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_posicao integer;
BEGIN
    -- Se não foi especificada posição, colocar no final
    IF NEW.posicao IS NULL OR NEW.posicao = 0 THEN
        SELECT COALESCE(MAX(posicao), 0) + 10
        INTO v_max_posicao
        FROM kanban_cards
        WHERE coluna_id = NEW.coluna_id;

        NEW.posicao := v_max_posicao;
        RAISE NOTICE 'Card inserido na posição % da coluna %', NEW.posicao, NEW.coluna_id;
    END IF;

    -- Garantir que posição seja múltiplo de 10 para facilitar reordenação
    IF NEW.posicao % 10 != 0 THEN
        NEW.posicao := ROUND(NEW.posicao / 10.0) * 10;
    END IF;

    -- Timestamps
    NEW.created_at := NOW();
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER kanban_cards_autordem_ins
    BEFORE INSERT ON kanban_cards
    FOR EACH ROW
    EXECUTE FUNCTION trigger_kanban_cards_autordem_ins();

COMMENT ON TRIGGER kanban_cards_autordem_ins ON kanban_cards IS
'Atribui posição automaticamente ao inserir novo card no kanban';

-- =================================================================
-- TRIGGER: kanban_cards_autordem_upd
-- Descrição: Auto-ordenar ao atualizar posição
-- =================================================================

DROP TRIGGER IF EXISTS kanban_cards_autordem_upd ON kanban_cards;
DROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_upd();

CREATE OR REPLACE FUNCTION trigger_kanban_cards_autordem_upd()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_cards_to_shift integer;
BEGIN
    -- Se mudou de coluna, ajustar posições
    IF OLD.coluna_id IS DISTINCT FROM NEW.coluna_id THEN
        -- Se não especificou nova posição, colocar no final da nova coluna
        IF NEW.posicao = OLD.posicao OR NEW.posicao IS NULL THEN
            SELECT COALESCE(MAX(posicao), 0) + 10
            INTO NEW.posicao
            FROM kanban_cards
            WHERE coluna_id = NEW.coluna_id
                AND id != NEW.id;
        END IF;

        RAISE NOTICE 'Card movido para coluna %, posição %', NEW.coluna_id, NEW.posicao;

        -- Reordenar cards na coluna antiga (fechar gap)
        UPDATE kanban_cards
        SET posicao = posicao - 10
        WHERE coluna_id = OLD.coluna_id
            AND posicao > OLD.posicao
            AND id != NEW.id;

        -- Abrir espaço na nova coluna se necessário
        UPDATE kanban_cards
        SET posicao = posicao + 10
        WHERE coluna_id = NEW.coluna_id
            AND posicao >= NEW.posicao
            AND id != NEW.id;

    ELSIF OLD.posicao != NEW.posicao THEN
        -- Moveu dentro da mesma coluna
        IF NEW.posicao > OLD.posicao THEN
            -- Movendo para baixo
            UPDATE kanban_cards
            SET posicao = posicao - 10
            WHERE coluna_id = NEW.coluna_id
                AND posicao > OLD.posicao
                AND posicao <= NEW.posicao
                AND id != NEW.id;
        ELSE
            -- Movendo para cima
            UPDATE kanban_cards
            SET posicao = posicao + 10
            WHERE coluna_id = NEW.coluna_id
                AND posicao >= NEW.posicao
                AND posicao < OLD.posicao
                AND id != NEW.id;
        END IF;

        RAISE NOTICE 'Card reposicionado de % para %', OLD.posicao, NEW.posicao;
    END IF;

    -- Atualizar timestamp
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER kanban_cards_autordem_upd
    BEFORE UPDATE ON kanban_cards
    FOR EACH ROW
    WHEN (OLD.coluna_id IS DISTINCT FROM NEW.coluna_id OR OLD.posicao IS DISTINCT FROM NEW.posicao)
    EXECUTE FUNCTION trigger_kanban_cards_autordem_upd();

COMMENT ON TRIGGER kanban_cards_autordem_upd ON kanban_cards IS
'Reorganiza posições dos cards ao mover entre colunas ou reordenar';

-- =================================================================
-- TRIGGER: kanban_colunas_set_pos
-- Descrição: Auto-ordenar colunas
-- =================================================================

DROP TRIGGER IF EXISTS kanban_colunas_set_pos ON kanban_colunas;
DROP FUNCTION IF EXISTS trigger_kanban_colunas_set_pos();

CREATE OR REPLACE FUNCTION trigger_kanban_colunas_set_pos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_posicao integer;
BEGIN
    -- Ao inserir nova coluna
    IF TG_OP = 'INSERT' THEN
        -- Se não foi especificada posição, colocar no final
        IF NEW.posicao IS NULL OR NEW.posicao = 0 THEN
            SELECT COALESCE(MAX(posicao), 0) + 1
            INTO v_max_posicao
            FROM kanban_colunas
            WHERE board_id = NEW.board_id;

            NEW.posicao := v_max_posicao;
            RAISE NOTICE 'Coluna inserida na posição % do board %', NEW.posicao, NEW.board_id;
        ELSE
            -- Abrir espaço se necessário
            UPDATE kanban_colunas
            SET posicao = posicao + 1
            WHERE board_id = NEW.board_id
                AND posicao >= NEW.posicao
                AND id != NEW.id;
        END IF;

        NEW.created_at := NOW();
    END IF;

    -- Ao atualizar posição
    IF TG_OP = 'UPDATE' AND OLD.posicao != NEW.posicao THEN
        IF NEW.posicao > OLD.posicao THEN
            -- Movendo para direita
            UPDATE kanban_colunas
            SET posicao = posicao - 1
            WHERE board_id = NEW.board_id
                AND posicao > OLD.posicao
                AND posicao <= NEW.posicao
                AND id != NEW.id;
        ELSE
            -- Movendo para esquerda
            UPDATE kanban_colunas
            SET posicao = posicao + 1
            WHERE board_id = NEW.board_id
                AND posicao >= NEW.posicao
                AND posicao < OLD.posicao
                AND id != NEW.id;
        END IF;

        RAISE NOTICE 'Coluna reposicionada de % para %', OLD.posicao, NEW.posicao;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER kanban_colunas_set_pos
    BEFORE INSERT OR UPDATE ON kanban_colunas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_kanban_colunas_set_pos();

COMMENT ON TRIGGER kanban_colunas_set_pos ON kanban_colunas IS
'Gerencia automaticamente a posição das colunas do kanban';

-- =================================================================
-- FUNÇÃO AUXILIAR: kanban_move_card
-- Descrição: Mover card entre colunas
-- =================================================================

DROP FUNCTION IF EXISTS kanban_move_card(uuid, uuid, integer);

CREATE OR REPLACE FUNCTION kanban_move_card(
    p_card_id uuid,
    p_new_coluna_id uuid,
    p_new_posicao integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_coluna_id uuid;
    v_old_posicao integer;
BEGIN
    RAISE NOTICE 'kanban_move_card - Card: %, Nova coluna: %, Nova posição: %',
        p_card_id, p_new_coluna_id, p_new_posicao;

    -- Obter posição atual
    SELECT coluna_id, posicao
    INTO v_old_coluna_id, v_old_posicao
    FROM kanban_cards
    WHERE id = p_card_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Card não encontrado: %', p_card_id;
    END IF;

    -- Se não especificou posição, colocar no final
    IF p_new_posicao IS NULL THEN
        SELECT COALESCE(MAX(posicao), 0) + 10
        INTO p_new_posicao
        FROM kanban_cards
        WHERE coluna_id = p_new_coluna_id;
    END IF;

    -- Atualizar card (triggers farão o reordenamento)
    UPDATE kanban_cards
    SET
        coluna_id = p_new_coluna_id,
        posicao = p_new_posicao,
        updated_at = NOW()
    WHERE id = p_card_id;

    RAISE NOTICE 'Card movido com sucesso de coluna % pos % para coluna % pos %',
        v_old_coluna_id, v_old_posicao, p_new_coluna_id, p_new_posicao;

    RETURN TRUE;

END;
$$;

COMMENT ON FUNCTION kanban_move_card IS
'Move um card entre colunas do kanban, reordenando automaticamente as posições';

-- =================================================================
-- FUNÇÃO AUXILIAR: kanban_get_board_status
-- Descrição: Obter status do board
-- =================================================================

DROP FUNCTION IF EXISTS kanban_get_board_status(text);

CREATE OR REPLACE FUNCTION kanban_get_board_status(
    p_modulo text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result json;
    v_board_id uuid;
BEGIN
    -- Obter board_id
    SELECT id INTO v_board_id
    FROM kanban_boards
    WHERE ambiente = p_modulo;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'error', 'Board não encontrado',
            'modulo', p_modulo
        );
    END IF;

    -- Montar estatísticas
    SELECT json_build_object(
        'board_id', v_board_id,
        'modulo', p_modulo,
        'colunas', (
            SELECT json_agg(
                json_build_object(
                    'id', c.id,
                    'titulo', c.titulo,
                    'cor', c.cor,
                    'posicao', c.posicao,
                    'total_cards', COUNT(kc.id),
                    'valor_total', COALESCE(SUM(kc.valor), 0)
                ) ORDER BY c.posicao
            )
            FROM kanban_colunas c
            LEFT JOIN kanban_cards kc ON kc.coluna_id = c.id
            WHERE c.board_id = v_board_id
            GROUP BY c.id, c.titulo, c.cor, c.posicao
        ),
        'totais', (
            SELECT json_build_object(
                'total_cards', COUNT(kc.id),
                'valor_total', COALESCE(SUM(kc.valor), 0),
                'cards_sem_responsavel', COUNT(*) FILTER (WHERE kc.responsavel_id IS NULL)
            )
            FROM kanban_cards kc
            INNER JOIN kanban_colunas c ON c.id = kc.coluna_id
            WHERE c.board_id = v_board_id
        ),
        'timestamp', NOW()
    ) INTO v_result;

    RETURN v_result;

END;
$$;

COMMENT ON FUNCTION kanban_get_board_status IS
'Retorna estatísticas e status completo de um board kanban';

-- =================================================================
-- FIM DA MIGRATION 022
-- =================================================================

DO $$ BEGIN RAISE NOTICE 'Migration 022 - Funções Kanban criadas com sucesso!'; END $$ ;