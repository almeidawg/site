-- =============================================
-- Migration: View e Functions Kanban (Horizons compatibility)
-- Data: 2025-11-04
-- Descrição: View consolidada e functions para manipulação de Kanban
-- =============================================

-- ========================================
-- FASE 2: VIEW v_kanban_cards
-- ========================================

DROP VIEW IF EXISTS public.v_kanban_cards CASCADE;

CREATE OR REPLACE VIEW public.v_kanban_cards AS
SELECT
  kc.id,
  kc.titulo,
  kc.descricao,
  kc.coluna_id,
  col.nome AS coluna_nome,
  col.pos AS coluna_pos,
  kc.ordem,
  kc.payload,
  kc.entity_id,
  kc.created_at,
  kc.updated_at,
  kc.deleted_at,
  col.board_id,
  board.titulo AS board_nome,
  board.modulo AS board_modulo
FROM public.kanban_cards kc
JOIN public.kanban_colunas col ON kc.coluna_id = col.id
JOIN public.kanban_boards board ON col.board_id = board.id
WHERE kc.deleted_at IS NULL;

COMMENT ON VIEW public.v_kanban_cards IS
  'View consolidada de cards com informações de coluna e board. Compatível com Horizons.';

-- ========================================
-- FASE 3: FUNCTIONS SQL
-- ========================================

-- 1. api_criar_coluna_kanban
DROP FUNCTION IF EXISTS public.api_criar_coluna_kanban(uuid, text, integer);

CREATE OR REPLACE FUNCTION public.api_criar_coluna_kanban(
  p_board_id uuid,
  p_nome text,
  p_pos integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coluna_id uuid;
  v_max_pos integer;
BEGIN
  -- Validações
  IF p_nome IS NULL OR p_nome = '' THEN
    RAISE EXCEPTION 'Nome da coluna não pode ser vazio';
  END IF;

  IF p_board_id IS NULL THEN
    RAISE EXCEPTION 'board_id é obrigatório';
  END IF;

  -- Se pos não informado, usar max + 1
  IF p_pos IS NULL THEN
    SELECT COALESCE(MAX(pos), -1) + 1 INTO v_max_pos
    FROM kanban_colunas
    WHERE board_id = p_board_id;
    p_pos := v_max_pos;
  END IF;

  -- Criar coluna
  INSERT INTO kanban_colunas (board_id, nome, pos, created_at)
  VALUES (p_board_id, p_nome, p_pos, now())
  RETURNING id INTO v_coluna_id;

  RETURN v_coluna_id;
END;
$$;

COMMENT ON FUNCTION public.api_criar_coluna_kanban IS
  'Cria uma nova coluna no board Kanban';

-- 2. api_renomear_coluna_kanban
DROP FUNCTION IF EXISTS public.api_renomear_coluna_kanban(uuid, text);

CREATE OR REPLACE FUNCTION public.api_renomear_coluna_kanban(
  p_coluna_id uuid,
  p_novo_nome text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validações
  IF p_novo_nome IS NULL OR p_novo_nome = '' THEN
    RAISE EXCEPTION 'Novo nome não pode ser vazio';
  END IF;

  IF p_coluna_id IS NULL THEN
    RAISE EXCEPTION 'coluna_id é obrigatório';
  END IF;

  -- Renomear
  UPDATE kanban_colunas
  SET nome = p_novo_nome
  WHERE id = p_coluna_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coluna não encontrada: %', p_coluna_id;
  END IF;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.api_renomear_coluna_kanban IS
  'Renomeia uma coluna do Kanban (edição inline)';

-- 3. api_criar_card_kanban
DROP FUNCTION IF EXISTS public.api_criar_card_kanban(uuid, uuid, text, text, uuid, jsonb);

CREATE OR REPLACE FUNCTION public.api_criar_card_kanban(
  p_board_id uuid,
  p_coluna_id uuid,
  p_titulo text,
  p_descricao text DEFAULT NULL,
  p_cliente_id uuid DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_id uuid;
  v_max_ordem integer;
BEGIN
  -- Validações
  IF p_titulo IS NULL OR p_titulo = '' THEN
    RAISE EXCEPTION 'Título do card não pode ser vazio';
  END IF;

  IF p_board_id IS NULL THEN
    RAISE EXCEPTION 'board_id é obrigatório';
  END IF;

  IF p_coluna_id IS NULL THEN
    RAISE EXCEPTION 'coluna_id é obrigatório';
  END IF;

  -- Calcular próxima ordem na coluna
  SELECT COALESCE(MAX(ordem), -1) + 1 INTO v_max_ordem
  FROM kanban_cards
  WHERE coluna_id = p_coluna_id AND deleted_at IS NULL;

  -- Criar card
  INSERT INTO kanban_cards (
    titulo,
    descricao,
    coluna_id,
    entity_id,
    ordem,
    payload,
    created_at
  ) VALUES (
    p_titulo,
    p_descricao,
    p_coluna_id,
    p_cliente_id,
    v_max_ordem,
    p_payload,
    now()
  )
  RETURNING id INTO v_card_id;

  RETURN v_card_id;
END;
$$;

COMMENT ON FUNCTION public.api_criar_card_kanban IS
  'Cria um novo card no Kanban';

-- 4. api_atualizar_card_kanban
DROP FUNCTION IF EXISTS public.api_atualizar_card_kanban(uuid, jsonb);

CREATE OR REPLACE FUNCTION public.api_atualizar_card_kanban(
  p_card_id uuid,
  p_dados jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_updated kanban_cards%ROWTYPE;
BEGIN
  IF p_card_id IS NULL THEN
    RAISE EXCEPTION 'card_id é obrigatório';
  END IF;

  -- Atualizar campos permitidos do card
  UPDATE kanban_cards
  SET
    titulo = COALESCE((p_dados->>'titulo')::text, titulo),
    descricao = COALESCE((p_dados->>'descricao')::text, descricao),
    payload = COALESCE((p_dados->'payload')::jsonb, payload),
    updated_at = now()
  WHERE id = p_card_id
  RETURNING * INTO v_card_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card não encontrado: %', p_card_id;
  END IF;

  -- Retornar card atualizado
  RETURN row_to_json(v_card_updated)::jsonb;
END;
$$;

COMMENT ON FUNCTION public.api_atualizar_card_kanban IS
  'Atualiza campos de um card (título, descrição, payload)';

-- 5. api_mover_card_kanban
DROP FUNCTION IF EXISTS public.api_mover_card_kanban(uuid, uuid, integer);

CREATE OR REPLACE FUNCTION public.api_mover_card_kanban(
  p_card_id uuid,
  p_nova_coluna_id uuid,
  p_nova_ordem integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_card_id IS NULL THEN
    RAISE EXCEPTION 'card_id é obrigatório';
  END IF;

  IF p_nova_coluna_id IS NULL THEN
    RAISE EXCEPTION 'nova_coluna_id é obrigatório';
  END IF;

  -- Mover card (drag-and-drop)
  UPDATE kanban_cards
  SET
    coluna_id = p_nova_coluna_id,
    ordem = COALESCE(p_nova_ordem, ordem),
    updated_at = now()
  WHERE id = p_card_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card não encontrado: %', p_card_id;
  END IF;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.api_mover_card_kanban IS
  'Move card para outra coluna e/ou altera ordem (drag-and-drop)';