-- =============================================
-- MIGRATION: 001
-- Descrição: Criar tabelas base do sistema
-- Data: 2025-10-30
-- Autor: Equipe WG
-- =============================================
-- Tabelas criadas:
--   - profiles (usuários do sistema)
--   - usuarios_perfis (permissões)
--   - empresas (empresas do grupo)
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. TABELA: profiles (estende auth.users)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  telefone TEXT,
  cargo TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_ativo ON profiles(ativo);

-- Comentário
COMMENT ON TABLE profiles IS 'Perfis de usuários do sistema, estende auth.users do Supabase';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. TABELA: usuarios_perfis (permissões)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.usuarios_perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'gestor', 'vendedor', 'arquiteto', 'financeiro', 'readonly')),
  permissoes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_usuarios_perfis_user ON usuarios_perfis(user_id);
CREATE INDEX idx_usuarios_perfis_perfil ON usuarios_perfis(perfil);

-- Comentário
COMMENT ON TABLE usuarios_perfis IS 'Perfis e permissões dos usuários';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. TABELA: empresas (empresas do grupo)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  inscricao_estadual TEXT,
  tipo TEXT CHECK (tipo IN ('matriz', 'filial', 'parceiro')),
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX idx_empresas_ativo ON empresas(ativo);

-- Comentário
COMMENT ON TABLE empresas IS 'Empresas do grupo WG Almeida';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER: Atualizar updated_at automaticamente
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DADOS INICIAIS (seed)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Inserir empresa padrão
INSERT INTO empresas (razao_social, nome_fantasia, cnpj, tipo)
VALUES
  ('WG Almeida Arquitetura LTDA', 'WG Arquitetura', '00.000.000/0001-00', 'matriz')
ON CONFLICT (cnpj) DO NOTHING;
