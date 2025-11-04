-- =============================================
-- MIGRATION: 005
-- Descrição: Habilitar Row Level Security (RLS)
-- Data: 2025-10-30
-- Autor: Equipe WG
-- =============================================
-- RLS habilitado em:
--   - profiles
--   - empresas
--   - titulos_financeiros
--   - lancamentos
--   - entities
--   - kanban_cards
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. HABILITAR RLS NAS TABELAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE titulos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_colunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. POLICIES: profiles
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil = 'admin'
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. POLICIES: empresas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Todos os usuários autenticados podem ver empresas
CREATE POLICY "Authenticated users can view companies"
  ON empresas FOR SELECT
  TO authenticated
  USING (TRUE);

-- Apenas admins podem criar/editar empresas
CREATE POLICY "Admins can manage companies"
  ON empresas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil = 'admin'
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. POLICIES: titulos_financeiros
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Usuários veem títulos de empresas que têm acesso
CREATE POLICY "Users can view titles of accessible companies"
  ON titulos_financeiros FOR SELECT
  TO authenticated
  USING (
    -- Admin vê tudo
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil = 'admin'
    )
    OR
    -- Ou usuário tem acesso à empresa do título
    TRUE  -- TODO: implementar lógica de acesso por empresa
  );

-- Usuários com perfil 'financeiro' ou 'admin' podem criar/editar
CREATE POLICY "Financial users can manage titles"
  ON titulos_financeiros FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil IN ('admin', 'financeiro', 'gestor')
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. POLICIES: lancamentos
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Mesmas regras dos títulos
CREATE POLICY "Users can view lancamentos"
  ON lancamentos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil IN ('admin', 'financeiro', 'gestor')
    )
  );

CREATE POLICY "Financial users can manage lancamentos"
  ON lancamentos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil IN ('admin', 'financeiro', 'gestor')
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. POLICIES: entities
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Todos os usuários autenticados podem ver entities
CREATE POLICY "Authenticated users can view entities"
  ON entities FOR SELECT
  TO authenticated
  USING (TRUE);

-- Usuários autenticados podem criar entities
CREATE POLICY "Authenticated users can create entities"
  ON entities FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Usuários autenticados podem atualizar entities
CREATE POLICY "Authenticated users can update entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (TRUE);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. POLICIES: kanban_cards
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Todos os usuários autenticados podem ver cards
CREATE POLICY "Authenticated users can view cards"
  ON kanban_cards FOR SELECT
  TO authenticated
  USING (TRUE);

-- Responsável pode editar seus cards
CREATE POLICY "Responsible user can edit own cards"
  ON kanban_cards FOR UPDATE
  TO authenticated
  USING (responsavel_id = auth.uid());

-- Gestores e admins podem editar qualquer card
CREATE POLICY "Managers can edit any card"
  ON kanban_cards FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil IN ('admin', 'gestor')
    )
  );

-- Vendedores podem criar cards
CREATE POLICY "Sellers can create cards"
  ON kanban_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil IN ('admin', 'gestor', 'vendedor', 'arquiteto')
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. POLICIES: Boards e Colunas (leitura pública)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Todos podem ver boards
CREATE POLICY "Authenticated users can view boards"
  ON kanban_boards FOR SELECT
  TO authenticated
  USING (TRUE);

-- Todos podem ver colunas
CREATE POLICY "Authenticated users can view columns"
  ON kanban_colunas FOR SELECT
  TO authenticated
  USING (TRUE);

-- Apenas admins podem gerenciar boards/colunas
CREATE POLICY "Admins can manage boards"
  ON kanban_boards FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil = 'admin'
    )
  );

CREATE POLICY "Admins can manage columns"
  ON kanban_colunas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
      AND perfil = 'admin'
    )
  );
