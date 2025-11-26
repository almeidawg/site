-- =============================================
-- SCRIPT ÚNICO SEGURO / IDEMPOTENTE
-- Ajusta cronograma + financeiro + contratos + coluna nome_razao_social
-- Data: 2025-11-26
-- Descrição: Script consolidado que cria todas as tabelas e ajustes necessários
--            de forma idempotente (pode ser executado múltiplas vezes)
-- =============================================

BEGIN;

-- Garantir coluna empresa_id em profiles (necessária para RLS de projetos)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

-- Se a tabela projects já existia sem a coluna empresa_id, adiciona agora
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

-- ================================
-- Tabelas base do Cronograma
-- ================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim_prevista DATE NOT NULL,
  data_fim_real DATE,
  status VARCHAR(50) CHECK (status IN ('planejamento','em_andamento','pausado','concluido','cancelado')) DEFAULT 'planejamento',
  progresso_percentual NUMERIC(5,2) DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100),
  orcamento_total NUMERIC(15,2),
  custo_realizado NUMERIC(15,2) DEFAULT 0,
  responsavel_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_projects_empresa_id ON projects(empresa_id);
CREATE INDEX IF NOT EXISTS idx_projects_obra_id ON projects(obra_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_responsavel ON projects(responsavel_id);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem projetos da própria empresa" ON projects;
CREATE POLICY "Usuários veem projetos da própria empresa"
  ON projects FOR SELECT
  USING ((SELECT empresa_id FROM profiles WHERE id = auth.uid()) = empresa_id);

DROP POLICY IF EXISTS "Usuários criam projetos na própria empresa" ON projects;
CREATE POLICY "Usuários criam projetos na própria empresa"
  ON projects FOR INSERT
  WITH CHECK ((SELECT empresa_id FROM profiles WHERE id = auth.uid()) = empresa_id);

DROP POLICY IF EXISTS "Usuários editam projetos da própria empresa" ON projects;
CREATE POLICY "Usuários editam projetos da própria empresa"
  ON projects FOR UPDATE
  USING ((SELECT empresa_id FROM profiles WHERE id = auth.uid()) = empresa_id);

COMMENT ON TABLE projects IS 'Projetos de cronograma vinculados a obras';

-- Tarefas do projeto
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  responsavel_id UUID REFERENCES profiles(id),
  prazo DATE,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);

-- Itens do projeto
CREATE TABLE IF NOT EXISTS public.project_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  catalog_item_id UUID,
  quantidade NUMERIC,
  preco_unitario NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(project_id);

-- Equipes e membros
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ajuste defensivo: se teams já existia sem empresa_id, adicionar coluna
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  papel TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ⚠️ IMPORTANTE: Ajuste de colunas faltantes em team_members
-- Isso resolve o erro "column team_id does not exist"
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS papel TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem membros de equipes da própria empresa" ON team_members;
CREATE POLICY "Usuários veem membros de equipes da própria empresa"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT t.id FROM teams t WHERE t.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Usuários criam membros de equipes da própria empresa" ON team_members;
CREATE POLICY "Usuários criam membros de equipes da própria empresa"
  ON team_members FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT t.id FROM teams t WHERE t.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Contratos do projeto
CREATE TABLE IF NOT EXISTS public.project_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  numero TEXT,
  descricao TEXT,
  valor_total NUMERIC(15,2),
  status TEXT DEFAULT 'rascunho',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comentários
CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;

-- ================================
-- Financeiro Core
-- ================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.fin_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE SET NULL,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fin_categories_empresa ON fin_categories(empresa_id);
CREATE INDEX IF NOT EXISTS idx_fin_categories_kind ON fin_categories(kind);

