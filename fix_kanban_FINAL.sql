-- ===================================================================
-- CORREÇÃO FINAL DA VIEW v_kanban_cards_board
-- ===================================================================
-- Este script corrige todos os erros encontrados:
-- 1. Remove referências a colunas inexistentes (b.titulo, k.org_id)
-- 2. Usa a estrutura correta (cliente_id em vez de org_id)
-- 3. Remove filtro deleted_at (pode não existir)
-- ===================================================================

-- PASSO 1: Remover a view antiga completamente
DROP VIEW IF EXISTS public.v_kanban_cards_board CASCADE;

-- PASSO 2: Criar a view correta
CREATE VIEW public.v_kanban_cards_board AS
SELECT
  -- Board info (prefer board from column, fallback to card's direct board_id)
  COALESCE(b.id, b2.id) AS board_id,
  COALESCE(b.nome, b.name, b2.nome, b2.name) AS board_name,
  -- Column info
  c.id AS column_id,
  COALESCE(c.nome, c.name) AS column_title,
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
-- Join com coluna (se existir)
LEFT JOIN public.kanban_colunas c ON c.id = k.coluna_id
-- Join com board via coluna
LEFT JOIN public.kanban_boards b ON b.id = c.board_id
-- Join com board direto do card (fallback)
LEFT JOIN public.kanban_boards b2 ON b2.id = k.board_id;

COMMENT ON VIEW public.v_kanban_cards_board IS 'Kanban cards joined with boards and columns for dashboards';

-- ===================================================================
-- FIM DA CORREÇÃO
-- ===================================================================
