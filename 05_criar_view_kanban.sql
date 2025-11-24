-- =============================================
-- 5. Criar view v_kanban_cards_board
-- =============================================

DROP VIEW IF EXISTS v_kanban_cards_board;

CREATE OR REPLACE VIEW v_kanban_cards_board AS
SELECT
  kc.id,
  kc.titulo,
  kc.descricao,
  kc.coluna_id,
  kc.ordem as card_ordem,
  kc.prioridade,
  kc.tags,
  kc.created_at,
  kc.updated_at,
  col.titulo as coluna_titulo,
  col.ordem as coluna_ordem,
  col.cor as coluna_cor,
  col.limite_wip
FROM kanban_cards kc
LEFT JOIN kanban_colunas col ON kc.coluna_id = col.id
ORDER BY col.ordem, kc.ordem;

COMMENT ON VIEW v_kanban_cards_board IS 'View combinada de cards com suas colunas para visualização do board';
