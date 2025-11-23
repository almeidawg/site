-- =============================================
-- MIGRATION: 004
-- Descrição: Criar views para consultas otimizadas
-- Data: 2025-10-30
-- Autor: Equipe WG
-- =============================================
-- Views criadas:
--   - vw_pipeline_oportunidades (dados agregados do pipeline)
--   - vw_titulos_resumo (resumo financeiro)
--   - vw_oportunidades_completas (oportunidades com todos os dados)
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. VIEW: vw_pipeline_oportunidades
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE VIEW vw_pipeline_oportunidades AS
SELECT
  col.titulo as estagio,
  col.cor as cor_estagio,
  col.posicao,
  COUNT(kc.id) as quantidade,
  COALESCE(SUM(kc.valor), 0) as valor_total
FROM kanban_colunas col
LEFT JOIN kanban_cards kc ON kc.coluna_id = col.id
JOIN kanban_boards kb ON col.board_id = kb.id
WHERE kb.ambiente = 'oportunidades'
GROUP BY col.id, col.titulo, col.cor, col.posicao
ORDER BY col.posicao;

COMMENT ON VIEW vw_pipeline_oportunidades IS 'Dados agregados do pipeline de vendas por estágio';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. VIEW: vw_titulos_resumo
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE VIEW vw_titulos_resumo AS
SELECT
  e.id as empresa_id,
  e.razao_social as empresa,

  -- Receitas
  COALESCE(SUM(CASE
    WHEN t.tipo = 'Receber' AND t.status = 'Pago'
    THEN t.valor ELSE 0
  END), 0) as total_receitas,

  -- Despesas
  COALESCE(SUM(CASE
    WHEN t.tipo = 'Pagar' AND t.status = 'Pago'
    THEN t.valor ELSE 0
  END), 0) as total_despesas,

  -- A Receber
  COALESCE(SUM(CASE
    WHEN t.tipo = 'Receber' AND t.status IN ('Previsto', 'Aprovado')
    THEN t.valor ELSE 0
  END), 0) as a_receber,

  -- A Pagar
  COALESCE(SUM(CASE
    WHEN t.tipo = 'Pagar' AND t.status IN ('Previsto', 'Aprovado')
    THEN t.valor ELSE 0
  END), 0) as a_pagar,

  -- Saldo
  COALESCE(SUM(CASE
    WHEN t.tipo = 'Receber' AND t.status = 'Pago'
    THEN t.valor
    WHEN t.tipo = 'Pagar' AND t.status = 'Pago'
    THEN -t.valor
    ELSE 0
  END), 0) as saldo,

  -- Vencidos
  COUNT(CASE
    WHEN t.status IN ('Previsto', 'Aprovado')
    AND t.data_vencimento < CURRENT_DATE
    THEN 1
  END) as titulos_vencidos

FROM empresas e
LEFT JOIN titulos_financeiros t ON t.empresa_id = e.id
WHERE e.ativo = TRUE
GROUP BY e.id, e.razao_social;

COMMENT ON VIEW vw_titulos_resumo IS 'Resumo financeiro consolidado por empresa';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. VIEW: vw_oportunidades_completas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE VIEW vw_oportunidades_completas AS
SELECT
  kc.id,
  kc.titulo,
  kc.descricao,
  kc.valor,
  kc.posicao,
  kc.dados,
  kc.created_at,
  kc.updated_at,

  -- Coluna
  col.id as coluna_id,
  col.titulo as coluna_titulo,
  col.cor as coluna_cor,
  col.posicao as coluna_posicao,

  -- Board
  kb.id as board_id,
  kb.ambiente as board_ambiente,
  kb.titulo as board_titulo,

  -- Responsável
  p.id as responsavel_id,
  p.nome as responsavel_nome,
  p.email as responsavel_email,

  -- Cliente/Lead
  e.id as entity_id,
  e.tipo as entity_tipo,
  e.nome as entity_nome,
  e.email as entity_email,
  e.telefone as entity_telefone,
  e.dados as entity_dados

FROM kanban_cards kc
JOIN kanban_colunas col ON kc.coluna_id = col.id
JOIN kanban_boards kb ON col.board_id = kb.id
LEFT JOIN profiles p ON kc.responsavel_id = p.id
LEFT JOIN entities e ON kc.entity_id = e.id
WHERE kb.ambiente = 'oportunidades'
ORDER BY col.posicao, kc.posicao;

COMMENT ON VIEW vw_oportunidades_completas IS 'Oportunidades com todos os dados relacionados (joins)';
