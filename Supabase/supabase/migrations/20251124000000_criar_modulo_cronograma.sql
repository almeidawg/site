-- =============================================
-- MIGRATION: Criar Módulo Cronograma Completo
-- Data: 2025-11-24
-- Descrição: Cria todas as tabelas para o módulo de
--            cronograma (projetos, tarefas, equipes,
--            contratos, medições) com RLS e policies
-- =============================================

BEGIN;

-- =============================================
-- 1. TABELA DE PROJETOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL,

  -- Dados básicos
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,

  -- Datas
  data_inicio DATE NOT NULL,
  data_fim_prevista DATE NOT NULL,
  data_fim_real DATE,

  -- Status e progresso
  status VARCHAR(50) CHECK (status IN (
    'planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado'
  )) DEFAULT 'planejamento',
  progresso_percentual NUMERIC(5,2) DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100),

  -- Financeiro
  orcamento_total NUMERIC(15,2),
  custo_realizado NUMERIC(15,2) DEFAULT 0,

  -- Responsável
  responsavel_id UUID REFERENCES profiles(id),

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Índices
CREATE INDEX idx_projects_empresa_id ON projects(empresa_id);
CREATE INDEX idx_projects_obra_id ON projects(obra_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_responsavel ON projects(responsavel_id);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem projetos da própria empresa"
  ON projects FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários criam projetos na própria empresa"
  ON projects FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários editam projetos da própria empresa"
  ON projects FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

COMMENT ON TABLE projects IS 'Projetos de cronograma vinculados a obras';

-- =============================================
-- 2. TABELA DE EQUIPES (criar antes de tasks)
-- =============================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,

  -- Dados básicos
  nome TEXT NOT NULL,
  descricao TEXT,

  -- Líder da equipe
  lider_id UUID REFERENCES profiles(id),

  -- Status
  ativa BOOLEAN DEFAULT TRUE,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_empresa_id ON teams(empresa_id);
CREATE INDEX idx_teams_lider ON teams(lider_id);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem equipes da própria empresa"
  ON teams FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários criam equipes na própria empresa"
  ON teams FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários editam equipes da própria empresa"
  ON teams FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- 3. TABELA DE TAREFAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL,

  -- Dados básicos
  codigo VARCHAR(50),
  titulo TEXT NOT NULL,
  descricao TEXT,

  -- Hierarquia (WBS)
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  ordem INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,

  -- Datas
  data_inicio_prevista DATE NOT NULL,
  data_fim_prevista DATE NOT NULL,
  data_inicio_real DATE,
  data_fim_real DATE,

  -- Duração
  duracao_dias INTEGER NOT NULL,
  duracao_real_dias INTEGER,

  -- Status e progresso
  status VARCHAR(50) CHECK (status IN (
    'nao_iniciada', 'em_andamento', 'pausada', 'concluida', 'cancelada'
  )) DEFAULT 'nao_iniciada',
  progresso_percentual NUMERIC(5,2) DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100),

  -- Tipo de tarefa
  tipo VARCHAR(50) CHECK (tipo IN (
    'tarefa', 'marco', 'fase'
  )) DEFAULT 'tarefa',

  -- Caminho crítico
  eh_caminho_critico BOOLEAN DEFAULT FALSE,
  folga_dias INTEGER DEFAULT 0,

  -- Recursos
  responsavel_id UUID REFERENCES profiles(id),
  equipe_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Custos
  custo_previsto NUMERIC(15,2),
  custo_realizado NUMERIC(15,2) DEFAULT 0,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_tasks_empresa_id ON tasks(empresa_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_responsavel ON tasks(responsavel_id);
CREATE INDEX idx_tasks_equipe ON tasks(equipe_id);
CREATE INDEX idx_tasks_datas ON tasks(data_inicio_prevista, data_fim_prevista);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem tarefas da própria empresa"
  ON tasks FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários criam tarefas na própria empresa"
  ON tasks FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários editam tarefas da própria empresa"
  ON tasks FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

COMMENT ON TABLE tasks IS 'Tarefas do cronograma com suporte a WBS e dependências';

-- =============================================
-- 4. TABELA DE DEPENDÊNCIAS ENTRE TAREFAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamento
  predecessor_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  successor_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Tipo de dependência
  tipo VARCHAR(50) CHECK (tipo IN (
    'FS', 'SS', 'FF', 'SF'
  )) DEFAULT 'FS',

  -- Lag/Lead
  lag_dias INTEGER DEFAULT 0,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),

  -- Constraints
  CONSTRAINT no_self_dependency CHECK (predecessor_id != successor_id),
  UNIQUE(predecessor_id, successor_id)
);

CREATE INDEX idx_task_dependencies_predecessor ON task_dependencies(predecessor_id);
CREATE INDEX idx_task_dependencies_successor ON task_dependencies(successor_id);

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem dependências de tarefas da própria empresa"
  ON task_dependencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_dependencies.predecessor_id
      AND tasks.empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários criam dependências de tarefas da própria empresa"
  ON task_dependencies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_dependencies.predecessor_id
      AND tasks.empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

COMMENT ON TABLE task_dependencies IS 'Dependências entre tarefas (FS, SS, FF, SF)';

