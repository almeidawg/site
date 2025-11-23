-- =============================================
-- API: api_resumo_financeiro
-- Descrição: Retorna resumo financeiro por empresa
-- Parâmetros:
--   p_empresa_id (uuid) - ID da empresa (opcional, NULL = todas)
--   p_data_inicio (date) - Data inicial (opcional)
--   p_data_fim (date) - Data final (opcional)
-- Retorno: json
-- HTTP: POST /rest/v1/rpc/api_resumo_financeiro
-- Criado: 2025-10-30
-- =============================================

DROP FUNCTION IF EXISTS api_resumo_financeiro();
DROP FUNCTION IF EXISTS api_resumo_financeiro(uuid);
DROP FUNCTION IF EXISTS api_resumo_financeiro(uuid, date, date);

CREATE OR REPLACE FUNCTION api_resumo_financeiro(
  p_empresa_id uuid DEFAULT NULL,
  p_data_inicio date DEFAULT NULL,
  p_data_fim date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_total_receitas numeric;
  v_total_despesas numeric;
  v_saldo numeric;
  v_a_receber numeric;
  v_a_pagar numeric;
  v_vencidos integer;
BEGIN
  -- ==========================================
  -- 1. CALCULAR MÉTRICAS
  -- ==========================================

  -- Receitas pagas
  SELECT COALESCE(SUM(valor), 0)
  INTO v_total_receitas
  FROM titulos_financeiros
  WHERE tipo = 'Receber'
    AND status = 'Pago'
    AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id)
    AND (p_data_inicio IS NULL OR data_emissao >= p_data_inicio)
    AND (p_data_fim IS NULL OR data_emissao <= p_data_fim);

  -- Despesas pagas
  SELECT COALESCE(SUM(valor), 0)
  INTO v_total_despesas
  FROM titulos_financeiros
  WHERE tipo = 'Pagar'
    AND status = 'Pago'
    AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id)
    AND (p_data_inicio IS NULL OR data_emissao >= p_data_inicio)
    AND (p_data_fim IS NULL OR data_emissao <= p_data_fim);

  -- A Receber
  SELECT COALESCE(SUM(valor), 0)
  INTO v_a_receber
  FROM titulos_financeiros
  WHERE tipo = 'Receber'
    AND status IN ('Previsto', 'Aprovado')
    AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

  -- A Pagar
  SELECT COALESCE(SUM(valor), 0)
  INTO v_a_pagar
  FROM titulos_financeiros
  WHERE tipo = 'Pagar'
    AND status IN ('Previsto', 'Aprovado')
    AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

  -- Vencidos
  SELECT COUNT(*)
  INTO v_vencidos
  FROM titulos_financeiros
  WHERE status IN ('Previsto', 'Aprovado')
    AND data_vencimento < CURRENT_DATE
    AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

  -- Saldo
  v_saldo := v_total_receitas - v_total_despesas;

  -- ==========================================
  -- 2. RETORNAR RESULTADO
  -- ==========================================

  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'total_receitas', v_total_receitas,
      'total_despesas', v_total_despesas,
      'saldo', v_saldo,
      'lucratividade', CASE
        WHEN v_total_receitas > 0
        THEN ROUND((v_saldo / v_total_receitas) * 100, 2)
        ELSE 0
      END,
      'a_receber', v_a_receber,
      'a_pagar', v_a_pagar,
      'titulos_vencidos', v_vencidos
    ),
    'metadata', json_build_object(
      'empresa_id', p_empresa_id,
      'data_inicio', p_data_inicio,
      'data_fim', p_data_fim,
      'gerado_em', NOW()
    )
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_resumo_financeiro: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    );
END;
$$;

COMMENT ON FUNCTION api_resumo_financeiro(uuid, date, date) IS
'Retorna resumo financeiro consolidado com receitas, despesas, saldo e lucratividade.
Pode filtrar por empresa e período.';
