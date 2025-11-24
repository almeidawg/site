-- =============================================
-- 6. Criar view v_clientes_ativos_contratos
-- =============================================

DROP VIEW IF EXISTS v_clientes_ativos_contratos;

CREATE OR REPLACE VIEW v_clientes_ativos_contratos AS
SELECT
  e.id as cliente_id,
  e.nome_razao_social,
  e.cnpj_cpf,
  e.tipo,
  e.cidade,
  e.uf,
  COUNT(DISTINCT c.id) as total_contratos,
  SUM(CASE WHEN c.status_geral = 'Em andamento' THEN 1 ELSE 0 END) as contratos_ativos,
  SUM(CASE WHEN c.status_geral = 'Concluído' THEN 1 ELSE 0 END) as contratos_concluidos,
  COALESCE(SUM(co.valor_total), 0) as valor_total_contratos,
  MAX(c.created_at) as ultimo_contrato_em
FROM entities e
LEFT JOIN contratos c ON c.empresa_id = e.id
LEFT JOIN contratos_obras co ON co.projeto_id = c.id
WHERE e.ativo = true
GROUP BY e.id, e.nome_razao_social, e.cnpj_cpf, e.tipo, e.cidade, e.uf
ORDER BY total_contratos DESC, valor_total_contratos DESC;

COMMENT ON VIEW v_clientes_ativos_contratos IS 'View de clientes ativos com resumo completo de contratos e valores';
