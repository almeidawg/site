-- =============================================
-- MIGRATION: 002
-- Descrição: Criar tabelas do módulo financeiro
-- Data: 2025-10-30
-- Autor: Equipe WG
-- =============================================
-- Tabelas criadas:
--   - plano_contas (plano de contas contábil)
--   - centros_custo (centros de custo)
--   - contas_financeiras (contas bancárias)
--   - titulos_financeiros (títulos a pagar/receber)
--   - lancamentos (lançamentos financeiros)
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. TABELA: plano_contas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.plano_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo TEXT NOT NULL CHECK (grupo IN ('Receitas', 'Despesas')),
  conta TEXT NOT NULL,
  codigo TEXT UNIQUE,
  tipo TEXT,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_plano_contas_grupo ON plano_contas(grupo);
CREATE INDEX idx_plano_contas_ativo ON plano_contas(ativo);

-- Comentário
COMMENT ON TABLE plano_contas IS 'Plano de contas contábil';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. TABELA: centros_custo
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.centros_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_centros_custo_ativo ON centros_custo(ativo);

-- Comentário
COMMENT ON TABLE centros_custo IS 'Centros de custo para controle gerencial';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. TABELA: contas_financeiras
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.contas_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  banco TEXT NOT NULL,
  agencia TEXT,
  conta TEXT,
  tipo TEXT CHECK (tipo IN ('corrente', 'poupanca', 'investimento')),
  saldo_inicial NUMERIC(15, 2) DEFAULT 0,
  saldo_atual NUMERIC(15, 2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_contas_financeiras_empresa ON contas_financeiras(empresa_id);

-- Trigger
CREATE TRIGGER contas_financeiras_updated_at
  BEFORE UPDATE ON contas_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE contas_financeiras IS 'Contas bancárias das empresas';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. TABELA: titulos_financeiros
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.titulos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Pagar', 'Receber')),
  descricao TEXT NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  status TEXT CHECK (status IN ('Previsto', 'Aprovado', 'Pago', 'Cancelado', 'Vencido')),
  categoria_id UUID REFERENCES plano_contas(id) ON DELETE SET NULL,
  centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  conta_financeira_id UUID REFERENCES contas_financeiras(id) ON DELETE SET NULL,
  observacao TEXT,
  documento TEXT,
  fornecedor_cliente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_titulos_empresa ON titulos_financeiros(empresa_id);
CREATE INDEX idx_titulos_tipo ON titulos_financeiros(tipo);
CREATE INDEX idx_titulos_status ON titulos_financeiros(status);
CREATE INDEX idx_titulos_vencimento ON titulos_financeiros(data_vencimento);
CREATE INDEX idx_titulos_categoria ON titulos_financeiros(categoria_id);

-- Trigger
CREATE TRIGGER titulos_financeiros_updated_at
  BEFORE UPDATE ON titulos_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE titulos_financeiros IS 'Títulos a pagar e a receber';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. TABELA: lancamentos
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo_id UUID REFERENCES titulos_financeiros(id) ON DELETE CASCADE,
  valor NUMERIC(15, 2) NOT NULL,
  data DATE NOT NULL,
  tipo_pagamento TEXT,
  centro_custo_cliente_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  categoria_id UUID REFERENCES plano_contas(id) ON DELETE SET NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lancamentos_titulo ON lancamentos(titulo_id);
CREATE INDEX idx_lancamentos_data ON lancamentos(data);

-- Comentário
COMMENT ON TABLE lancamentos IS 'Lançamentos financeiros (parcelas, pagamentos)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DADOS INICIAIS (seed)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Plano de Contas padrão
INSERT INTO plano_contas (grupo, conta, codigo) VALUES
  ('Receitas', 'Honorários de Projeto', 'R001'),
  ('Receitas', 'Vendas de Produtos', 'R002'),
  ('Receitas', 'Prestação de Serviços', 'R003'),
  ('Despesas', 'Fornecedores', 'D001'),
  ('Despesas', 'Salários e Encargos', 'D002'),
  ('Despesas', 'Marketing e Publicidade', 'D003'),
  ('Despesas', 'Aluguel e Condomínio', 'D004'),
  ('Despesas', 'Impostos e Taxas', 'D005')
ON CONFLICT (codigo) DO NOTHING;

-- Centros de Custo padrão
INSERT INTO centros_custo (nome, codigo) VALUES
  ('Arquitetura', 'CC001'),
  ('Marcenaria', 'CC002'),
  ('Engenharia', 'CC003'),
  ('Marketing', 'CC004'),
  ('Administrativo', 'CC005')
ON CONFLICT (codigo) DO NOTHING;
