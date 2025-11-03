-- =============================================
-- FUNÇÃO: users_reset_password
-- Descrição: Validar usuário para reset de senha
-- Filosofia: SQL-First
-- Data: 2025-11-02
-- =============================================

DROP FUNCTION IF EXISTS users_reset_password(TEXT);

CREATE OR REPLACE FUNCTION users_reset_password(
  p_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verificar se usuário existe
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = p_email AND ativo = true;

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado ou inativo'
    );
  END IF;

  -- NOTA: Esta função SQL apenas valida o usuário
  -- O reset real de senha DEVE ser feito via Supabase Auth:
  -- supabase.auth.resetPasswordForEmail(email)

  RETURN json_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'message', 'Usuário validado. Execute supabase.auth.resetPasswordForEmail() no frontend ou auth.admin.generateLink no backend.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION users_reset_password IS 'Valida usuário para reset de senha. Reset real via supabase.auth.resetPasswordForEmail()';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================

-- SELECT users_reset_password('usuario@empresa.com');
