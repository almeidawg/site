-- =============================================
-- Migration: Criar tabela de comentários em tarefas (Timeline Gantt)
-- Data: 2025-11-26
-- Descrição: Permite adicionar comentários vinculados a dias específicos
--            na timeline do Gráfico de Gantt
-- =============================================

BEGIN;

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  data_comentario DATE NOT NULL, -- Dia específico na timeline
  conteudo TEXT NOT NULL,
  tipo TEXT DEFAULT 'comentario' CHECK (tipo IN ('comentario', 'alteracao', 'alerta', 'marco')),
  anexos JSONB, -- Array de URLs de anexos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_project ON task_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_data ON task_comments(data_comentario);
CREATE INDEX IF NOT EXISTS idx_task_comments_author ON task_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_tipo ON task_comments(tipo);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_task_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS task_comments_updated_at ON task_comments;
CREATE TRIGGER task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_task_comments_updated_at();

-- RLS (Row Level Security)
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem comentários de projetos da própria empresa
DROP POLICY IF EXISTS "Usuários veem comentários de projetos da empresa" ON task_comments;
CREATE POLICY "Usuários veem comentários de projetos da empresa"
  ON task_comments FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Policy: Usuários podem criar comentários
DROP POLICY IF EXISTS "Usuários podem criar comentários" ON task_comments;
CREATE POLICY "Usuários podem criar comentários"
  ON task_comments FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    )
    AND author_id = auth.uid()
  );

-- Policy: Usuários podem editar seus próprios comentários
DROP POLICY IF EXISTS "Usuários podem editar seus comentários" ON task_comments;
CREATE POLICY "Usuários podem editar seus comentários"
  ON task_comments FOR UPDATE
  USING (author_id = auth.uid());

-- Policy: Usuários podem deletar seus próprios comentários
DROP POLICY IF EXISTS "Usuários podem deletar seus comentários" ON task_comments;
CREATE POLICY "Usuários podem deletar seus comentários"
  ON task_comments FOR DELETE
  USING (author_id = auth.uid());

-- Comentários
COMMENT ON TABLE task_comments IS 'Comentários vinculados a dias específicos na timeline do Gantt';
COMMENT ON COLUMN task_comments.data_comentario IS 'Data específica na timeline onde o comentário aparece';
COMMENT ON COLUMN task_comments.tipo IS 'Tipo: comentario (normal), alteracao (mudança), alerta (atenção), marco (milestone)';
COMMENT ON COLUMN task_comments.anexos IS 'Array JSON de URLs de anexos (imagens, documentos, etc)';

-- View para buscar comentários com detalhes do autor
CREATE OR REPLACE VIEW vw_task_comments_detailed AS
SELECT
  tc.id,
  tc.task_id,
  tc.project_id,
  tc.data_comentario,
  tc.conteudo,
  tc.tipo,
  tc.anexos,
  tc.created_at,
  tc.updated_at,
  p.id AS author_id,
  p.nome AS author_nome,
  p.email AS author_email,
  p.avatar_url AS author_avatar,
  t.titulo AS task_titulo,
  proj.titulo AS project_titulo
FROM task_comments tc
INNER JOIN profiles p ON p.id = tc.author_id
INNER JOIN tasks t ON t.id = tc.task_id
INNER JOIN projects proj ON proj.id = tc.project_id
ORDER BY tc.data_comentario DESC, tc.created_at DESC;

COMMENT ON VIEW vw_task_comments_detailed IS 'View com comentários e detalhes do autor';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Tabela task_comments criada
-- ✅ RLS policies configuradas
-- ✅ View detalhada criada
-- ✅ Trigger updated_at criado
