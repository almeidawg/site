-- =============================================
-- SCRIPT DE CORREÇÃO DO MÓDULO FINANCEIRO - V2 (CORRIGIDO)
-- Execute este script diretamente no Supabase Dashboard
-- =============================================
-- Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql/new
-- Cole este script e clique em "Run"
-- =============================================

-- PARTE 1: Adicionar coluna 'nome' na tabela 'obras' (alias para 'titulo')
DO $$
BEGIN
  -- Verificar se a tabela obras existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'obras') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'obras'
      AND column_name = 'nome'
    ) THEN
      ALTER TABLE public.obras ADD COLUMN nome TEXT GENERATED ALWAYS AS (titulo) STORED;
      CREATE INDEX IF NOT EXISTS idx_obras_nome ON public.obras(nome);
      RAISE NOTICE 'Coluna obras.nome criada com sucesso';
    ELSE
      RAISE NOTICE 'Coluna obras.nome já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela obras não existe ainda';
  END IF;
END $$;

-- PARTE 2: Adicionar coluna 'nome_razao_social' na tabela 'entities'
DO $$
DECLARE
  col_exists BOOLEAN;
  table_exists BOOLEAN;
BEGIN
  -- Verificar se a tabela entities existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'entities'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'entities'
      AND column_name = 'nome_razao_social'
    ) INTO col_exists;

    IF NOT col_exists THEN
      -- Tenta criar alias de 'name'
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'entities'
        AND column_name = 'name'
      ) THEN
        ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT GENERATED ALWAYS AS (name) STORED;
        RAISE NOTICE 'Coluna entities.nome_razao_social criada como alias de name';

      -- Tenta criar alias de 'nome'
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'entities'
        AND column_name = 'nome'
      ) THEN
        ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT GENERATED ALWAYS AS (nome) STORED;
        RAISE NOTICE 'Coluna entities.nome_razao_social criada como alias de nome';

      -- Adiciona como coluna normal
      ELSE
        ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT;
        RAISE NOTICE 'Coluna entities.nome_razao_social criada como coluna normal';
      END IF;

      CREATE INDEX IF NOT EXISTS idx_entities_nome_razao_social ON public.entities(nome_razao_social);
    ELSE
      RAISE NOTICE 'Coluna entities.nome_razao_social já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela entities não existe ainda';
  END IF;
END $$;

-- PARTE 3: Criar tabelas financeiras faltantes

-- Tabela: categorias_custo (criar primeiro pois outras dependem dela)
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

-- Tabela: fin_categories (criar antes de reembolsos)
CREATE TABLE IF NOT EXISTS public.fin_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT CHECK (kind IN ('income', 'expense')),
  description TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_categories_name ON public.fin_categories(name);
CREATE INDEX IF NOT EXISTS idx_fin_categories_kind ON public.fin_categories(kind);
CREATE INDEX IF NOT EXISTS idx_fin_categories_ativo ON public.fin_categories(ativo);

-- Tabela: cobrancas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'obras')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entities') THEN

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

    CREATE INDEX IF NOT EXISTS idx_cobrancas_obra ON public.cobrancas(obra_id);
    CREATE INDEX IF NOT EXISTS idx_cobrancas_cliente ON public.cobrancas(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_cobrancas_vencimento ON public.cobrancas(vencimento);
    CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON public.cobrancas(status);

    RAISE NOTICE 'Tabela cobrancas criada';
  ELSE
    RAISE NOTICE 'Não foi possível criar cobrancas - tabelas obras ou entities não existem';
  END IF;
END $$;

-- Tabela: solicitacoes_pagamento
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'obras') THEN

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

    CREATE INDEX IF NOT EXISTS idx_solicitacoes_obra ON public.solicitacoes_pagamento(obra_id);
    CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes_pagamento(status);
    CREATE INDEX IF NOT EXISTS idx_solicitacoes_data ON public.solicitacoes_pagamento(data_solicitacao);

    RAISE NOTICE 'Tabela solicitacoes_pagamento criada';
  ELSE
    RAISE NOTICE 'Não foi possível criar solicitacoes_pagamento - tabela obras não existe';
  END IF;
END $$;

