-- =============================================
-- FUNÇÃO: users_role_toggle
-- Descrição: Alterar perfil/role do usuário
-- Filosofia: SQL-First
-- Data: 2025-11-02
-- =============================================

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

-- =============================================
-- EXEMPLO DE USO:
-- =============================================

-- SELECT users_role_toggle('user-uuid-aqui', 'admin');
