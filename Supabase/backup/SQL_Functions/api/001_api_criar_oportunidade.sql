-- =============================================
-- API: api_criar_oportunidade
-- Descrição: Cria uma nova oportunidade no pipeline
-- Parâmetros:
--   p_titulo (text) - Título da oportunidade
--   p_entity_id (uuid) - ID do cliente/lead
--   p_valor (numeric) - Valor estimado (opcional)
--   p_descricao (text) - Descrição (opcional)
-- Retorno: json
-- HTTP: POST /rest/v1/rpc/api_criar_oportunidade
-- Criado: 2025-10-30
-- =============================================

-- Limpar versões antigas (SEMPRE!)
DROP FUNCTION IF EXISTS api_criar_oportunidade();
DROP FUNCTION IF EXISTS api_criar_oportunidade(text, uuid);
DROP FUNCTION IF EXISTS api_criar_oportunidade(text, uuid, numeric);
DROP FUNCTION IF EXISTS api_criar_oportunidade(text, uuid, numeric, text);

-- Criar função nova
CREATE OR REPLACE FUNCTION api_criar_oportunidade(
  p_titulo text,
  p_entity_id uuid,
  p_valor numeric DEFAULT NULL,
  p_descricao text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_card_id uuid;
  v_coluna_id uuid;
  v_board_id uuid;
BEGIN
  -- ==========================================
  -- 1. VALIDAÇÃO DE ENTRADA
  -- ==========================================
  IF p_titulo IS NULL OR p_titulo = '' THEN
    RAISE EXCEPTION 'Título é obrigatório';
  END IF;

  IF p_entity_id IS NULL THEN
    RAISE EXCEPTION 'Entity ID é obrigatório';
  END IF;

  -- Validar que entity existe
  IF NOT EXISTS (SELECT 1 FROM entities WHERE id = p_entity_id) THEN
    RAISE EXCEPTION 'Entity não encontrada: %', p_entity_id;
  END IF;

  -- ==========================================
  -- 2. BUSCAR BOARD E PRIMEIRA COLUNA
  -- ==========================================

  -- Buscar board de oportunidades
  SELECT id INTO v_board_id
  FROM kanban_boards
  WHERE ambiente = 'oportunidades';

  IF v_board_id IS NULL THEN
    RAISE EXCEPTION 'Board de oportunidades não encontrado';
  END IF;

  -- Buscar primeira coluna (Lead)
  SELECT id INTO v_coluna_id
  FROM kanban_colunas
  WHERE board_id = v_board_id
  ORDER BY posicao ASC
  LIMIT 1;

  IF v_coluna_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma coluna encontrada no board';
  END IF;

  -- ==========================================
  -- 3. CRIAR CARD
  -- ==========================================

  INSERT INTO kanban_cards (
    coluna_id,
    titulo,
    descricao,
    valor,
    entity_id,
    responsavel_id,
    posicao
  ) VALUES (
    v_coluna_id,
    p_titulo,
    p_descricao,
    p_valor,
    p_entity_id,
    auth.uid(),  -- Usuário logado é o responsável
    COALESCE((
      SELECT MAX(posicao) + 1
      FROM kanban_cards
      WHERE coluna_id = v_coluna_id
    ), 0)
  )
  RETURNING id INTO v_card_id;

  -- ==========================================
  -- 4. RETORNAR RESULTADO
  -- ==========================================

  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'id', v_card_id,
      'titulo', p_titulo,
      'entity_id', p_entity_id,
      'valor', p_valor,
      'coluna_id', v_coluna_id,
      'responsavel_id', auth.uid()
    ),
    'message', 'Oportunidade criada com sucesso'
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log de erro (aparece nos logs do Supabase)
    RAISE LOG 'Erro em api_criar_oportunidade: %', SQLERRM;

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
COMMENT ON FUNCTION api_criar_oportunidade(text, uuid, numeric, text) IS
'Cria uma nova oportunidade no pipeline de vendas.
A oportunidade é criada na primeira coluna (Lead) e o usuário logado é definido como responsável.

Exemplo de uso:
  POST /rest/v1/rpc/api_criar_oportunidade
  Body: {
    "p_titulo": "Projeto Residencial Silva",
    "p_entity_id": "uuid-do-cliente",
    "p_valor": 150000.00,
    "p_descricao": "Casa de 200m² em condomínio"
  }';

-- ==========================================
-- EXEMPLO DE CHAMADA (HTTP)
-- ==========================================
/*
const { data, error } = await supabase.rpc('api_criar_oportunidade', {
  p_titulo: 'Projeto Residencial Silva',
  p_entity_id: 'uuid-do-cliente',
  p_valor: 150000.00,
  p_descricao: 'Casa de 200m² em condomínio'
});

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Oportunidade criada:', data);
}
*/
