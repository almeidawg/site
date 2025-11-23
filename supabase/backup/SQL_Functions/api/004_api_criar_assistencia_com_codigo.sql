-- =============================================
-- API: api_criar_assistencia_com_codigo
-- Descrição: Cria assistência com código sequencial automático
-- Parâmetros:
--   p_cliente_id (uuid) - ID do cliente
--   p_cliente_nome (text) - Nome do cliente
--   p_descricao (text) - Descrição do problema
--   p_prioridade (text) - Prioridade (opcional)
-- Retorno: json
-- HTTP: POST /rest/v1/rpc/api_criar_assistencia_com_codigo
-- Criado: 2025-10-30
-- =============================================

-- Criar sequence para código
CREATE SEQUENCE IF NOT EXISTS assistencias_codigo_seq START 1;

-- Limpar versões antigas
DROP FUNCTION IF EXISTS api_criar_assistencia_com_codigo();
DROP FUNCTION IF EXISTS api_criar_assistencia_com_codigo(uuid, text, text);
DROP FUNCTION IF EXISTS api_criar_assistencia_com_codigo(uuid, text, text, text);

-- Criar função
CREATE OR REPLACE FUNCTION api_criar_assistencia_com_codigo(
  p_cliente_id uuid,
  p_cliente_nome text,
  p_descricao text,
  p_prioridade text DEFAULT 'media'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_codigo TEXT;
  v_ano INT;
  v_numero INT;
  v_assistencia_id UUID;
BEGIN
  -- ==========================================
  -- 1. VALIDAÇÃO DE ENTRADA
  -- ==========================================
  IF p_cliente_id IS NULL THEN
    RAISE EXCEPTION 'Cliente ID é obrigatório';
  END IF;

  IF p_descricao IS NULL OR p_descricao = '' THEN
    RAISE EXCEPTION 'Descrição é obrigatória';
  END IF;

  -- Validar prioridade
  IF p_prioridade NOT IN ('baixa', 'media', 'alta', 'urgente') THEN
    RAISE EXCEPTION 'Prioridade inválida: %. Valores permitidos: baixa, media, alta, urgente', p_prioridade;
  END IF;

  -- Validar que cliente existe
  IF NOT EXISTS (SELECT 1 FROM entities WHERE id = p_cliente_id) THEN
    RAISE EXCEPTION 'Cliente não encontrado: %', p_cliente_id;
  END IF;

  -- ==========================================
  -- 2. GERAR CÓDIGO SEQUENCIAL (AST-YYYY-NNNNNN)
  -- ==========================================
  v_ano := EXTRACT(YEAR FROM NOW());
  v_numero := nextval('assistencias_codigo_seq');
  v_codigo := 'AST-' || v_ano || '-' || LPAD(v_numero::TEXT, 6, '0');

  -- ==========================================
  -- 3. CRIAR ASSISTÊNCIA
  -- ==========================================
  INSERT INTO assistencias (
    codigo,
    cliente_id,
    cliente_nome,
    descricao,
    status,
    prioridade,
    data_solicitacao,
    responsavel_id
  ) VALUES (
    v_codigo,
    p_cliente_id,
    p_cliente_nome,
    p_descricao,
    'aberta',
    p_prioridade,
    NOW(),
    auth.uid()  -- Usuário logado é o responsável
  )
  RETURNING id INTO v_assistencia_id;

  -- ==========================================
  -- 4. RETORNAR RESULTADO
  -- ==========================================
  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'id', v_assistencia_id,
      'codigo', v_codigo,
      'cliente_id', p_cliente_id,
      'cliente_nome', p_cliente_nome,
      'status', 'aberta',
      'prioridade', p_prioridade,
      'data_solicitacao', NOW()
    ),
    'message', 'Assistência criada com sucesso: ' || v_codigo
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_criar_assistencia_com_codigo: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    );
END;
$$;

COMMENT ON FUNCTION api_criar_assistencia_com_codigo(uuid, text, text, text) IS
'Cria uma nova assistência técnica com código sequencial automático (AST-YYYY-NNNNNN).
O usuário logado é definido como responsável.

Exemplo de uso:
  POST /rest/v1/rpc/api_criar_assistencia_com_codigo
  Body: {
    "p_cliente_id": "uuid-do-cliente",
    "p_cliente_nome": "João Silva",
    "p_descricao": "Problema na instalação da cozinha",
    "p_prioridade": "alta"
  }';

-- ==========================================
-- EXEMPLO DE CHAMADA (HTTP)
-- ==========================================
/*
const { data, error } = await supabase.rpc('api_criar_assistencia_com_codigo', {
  p_cliente_id: 'uuid-do-cliente',
  p_cliente_nome: 'João Silva',
  p_descricao: 'Problema na instalação da cozinha',
  p_prioridade: 'alta'
});

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Assistência criada:', data.data.codigo);
}
*/
