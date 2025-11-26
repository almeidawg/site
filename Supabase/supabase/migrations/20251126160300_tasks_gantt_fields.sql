-- =============================================
-- Migration: Adicionar campos para Gráfico de Gantt em tasks
-- Data: 2025-11-26
-- Descrição: Adiciona campos necessários para renderização de Gráfico de Gantt
--            com datas, duração, progresso, categorias e dependências
-- =============================================

BEGIN;

-- Adicionar colunas
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS data_inicio DATE,
  ADD COLUMN IF NOT EXISTS data_fim DATE,
  ADD COLUMN IF NOT EXISTS progresso_percentual NUMERIC(5,2) DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS categoria TEXT,
  ADD COLUMN IF NOT EXISTS cor_categoria VARCHAR(7), -- Hex color: #FF5733
  ADD COLUMN IF NOT EXISTS dependencias UUID[], -- Array de IDs de tarefas predecessoras
  ADD COLUMN IF NOT EXISTS ordem_exibicao INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimativa_horas NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS horas_trabalhadas NUMERIC(8,2) DEFAULT 0;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_data_inicio ON tasks(data_inicio);
CREATE INDEX IF NOT EXISTS idx_tasks_data_fim ON tasks(data_fim);
CREATE INDEX IF NOT EXISTS idx_tasks_categoria ON tasks(categoria);
CREATE INDEX IF NOT EXISTS idx_tasks_ordem ON tasks(ordem_exibicao);

-- Comentários
COMMENT ON COLUMN tasks.data_inicio IS 'Data de início da tarefa (para Gantt)';
COMMENT ON COLUMN tasks.data_fim IS 'Data de término da tarefa (para Gantt)';
COMMENT ON COLUMN tasks.progresso_percentual IS 'Progresso da tarefa em % (0-100)';
COMMENT ON COLUMN tasks.categoria IS 'Categoria da tarefa para agrupamento no Gantt (ex: Fundação, Estrutura)';
COMMENT ON COLUMN tasks.cor_categoria IS 'Cor da categoria no gráfico de Gantt (hex)';
COMMENT ON COLUMN tasks.dependencias IS 'Array de UUIDs de tarefas que devem ser concluídas antes desta';
COMMENT ON COLUMN tasks.ordem_exibicao IS 'Ordem de exibição no Gantt (menor = primeiro)';
COMMENT ON COLUMN tasks.estimativa_horas IS 'Estimativa de horas para completar a tarefa';
COMMENT ON COLUMN tasks.horas_trabalhadas IS 'Horas já trabalhadas na tarefa';

-- Função para calcular duração automaticamente
CREATE OR REPLACE FUNCTION calculate_task_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.data_inicio IS NOT NULL AND NEW.data_fim IS NOT NULL THEN
    -- Calcular duração em dias
    NEW.duracao_dias := (NEW.data_fim - NEW.data_inicio);

    -- Validar que data_fim >= data_inicio
    IF NEW.data_fim < NEW.data_inicio THEN
      RAISE EXCEPTION 'Data de término não pode ser anterior à data de início';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular duração
DROP TRIGGER IF EXISTS tasks_calculate_duration ON tasks;
CREATE TRIGGER tasks_calculate_duration
  BEFORE INSERT OR UPDATE OF data_inicio, data_fim ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_task_duration();

-- Popular categorias padrão para tarefas existentes
UPDATE tasks
SET categoria = 'Geral'
WHERE categoria IS NULL;

-- Cores padrão por categoria (exemplo)
CREATE TABLE IF NOT EXISTS public.categorias_tarefa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor VARCHAR(7) NOT NULL, -- Hex color
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir categorias padrão com cores
INSERT INTO categorias_tarefa (nome, cor, descricao, ordem) VALUES
  ('Planejamento', '#3B82F6', 'Fase de planejamento e preparação', 1),
  ('Fundação', '#8B5CF6', 'Trabalhos de fundação e estrutura', 2),
  ('Alvenaria', '#EF4444', 'Construção de paredes e estruturas', 3),
  ('Instalações', '#F59E0B', 'Instalações elétricas e hidráulicas', 4),
  ('Acabamento', '#10B981', 'Acabamentos finais', 5),
  ('Entrega', '#06B6D4', 'Entrega e finalização', 6),
  ('Geral', '#6B7280', 'Tarefas gerais', 99)
ON CONFLICT (nome) DO NOTHING;

COMMENT ON TABLE categorias_tarefa IS 'Categorias de tarefas para organização no Gantt';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Campos Gantt adicionados em tasks
-- ✅ Trigger de cálculo de duração criado
-- ✅ Tabela categorias_tarefa criada
-- ✅ Categorias padrão populadas
