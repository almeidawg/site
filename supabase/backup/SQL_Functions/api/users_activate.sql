-- =============================================
-- FUNÇÃO: users_activate
-- Descrição: Reativar usuário previamente desativado
-- Filosofia: SQL-First
-- Data: 2025-11-02
-- =============================================

DROP FUNCTION IF EXISTS users_activate(UUID);

CREATE OR REPLACE FUNCTION users_activate(
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

  -- Reativar usuário
  UPDATE profiles
  SET ativo = true
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'nome', v_nome,
    'email', v_email,
    'message', 'Usuário reativado com sucesso'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION users_activate IS 'Reativa usuário previamente desativado';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================

-- SELECT users_activate('user-uuid-aqui');
