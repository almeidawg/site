-- =============================================
-- MIGRATION: 054
-- Descrição: Cria/Completa tabelas usadas por financeiramente e catálogo
-- Data: 2025-11-27
-- =============================================

-- Cobrancas
CREATE TABLE IF NOT EXISTS public.cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  descricao TEXT,
  valor NUMERIC(15,2) NOT NULL DEFAULT 0,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','EmAberto','Pago','Cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cobrancas_cliente ON cobrancas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_project ON cobrancas(project_id);

-- Comissões
CREATE TABLE IF NOT EXISTS public.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  percentual NUMERIC(6,2) NOT NULL DEFAULT 0,
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Previsto' CHECK (status IN ('Previsto','Aprovado','Pago','Cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comissoes_contrato ON comissoes(contrato_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_responsavel ON comissoes(responsavel_id);

-- Reembolsos
CREATE TABLE IF NOT EXISTS public.reembolsos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  destinatario_tipo TEXT CHECK (destinatario_tipo IN ('empresa','colaborador')),
  categoria_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  descricao TEXT,
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente','Aprovado','Pago','Cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reembolsos_destinatario ON reembolsos(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_categoria ON reembolsos(categoria_id);

-- Obra com nome
ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS nome TEXT,
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES entities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_obras_nome ON obras(nome);

-- Categorias de custo (alias)
CREATE TABLE IF NOT EXISTS public.categorias_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  centro_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias_custo(nome);

-- Transações (alias simplificado)
CREATE TABLE IF NOT EXISTS public.transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  tipo TEXT CHECK (tipo IN ('income','expense')) NOT NULL,
  data_ocorrencia DATE NOT NULL DEFAULT CURRENT_DATE,
  categorias_custo_id UUID REFERENCES centros_custo(id),
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categorias_custo_id);

-- Relations extras
ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS nome_razao_social TEXT;

COMMENT ON TABLE public.catalog_items IS 'Catálogo de itens usado pelo Price List';
COMMENT ON TABLE public.cobrancas IS 'Cobranças vinculadas a projetos e contratos';
COMMENT ON TABLE public.comissoes IS 'Comissões sobre contratos';
COMMENT ON TABLE public.reembolsos IS 'Reembolsos registrados';
COMMENT ON TABLE public.transacoes IS 'Lançamentos financeiros simplificados';
