-- =============================================
-- Migration: Corrigir módulo Financeiro completo
-- Data: 2025-11-26
-- Objetivo: Criar tabelas e VIEWs faltantes do módulo financeiro
-- =============================================

-- Criar tabela cobrancas
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
CREATE TRIGGER trg_updated_at_cobrancas
  BEFORE UPDATE ON cobrancas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar VIEW categorias_custo apontando para centros_custo
CREATE OR REPLACE VIEW public.categorias_custo AS
SELECT
  id,
  nome AS name,
  descricao AS description,
  tipo AS type,
  created_at,
  updated_at
FROM public.centros_custo;

-- Criar tabela categorias_financeiras (se não existir via centros_custo)
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  tipo TEXT CHECK (tipo IN ('receita', 'despesa', 'ambos')),
  pai_id UUID REFERENCES categorias_financeiras(id),
  nivel INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar VIEW fin_categories apontando para categorias_financeiras
CREATE OR REPLACE VIEW public.fin_categories AS
SELECT * FROM public.categorias_financeiras;

-- Seed data de categorias financeiras básicas
INSERT INTO categorias_financeiras (nome, tipo, nivel) VALUES
  ('Receitas Operacionais', 'receita', 1),
  ('Vendas de Projetos', 'receita', 2),
  ('Vendas de Produtos', 'receita', 2),
  ('Serviços Prestados', 'receita', 2),
  ('Despesas Operacionais', 'despesa', 1),
  ('Salários e Encargos', 'despesa', 2),
  ('Material de Construção', 'despesa', 2),
  ('Transporte e Logística', 'despesa', 2),
  ('Ferramentas e Equipamentos', 'despesa', 2),
  ('Despesas Administrativas', 'despesa', 1),
  ('Aluguel', 'despesa', 2),
  ('Energia e Água', 'despesa', 2),
  ('Telefone e Internet', 'despesa', 2)
ON CONFLICT (nome) DO NOTHING;

-- Criar tabela solicitacoes_pagamento
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
CREATE TRIGGER trg_updated_at_solicitacoes
  BEFORE UPDATE ON solicitacoes_pagamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela reembolsos
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
CREATE TRIGGER trg_updated_at_reembolsos
  BEFORE UPDATE ON reembolsos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela plano_contas (chart of accounts)
CREATE TABLE IF NOT EXISTS public.plano_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('ativo', 'passivo', 'receita', 'despesa', 'patrimonio')),
  pai_id UUID REFERENCES plano_contas(id),
  nivel INTEGER DEFAULT 1,
  natureza TEXT CHECK (natureza IN ('devedora', 'credora')),
  aceita_lancamento BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data de plano de contas básico
INSERT INTO plano_contas (codigo, nome, tipo, nivel, natureza, aceita_lancamento) VALUES
  ('1', 'ATIVO', 'ativo', 1, 'devedora', false),
  ('1.1', 'Ativo Circulante', 'ativo', 2, 'devedora', false),
  ('1.1.1', 'Caixa e Bancos', 'ativo', 3, 'devedora', true),
  ('1.1.2', 'Contas a Receber', 'ativo', 3, 'devedora', true),
  ('2', 'PASSIVO', 'passivo', 1, 'credora', false),
  ('2.1', 'Passivo Circulante', 'passivo', 2, 'credora', false),
  ('2.1.1', 'Fornecedores a Pagar', 'passivo', 3, 'credora', true),
  ('2.1.2', 'Salários a Pagar', 'passivo', 3, 'credora', true),
  ('3', 'RECEITAS', 'receita', 1, 'credora', false),
  ('3.1', 'Receitas Operacionais', 'receita', 2, 'credora', true),
  ('4', 'DESPESAS', 'despesa', 1, 'devedora', false),
  ('4.1', 'Despesas Operacionais', 'despesa', 2, 'devedora', true)
ON CONFLICT (codigo) DO NOTHING;

-- RLS
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_contas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver cobrancas"
  ON cobrancas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver solicitações"
  ON solicitacoes_pagamento FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver reembolsos"
  ON reembolsos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver plano de contas"
  ON plano_contas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE cobrancas IS 'Cobranças e faturas do sistema';
COMMENT ON TABLE solicitacoes_pagamento IS 'Solicitações de pagamento de obras';
COMMENT ON TABLE reembolsos IS 'Solicitações de reembolso de colaboradores';
COMMENT ON TABLE plano_contas IS 'Plano de contas contábil';
COMMENT ON VIEW categorias_custo IS 'VIEW de compatibilidade: expõe centros_custo como categorias_custo';
COMMENT ON VIEW fin_categories IS 'VIEW de compatibilidade: expõe categorias_financeiras';
