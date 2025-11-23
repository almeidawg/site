-- ===================================================================
-- CORREÇÃO SIMPLIFICADA DA VIEW v_kanban_cards_board
-- ===================================================================
-- Esta versão simplificada não faz join com kanban_colunas
-- porque a coluna de referência pode ter nome diferente ou não existir
-- ===================================================================

-- PASSO 1: Remover a view antiga completamente
DROP VIEW IF EXISTS public.v_kanban_cards_board CASCADE;

-- PASSO 2: Criar view simplificada (apenas cards + boards, sem colunas)
CREATE VIEW public.v_kanban_cards_board AS
SELECT
  -- Board info
  b.id AS board_id,
  COALESCE(b.nome, b.name) AS board_name,
  -- Column info (null por enquanto)
  NULL::uuid AS column_id,
  NULL::text AS column_title,
  -- Card info
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

COMMENT ON VIEW public.v_kanban_cards_board IS 'Kanban cards joined with boards (simplified version without columns)';

-- ===================================================================
-- FIM DA CORREÇÃO
-- ===================================================================
