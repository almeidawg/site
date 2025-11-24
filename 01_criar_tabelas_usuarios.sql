-- =============================================
-- 1. Criar tabelas de perfis de usuários
-- =============================================

-- Criar tabela usuarios_perfis
CREATE TABLE IF NOT EXISTS public.usuarios_perfis (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  sobrenome text,
  telefone text,
  cargo text,
  empresa_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_perfis_user_id ON usuarios_perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfis_empresa_id ON usuarios_perfis(empresa_id);

-- Comentário
COMMENT ON TABLE usuarios_perfis IS 'Perfis de usuários do sistema';

-- =============================================

-- Criar tabela user_profiles (alias para usuarios_perfis)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  sobrenome text,
  telefone text,
  cargo text,
  empresa_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_empresa_id ON user_profiles(empresa_id);

-- Comentário
COMMENT ON TABLE user_profiles IS 'User profiles (alternative naming)';

-- =============================================
-- Trigger para updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_usuarios_perfis_updated_at ON usuarios_perfis;
CREATE TRIGGER update_usuarios_perfis_updated_at
  BEFORE UPDATE ON usuarios_perfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
