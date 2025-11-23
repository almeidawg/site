-- =============================================
-- Migration: Atualizar view v_kanban_cards com join entities
-- Data: 2025-11-04
-- Descrição: Adiciona LEFT JOIN com entities para incluir dados do cliente
-- =============================================

-- Recriar view com LEFT JOIN para entities
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
  kc.valor,
  kc.created_at,
  kc.updated_at,
  kc.deleted_at,
  col.board_id,
  board.titulo AS board_nome,
  board.modulo AS board_modulo,
  -- Campos de entities (cliente)
  e.nome AS cliente_nome,
  e.telefone,
  e.email AS cliente_email,
  e.endereco,
  e.cidade,
  e.estado,
  e.cep,
  -- Campos do JSONB dados de entities (se existirem)
  e.dados->>'endereco_obra' AS endereco_obra,
  e.dados->>'empreendimento' AS empreendimento
FROM public.kanban_cards kc
JOIN public.kanban_colunas col ON kc.coluna_id = col.id
JOIN public.kanban_boards board ON col.board_id = board.id
LEFT JOIN public.entities e ON kc.entity_id = e.id
WHERE kc.deleted_at IS NULL;

COMMENT ON VIEW public.v_kanban_cards IS
  'View consolidada de cards com informações de coluna, board e cliente (entities). Compatível com Horizons e OportunidadeCard.';