CREATE TABLE IF NOT EXISTS public.fin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  category_id uuid REFERENCES fin_categories(id) ON DELETE SET NULL,
  description text,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  occurred_at date NOT NULL DEFAULT current_date,
  type text NOT NULL CHECK (type IN ('income','expense')),
  status text DEFAULT 'cleared',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_cliente ON fin_transactions(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_category ON fin_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_occurred ON fin_transactions(occurred_at);

CREATE TABLE IF NOT EXISTS public.solicitacoes_pagamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  categoria_id uuid REFERENCES fin_categories(id) ON DELETE SET NULL,
  descricao text,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Aprovada','Paga','Cancelada')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_pagamento_cliente ON solicitacoes_pagamento(cliente_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_pagamento_status ON solicitacoes_pagamento(status);

CREATE TABLE IF NOT EXISTS public.comissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid REFERENCES project_contracts(id) ON DELETE CASCADE,
  responsavel_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  percentual numeric(6,2) NOT NULL DEFAULT 0,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Previsto' CHECK (status IN ('Previsto','Aprovado','Pago','Cancelado')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comissoes_contrato ON comissoes(contrato_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_responsavel ON comissoes(responsavel_id);

CREATE TABLE IF NOT EXISTS public.reembolsos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  destinatario_tipo text CHECK (destinatario_tipo IN ('empresa','colaborador')),
  categoria_id uuid REFERENCES fin_categories(id) ON DELETE SET NULL,
  descricao text,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT current_date,
  status text DEFAULT 'Pendente' CHECK (status IN ('Pendente','Aprovado','Pago','Cancelado')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reembolsos_destinatario ON reembolsos(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_categoria ON reembolsos(categoria_id);

CREATE TABLE IF NOT EXISTS public.cobrancas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  descricao text,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','EmAberto','Pago','Cancelado')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cobrancas_cliente ON cobrancas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_project ON cobrancas(project_id);

COMMIT;

-- ================================
-- Contratos: aprovação/condições e geração de cobranças
-- ================================
BEGIN;

ALTER TABLE public.project_contracts
  ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT,
  ADD COLUMN IF NOT EXISTS condicoes_pagamento JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT CHECK (forma_pagamento IN ('boleto','pix','transferencia','cartao','dinheiro')),
  ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT 1 CHECK (parcelas >= 1),
  ADD COLUMN IF NOT EXISTS cronograma_gerado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS financeiro_gerado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS conteudo_contrato TEXT;

CREATE INDEX IF NOT EXISTS idx_project_contracts_aprovado ON project_contracts(aprovado);
CREATE INDEX IF NOT EXISTS idx_project_contracts_aprovado_por ON project_contracts(aprovado_por);

COMMENT ON COLUMN project_contracts.aprovado IS 'Indica se o contrato foi aprovado';
COMMENT ON COLUMN project_contracts.condicoes_pagamento IS 'Array JSON com condições de pagamento';
COMMENT ON COLUMN project_contracts.cronograma_gerado IS 'Indica se o cronograma foi gerado automaticamente';
COMMENT ON COLUMN project_contracts.financeiro_gerado IS 'Indica se as cobranças foram geradas no financeiro';

-- ================================
-- Função: Gerar Cobranças
-- ================================

CREATE OR REPLACE FUNCTION api_gerar_cobrancas_contrato(p_contrato_id UUID)
RETURNS VOID AS $$
DECLARE
  v_contrato record;
  v_parcela jsonb;
  v_valor_parcela numeric;
  v_vencimento date;
  v_index integer := 0;
BEGIN
  SELECT * INTO v_contrato FROM project_contracts WHERE id = p_contrato_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Contrato não encontrado'; END IF;
  IF v_contrato.condicoes_pagamento IS NULL OR jsonb_array_length(v_contrato.condicoes_pagamento) = 0 THEN
    RAISE EXCEPTION 'Contrato sem condições de pagamento';
  END IF;

  FOR v_index IN 0..jsonb_array_length(v_contrato.condicoes_pagamento)-1 LOOP
    v_parcela := v_contrato.condicoes_pagamento -> v_index;
    v_valor_parcela := COALESCE((v_parcela->>'valor')::numeric,
                                v_contrato.valor_total * COALESCE((v_parcela->>'percentual')::numeric,0)/100);
    v_vencimento := COALESCE((v_parcela->>'vencimento')::date, current_date);
    INSERT INTO cobrancas (cliente_id, project_id, descricao, valor, vencimento, status, created_at)
    VALUES (v_contrato.cliente_id, v_contrato.project_id,
            COALESCE(v_parcela->>'descricao','Parcela'),
            v_valor_parcela, v_vencimento, 'Pendente', now());
  END LOOP;

  -- Marcar financeiro como gerado
  UPDATE project_contracts SET financeiro_gerado = TRUE WHERE id = p_contrato_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION api_gerar_cobrancas_contrato IS 'Gera cobranças no financeiro baseado nas condições de pagamento do contrato';

COMMIT;

-- ================================
-- Ajuste em entities
-- ================================
BEGIN;

ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS nome_razao_social text;

COMMENT ON COLUMN public.entities.nome_razao_social IS 'Nome/Razão Social da entidade (duplicado de nome para compatibilidade)';

COMMIT;

-- ================================
-- Recarregar cache do PostgREST
-- ================================
NOTIFY pgrst, 'reload schema';

-- =============================================
-- FIM DO SCRIPT
-- =============================================
-- ✅ Todas as tabelas criadas/ajustadas
-- ✅ Colunas adicionadas de forma idempotente
-- ✅ Policies criadas após ajuste de colunas
-- ✅ Função de geração de cobranças criada
-- ✅ Coluna nome_razao_social adicionada em entities
