-- =============================================
-- API: api_atualizar_status_assistencia
-- Descrição: Atualiza status de assistência com validações
-- Parâmetros:
--   p_assistencia_id (uuid) - ID da assistência
--   p_novo_status (text) - Novo status
--   p_observacao (text) - Observação (opcional)
-- Retorno: json
-- HTTP: POST /rest/v1/rpc/api_atualizar_status_assistencia
-- Criado: 2025-10-30
-- =============================================

DROP FUNCTION IF EXISTS api_atualizar_status_assistencia();
DROP FUNCTION IF EXISTS api_atualizar_status_assistencia(uuid, text);
DROP FUNCTION IF EXISTS api_atualizar_status_assistencia(uuid, text, text);

CREATE OR REPLACE FUNCTION api_atualizar_status_assistencia(
  p_assistencia_id uuid,
  p_novo_status text,
  p_observacao text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_status_anterior text;
  v_codigo text;
BEGIN
  -- ==========================================
  -- 1. VALIDAÇÃO
  -- ==========================================

  IF p_assistencia_id IS NULL THEN
    RAISE EXCEPTION 'Assistência ID é obrigatório';
  END IF;

  IF p_novo_status NOT IN ('aberta', 'agendado', 'em_atendimento', 'atendido', 'em_atraso') THEN
    RAISE EXCEPTION 'Status inválido: %. Permitidos: aberta, agendado, em_atendimento, atendido, em_atraso', p_novo_status;
  END IF;

  -- Buscar assistência e validar
  SELECT status, codigo
  INTO v_status_anterior, v_codigo
  FROM assistencias
  WHERE id = p_assistencia_id;

  IF v_status_anterior IS NULL THEN
    RAISE EXCEPTION 'Assistência não encontrada: %', p_assistencia_id;
  END IF;

  -- ==========================================
  -- 2. ATUALIZAR STATUS
  -- ==========================================

  UPDATE assistencias
  SET
    status = p_novo_status,
    observacoes = CASE
      WHEN p_observacao IS NOT NULL
      THEN COALESCE(observacoes, '') || E'\n[' || NOW() || '] ' || p_observacao
      ELSE observacoes
    END,
    data_conclusao = CASE
      WHEN p_novo_status = 'atendido'
      THEN NOW()
      ELSE data_conclusao
    END,
    updated_at = NOW()
  WHERE id = p_assistencia_id;

  -- ==========================================
  -- 3. RETORNAR RESULTADO
  -- ==========================================

  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'id', p_assistencia_id,
      'codigo', v_codigo,
      'status_anterior', v_status_anterior,
      'status_novo', p_novo_status,
      'observacao_adicionada', p_observacao IS NOT NULL
    ),
    'message', 'Status atualizado: ' || v_status_anterior || ' → ' || p_novo_status
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_atualizar_status_assistencia: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    );
END;
$$;

COMMENT ON FUNCTION api_atualizar_status_assistencia(uuid, text, text) IS
'Atualiza status de assistência com validações e log de observações.
Quando marcada como "atendido", registra data_conclusao automaticamente.';
