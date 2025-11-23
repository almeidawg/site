-- =============================================
-- Migration: Adiciona suporte a entity_id em api_atualizar_card_kanban
-- Descrição: Permite atualizar o campo entity_id ao editar um card
-- Data: 2025-11-05
-- =============================================

CREATE OR REPLACE FUNCTION public.api_atualizar_card_kanban(p_card_id uuid, p_dados jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_card_updated kanban_cards%ROWTYPE;
BEGIN
  IF p_card_id IS NULL THEN
    RAISE EXCEPTION 'card_id é obrigatório';
  END IF;

  -- Atualizar campos permitidos do card (incluindo entity_id)
  UPDATE kanban_cards
  SET
    titulo = COALESCE((p_dados->>'titulo')::text, titulo),
    descricao = COALESCE((p_dados->>'descricao')::text, descricao),
    entity_id = CASE 
      WHEN p_dados ? 'entity_id' THEN (p_dados->>'entity_id')::uuid 
      ELSE entity_id 
    END,
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
$function$;

-- Comentário
COMMENT ON FUNCTION api_atualizar_card_kanban IS 'Atualiza campos de um card, incluindo entity_id para vincular/desvincular cliente';
