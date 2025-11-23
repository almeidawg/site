-- =============================================
-- API: api_nome_da_operacao
-- Descrição: Breve descrição do que faz
-- Parâmetros:
--   p_param1 (tipo) - descrição
--   p_param2 (tipo) - descrição (opcional)
-- Retorno: json
-- HTTP: POST /rest/v1/rpc/api_nome_da_operacao
-- Criado: YYYY-MM-DD
-- Modificado: YYYY-MM-DD (se aplicável)
-- =============================================

-- Limpar versões antigas (SEMPRE!)
DROP FUNCTION IF EXISTS api_nome_da_operacao();
DROP FUNCTION IF EXISTS api_nome_da_operacao(uuid);
DROP FUNCTION IF EXISTS api_nome_da_operacao(text);
-- Adicionar mais DROP se houver outras assinaturas antigas

-- Criar função nova
CREATE OR REPLACE FUNCTION api_nome_da_operacao(
  p_param1 text,
  p_param2 text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_temp_var tipo; -- variáveis auxiliares se necessário
BEGIN
  -- ==========================================
  -- 1. VALIDAÇÃO DE ENTRADA
  -- ==========================================
  IF p_param1 IS NULL OR p_param1 = '' THEN
    RAISE EXCEPTION 'Parâmetro p_param1 é obrigatório';
  END IF;

  -- Validações adicionais
  IF NOT EXISTS (SELECT 1 FROM tabela WHERE campo = p_param1) THEN
    RAISE EXCEPTION 'Registro não encontrado';
  END IF;

  -- ==========================================
  -- 2. LÓGICA PRINCIPAL
  -- ==========================================
  SELECT json_build_object(
    'success', true,
    'data', row_to_json(t.*),
    'metadata', json_build_object(
      'timestamp', now(),
      'count', (SELECT COUNT(*) FROM tabela)
    )
  ) INTO v_result
  FROM tabela t
  WHERE t.campo = p_param1;

  -- ==========================================
  -- 3. RETORNAR RESULTADO
  -- ==========================================
  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log de erro (aparece nos logs do Supabase)
    RAISE LOG 'Erro em api_nome_da_operacao: %', SQLERRM;

    -- Retornar erro formatado
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    );
END;
$$;

-- Documentação (aparece no Dashboard)
COMMENT ON FUNCTION api_nome_da_operacao(text, text) IS
'Descrição detalhada da função e seu propósito.
Exemplo de uso:
  POST /rest/v1/rpc/api_nome_da_operacao
  Body: { "p_param1": "valor" }';

-- ==========================================
-- EXEMPLO DE CHAMADA (HTTP)
-- ==========================================
/*
fetch('https://projeto.supabase.co/rest/v1/rpc/api_nome_da_operacao', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'ANON_KEY',
    'Authorization': 'Bearer USER_TOKEN'
  },
  body: JSON.stringify({
    p_param1: 'valor1',
    p_param2: 'valor2'
  })
})
*/
