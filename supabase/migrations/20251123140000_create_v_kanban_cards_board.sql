-- Drop existing view if it exists (to avoid conflicts)
drop view if exists public.v_kanban_cards_board cascade;

-- Create view to expose kanban cards with board/column context
-- ESTRUTURA CORRETA:
-- kanban_cards -> coluna_id -> kanban_colunas -> board_id -> kanban_boards
--              -> board_id (direto, opcional) -> kanban_boards

create or replace view public.v_kanban_cards_board as
select
  -- Board info (prefer board from column, fallback to card's direct board_id)
  coalesce(b.id, b2.id) as board_id,
  coalesce(b.nome, b.name, b2.nome, b2.name) as board_name,
  -- Column info
  c.id as column_id,
  coalesce(c.nome, c.name) as column_title,
  -- Card info
  k.id as card_id,
  k.titulo as card_title,
  k.ordem as card_pos,
  k.descricao as card_description,
  k.cliente_id as card_org_id,
  k.due_date,
  k.status,
  k.payload as metadata,
  k.valor_proposta
from public.kanban_cards k
-- Join com coluna (se existir)
left join public.kanban_colunas c on c.id = k.coluna_id
-- Join com board via coluna
left join public.kanban_boards b on b.id = c.board_id
-- Join com board direto do card (fallback)
left join public.kanban_boards b2 on b2.id = k.board_id;

comment on view public.v_kanban_cards_board is 'Kanban cards joined with boards and columns for dashboards';
