-- =============================================
-- Migration: Corrigir estrutura do banco
-- Data: 2025-11-23
-- Descrição: Criar tabelas e views faltantes
-- =============================================

-- 1. Criar tabela usuarios_perfis
-- =============================================
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
-- 2. Criar tabela user_profiles (alias para usuarios_perfis)
-- =============================================
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
-- 3. Verificar e ajustar storage_items
-- =============================================
DO $$
BEGIN
  -- Adicionar coluna name se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'storage_items'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE storage_items ADD COLUMN name text;
  END IF;

  -- Adicionar coluna description se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'storage_items'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE storage_items ADD COLUMN description text;
  END IF;
END $$;

-- =============================================
-- 4. Criar tabela propostas (se não existir)
-- =============================================
CREATE TABLE IF NOT EXISTS public.propostas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  valor numeric(10,2),
  status text DEFAULT 'rascunho',
  cliente_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propostas_cliente_id ON propostas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);

-- Comentário
COMMENT ON TABLE propostas IS 'Propostas comerciais';

-- =============================================
-- 5. Criar view v_kanban_cards_board
-- =============================================
CREATE OR REPLACE VIEW v_kanban_cards_board AS
SELECT
  kc.id,
  kc.titulo,
  kc.descricao,
  kc.coluna_id,
  kc.ordem,
  kc.created_at,
  kc.updated_at,
  col.titulo as coluna_titulo,
  col.ordem as coluna_ordem
FROM kanban_cards kc
LEFT JOIN kanban_colunas col ON kc.coluna_id = col.id
ORDER BY col.ordem, kc.ordem;

COMMENT ON VIEW v_kanban_cards_board IS 'View combinada de cards com suas colunas';

-- =============================================
-- 6. Criar view v_clientes_ativos_contratos
-- =============================================
CREATE OR REPLACE VIEW v_clientes_ativos_contratos AS
SELECT
  e.id as cliente_id,
  e.nome_razao_social,
  e.cnpj_cpf,
  e.tipo,
  COUNT(c.id) as total_contratos,
  SUM(CASE WHEN c.status_geral = 'Em andamento' THEN 1 ELSE 0 END) as contratos_ativos,
  COALESCE(SUM(co.valor_total), 0) as valor_total_contratos
FROM entities e
LEFT JOIN contratos c ON c.empresa_id = e.id
LEFT JOIN contratos_obras co ON co.projeto_id = c.id
WHERE e.ativo = true
GROUP BY e.id, e.nome_razao_social, e.cnpj_cpf, e.tipo
ORDER BY total_contratos DESC;

COMMENT ON VIEW v_clientes_ativos_contratos IS 'View de clientes ativos com resumo de contratos';

-- =============================================
-- 7. Verificar e criar tabelas relacionadas se necessário
-- =============================================

-- Garantir que kanban_cards existe
CREATE TABLE IF NOT EXISTS public.kanban_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  coluna_id uuid,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Garantir que kanban_colunas existe
CREATE TABLE IF NOT EXISTS public.kanban_colunas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- 8. Atualizar triggers updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'updated_at'
    AND table_name IN ('usuarios_perfis', 'user_profiles', 'propostas', 'kanban_cards')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- =============================================
-- FIM DA MIGRATION
-- =============================================

-- Verificar estrutura criada
SELECT
  'Tabela' as tipo,
  table_name as nome
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('usuarios_perfis', 'user_profiles', 'propostas', 'storage_items', 'kanban_cards', 'kanban_colunas')
UNION ALL
SELECT
  'View' as tipo,
  table_name as nome
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('v_kanban_cards_board', 'v_clientes_ativos_contratos')
ORDER BY tipo, nome;