-- Tabela: comissoes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos') THEN

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

    CREATE INDEX IF NOT EXISTS idx_comissoes_profissional ON public.comissoes(profissional_id);
    CREATE INDEX IF NOT EXISTS idx_comissoes_contrato ON public.comissoes(contrato_id);
    CREATE INDEX IF NOT EXISTS idx_comissoes_status ON public.comissoes(status);

    RAISE NOTICE 'Tabela comissoes criada';
  ELSE
    RAISE NOTICE 'Não foi possível criar comissoes - tabelas profiles ou contratos não existem';
  END IF;
END $$;

-- Tabela: catalog_items
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

-- Tabela: reembolsos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entities') THEN

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

    CREATE INDEX IF NOT EXISTS idx_reembolsos_destinatario ON public.reembolsos(destinatario_id);
    CREATE INDEX IF NOT EXISTS idx_reembolsos_status ON public.reembolsos(status);
    CREATE INDEX IF NOT EXISTS idx_reembolsos_data ON public.reembolsos(data_solicitacao);

    RAISE NOTICE 'Tabela reembolsos criada';
  ELSE
    RAISE NOTICE 'Não foi possível criar reembolsos - tabela entities não existe';
  END IF;
END $$;

-- PARTE 4: Habilitar Row Level Security (apenas para tabelas que existem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cobrancas') THEN
    ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solicitacoes_pagamento') THEN
    ALTER TABLE public.solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categorias_custo') THEN
    ALTER TABLE public.categorias_custo ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comissoes') THEN
    ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalog_items') THEN
    ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reembolsos') THEN
    ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fin_categories') THEN
    ALTER TABLE public.fin_categories ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- PARTE 5: Criar políticas de acesso
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cobrancas' AND policyname = 'cobrancas_all_access')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cobrancas') THEN
    CREATE POLICY cobrancas_all_access ON public.cobrancas FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'solicitacoes_pagamento' AND policyname = 'solicitacoes_all_access')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'solicitacoes_pagamento') THEN
    CREATE POLICY solicitacoes_all_access ON public.solicitacoes_pagamento FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categorias_custo' AND policyname = 'categorias_custo_all_access')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categorias_custo') THEN
    CREATE POLICY categorias_custo_all_access ON public.categorias_custo FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comissoes' AND policyname = 'comissoes_all_access')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comissoes') THEN
    CREATE POLICY comissoes_all_access ON public.comissoes FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalog_items' AND policyname = 'catalog_items_all_access')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalog_items') THEN
    CREATE POLICY catalog_items_all_access ON public.catalog_items FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reembolsos' AND policyname = 'reembolsos_all_access')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reembolsos') THEN
    CREATE POLICY reembolsos_all_access ON public.reembolsos FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fin_categories' AND policyname = 'fin_categories_all_access')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fin_categories') THEN
    CREATE POLICY fin_categories_all_access ON public.fin_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- PARTE 6: Criar função e triggers para updated_at
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers apenas se as tabelas existirem
DO $$
BEGIN
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

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categorias_custo') THEN
    DROP TRIGGER IF EXISTS categorias_custo_updated_at ON public.categorias_custo;
    CREATE TRIGGER categorias_custo_updated_at BEFORE UPDATE ON public.categorias_custo
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comissoes') THEN
    DROP TRIGGER IF EXISTS comissoes_updated_at ON public.comissoes;
    CREATE TRIGGER comissoes_updated_at BEFORE UPDATE ON public.comissoes
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalog_items') THEN
    DROP TRIGGER IF EXISTS catalog_items_updated_at ON public.catalog_items;
    CREATE TRIGGER catalog_items_updated_at BEFORE UPDATE ON public.catalog_items
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reembolsos') THEN
    DROP TRIGGER IF EXISTS reembolsos_updated_at ON public.reembolsos;
    CREATE TRIGGER reembolsos_updated_at BEFORE UPDATE ON public.reembolsos
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fin_categories') THEN
    DROP TRIGGER IF EXISTS fin_categories_updated_at ON public.fin_categories;
    CREATE TRIGGER fin_categories_updated_at BEFORE UPDATE ON public.fin_categories
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
  END IF;
END $$;

-- =============================================
-- FIM DO SCRIPT
-- =============================================

-- Verificação final
SELECT
  'Tabela criada: ' || table_name as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories')
ORDER BY table_name;

SELECT
  'Coluna criada: ' || table_name || '.' || column_name as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND ((table_name = 'obras' AND column_name = 'nome')
    OR (table_name = 'entities' AND column_name = 'nome_razao_social'))
ORDER BY table_name, column_name;
