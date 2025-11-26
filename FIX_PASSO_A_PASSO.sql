-- =============================================
-- SCRIPT PASSO A PASSO - CORREÇÃO FINANCEIRO
-- Execute uma seção por vez
-- =============================================

-- ========== SEÇÃO 1: LIMPEZA ==========
DROP TABLE IF EXISTS public.lancamentos_financeiros CASCADE;

-- ========== SEÇÃO 2: OBRAS.NOME ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'obras') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'obras' AND column_name = 'nome') THEN
      ALTER TABLE public.obras ADD COLUMN nome TEXT GENERATED ALWAYS AS (titulo) STORED;
      CREATE INDEX IF NOT EXISTS idx_obras_nome ON public.obras(nome);
    END IF;
  END IF;
END $$;

-- ========== SEÇÃO 3: ENTITIES.NOME_RAZAO_SOCIAL ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entities') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'nome_razao_social') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'name') THEN
        ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT GENERATED ALWAYS AS (name) STORED;
      ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'nome') THEN
        ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT GENERATED ALWAYS AS (nome) STORED;
      ELSE
        ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT;
      END IF;
      CREATE INDEX IF NOT EXISTS idx_entities_nome_razao_social ON public.entities(nome_razao_social);
    END IF;
  END IF;
END $$;

-- ========== SEÇÃO 4: CATEGORIAS_CUSTO ==========
CREATE TABLE IF NOT EXISTS public.categorias_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_custo_ativo ON public.categorias_custo(ativo);
CREATE INDEX IF NOT EXISTS idx_categorias_custo_nome ON public.categorias_custo(nome);

-- ========== SEÇÃO 5: FIN_CATEGORIES (já existe, só índices) ==========
CREATE INDEX IF NOT EXISTS idx_fin_categories_name ON public.fin_categories(name);
CREATE INDEX IF NOT EXISTS idx_fin_categories_kind ON public.fin_categories(kind);
CREATE INDEX IF NOT EXISTS idx_fin_categories_ativo ON public.fin_categories(ativo);

-- ========== SEÇÃO 6: CATALOG_ITEMS ==========
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

CREATE INDEX IF NOT EXISTS idx_catalog_items_name ON public.catalog_items(name);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON public.catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_catalog_items_ativo ON public.catalog_items(ativo);

-- ========== SEÇÃO 7: COBRANCAS ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'obras')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entities')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cobrancas') THEN

    CREATE TABLE public.cobrancas (
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

    CREATE INDEX idx_cobrancas_obra ON public.cobrancas(obra_id);
    CREATE INDEX idx_cobrancas_cliente ON public.cobrancas(cliente_id);
    CREATE INDEX idx_cobrancas_vencimento ON public.cobrancas(vencimento);
  END IF;
END $$;

-- ========== SEÇÃO 8: SOLICITACOES_PAGAMENTO ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'obras')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solicitacoes_pagamento') THEN

    CREATE TABLE public.solicitacoes_pagamento (
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

    CREATE INDEX idx_solicitacoes_obra ON public.solicitacoes_pagamento(obra_id);
    CREATE INDEX idx_solicitacoes_status ON public.solicitacoes_pagamento(status);
  END IF;
END $$;

-- ========== SEÇÃO 9: COMISSOES ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comissoes') THEN

    CREATE TABLE public.comissoes (
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

    CREATE INDEX idx_comissoes_profissional ON public.comissoes(profissional_id);
    CREATE INDEX idx_comissoes_contrato ON public.comissoes(contrato_id);
  END IF;
END $$;

-- ========== SEÇÃO 10: REEMBOLSOS ==========
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entities')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reembolsos') THEN

    CREATE TABLE public.reembolsos (
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

    CREATE INDEX idx_reembolsos_destinatario ON public.reembolsos(destinatario_id);
    CREATE INDEX idx_reembolsos_status ON public.reembolsos(status);
  END IF;
END $$;

-- ========== SEÇÃO 11: RLS ==========
ALTER TABLE public.categorias_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cobrancas') THEN
    ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solicitacoes_pagamento') THEN
    ALTER TABLE public.solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comissoes') THEN
    ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reembolsos') THEN
    ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ========== SEÇÃO 12: POLÍTICAS ==========
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categorias_custo' AND policyname = 'categorias_custo_all') THEN
    CREATE POLICY categorias_custo_all ON public.categorias_custo FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fin_categories' AND policyname = 'fin_categories_all') THEN
    CREATE POLICY fin_categories_all ON public.fin_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalog_items' AND policyname = 'catalog_items_all') THEN
    CREATE POLICY catalog_items_all ON public.catalog_items FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cobrancas')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cobrancas' AND policyname = 'cobrancas_all') THEN
    CREATE POLICY cobrancas_all ON public.cobrancas FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solicitacoes_pagamento')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'solicitacoes_pagamento' AND policyname = 'solicitacoes_all') THEN
    CREATE POLICY solicitacoes_all ON public.solicitacoes_pagamento FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comissoes')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comissoes' AND policyname = 'comissoes_all') THEN
    CREATE POLICY comissoes_all ON public.comissoes FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reembolsos')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reembolsos' AND policyname = 'reembolsos_all') THEN
    CREATE POLICY reembolsos_all ON public.reembolsos FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ========== SEÇÃO 13: TRIGGERS ==========
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS categorias_custo_updated_at ON public.categorias_custo;
  CREATE TRIGGER categorias_custo_updated_at BEFORE UPDATE ON public.categorias_custo
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

  DROP TRIGGER IF EXISTS fin_categories_updated_at ON public.fin_categories;
  CREATE TRIGGER fin_categories_updated_at BEFORE UPDATE ON public.fin_categories
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

  DROP TRIGGER IF EXISTS catalog_items_updated_at ON public.catalog_items;
  CREATE TRIGGER catalog_items_updated_at BEFORE UPDATE ON public.catalog_items
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cobrancas') THEN
    DROP TRIGGER IF EXISTS cobrancas_updated_at ON public.cobrancas;
    CREATE TRIGGER cobrancas_updated_at BEFORE UPDATE ON public.cobrancas
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solicitacoes_pagamento') THEN
    DROP TRIGGER IF EXISTS solicitacoes_updated_at ON public.solicitacoes_pagamento;
    CREATE TRIGGER solicitacoes_updated_at BEFORE UPDATE ON public.solicitacoes_pagamento
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comissoes') THEN
    DROP TRIGGER IF EXISTS comissoes_updated_at ON public.comissoes;
    CREATE TRIGGER comissoes_updated_at BEFORE UPDATE ON public.comissoes
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reembolsos') THEN
    DROP TRIGGER IF EXISTS reembolsos_updated_at ON public.reembolsos;
    CREATE TRIGGER reembolsos_updated_at BEFORE UPDATE ON public.reembolsos
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;
END $$;

-- ========== VERIFICAÇÃO FINAL ==========
SELECT '✓ ' || table_name as tabelas_criadas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories')
ORDER BY table_name;