-- =============================================
-- 5. TABELA DE MEMBROS DE EQUIPES
-- =============================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamento
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Papel na equipe
  papel VARCHAR(100),

  -- Status
  ativo BOOLEAN DEFAULT TRUE,

  -- Metadados
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem membros de equipes da própria empresa"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários criam membros de equipes da própria empresa"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- =============================================
-- 6. TABELA DE CONTRATOS DE PROJETOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.project_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL,

  -- Dados do contrato
  numero_contrato VARCHAR(100) UNIQUE,
  cliente_id UUID REFERENCES entities(id),

  -- Valores
  valor_total NUMERIC(15,2) NOT NULL,
  valor_medido NUMERIC(15,2) DEFAULT 0,
  valor_recebido NUMERIC(15,2) DEFAULT 0,

  -- Retenções
  percentual_retencao NUMERIC(5,2) DEFAULT 0,
  valor_retido NUMERIC(15,2) DEFAULT 0,

  -- Datas
  data_assinatura DATE,
  data_inicio DATE,
  data_termino_previsto DATE,

  -- Status
  status VARCHAR(50) CHECK (status IN (
    'em_negociacao', 'assinado', 'em_andamento', 'concluido', 'cancelado'
  )) DEFAULT 'em_negociacao',

  -- Observações
  observacoes TEXT,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_contracts_empresa ON project_contracts(empresa_id);
CREATE INDEX idx_project_contracts_project ON project_contracts(project_id);
CREATE INDEX idx_project_contracts_cliente ON project_contracts(cliente_id);
CREATE INDEX idx_project_contracts_status ON project_contracts(status);

ALTER TABLE project_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem contratos da própria empresa"
  ON project_contracts FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários criam contratos na própria empresa"
  ON project_contracts FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários editam contratos da própria empresa"
  ON project_contracts FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

COMMENT ON TABLE project_contracts IS 'Contratos vinculados a projetos de cronograma';

-- =============================================
-- 7. TABELA DE MEDIÇÕES
-- =============================================

CREATE TABLE IF NOT EXISTS public.project_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES project_contracts(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL,

  -- Identificação
  numero_medicao INTEGER NOT NULL,
  periodo_referencia VARCHAR(50),

  -- Valores
  valor_medido NUMERIC(15,2) NOT NULL,
  percentual_execucao NUMERIC(5,2),

  -- Retenção
  valor_retencao NUMERIC(15,2) DEFAULT 0,
  valor_liquido NUMERIC(15,2) GENERATED ALWAYS AS (valor_medido - COALESCE(valor_retencao, 0)) STORED,

  -- Status
  status VARCHAR(50) CHECK (status IN (
    'em_elaboracao', 'enviada', 'aprovada', 'rejeitada', 'paga'
  )) DEFAULT 'em_elaboracao',

  -- Datas
  data_medicao DATE NOT NULL,
  data_aprovacao DATE,
  data_prevista_pagamento DATE,
  data_pagamento_real DATE,

  -- Referência ao título financeiro (quando criado)
  titulo_id UUID,

  -- Observações
  observacoes TEXT,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_project_measurements_empresa ON project_measurements(empresa_id);
CREATE INDEX idx_project_measurements_contract ON project_measurements(contract_id);
CREATE INDEX idx_project_measurements_status ON project_measurements(status);

ALTER TABLE project_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem medições da própria empresa"
  ON project_measurements FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários criam medições na própria empresa"
  ON project_measurements FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários editam medições da própria empresa"
  ON project_measurements FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

COMMENT ON TABLE project_measurements IS 'Medições de avanço físico-financeiro de contratos';

-- =============================================
-- 8. FUNÇÕES ÚTEIS
-- =============================================

-- Função para calcular progresso do projeto baseado nas tarefas
CREATE OR REPLACE FUNCTION calcular_progresso_projeto(p_project_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $
DECLARE
  v_progresso NUMERIC;
BEGIN
  SELECT COALESCE(AVG(progresso_percentual), 0)
  INTO v_progresso
  FROM tasks
  WHERE project_id = p_project_id
  AND parent_task_id IS NULL; -- Apenas tarefas raiz

  RETURN v_progresso;
END;
$;

-- Trigger para atualizar progresso do projeto quando tarefa muda
CREATE OR REPLACE FUNCTION atualizar_progresso_projeto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
BEGIN
  UPDATE projects
  SET progresso_percentual = calcular_progresso_projeto(NEW.project_id),
      updated_at = NOW()
  WHERE id = NEW.project_id;

  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trigger_atualizar_progresso_projeto ON tasks;
CREATE TRIGGER trigger_atualizar_progresso_projeto
  AFTER INSERT OR UPDATE OF progresso_percentual ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_progresso_projeto();

-- =============================================
-- 9. TABELAS AUXILIARES FINANCEIRO (se não existirem)
-- =============================================

-- Categorias financeiras
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')),
  plano_conta_id UUID REFERENCES plano_contas(id),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_empresa ON categorias_financeiras(empresa_id);

ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem categorias da própria empresa" ON categorias_financeiras;
CREATE POLICY "Usuários veem categorias da própria empresa"
  ON categorias_financeiras FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários criam categorias na própria empresa" ON categorias_financeiras;
CREATE POLICY "Usuários criam categorias na própria empresa"
  ON categorias_financeiras FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Contas bancárias
CREATE TABLE IF NOT EXISTS public.contas_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  tipo VARCHAR(50) CHECK (tipo IN ('corrente', 'poupanca', 'aplicacao')),
  saldo_inicial NUMERIC(15,2) DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contas_bancarias_empresa ON contas_bancarias(empresa_id);

ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem contas da própria empresa" ON contas_bancarias;
CREATE POLICY "Usuários veem contas da própria empresa"
  ON contas_bancarias FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários criam contas na própria empresa" ON contas_bancarias;
CREATE POLICY "Usuários criam contas na própria empresa"
  ON contas_bancarias FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Todas as tabelas do módulo Cronograma criadas!
-- ✅ RLS habilitado em todas
-- ✅ Policies configuradas para multi-tenancy
-- ✅ Índices otimizados
-- ✅ Triggers de progresso automático
