-- =============================================
-- MIGRATION: 014
-- Descrição: Funções SQL para gestão de usuários
-- Data: 2025-11-02
-- Autor: Supabase MCP Expert
-- =============================================
-- Filosofia SQL-First: 90% do backend em SQL!
-- =============================================
-- Funções criadas:
--   1. users_invite() - Convidar novo usuário
--   2. users_reset_password() - Reset de senha
--   3. users_role_toggle() - Alternar perfil/role
--   4. users_list() - Listar usuários ativos
--   5. users_deactivate() - Desativar usuário
-- =============================================


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. FUNÇÃO: users_invite (Convidar Usuário)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

  -- Criar registro temporário em profiles (será ligado ao auth.users quando usuário aceitar)
  -- NOTA: Na prática, você precisaria usar auth.admin.invite_user_by_email via Edge Function
  -- Esta função SQL cria apenas o perfil e permissões pré-configuradas

  v_user_id := gen_random_uuid();

  -- Inserir em profiles (temporário até auth criar)
  INSERT INTO profiles (id, email, nome, cargo, ativo)
  VALUES (v_user_id, p_email, p_nome, p_cargo, false) -- inativo até aceitar convite
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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. FUNÇÃO: users_reset_password (Reset de Senha)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. FUNÇÃO: users_role_toggle (Alterar Role/Perfil)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP FUNCTION IF EXISTS users_role_toggle(UUID, TEXT);

CREATE OR REPLACE FUNCTION users_role_toggle(
  p_user_id UUID,
  p_novo_perfil TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_perfil_antigo TEXT;
  v_permissoes JSONB;
BEGIN
  -- Validar novo perfil
  IF p_novo_perfil NOT IN ('admin', 'gestor', 'vendedor', 'arquiteto', 'financeiro', 'readonly') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Perfil inválido'
    );
  END IF;

  -- Buscar perfil atual
  SELECT perfil INTO v_perfil_antigo
  FROM usuarios_perfis
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_perfil_antigo IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;

  -- Definir novas permissões baseadas no perfil
  v_permissoes := CASE
    WHEN p_novo_perfil = 'admin' THEN '{"all": true}'::jsonb
    WHEN p_novo_perfil = 'gestor' THEN '{"dashboard": true, "clientes": true, "financeiro": true, "obras": true}'::jsonb
    WHEN p_novo_perfil = 'vendedor' THEN '{"dashboard": true, "clientes": true, "oportunidades": true}'::jsonb
    WHEN p_novo_perfil = 'arquiteto' THEN '{"dashboard": true, "obras": true, "registros": true}'::jsonb
    WHEN p_novo_perfil = 'financeiro' THEN '{"dashboard": true, "financeiro": true}'::jsonb
    ELSE '{"dashboard": true}'::jsonb
  END;

  -- Atualizar perfil
  UPDATE usuarios_perfis
  SET
    perfil = p_novo_perfil,
    permissoes = v_permissoes
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'perfil_antigo', v_perfil_antigo,
    'perfil_novo', p_novo_perfil,
    'permissoes', v_permissoes,
    'message', 'Perfil atualizado com sucesso'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION users_role_toggle IS 'Altera perfil/role do usuário e atualiza permissões automaticamente';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. FUNÇÃO: users_list (Listar Usuários)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP FUNCTION IF EXISTS users_list(BOOLEAN);

CREATE OR REPLACE FUNCTION users_list(
  p_apenas_ativos BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  email TEXT,
  cargo TEXT,
  perfil TEXT,
  permissoes JSONB,
  ativo BOOLEAN,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nome,
    p.email,
    p.cargo,
    up.perfil,
    up.permissoes,
    p.ativo,
    p.avatar_url,
    p.created_at
  FROM profiles p
  LEFT JOIN usuarios_perfis up ON up.user_id = p.id
  WHERE (p_apenas_ativos = false OR p.ativo = true)
  ORDER BY p.nome;
END;
$$;

COMMENT ON FUNCTION users_list IS 'Lista usuários do sistema com perfis e permissões';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. FUNÇÃO: users_deactivate (Desativar Usuário)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. FUNÇÃO: users_activate (Reativar Usuário)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION 014
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
