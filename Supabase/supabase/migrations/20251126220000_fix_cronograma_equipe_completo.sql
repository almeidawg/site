-- =============================================
-- Migration: Corrigir módulo Cronograma + Equipe + Sharing
-- Data: 2025-11-26
-- Objetivo: Integrar equipes com entities + adicionar compartilhamento
-- =============================================

-- Adicionar campo name em projects (compatibilidade)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS name TEXT;

-- Atualizar name com titulo se vazio
UPDATE projects SET name = titulo WHERE name IS NULL;

-- Criar tabela project_team (junction table)
CREATE TABLE IF NOT EXISTS public.project_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  papel TEXT,  -- Ex: "Eletricista", "Mestre de Obras", "Engenheiro"
  data_inicio DATE,
  data_fim DATE,
  horas_alocadas NUMERIC(10,2),
  valor_hora NUMERIC(10,2),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_project_team_project ON project_team(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_entity ON project_team(entity_id);
CREATE INDEX IF NOT EXISTS idx_project_team_ativo ON project_team(ativo);

-- Trigger updated_at
CREATE TRIGGER trg_updated_at_project_team
  BEFORE UPDATE ON project_team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela project_shares (compartilhamento público)
CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  permissao TEXT DEFAULT 'view' CHECK (permissao IN ('view', 'comment', 'edit')),
  expira_em TIMESTAMPTZ,
  criado_por UUID REFERENCES auth.users(id),
  acessos INTEGER DEFAULT 0,
  ultimo_acesso TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_shares_project ON project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_token ON project_shares(token);
CREATE INDEX IF NOT EXISTS idx_project_shares_ativo ON project_shares(ativo);

-- Trigger updated_at
CREATE TRIGGER trg_updated_at_project_shares
  BEFORE UPDATE ON project_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para adicionar membro à equipe
CREATE OR REPLACE FUNCTION add_member_to_project(
  p_project_id UUID,
  p_entity_id UUID,
  p_papel TEXT DEFAULT NULL,
  p_valor_hora NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
BEGIN
  -- Verificar se projeto existe
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Projeto não encontrado';
  END IF;

  -- Verificar se entity existe e é colaborador/fornecedor
  IF NOT EXISTS (
    SELECT 1 FROM entities
    WHERE id = p_entity_id
    AND tipo IN ('colaborador', 'fornecedor')
  ) THEN
    RAISE EXCEPTION 'Entity deve ser colaborador ou fornecedor';
  END IF;

  -- Inserir ou atualizar
  INSERT INTO project_team (project_id, entity_id, papel, valor_hora)
  VALUES (p_project_id, p_entity_id, p_papel, p_valor_hora)
  ON CONFLICT (project_id, entity_id)
  DO UPDATE SET
    papel = COALESCE(EXCLUDED.papel, project_team.papel),
    valor_hora = COALESCE(EXCLUDED.valor_hora, project_team.valor_hora),
    ativo = true,
    updated_at = now()
  RETURNING id INTO v_member_id;

  RETURN v_member_id;
END;
$$;

-- Função para remover membro da equipe
CREATE OR REPLACE FUNCTION remove_member_from_project(
  p_project_id UUID,
  p_entity_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE project_team
  SET ativo = false, updated_at = now()
  WHERE project_id = p_project_id AND entity_id = p_entity_id;

  RETURN FOUND;
END;
$$;

-- Função para criar compartilhamento
CREATE OR REPLACE FUNCTION create_project_share(
  p_project_id UUID,
  p_permissao TEXT DEFAULT 'view',
  p_expires_in_days INTEGER DEFAULT 30
)
RETURNS TABLE (token UUID, share_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token UUID;
  v_base_url TEXT := 'http://localhost:3004/cronograma/projects/'; -- Ajustar conforme necessário
BEGIN
  -- Verificar se projeto existe
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id) THEN
    RAISE EXCEPTION 'Projeto não encontrado';
  END IF;

  -- Criar share
  INSERT INTO project_shares (project_id, permissao, expira_em, criado_por)
  VALUES (
    p_project_id,
    p_permissao,
    CASE WHEN p_expires_in_days > 0
      THEN now() + (p_expires_in_days || ' days')::interval
      ELSE NULL
    END,
    auth.uid()
  )
  RETURNING project_shares.token INTO v_token;

  -- Retornar token e URL
  RETURN QUERY SELECT v_token, v_base_url || p_project_id::text || '/share/' || v_token::text;
END;
$$;

-- Criar VIEW consolidada da equipe
CREATE OR REPLACE VIEW public.v_project_team_completo AS
SELECT
  pt.id,
  pt.project_id,
  p.titulo AS project_name,
  pt.entity_id,
  e.nome AS member_name,
  e.tipo AS member_type,
  e.email AS member_email,
  e.telefone AS member_phone,
  e.avatar_url AS member_avatar,
  pt.papel,
  pt.data_inicio,
  pt.data_fim,
  pt.horas_alocadas,
  pt.valor_hora,
  pt.observacoes,
  pt.ativo,
  pt.created_at,
  pt.updated_at
FROM project_team pt
JOIN projects p ON p.id = pt.project_id
JOIN entities e ON e.id = pt.entity_id
WHERE pt.ativo = true;

-- RLS
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver equipes"
  ON project_team FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem modificar equipes"
  ON project_team FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Qualquer um pode ver shares ativos"
  ON project_shares FOR SELECT
  USING (ativo = true AND (expira_em IS NULL OR expira_em > now()));

CREATE POLICY "Usuários autenticados podem criar shares"
  ON project_shares FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE project_team IS 'Membros da equipe de projetos (colaboradores/fornecedores)';
COMMENT ON TABLE project_shares IS 'Links de compartilhamento público de projetos';
COMMENT ON VIEW v_project_team_completo IS 'VIEW consolidada de equipes com dados dos membros';
COMMENT ON FUNCTION add_member_to_project IS 'Adiciona ou atualiza membro na equipe do projeto';
COMMENT ON FUNCTION remove_member_from_project IS 'Remove (desativa) membro da equipe';
COMMENT ON FUNCTION create_project_share IS 'Cria link de compartilhamento público';
