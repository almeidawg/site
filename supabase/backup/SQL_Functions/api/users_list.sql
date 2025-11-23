-- =============================================
-- FUNÇÃO: users_list
-- Descrição: Listar usuários do sistema com perfis
-- Filosofia: SQL-First
-- Data: 2025-11-02
-- =============================================

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

-- =============================================
-- EXEMPLO DE USO:
-- =============================================

-- SELECT * FROM users_list(true);  -- Apenas ativos
-- SELECT * FROM users_list(false); -- Todos
