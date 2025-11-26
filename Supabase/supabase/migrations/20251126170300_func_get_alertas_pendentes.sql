-- =============================================
-- Função: Obter alertas pendentes do usuário
-- Data: 2025-11-26
-- Descrição: Retorna alertas de pagamento pendentes para o usuário autenticado
--            Ordenados por urgência (vencimento próximo primeiro)
-- =============================================

BEGIN;

DROP FUNCTION IF EXISTS api_get_alertas_pendentes(UUID);

CREATE OR REPLACE FUNCTION api_get_alertas_pendentes(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  alerta_id UUID,
  cobranca_id UUID,
  tipo_alerta TEXT,
  data_alerta DATE,
  data_vencimento DATE,
  cliente_nome TEXT,
  cliente_id UUID,
  valor NUMERIC,
  descricao TEXT,
  dias_para_vencimento INTEGER,
  urgencia TEXT,
  metodo_envio TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id UUID;
BEGIN
  -- Determinar empresa do usuário
  IF p_user_id IS NULL THEN
    SELECT empresa_id INTO v_empresa_id
    FROM profiles
    WHERE id = auth.uid();
  ELSE
    SELECT empresa_id INTO v_empresa_id
    FROM profiles
    WHERE id = p_user_id;
  END IF;

  RAISE NOTICE 'api_get_alertas_pendentes - Buscando alertas para empresa: %', v_empresa_id;

  RETURN QUERY
  SELECT
    a.id AS alerta_id,
    a.cobranca_id,
    a.tipo_alerta,
    a.data_alerta,
    a.data_vencimento,
    COALESCE(e.nome_razao_social, 'Cliente não informado') AS cliente_nome,
    e.id AS cliente_id,
    c.valor,
    COALESCE(c.descricao, 'Sem descrição') AS descricao,
    (c.vencimento - CURRENT_DATE)::INTEGER AS dias_para_vencimento,
    CASE
      WHEN c.vencimento < CURRENT_DATE THEN 'VENCIDO'
      WHEN c.vencimento = CURRENT_DATE THEN 'VENCE HOJE'
      WHEN c.vencimento = CURRENT_DATE + INTERVAL '1 day' THEN 'VENCE AMANHÃ'
      WHEN c.vencimento <= CURRENT_DATE + INTERVAL '5 days' THEN 'URGENTE'
      ELSE 'NORMAL'
    END AS urgencia,
    a.metodo_envio
  FROM alertas_pagamento a
  INNER JOIN cobrancas c ON c.id = a.cobranca_id
  LEFT JOIN entities e ON e.id = c.cliente_id
  LEFT JOIN projects p ON p.id = c.project_id
  WHERE a.status = 'pendente'
  AND c.status IN ('Pendente', 'EmAberto') -- Só alertas de cobranças ativas
  AND (v_empresa_id IS NULL OR p.empresa_id = v_empresa_id)
  ORDER BY
    CASE
      WHEN c.vencimento < CURRENT_DATE THEN 1        -- Vencidos primeiro
      WHEN c.vencimento = CURRENT_DATE THEN 2        -- Vence hoje
      WHEN c.vencimento = CURRENT_DATE + INTERVAL '1 day' THEN 3 -- Vence amanhã
      ELSE 4                                         -- Demais
    END,
    c.vencimento ASC,
    a.tipo_alerta ASC;
END;
$$;

COMMENT ON FUNCTION api_get_alertas_pendentes IS 'Retorna alertas de pagamento pendentes para o usuário autenticado';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Função api_get_alertas_pendentes criada
-- ✅ Retorna alertas ordenados por urgência
-- ✅ Calcula dias para vencimento automaticamente
