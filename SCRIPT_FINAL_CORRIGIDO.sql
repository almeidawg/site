-- =============================================
-- SCRIPT FINAL CORRIGIDO
-- =============================================

-- PASSO 1: Limpar tabelas problemáticas
DROP TABLE IF EXISTS public.lancamentos_financeiros CASCADE;
DROP TABLE IF EXISTS public.cobrancas CASCADE;
DROP TABLE IF EXISTS public.solicitacoes_pagamento CASCADE;
DROP TABLE IF EXISTS public.comissoes CASCADE;
DROP TABLE IF EXISTS public.reembolsos CASCADE;

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

-- PASSO 4: Verificar colunas da tabela obras antes de criar foreign keys
DO $$
DECLARE
  obras_id_column TEXT;
BEGIN
  -- Verificar qual é o nome correto da coluna de ID em obras
  SELECT column_name INTO obras_id_column
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'obras'
    AND column_name IN ('id', 'obra_id')
  LIMIT 1;

  RAISE NOTICE 'Coluna de ID em obras: %', obras_id_column;
END $$;

-- PASSO 5: Criar tabela cobrancas (SEM foreign key por enquanto)
CREATE TABLE IF NOT EXISTS public.cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID,
  cliente_id UUID,
  valor NUMERIC(15, 2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'atrasada', 'cancelada')),
  descricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 6: Criar tabela solicitacoes_pagamento (SEM foreign key por enquanto)
CREATE TABLE IF NOT EXISTS public.solicitacoes_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID,
  categoria_id UUID,
  fornecedor TEXT NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Pago', 'Rejeitado')),
  descricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 7: Criar tabela comissoes (SEM foreign key por enquanto)
CREATE TABLE IF NOT EXISTS public.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID,
  contrato_id UUID,
  valor NUMERIC(15, 2) NOT NULL,
  percentual NUMERIC(5, 2),
  data_referencia DATE DEFAULT CURRENT_DATE,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 8: Criar tabela reembolsos (SEM foreign key por enquanto)
CREATE TABLE IF NOT EXISTS public.reembolsos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID,
  categoria_id UUID,
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

-- PASSO 9: Adicionar foreign keys com verificação
DO $$
BEGIN
  -- Foreign key para cobrancas -> obras
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'obras' AND column_name = 'id') THEN
    ALTER TABLE public.cobrancas
    ADD CONSTRAINT fk_cobrancas_obra
    FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key para cobrancas -> entities
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'id') THEN
    ALTER TABLE public.cobrancas
    ADD CONSTRAINT fk_cobrancas_cliente
    FOREIGN KEY (cliente_id) REFERENCES public.entities(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key para solicitacoes_pagamento -> obras
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'obras' AND column_name = 'id') THEN
    ALTER TABLE public.solicitacoes_pagamento
    ADD CONSTRAINT fk_solicitacoes_obra
    FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key para solicitacoes_pagamento -> categorias_custo
  ALTER TABLE public.solicitacoes_pagamento
  ADD CONSTRAINT fk_solicitacoes_categoria
  FOREIGN KEY (categoria_id) REFERENCES public.categorias_custo(id) ON DELETE SET NULL;

  -- Foreign key para comissoes -> profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.comissoes
    ADD CONSTRAINT fk_comissoes_profissional
    FOREIGN KEY (profissional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key para comissoes -> contratos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos') THEN
    ALTER TABLE public.comissoes
    ADD CONSTRAINT fk_comissoes_contrato
    FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key para reembolsos -> entities
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'id') THEN
    ALTER TABLE public.reembolsos
    ADD CONSTRAINT fk_reembolsos_destinatario
    FOREIGN KEY (destinatario_id) REFERENCES public.entities(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key para reembolsos -> fin_categories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fin_categories') THEN
    ALTER TABLE public.reembolsos
    ADD CONSTRAINT fk_reembolsos_categoria
    FOREIGN KEY (categoria_id) REFERENCES public.fin_categories(id) ON DELETE SET NULL;
  END IF;

  RAISE NOTICE '✓ Foreign keys criadas';
END $$;

-- PASSO 10: Criar índices
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

-- PASSO 11: Habilitar RLS
ALTER TABLE public.categorias_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_categories ENABLE ROW LEVEL SECURITY;

-- PASSO 12: Criar políticas
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

-- PASSO 13: Criar função de timestamp
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 14: Criar triggers
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

-- PASSO 15: Recarregar schema cache
NOTIFY pgrst, 'reload schema';

-- PASSO 16: Verificação final
SELECT '=== TABELAS CRIADAS ===' as info;
SELECT '✓ ' || tablename as resultado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories')
ORDER BY tablename;

SELECT '=== RESUMO ===' as info;
SELECT 'Total: ' || COUNT(*)::text || ' tabelas criadas' as resumo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories');
