-- =============================================
-- Financeiro Core Tables (clientes via entities)
-- =============================================

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

-- Note: RLS/policies não incluídas aqui por simplicidade; adicionar conforme regras de multi-tenant.
