-- ===================================================================
-- CORREÇÃO COMPLETA DA VIEW v_kanban_cards_board
-- ===================================================================
-- Remove view antiga e recria sem joins problemáticos
-- ===================================================================

DROP VIEW IF EXISTS public.v_kanban_cards_board CASCADE;

CREATE VIEW public.v_kanban_cards_board AS
SELECT
  b.id AS board_id,
  COALESCE(b.nome, b.name) AS board_name,
  NULL::uuid AS column_id,
  NULL::text AS column_title,
  k.id AS card_id,
  k.titulo AS card_title,
  k.ordem AS card_pos,
  k.descricao AS card_description,
  k.cliente_id AS card_org_id,
  k.due_date,
  k.status,
  k.payload AS metadata,
  k.valor_proposta
FROM public.kanban_cards k
LEFT JOIN public.kanban_boards b ON b.id = k.board_id;

COMMENT ON VIEW public.v_kanban_cards_board IS 'Kanban cards joined with boards (simplified version)';
