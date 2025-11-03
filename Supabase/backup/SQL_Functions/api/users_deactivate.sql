-- =============================================
-- FUNÇÃO: users_deactivate
-- Descrição: Desativar usuário (soft delete)
-- Filosofia: SQL-First
-- Data: 2025-11-02
-- =============================================

DROP FUNCTION IF EXISTS users_deactivate(UUID);

CREATE OR REPLACE FUNCTION users_deactivate(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nome TEXT;
  v_email TEXT;
BEGIN
  -- Buscar dados do usuário
  SELECT nome, email INTO v_nome, v_email
  FROM profiles
  WHERE id = p_user_id;

  IF v_nome IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;

  -- Desativar usuário
  UPDATE profiles
  SET ativo = false
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'nome', v_nome,
    'email', v_email,
    'message', 'Usuário desativado com sucesso'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION users_deactivate IS 'Desativa usuário (soft delete)';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================

-- SELECT users_deactivate('user-uuid-aqui');
