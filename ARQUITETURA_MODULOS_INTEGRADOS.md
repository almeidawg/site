# 🏗️ Arquitetura - Integração Módulos Finance e Cronograma

**Projeto**: WGEasy CRM
**Data**: 2025-11-24
**Versão**: 1.0
**Status**: Documento de Arquitetura

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Modelo de Dados (Database)](#modelo-de-dados-database)
4. [Componentes React](#componentes-react)
5. [Rotas e Navegação](#rotas-e-navegação)
6. [Integração entre Módulos](#integração-entre-módulos)
7. [TypeScript Types](#typescript-types)
8. [Guia de Migração](#guia-de-migração)

---

## 🎯 Visão Geral

### Objetivo

Integrar os módulos **Financeiro** (05finance/) e **Cronograma** (06cronograma/), atualmente isolados, na aplicação principal **wg-crm/**, criando um sistema unificado e coeso.

### Princípios de Design

1. **Modularidade**: Cada módulo mantém sua independência funcional
2. **Reutilização**: Compartilhar componentes comuns (AuthContext, SupabaseClient)
3. **Multi-tenancy**: Isolamento via `empresa_id` em todas as tabelas
4. **RLS (Row Level Security)**: Segurança no nível de banco de dados
5. **Integração Natural**: Finance ↔ Cronograma ↔ Obras conectados

### Fluxo de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                      WGEasy CRM (wg-crm/)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   OBRAS      │  │  CRONOGRAMA  │  │  FINANCEIRO  │     │
│  │              │  │              │  │              │     │
│  │ - Cadastro   │  │ - Projetos   │  │ - Lançamentos│     │
│  │ - Contratos  │  │ - Tarefas    │  │ - Títulos    │     │
│  │ - Etapas     │  │ - Gantt      │  │ - Cobrança   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┴─────────────────┘              │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │   SUPABASE DB   │                       │
│                  │                 │                       │
│                  │ - RLS ativo     │                       │
│                  │ - Multi-tenant  │                       │
│                  │ - FKs           │                       │
│                  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

### Estrutura Completa Integrada

```
wg-crm/
├── src/
│   ├── components/
│   │   ├── ui/                      ← Componentes Shadcn/UI reutilizáveis
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── select.jsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                  ← Layouts da aplicação
│   │   │   ├── CrmLayout.jsx        ← Layout principal (sidebar + header)
│   │   │   └── PublicLayout.jsx     ← Layout público
│   │   │
│   │   ├── auth/                    ← Autenticação
│   │   │   ├── LoginForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── obras/                   ← Módulo Obras (já existe)
│   │   │   ├── ObrasTable.jsx
│   │   │   ├── ObraForm.jsx
│   │   │   ├── ContratoForm.jsx
│   │   │   └── EtapasList.jsx
│   │   │
│   │   ├── financeiro/              ← 🆕 MÓDULO FINANCEIRO INTEGRADO
│   │   │   ├── index.js             ← Barrel export
│   │   │   │
│   │   │   ├── Dashboard/           ← Dashboard Financeiro
│   │   │   │   ├── DashboardFinanceiro.jsx
│   │   │   │   ├── CartoesResumo.jsx
│   │   │   │   ├── GraficoFluxoCaixa.jsx
│   │   │   │   └── GraficoDRE.jsx
│   │   │   │
│   │   │   ├── Lancamentos/         ← Lançamentos
│   │   │   │   ├── LancamentosList.jsx
│   │   │   │   ├── LancamentoForm.jsx
│   │   │   │   └── LancamentoModal.jsx
│   │   │   │
│   │   │   ├── Titulos/             ← Títulos a Pagar/Receber
│   │   │   │   ├── TitulosList.jsx
│   │   │   │   ├── TituloForm.jsx
│   │   │   │   └── TituloDetalhes.jsx
│   │   │   │
│   │   │   ├── Cobrancas/           ← Gestão de Cobranças
│   │   │   │   ├── CobrancasList.jsx
│   │   │   │   ├── GerarCobranca.jsx
│   │   │   │   └── HistoricoCobrancas.jsx
│   │   │   │
│   │   │   ├── Relatorios/          ← Relatórios
│   │   │   │   ├── RelatorioFluxoCaixa.jsx
│   │   │   │   ├── RelatorioDRE.jsx
│   │   │   │   └── RelatorioBalanco.jsx
│   │   │   │
│   │   │   └── shared/              ← Componentes compartilhados
│   │   │       ├── FiltroPeriodo.jsx
│   │   │       ├── SeletorCentroCusto.jsx
│   │   │       └── StatusBadge.jsx
│   │   │
│   │   ├── cronograma/              ← 🆕 MÓDULO CRONOGRAMA INTEGRADO
│   │   │   ├── index.js             ← Barrel export
│   │   │   │
│   │   │   ├── Projetos/            ← Gestão de Projetos
│   │   │   │   ├── ProjetosList.jsx
│   │   │   │   ├── ProjetoForm.jsx
│   │   │   │   └── ProjetoDetalhes.jsx
│   │   │   │
│   │   │   ├── Tarefas/             ← Gestão de Tarefas
│   │   │   │   ├── TarefasList.jsx
│   │   │   │   ├── TarefaForm.jsx
│   │   │   │   ├── TarefaCard.jsx
│   │   │   │   └── DependenciasPicker.jsx
│   │   │   │
│   │   │   ├── Gantt/               ← Visualização Gantt
│   │   │   │   ├── GanttChart.jsx
│   │   │   │   ├── GanttTimeline.jsx
│   │   │   │   ├── GanttTask.jsx
│   │   │   │   └── GanttDependency.jsx
│   │   │   │
│   │   │   ├── Equipes/             ← Gestão de Equipes
│   │   │   │   ├── EquipesList.jsx
│   │   │   │   ├── EquipeForm.jsx
│   │   │   │   └── AlocacaoRecursos.jsx
│   │   │   │
│   │   │   ├── Contratos/           ← Contratos de Projetos
│   │   │   │   ├── ContratosList.jsx
│   │   │   │   ├── ContratoForm.jsx
│   │   │   │   └── ContratoFinanceiro.jsx
│   │   │   │
│   │   │   └── shared/              ← Componentes compartilhados
│   │   │       ├── StatusProjeto.jsx
│   │   │       ├── ProgressBar.jsx
│   │   │       └── CalendarioPicker.jsx
│   │   │
│   │   └── shared/                  ← Componentes globais compartilhados
│   │       ├── Sidebar.jsx
│   │       ├── Header.jsx
│   │       └── LoadingSpinner.jsx
│   │
│   ├── pages/                       ← Páginas principais
│   │   ├── public/
│   │   │   ├── Login.jsx
│   │   │   └── Home.jsx
│   │   │
│   │   ├── obras/
│   │   │   ├── Obras.jsx
│   │   │   └── ObraDetalhes.jsx
│   │   │
│   │   ├── financeiro/              ← 🆕 PÁGINAS FINANCEIRO
│   │   │   ├── FinanceiroDashboard.jsx
│   │   │   ├── Lancamentos.jsx
│   │   │   ├── Titulos.jsx
│   │   │   ├── Cobrancas.jsx
│   │   │   └── Relatorios.jsx
│   │   │
│   │   └── cronograma/              ← 🆕 PÁGINAS CRONOGRAMA
│   │       ├── CronogramaDashboard.jsx
│   │       ├── Projetos.jsx
│   │       ├── Tarefas.jsx
│   │       ├── Gantt.jsx
│   │       ├── Equipes.jsx
│   │       └── Contratos.jsx
│   │
│   ├── hooks/                       ← Custom Hooks
│   │   ├── useAuth.js               ← Autenticação (já existe)
│   │   │
│   │   ├── financeiro/              ← 🆕 HOOKS FINANCEIRO
│   │   │   ├── useLancamentos.js
│   │   │   ├── useTitulos.js
│   │   │   ├── useCobrancas.js
│   │   │   ├── usePlanoContas.js
│   │   │   └── useCentrosCusto.js
│   │   │
│   │   └── cronograma/              ← 🆕 HOOKS CRONOGRAMA
│   │       ├── useProjetos.js
│   │       ├── useTarefas.js
│   │       ├── useEquipes.js
│   │       ├── useContratos.js
│   │       └── useGantt.js
│   │
│   ├── services/                    ← Serviços/API
│   │   ├── supabase.js              ← Cliente Supabase (já existe)
│   │   │
│   │   ├── financeiro/              ← 🆕 SERVICES FINANCEIRO
│   │   │   ├── lancamentosService.js
│   │   │   ├── titulosService.js
│   │   │   ├── cobrancasService.js
│   │   │   └── relatoriosService.js
│   │   │
│   │   └── cronograma/              ← 🆕 SERVICES CRONOGRAMA
│   │       ├── projetosService.js
│   │       ├── tarefasService.js
│   │       ├── equipesService.js
│   │       └── contratosService.js
│   │
│   ├── contexts/                    ← Contexts
│   │   ├── AuthContext.jsx          ← Autenticação (já existe)
│   │   ├── FinancialContext.jsx     ← Financeiro (já existe)
│   │   │
│   │   └── CronogramaContext.jsx    ← 🆕 CONTEXT CRONOGRAMA
│   │
│   ├── types/                       ← 🆕 TypeScript Types
│   │   ├── financeiro.ts
│   │   ├── cronograma.ts
│   │   └── shared.ts
│   │
│   ├── lib/                         ← Utilitários
│   │   ├── utils.js
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   ├── App.jsx                      ← App principal
│   ├── main.jsx                     ← Entry point
│   └── routes.jsx                   ← Configuração de rotas
│
├── public/
├── package.json
├── vite.config.js
└── vercel.json
```

### Explicação da Estrutura

**Componentes por Módulo**:
- Cada módulo (financeiro/, cronograma/) tem estrutura própria com subpastas por feature
- Componentes compartilhados ficam em shared/ de cada módulo
- Componentes globais em components/shared/

**Pages vs Components**:
- **Pages**: Containers de rotas, fazem fetch de dados, gerenciam estado global
- **Components**: Apresentacionais, recebem props, reutilizáveis

**Hooks**:
- Organizados por módulo
- Encapsulam lógica de fetch/mutation do Supabase
- Reutilizáveis entre componentes

**Services**:
- Camada de abstração sobre Supabase
- Funções puras que retornam promessas
- Facilitam testes e manutenção

---

## 🗄️ Modelo de Dados (Database)

### Tabelas Existentes (já criadas)

```sql
-- Tabela de usuários/perfis
profiles (id, email, full_name, role, empresa_id, created_at)

-- Tabela de entidades (clientes, prospects, fornecedores)
entities (id, type, name, cpf_cnpj, empresa_id, created_at)

-- Tabela de obras
obras (id, cliente_id, titulo, descricao, status, empresa_id, created_at)

-- Tabela de títulos financeiros (já existe!)
titulos_financeiros (id, tipo, descricao, valor, vencimento, status, empresa_id, created_at)

-- Tabela de lançamentos (já existe!)
lancamentos (id, tipo, descricao, valor, data, categoria_id, empresa_id, created_at)

-- Tabela de plano de contas (já existe!)
plano_contas (id, codigo, nome, tipo, empresa_id, created_at)

-- Tabela de centros de custo (já existe!)
centros_custo (id, codigo, nome, empresa_id, created_at)
```

### Novas Tabelas - Módulo Cronograma

```sql
-- =============================================
-- MIGRATION: Criar tabelas do módulo Cronograma
-- Data: 2025-11-24
-- =============================================

BEGIN;

-- 1. Tabela de Projetos
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

-- Comentários
COMMENT ON TABLE projects IS 'Projetos de cronograma vinculados a obras';
COMMENT ON COLUMN projects.progresso_percentual IS 'Calculado com base no progresso das tarefas';


-- 2. Tabela de Tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL,

  -- Dados básicos
  codigo VARCHAR(50),
  titulo TEXT NOT NULL,
  descricao TEXT,

  -- Hierarquia (WBS - Work Breakdown Structure)
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
  equipe_id UUID, -- Será FK para teams quando criar tabela

  -- Custos
  custo_previsto NUMERIC(15,2),
  custo_realizado NUMERIC(15,2) DEFAULT 0,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Índices
CREATE INDEX idx_tasks_empresa_id ON tasks(empresa_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_responsavel ON tasks(responsavel_id);
CREATE INDEX idx_tasks_datas ON tasks(data_inicio_prevista, data_fim_prevista);

-- RLS
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

-- Comentários
COMMENT ON TABLE tasks IS 'Tarefas do cronograma com suporte a WBS e dependências';


-- 3. Tabela de Dependências entre Tarefas
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamento
  predecessor_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  successor_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Tipo de dependência
  tipo VARCHAR(50) CHECK (tipo IN (
    'FS', -- Finish-to-Start (padrão)
    'SS', -- Start-to-Start
    'FF', -- Finish-to-Finish
    'SF'  -- Start-to-Finish
  )) DEFAULT 'FS',

  -- Lag/Lead (antecipação ou atraso em dias)
  lag_dias INTEGER DEFAULT 0,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),

  -- Constraint: uma tarefa não pode depender dela mesma
  CONSTRAINT no_self_dependency CHECK (predecessor_id != successor_id),

  -- Constraint: combinação única
  UNIQUE(predecessor_id, successor_id)
);

-- Índices
CREATE INDEX idx_task_dependencies_predecessor ON task_dependencies(predecessor_id);
CREATE INDEX idx_task_dependencies_successor ON task_dependencies(successor_id);

-- RLS
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

-- Comentários
COMMENT ON TABLE task_dependencies IS 'Dependências entre tarefas (FS, SS, FF, SF)';


-- 4. Tabela de Equipes
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

-- Índices
CREATE INDEX idx_teams_empresa_id ON teams(empresa_id);
CREATE INDEX idx_teams_lider ON teams(lider_id);

-- RLS
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


-- 5. Tabela de Membros de Equipes
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamento
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Papel na equipe
  papel VARCHAR(100), -- Ex: "Engenheiro", "Pedreiro", "Arquiteto"

  -- Status
  ativo BOOLEAN DEFAULT TRUE,

  -- Metadados
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: membro único por equipe
  UNIQUE(team_id, user_id)
);

-- Índices
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- RLS
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


-- 6. FK tasks.equipe_id → teams.id (agora que teams existe)
ALTER TABLE tasks
  ADD CONSTRAINT tasks_equipe_id_fkey
  FOREIGN KEY (equipe_id) REFERENCES teams(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_equipe ON tasks(equipe_id);


-- 7. Tabela de Contratos de Projetos (Cronograma Financeiro)
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

-- Índices
CREATE INDEX idx_project_contracts_empresa ON project_contracts(empresa_id);
CREATE INDEX idx_project_contracts_project ON project_contracts(project_id);
CREATE INDEX idx_project_contracts_cliente ON project_contracts(cliente_id);
CREATE INDEX idx_project_contracts_status ON project_contracts(status);

-- RLS
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

-- Comentários
COMMENT ON TABLE project_contracts IS 'Contratos vinculados a projetos de cronograma';


-- 8. Tabela de Medições (vincula cronograma físico com financeiro)
CREATE TABLE IF NOT EXISTS public.project_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES project_contracts(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL,

  -- Identificação
  numero_medicao INTEGER NOT NULL,
  periodo_referencia VARCHAR(50), -- Ex: "Setembro/2025"

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

  -- Observações
  observacoes TEXT,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Índices
CREATE INDEX idx_project_measurements_empresa ON project_measurements(empresa_id);
CREATE INDEX idx_project_measurements_contract ON project_measurements(contract_id);
CREATE INDEX idx_project_measurements_status ON project_measurements(status);

-- RLS
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

-- Comentários
COMMENT ON TABLE project_measurements IS 'Medições de avanço físico-financeiro de contratos';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
```

### Tabelas Auxiliares - Módulo Financeiro (completar se necessário)

```sql
-- Caso precise de tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')),
  plano_conta_id UUID REFERENCES plano_contas(id),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caso precise de contas bancárias
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
```

---

## ⚛️ Componentes React

### Exemplo: Dashboard Financeiro

```jsx
// wg-crm/src/pages/financeiro/FinanceiroDashboard.jsx

import React from 'react';
import { CartoesResumo, GraficoFluxoCaixa, GraficoDRE } from '@/components/financeiro/Dashboard';
import { useLancamentos } from '@/hooks/financeiro/useLancamentos';
import { useTitulos } from '@/hooks/financeiro/useTitulos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FinanceiroDashboard() {
  const { lancamentos, loading: loadingLancamentos } = useLancamentos();
  const { titulos, loading: loadingTitulos } = useTitulos();

  const isLoading = loadingLancamentos || loadingTitulos;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Visão geral das finanças</p>
        </div>
      </div>

      {/* Cartões de Resumo */}
      <CartoesResumo lancamentos={lancamentos} titulos={titulos} loading={isLoading} />

      {/* Gráficos */}
      <Tabs defaultValue="fluxo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
        </TabsList>

        <TabsContent value="fluxo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa - Últimos 12 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <GraficoFluxoCaixa lancamentos={lancamentos} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dre" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DRE - Demonstrativo de Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <GraficoDRE lancamentos={lancamentos} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Exemplo: Gantt Chart

```jsx
// wg-crm/src/components/cronograma/Gantt/GanttChart.jsx

import React, { useMemo } from 'react';
import { GanttTimeline } from './GanttTimeline';
import { GanttTask } from './GanttTask';
import { GanttDependency } from './GanttDependency';
import { useTarefas } from '@/hooks/cronograma/useTarefas';

export function GanttChart({ projectId }) {
  const { tarefas, dependencias, loading } = useTarefas(projectId);

  // Calcular escala de tempo
  const { startDate, endDate, days } = useMemo(() => {
    if (!tarefas || tarefas.length === 0) return { startDate: new Date(), endDate: new Date(), days: [] };

    const start = new Date(Math.min(...tarefas.map(t => new Date(t.data_inicio_prevista))));
    const end = new Date(Math.max(...tarefas.map(t => new Date(t.data_fim_prevista))));

    const daysList = [];
    const current = new Date(start);
    while (current <= end) {
      daysList.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { startDate: start, endDate: end, days: daysList };
  }, [tarefas]);

  if (loading) return <div>Carregando cronograma...</div>;

  return (
    <div className="gantt-chart">
      {/* Timeline (cabeçalho com datas) */}
      <GanttTimeline startDate={startDate} endDate={endDate} days={days} />

      {/* Tasks (barras do Gantt) */}
      <div className="gantt-tasks">
        {tarefas.map(tarefa => (
          <GanttTask
            key={tarefa.id}
            tarefa={tarefa}
            startDate={startDate}
            days={days}
          />
        ))}
      </div>

      {/* Dependencies (setas de ligação) */}
      <svg className="gantt-dependencies">
        {dependencias.map(dep => (
          <GanttDependency
            key={dep.id}
            dependency={dep}
            tarefas={tarefas}
            startDate={startDate}
            days={days}
          />
        ))}
      </svg>
    </div>
  );
}
```

---

## 🗺️ Rotas e Navegação

### Configuração de Rotas

```jsx
// wg-crm/src/routes.jsx

import { createBrowserRouter } from 'react-router-dom';
import CrmLayout from '@/components/layout/CrmLayout';
import PublicLayout from '@/components/layout/PublicLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public Pages
import Login from '@/pages/public/Login';
import Home from '@/pages/public/Home';

// Obras Pages
import Obras from '@/pages/obras/Obras';
import ObraDetalhes from '@/pages/obras/ObraDetalhes';

// Financeiro Pages
import FinanceiroDashboard from '@/pages/financeiro/FinanceiroDashboard';
import Lancamentos from '@/pages/financeiro/Lancamentos';
import Titulos from '@/pages/financeiro/Titulos';
import Cobrancas from '@/pages/financeiro/Cobrancas';
import Relatorios from '@/pages/financeiro/Relatorios';

// Cronograma Pages
import CronogramaDashboard from '@/pages/cronograma/CronogramaDashboard';
import Projetos from '@/pages/cronograma/Projetos';
import Tarefas from '@/pages/cronograma/Tarefas';
import Gantt from '@/pages/cronograma/Gantt';
import Equipes from '@/pages/cronograma/Equipes';
import Contratos from '@/pages/cronograma/Contratos';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> }
    ]
  },
  {
    element: <ProtectedRoute><CrmLayout /></ProtectedRoute>,
    children: [
      // Obras
      { path: '/obras', element: <Obras /> },
      { path: '/obras/:id', element: <ObraDetalhes /> },

      // Financeiro
      { path: '/financeiro', element: <FinanceiroDashboard /> },
      { path: '/financeiro/lancamentos', element: <Lancamentos /> },
      { path: '/financeiro/titulos', element: <Titulos /> },
      { path: '/financeiro/cobrancas', element: <Cobrancas /> },
      { path: '/financeiro/relatorios', element: <Relatorios /> },

      // Cronograma
      { path: '/cronograma', element: <CronogramaDashboard /> },
      { path: '/cronograma/projetos', element: <Projetos /> },
      { path: '/cronograma/projetos/:id/tarefas', element: <Tarefas /> },
      { path: '/cronograma/projetos/:id/gantt', element: <Gantt /> },
      { path: '/cronograma/equipes', element: <Equipes /> },
      { path: '/cronograma/contratos', element: <Contratos /> }
    ]
  }
]);

export default router;
```

### Integração na Sidebar

```jsx
// wg-crm/src/components/shared/Sidebar.jsx

import { Link, useLocation } from 'react-router-dom';
import {
  Home, Building2, DollarSign, Calendar,
  FileText, Users, Settings
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Obras', path: '/obras' },

  // 🆕 FINANCEIRO
  {
    icon: DollarSign,
    label: 'Financeiro',
    path: '/financeiro',
    submenu: [
      { label: 'Dashboard', path: '/financeiro' },
      { label: 'Lançamentos', path: '/financeiro/lancamentos' },
      { label: 'Títulos', path: '/financeiro/titulos' },
      { label: 'Cobranças', path: '/financeiro/cobrancas' },
      { label: 'Relatórios', path: '/financeiro/relatorios' }
    ]
  },

  // 🆕 CRONOGRAMA
  {
    icon: Calendar,
    label: 'Cronograma',
    path: '/cronograma',
    submenu: [
      { label: 'Dashboard', path: '/cronograma' },
      { label: 'Projetos', path: '/cronograma/projetos' },
      { label: 'Equipes', path: '/cronograma/equipes' },
      { label: 'Contratos', path: '/cronograma/contratos' }
    ]
  },

  { icon: FileText, label: 'Propostas', path: '/propostas' },
  { icon: Users, label: 'Entidades', path: '/entidades' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent ${
                location.pathname.startsWith(item.path) ? 'bg-accent' : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>

            {/* Submenu */}
            {item.submenu && location.pathname.startsWith(item.path) && (
              <div className="ml-8 mt-1 space-y-1">
                {item.submenu.map((subitem) => (
                  <Link
                    key={subitem.path}
                    to={subitem.path}
                    className={`block px-4 py-1.5 text-sm rounded hover:bg-accent ${
                      location.pathname === subitem.path ? 'bg-accent font-medium' : ''
                    }`}
                  >
                    {subitem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

---

## 🔗 Integração entre Módulos

### Fluxo de Integração: Obra → Projeto → Cronograma → Financeiro

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUXO DE INTEGRAÇÃO                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. OBRA                                                    │
│     │                                                       │
│     ├─ Cadastro de obra (cliente, descrição, valor)        │
│     │                                                       │
│     ▼                                                       │
│  2. PROJETO (Cronograma)                                    │
│     │                                                       │
│     ├─ Criar projeto vinculado à obra                       │
│     ├─ Definir tarefas, dependências, equipes              │
│     ├─ Gerar cronograma Gantt                               │
│     │                                                       │
│     ▼                                                       │
│  3. CONTRATO (Cronograma Financeiro)                        │
│     │                                                       │
│     ├─ Criar contrato vinculado ao projeto                  │
│     ├─ Definir valor total, retenções                       │
│     ├─ Programar parcelas/medições                          │
│     │                                                       │
│     ▼                                                       │
│  4. MEDIÇÕES                                                │
│     │                                                       │
│     ├─ Registrar avanço físico (% execução)                 │
│     ├─ Calcular valor a receber                             │
│     ├─ Aplicar retenções                                    │
│     │                                                       │
│     ▼                                                       │
│  5. FINANCEIRO                                              │
│     │                                                       │
│     ├─ Criar título a receber da medição                    │
│     ├─ Lançar no fluxo de caixa                             │
│     ├─ Gerar cobrança/boleto                                │
│     ├─ Baixar pagamento quando recebido                     │
│     │                                                       │
│     ▼                                                       │
│  6. RELATÓRIOS INTEGRADOS                                   │
│     │                                                       │
│     ├─ Dashboard: Obra vs Previsto vs Realizado            │
│     ├─ Análise de rentabilidade por obra                    │
│     └─ Curva S (físico vs financeiro)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Exemplo de Integração: Criar Título a Receber de uma Medição

```jsx
// wg-crm/src/services/cronograma/medicoesService.js

import { supabase } from '@/services/supabase';
import { titulosService } from '@/services/financeiro/titulosService';

export const medicoesService = {
  async aprovarMedicao(medicaoId) {
    // 1. Buscar medição
    const { data: medicao } = await supabase
      .from('project_measurements')
      .select(`
        *,
        contract:project_contracts(
          numero_contrato,
          cliente_id,
          project:projects(titulo)
        )
      `)
      .eq('id', medicaoId)
      .maybeSingle();

    if (!medicao) throw new Error('Medição não encontrada');

    // 2. Aprovar medição
    await supabase
      .from('project_measurements')
      .update({
        status: 'aprovada',
        data_aprovacao: new Date().toISOString()
      })
      .eq('id', medicaoId);

    // 3. Criar título a receber no financeiro
    const tituloData = {
      tipo: 'receber',
      descricao: `Medição ${medicao.numero_medicao} - ${medicao.contract.project.titulo}`,
      valor: medicao.valor_liquido,
      vencimento: medicao.data_prevista_pagamento,
      status: 'aberto',
      entity_id: medicao.contract.cliente_id,
      // Referência à medição
      metadata: {
        medicao_id: medicao.id,
        contrato_id: medicao.contract_id,
        numero_medicao: medicao.numero_medicao
      }
    };

    const titulo = await titulosService.create(tituloData);

    return { medicao, titulo };
  },

  async vincularPagamento(medicaoId, tituloId) {
    // Atualizar medição com ID do título
    await supabase
      .from('project_measurements')
      .update({
        titulo_id: tituloId,
        status: 'paga',
        data_pagamento_real: new Date().toISOString()
      })
      .eq('id', medicaoId);
  }
};
```

### Hooks para Dados Integrados

```jsx
// wg-crm/src/hooks/cronograma/useProjeto.js

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';

export function useProjeto(projectId) {
  const [projeto, setProjeto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    async function fetchProjeto() {
      setLoading(true);

      // Buscar projeto com dados relacionados
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          obra:obras(id, titulo, cliente_id),
          responsavel:profiles(id, full_name),
          tarefas:tasks(count),
          contratos:project_contracts(
            id,
            numero_contrato,
            valor_total,
            valor_medido,
            status
          )
        `)
        .eq('id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar projeto:', error);
      } else {
        setProjeto(data);
      }

      setLoading(false);
    }

    fetchProjeto();
  }, [projectId]);

  return { projeto, loading };
}
```

---

## 📘 TypeScript Types

Criar arquivo de types centralizado:

```typescript
// wg-crm/src/types/cronograma.ts

export interface Project {
  id: string;
  obra_id: string;
  empresa_id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim_prevista: string;
  data_fim_real?: string;
  status: 'planejamento' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
  progresso_percentual: number;
  orcamento_total?: number;
  custo_realizado: number;
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Task {
  id: string;
  project_id: string;
  empresa_id: string;
  codigo?: string;
  titulo: string;
  descricao?: string;
  parent_task_id?: string;
  ordem: number;
  nivel: number;
  data_inicio_prevista: string;
  data_fim_prevista: string;
  data_inicio_real?: string;
  data_fim_real?: string;
  duracao_dias: number;
  duracao_real_dias?: number;
  status: 'nao_iniciada' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';
  progresso_percentual: number;
  tipo: 'tarefa' | 'marco' | 'fase';
  eh_caminho_critico: boolean;
  folga_dias: number;
  responsavel_id?: string;
  equipe_id?: string;
  custo_previsto?: number;
  custo_realizado: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TaskDependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  tipo: 'FS' | 'SS' | 'FF' | 'SF';
  lag_dias: number;
  created_at: string;
  created_by?: string;
}

export interface Team {
  id: string;
  empresa_id: string;
  nome: string;
  descricao?: string;
  lider_id?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  papel?: string;
  ativo: boolean;
  added_at: string;
}

export interface ProjectContract {
  id: string;
  project_id: string;
  empresa_id: string;
  numero_contrato?: string;
  cliente_id?: string;
  valor_total: number;
  valor_medido: number;
  valor_recebido: number;
  percentual_retencao: number;
  valor_retido: number;
  data_assinatura?: string;
  data_inicio?: string;
  data_termino_previsto?: string;
  status: 'em_negociacao' | 'assinado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMeasurement {
  id: string;
  contract_id: string;
  empresa_id: string;
  numero_medicao: number;
  periodo_referencia?: string;
  valor_medido: number;
  percentual_execucao?: number;
  valor_retencao: number;
  valor_liquido: number; // computed
  status: 'em_elaboracao' | 'enviada' | 'aprovada' | 'rejeitada' | 'paga';
  data_medicao: string;
  data_aprovacao?: string;
  data_prevista_pagamento?: string;
  data_pagamento_real?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}
```

```typescript
// wg-crm/src/types/financeiro.ts

export interface Lancamento {
  id: string;
  empresa_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria_id?: string;
  centro_custo_id?: string;
  conta_bancaria_id?: string;
  plano_conta_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Titulo {
  id: string;
  empresa_id: string;
  tipo: 'receber' | 'pagar';
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'aberto' | 'pago' | 'atrasado' | 'cancelado';
  entity_id?: string;
  parcela?: number;
  total_parcelas?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlanoContas {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ativo' | 'passivo';
  nivel: number;
  parent_id?: string;
  ativo: boolean;
  created_at: string;
}

export interface CentroCusto {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}
```

---

## 📦 Guia de Migração

### Passo a Passo para Integração

#### FASE 1: Preparação do Banco de Dados

```bash
# 1. Criar migration no Supabase
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\Supabase"

# 2. Copiar SQL da seção "Modelo de Dados" para novo arquivo
# Nome: supabase/migrations/20251124_criar_modulo_cronograma.sql

# 3. Aplicar migration localmente (testar primeiro!)
supabase db reset

# 4. Se OK, aplicar no LIVE
# Via Dashboard: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new
# Ou via CLI: supabase db push
```

#### FASE 2: Migrar Código do Módulo Finance

```bash
# 1. Copiar componentes de 05finance/ para wg-crm/
cp -r "05finance/src/pages" "wg-crm/src/pages/financeiro"
cp -r "05finance/src/components" "wg-crm/src/components/financeiro"

# 2. Ajustar imports
# - Trocar "../components/ui" por "@/components/ui"
# - Trocar "../hooks" por "@/hooks/financeiro"
# - Trocar "../services" por "@/services/financeiro"

# 3. Criar hooks em wg-crm/src/hooks/financeiro/
# - useLancamentos.js
# - useTitulos.js
# - useCobrancas.js
# - etc

# 4. Criar services em wg-crm/src/services/financeiro/
# - lancamentosService.js
# - titulosService.js
# - etc
```

#### FASE 3: Migrar Código do Módulo Cronograma

```bash
# 1. Copiar componentes de 06cronograma/ para wg-crm/
cp -r "06cronograma/src/pages" "wg-crm/src/pages/cronograma"
cp -r "06cronograma/src/components" "wg-crm/src/components/cronograma"

# 2. Ajustar imports (mesma lógica)

# 3. Criar hooks em wg-crm/src/hooks/cronograma/

# 4. Criar services em wg-crm/src/services/cronograma/
```

#### FASE 4: Configurar Rotas e Navegação

```jsx
// 1. Atualizar wg-crm/src/routes.jsx
// Adicionar rotas de /financeiro/* e /cronograma/*

// 2. Atualizar wg-crm/src/components/shared/Sidebar.jsx
// Adicionar menu items de Financeiro e Cronograma
```

#### FASE 5: Testes de Integração

```bash
# 1. Iniciar dev server
cd wg-crm
npm run dev

# 2. Testar fluxos:
# - Criar obra
# - Criar projeto vinculado à obra
# - Criar tarefas no projeto
# - Visualizar Gantt
# - Criar contrato
# - Criar medição
# - Aprovar medição (deve criar título no financeiro)
# - Verificar título na aba Financeiro > Títulos
```

#### FASE 6: Deploy

```bash
# 1. Commit tudo
git add .
git commit -m "feat: Integra módulos Finance e Cronograma"
git push origin main

# 2. Deploy migrations no Supabase LIVE
# Via Dashboard ou CLI

# 3. Deploy frontend no Vercel
# Automático via Git push, ou manual
```

---

## ✅ Checklist Final de Integração

### Banco de Dados
- [ ] Migration `20251124_criar_modulo_cronograma.sql` criada
- [ ] Migration testada localmente (supabase db reset)
- [ ] Migration aplicada no LIVE
- [ ] RLS ativo em todas as novas tabelas
- [ ] Policies testadas (usuários só veem dados da própria empresa)

### Frontend - Financeiro
- [ ] Componentes copiados de 05finance/ para wg-crm/
- [ ] Imports ajustados (@/...)
- [ ] Hooks criados em hooks/financeiro/
- [ ] Services criados em services/financeiro/
- [ ] Páginas criadas em pages/financeiro/
- [ ] Rotas configuradas (/financeiro/*)
- [ ] Menu adicionado na Sidebar

### Frontend - Cronograma
- [ ] Componentes copiados de 06cronograma/ para wg-crm/
- [ ] Imports ajustados
- [ ] Hooks criados em hooks/cronograma/
- [ ] Services criados em services/cronograma/
- [ ] Páginas criadas em pages/cronograma/
- [ ] Rotas configuradas (/cronograma/*)
- [ ] Menu adicionado na Sidebar

### Integração
- [ ] Fluxo Obra → Projeto testado
- [ ] Fluxo Projeto → Contrato testado
- [ ] Fluxo Medição → Título testado
- [ ] Dashboard integrado mostrando dados de todos módulos
- [ ] Relatórios cruzados funcionando

### Deploy
- [ ] Código commitado no Git
- [ ] Migrations aplicadas no LIVE
- [ ] Frontend deployado no Vercel
- [ ] Testes em produção OK

---

## 🎉 Conclusão

Este documento fornece a arquitetura completa para integração dos módulos **Financeiro** e **Cronograma** no **WGEasy CRM**.

**Principais Benefícios da Integração:**

1. ✅ **Sistema Unificado**: Uma única aplicação ao invés de 3 separadas
2. ✅ **Autenticação Compartilhada**: Login único para todos módulos
3. ✅ **Integração Natural**: Obras → Projetos → Cronograma → Financeiro fluem naturalmente
4. ✅ **Multi-tenancy Completo**: Isolamento por empresa_id em TODAS as tabelas
5. ✅ **Manutenção Facilitada**: Código organizado, componentes reutilizáveis
6. ✅ **Escalabilidade**: Estrutura pronta para novos módulos

**Próximos Passos:**

1. Revisar este documento com a equipe
2. Validar modelo de dados (DDL)
3. Iniciar migração seguindo o Guia de Migração
4. Testar cada fase antes de avançar
5. Deploy gradual (módulo por módulo se preferir)

---

**Criado por**: Claude Code
**Data**: 2025-11-24
**Versão**: 1.0
**Projeto**: WGEasy CRM - Integração Finance + Cronograma
