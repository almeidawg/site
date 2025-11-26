-- =============================================
-- Aplicar tabelas faltantes das migrations
-- Data: 2025-11-26
-- =============================================

-- Da migration 20251126210000: cobrancas
CREATE TABLE IF NOT EXISTS public.cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Vencido', 'Cancelado')),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cobrancas_cliente ON cobrancas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_obra ON cobrancas(obra_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_vencimento ON cobrancas(vencimento);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON cobrancas(status);

-- Trigger updated_at
CREATE TRIGGER IF NOT EXISTS trg_updated_at_cobrancas
  BEFORE UPDATE ON cobrancas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Da migration 20251126210000: solicitacoes_pagamento
CREATE TABLE IF NOT EXISTS public.solicitacoes_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_id UUID REFERENCES auth.users(id),
  obra_id UUID REFERENCES obras(id),
  descricao TEXT NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  categoria_id UUID REFERENCES categorias_financeiras(id),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'paga')),
  justificativa TEXT,
  anexos JSONB,
  aprovador_id UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMPTZ,
  data_pagamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_obra ON solicitacoes_pagamento(obra_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_pagamento(status);

-- Trigger updated_at
CREATE TRIGGER IF NOT EXISTS trg_updated_at_solicitacoes
  BEFORE UPDATE ON solicitacoes_pagamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Da migration 20251126210000: reembolsos
CREATE TABLE IF NOT EXISTS public.reembolsos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES entities(id),
  obra_id UUID REFERENCES obras(id),
  descricao TEXT NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  data_despesa DATE NOT NULL,
  categoria_id UUID REFERENCES categorias_financeiras(id),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'reembolsado')),
  comprovantes JSONB,
  aprovador_id UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMPTZ,
  data_reembolso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reembolsos_colaborador ON reembolsos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_obra ON reembolsos(obra_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_status ON reembolsos(status);

-- Trigger updated_at
CREATE TRIGGER IF NOT EXISTS trg_updated_at_reembolsos
  BEFORE UPDATE ON reembolsos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Da migration 20251126220000: project_team
CREATE TABLE IF NOT EXISTS public.project_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  papel TEXT,
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
CREATE TRIGGER IF NOT EXISTS trg_updated_at_project_team
  BEFORE UPDATE ON project_team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Da migration 20251126220000: project_shares
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
CREATE TRIGGER IF NOT EXISTS trg_updated_at_project_shares
  BEFORE UPDATE ON project_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ver cobrancas"
  ON cobrancas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ver solicitações"
  ON solicitacoes_pagamento FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ver reembolsos"
  ON reembolsos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ver equipes"
  ON project_team FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem modificar equipes"
  ON project_team FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Qualquer um pode ver shares ativos"
  ON project_shares FOR SELECT
  USING (ativo = true AND (expira_em IS NULL OR expira_em > now()));

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem criar shares"
  ON project_shares FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE cobrancas IS 'Cobranças e faturas do sistema';
COMMENT ON TABLE solicitacoes_pagamento IS 'Solicitações de pagamento de obras';
COMMENT ON TABLE reembolsos IS 'Solicitações de reembolso de colaboradores';
COMMENT ON TABLE project_team IS 'Membros da equipe de projetos (colaboradores/fornecedores)';
COMMENT ON TABLE project_shares IS 'Links de compartilhamento público de projetos';
