-- =============================================
-- API: api_mover_card_kanban
-- Descrição: Move um card para outra coluna do Kanban
-- Parâmetros:
--   p_card_id (uuid) - ID do card
--   p_nova_coluna_id (uuid) - ID da nova coluna
--   p_nova_posicao (integer) - Nova posição (opcional)
-- Retorno: json
-- HTTP: POST /rest/v1/rpc/api_mover_card_kanban
-- Criado: 2025-10-30
-- =============================================

-- Limpar versões antigas
DROP FUNCTION IF EXISTS api_mover_card_kanban();
DROP FUNCTION IF EXISTS api_mover_card_kanban(uuid, uuid);
DROP FUNCTION IF EXISTS api_mover_card_kanban(uuid, uuid, integer);

-- Criar função
CREATE OR REPLACE FUNCTION api_mover_card_kanban(
  p_card_id uuid,
  p_nova_coluna_id uuid,
  p_nova_posicao integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_coluna_antiga_id uuid;
  v_card_titulo text;
BEGIN
  -- ==========================================
  -- 1. VALIDAÇÃO
  -- ==========================================

  IF p_card_id IS NULL THEN
    RAISE EXCEPTION 'Card ID é obrigatório';
  END IF;

  IF p_nova_coluna_id IS NULL THEN
    RAISE EXCEPTION 'Nova coluna ID é obrigatório';
  END IF;

  -- Buscar card e validar existência
  SELECT coluna_id, titulo
  INTO v_coluna_antiga_id, v_card_titulo
  FROM kanban_cards
  WHERE id = p_card_id;

  IF v_coluna_antiga_id IS NULL THEN
    RAISE EXCEPTION 'Card não encontrado: %', p_card_id;
  END IF;

  -- Validar que nova coluna existe
  IF NOT EXISTS (SELECT 1 FROM kanban_colunas WHERE id = p_nova_coluna_id) THEN
    RAISE EXCEPTION 'Coluna não encontrada: %', p_nova_coluna_id;
  END IF;

  -- ==========================================
  -- 2. MOVER CARD
  -- ==========================================

  -- Se posição não informada, coloca no final da coluna
  IF p_nova_posicao IS NULL THEN
    SELECT COALESCE(MAX(posicao), 0) + 1
    INTO p_nova_posicao
    FROM kanban_cards
    WHERE coluna_id = p_nova_coluna_id;
  END IF;

  -- Atualizar card
  UPDATE kanban_cards
  SET
    coluna_id = p_nova_coluna_id,
    posicao = p_nova_posicao,
    updated_at = NOW()
  WHERE id = p_card_id;

  -- ==========================================
  -- 3. RETORNAR RESULTADO
  -- ==========================================

  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'card_id', p_card_id,
      'titulo', v_card_titulo,
      'coluna_antiga', v_coluna_antiga_id,
      'coluna_nova', p_nova_coluna_id,
      'posicao', p_nova_posicao
    ),
    'message', 'Card movido com sucesso'
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_mover_card_kanban: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    );
END;
$$;

COMMENT ON FUNCTION api_mover_card_kanban(uuid, uuid, integer) IS
'Move um card do Kanban para outra coluna.
Utilizado no drag & drop do frontend.';
