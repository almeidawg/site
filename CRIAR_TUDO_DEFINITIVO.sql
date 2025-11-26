-- =============================================
-- SCRIPT DEFINITIVO - CRIAR TODAS AS TABELAS
-- =============================================
-- Este script cria TODAS as tabelas necessárias
-- Pode ser executado múltiplas vezes sem problemas
-- =============================================

-- PASSO 1: Limpar tabelas problemáticas
DROP TABLE IF EXISTS public.lancamentos_financeiros CASCADE;

-- PASSO 2: Criar tabela categorias_custo
CREATE TABLE IF NOT EXISTS public.categorias_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 3: Criar tabela catalog_items
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_price NUMERIC(15, 2) DEFAULT 0,
  unit TEXT DEFAULT 'un',
  ativo BOOLEAN DEFAULT TRUE,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 4: Criar tabela cobrancas
CREATE TABLE IF NOT EXISTS public.cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  valor NUMERIC(15, 2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'atrasada', 'cancelada')),
  descricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 5: Criar tabela solicitacoes_pagamento
CREATE TABLE IF NOT EXISTS public.solicitacoes_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias_custo(id) ON DELETE SET NULL,
  fornecedor TEXT NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Pago', 'Rejeitado')),
  descricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 6: Criar tabela comissoes
CREATE TABLE IF NOT EXISTS public.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
  valor NUMERIC(15, 2) NOT NULL,
  percentual NUMERIC(5, 2),
  data_referencia DATE DEFAULT CURRENT_DATE,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 7: Criar tabela reembolsos
CREATE TABLE IF NOT EXISTS public.reembolsos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.fin_categories(id) ON DELETE SET NULL,
  valor NUMERIC(15, 2) NOT NULL,
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'pago', 'rejeitado')),
  descricao TEXT,
  reimbursement_description TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 8: Criar índices
CREATE INDEX IF NOT EXISTS idx_categorias_custo_ativo ON public.categorias_custo(ativo);
CREATE INDEX IF NOT EXISTS idx_categorias_custo_nome ON public.categorias_custo(nome);

CREATE INDEX IF NOT EXISTS idx_catalog_items_name ON public.catalog_items(name);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON public.catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_catalog_items_ativo ON public.catalog_items(ativo);

CREATE INDEX IF NOT EXISTS idx_cobrancas_obra ON public.cobrancas(obra_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_cliente ON public.cobrancas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_vencimento ON public.cobrancas(vencimento);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON public.cobrancas(status);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_obra ON public.solicitacoes_pagamento(obra_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes_pagamento(status);

CREATE INDEX IF NOT EXISTS idx_comissoes_profissional ON public.comissoes(profissional_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_contrato ON public.comissoes(contrato_id);

CREATE INDEX IF NOT EXISTS idx_reembolsos_destinatario ON public.reembolsos(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_status ON public.reembolsos(status);

CREATE INDEX IF NOT EXISTS idx_fin_categories_name ON public.fin_categories(name);
CREATE INDEX IF NOT EXISTS idx_fin_categories_kind ON public.fin_categories(kind);

-- PASSO 9: Habilitar RLS
ALTER TABLE public.categorias_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_categories ENABLE ROW LEVEL SECURITY;

-- PASSO 10: Criar políticas (permissivas temporárias)
DROP POLICY IF EXISTS categorias_custo_all ON public.categorias_custo;
CREATE POLICY categorias_custo_all ON public.categorias_custo FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS catalog_items_all ON public.catalog_items;
CREATE POLICY catalog_items_all ON public.catalog_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cobrancas_all ON public.cobrancas;
CREATE POLICY cobrancas_all ON public.cobrancas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS solicitacoes_all ON public.solicitacoes_pagamento;
CREATE POLICY solicitacoes_all ON public.solicitacoes_pagamento FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS comissoes_all ON public.comissoes;
CREATE POLICY comissoes_all ON public.comissoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS reembolsos_all ON public.reembolsos;
CREATE POLICY reembolsos_all ON public.reembolsos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS fin_categories_all ON public.fin_categories;
CREATE POLICY fin_categories_all ON public.fin_categories FOR ALL USING (true) WITH CHECK (true);

-- PASSO 11: Criar função de timestamp
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 12: Criar triggers
DROP TRIGGER IF EXISTS categorias_custo_updated_at ON public.categorias_custo;
CREATE TRIGGER categorias_custo_updated_at BEFORE UPDATE ON public.categorias_custo
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS catalog_items_updated_at ON public.catalog_items;
CREATE TRIGGER catalog_items_updated_at BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS cobrancas_updated_at ON public.cobrancas;
CREATE TRIGGER cobrancas_updated_at BEFORE UPDATE ON public.cobrancas
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS solicitacoes_updated_at ON public.solicitacoes_pagamento;
CREATE TRIGGER solicitacoes_updated_at BEFORE UPDATE ON public.solicitacoes_pagamento
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS comissoes_updated_at ON public.comissoes;
CREATE TRIGGER comissoes_updated_at BEFORE UPDATE ON public.comissoes
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS reembolsos_updated_at ON public.reembolsos;
CREATE TRIGGER reembolsos_updated_at BEFORE UPDATE ON public.reembolsos
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS fin_categories_updated_at ON public.fin_categories;
CREATE TRIGGER fin_categories_updated_at BEFORE UPDATE ON public.fin_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

-- PASSO 13: Recarregar schema cache
NOTIFY pgrst, 'reload schema';

-- PASSO 14: Verificação final
SELECT '✓ Tabela ' || tablename || ' criada' as resultado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories')
ORDER BY tablename;

SELECT 'Total de tabelas criadas: ' || COUNT(*)::text as resumo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories');
