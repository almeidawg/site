-- =============================================
-- MIGRATION: Fix Financeiro Module Errors
-- Data: 2025-11-25
-- Descrição: Corrige incompatibilidades entre código frontend e schema do banco
-- =============================================
-- Alterações:
--   1. Adiciona coluna 'nome' na tabela 'obras' como alias para 'titulo'
--   2. Adiciona coluna 'nome_razao_social' na tabela 'entities' como alias para nome existente
--   3. Cria tabelas financeiras faltantes (cobrancas, solicitacoes_pagamento, etc)
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 1: ADICIONAR COLUNAS FALTANTES EM TABELAS EXISTENTES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1.1: Adicionar coluna 'nome' na tabela 'obras' como computed column
-- A coluna 'nome' será um alias para 'titulo' para compatibilidade com código legado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'obras'
    AND column_name = 'nome'
  ) THEN
    ALTER TABLE public.obras ADD COLUMN nome TEXT GENERATED ALWAYS AS (titulo) STORED;
    CREATE INDEX IF NOT EXISTS idx_obras_nome ON public.obras(nome);
  END IF;
END $$;

COMMENT ON COLUMN obras.nome IS 'Alias para titulo - mantido para compatibilidade com código legado';


-- 1.2: Verificar estrutura da tabela 'entities' e adicionar coluna se necessário
-- Primeiro, precisamos descobrir qual coluna contém o nome na tabela entities
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  -- Verifica se já existe nome_razao_social
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'entities'
    AND column_name = 'nome_razao_social'
  ) INTO col_exists;

  IF NOT col_exists THEN
    -- Se a tabela entities tem coluna 'name', cria alias
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'entities'
      AND column_name = 'name'
    ) THEN
      ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT GENERATED ALWAYS AS (name) STORED;

    -- Se a tabela entities tem coluna 'nome', cria alias
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'entities'
      AND column_name = 'nome'
    ) THEN
      ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT GENERATED ALWAYS AS (nome) STORED;

    -- Caso contrário, adiciona como coluna normal
    ELSE
      ALTER TABLE public.entities ADD COLUMN nome_razao_social TEXT;
    END IF;

    CREATE INDEX IF NOT EXISTS idx_entities_nome_razao_social ON public.entities(nome_razao_social);
  END IF;
END $$;

COMMENT ON COLUMN entities.nome_razao_social IS 'Nome/Razão Social - mantido para compatibilidade com código legado';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 2: CRIAR TABELAS FINANCEIRAS FALTANTES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 2.1: Tabela de Cobranças
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

COMMENT ON TABLE cobrancas IS 'Cobranças e faturas de clientes';


-- 2.2: Tabela de Solicitações de Pagamento
CREATE TABLE IF NOT EXISTS public.solicitacoes_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_solicitacoes_obra ON public.solicitacoes_pagamento(obra_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes_pagamento(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_data ON public.solicitacoes_pagamento(data_solicitacao);

COMMENT ON TABLE solicitacoes_pagamento IS 'Solicitações de pagamento para aprovação';


-- 2.3: Tabela de Categorias de Custo
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

COMMENT ON TABLE categorias_custo IS 'Categorias de custo para classificação financeira';


-- 2.4: Criar FK para categoria_id em solicitacoes_pagamento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'solicitacoes_pagamento_categoria_id_fkey'
  ) THEN
    ALTER TABLE public.solicitacoes_pagamento
    ADD CONSTRAINT solicitacoes_pagamento_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES public.categorias_custo(id) ON DELETE SET NULL;
  END IF;
END $$;


-- 2.5: Tabela de Comissões
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

COMMENT ON TABLE comissoes IS 'Comissões de vendas e profissionais';


-- 2.6: Tabela de Catálogo de Itens
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

COMMENT ON TABLE catalog_items IS 'Catálogo de itens e serviços';


-- 2.7: Tabela de Reembolsos
CREATE TABLE IF NOT EXISTS public.reembolsos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_reembolsos_destinatario ON public.reembolsos(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_status ON public.reembolsos(status);
CREATE INDEX IF NOT EXISTS idx_reembolsos_data ON public.reembolsos(data_solicitacao);

COMMENT ON TABLE reembolsos IS 'Solicitações de reembolso';


-- 2.8: Tabela de Categorias Financeiras (fin_categories)
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

COMMENT ON TABLE fin_categories IS 'Categorias para sistema de transações financeiras';


-- 2.9: Criar FK para categoria_id em reembolsos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reembolsos_categoria_id_fkey'
  ) THEN
    ALTER TABLE public.reembolsos
    ADD CONSTRAINT reembolsos_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES public.fin_categories(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 3: HABILITAR ROW LEVEL SECURITY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_categories ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de acesso (ajustar conforme necessidade)
DO $$
BEGIN
  -- cobrancas
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cobrancas' AND policyname = 'cobrancas_all_access') THEN
    CREATE POLICY cobrancas_all_access ON public.cobrancas FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- solicitacoes_pagamento
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'solicitacoes_pagamento' AND policyname = 'solicitacoes_all_access') THEN
    CREATE POLICY solicitacoes_all_access ON public.solicitacoes_pagamento FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- categorias_custo
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categorias_custo' AND policyname = 'categorias_custo_all_access') THEN
    CREATE POLICY categorias_custo_all_access ON public.categorias_custo FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- comissoes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comissoes' AND policyname = 'comissoes_all_access') THEN
    CREATE POLICY comissoes_all_access ON public.comissoes FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- catalog_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalog_items' AND policyname = 'catalog_items_all_access') THEN
    CREATE POLICY catalog_items_all_access ON public.catalog_items FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- reembolsos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reembolsos' AND policyname = 'reembolsos_all_access') THEN
    CREATE POLICY reembolsos_all_access ON public.reembolsos FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- fin_categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fin_categories' AND policyname = 'fin_categories_all_access') THEN
    CREATE POLICY fin_categories_all_access ON public.fin_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 4: TRIGGERS PARA UPDATED_AT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS cobrancas_updated_at ON public.cobrancas;
CREATE TRIGGER cobrancas_updated_at BEFORE UPDATE ON public.cobrancas
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS solicitacoes_updated_at ON public.solicitacoes_pagamento;
CREATE TRIGGER solicitacoes_updated_at BEFORE UPDATE ON public.solicitacoes_pagamento
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS categorias_custo_updated_at ON public.categorias_custo;
CREATE TRIGGER categorias_custo_updated_at BEFORE UPDATE ON public.categorias_custo
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS comissoes_updated_at ON public.comissoes;
CREATE TRIGGER comissoes_updated_at BEFORE UPDATE ON public.comissoes
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS catalog_items_updated_at ON public.catalog_items;
CREATE TRIGGER catalog_items_updated_at BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS reembolsos_updated_at ON public.reembolsos;
CREATE TRIGGER reembolsos_updated_at BEFORE UPDATE ON public.reembolsos
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

DROP TRIGGER IF EXISTS fin_categories_updated_at ON public.fin_categories;
CREATE TRIGGER fin_categories_updated_at BEFORE UPDATE ON public.fin_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
