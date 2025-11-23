-- =============================================
-- FUNÇÃO: users_invite
-- Descrição: Convidar novo usuário (criar perfil pré-configurado)
-- Filosofia: SQL-First
-- Data: 2025-11-02
-- =============================================

DROP FUNCTION IF EXISTS users_invite(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION users_invite(
  p_email TEXT,
  p_nome TEXT,
  p_perfil TEXT DEFAULT 'readonly',
  p_cargo TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Validar email
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Email inválido'
    );
  END IF;

  -- Validar perfil
  IF p_perfil NOT IN ('admin', 'gestor', 'vendedor', 'arquiteto', 'financeiro', 'readonly') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Perfil inválido. Use: admin, gestor, vendedor, arquiteto, financeiro ou readonly'
    );
  END IF;

  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário com este email já existe'
    );
  END IF;

  v_user_id := gen_random_uuid();

  -- Inserir em profiles (temporário até auth criar)
  INSERT INTO profiles (id, email, nome, cargo, ativo)
  VALUES (v_user_id, p_email, p_nome, p_cargo, false)
  RETURNING id INTO v_user_id;

  -- Inserir perfil padrão
  INSERT INTO usuarios_perfis (user_id, perfil, permissoes)
  VALUES (
    v_user_id,
    p_perfil,
    CASE
      WHEN p_perfil = 'admin' THEN '{"all": true}'::jsonb
      WHEN p_perfil = 'gestor' THEN '{"dashboard": true, "clientes": true, "financeiro": true, "obras": true}'::jsonb
      WHEN p_perfil = 'vendedor' THEN '{"dashboard": true, "clientes": true, "oportunidades": true}'::jsonb
      WHEN p_perfil = 'arquiteto' THEN '{"dashboard": true, "obras": true, "registros": true}'::jsonb
      WHEN p_perfil = 'financeiro' THEN '{"dashboard": true, "financeiro": true}'::jsonb
      ELSE '{"dashboard": true}'::jsonb
    END
  );

  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'nome', p_nome,
    'perfil', p_perfil,
    'message', 'Convite criado. IMPORTANTE: Execute auth.admin.invite_user_by_email no backend para enviar email de convite.'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION users_invite IS 'Convida novo usuário criando perfil pré-configurado. Requer envio de email via auth.admin.invite_user_by_email';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================

-- SELECT users_invite('novo.usuario@empresa.com', 'João Silva', 'vendedor', 'Vendedor Sênior');
