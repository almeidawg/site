-- =============================================
-- FIX ESPECÍFICO PARA COLUNA ATIVO
-- =============================================

-- PASSO 1: Adicionar colunas faltantes em fin_categories
DO $$
BEGIN
  -- Adicionar description se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'fin_categories'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.fin_categories ADD COLUMN description TEXT;
    RAISE NOTICE '✓ Coluna fin_categories.description adicionada';
  END IF;

  -- Adicionar ativo se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'fin_categories'
    AND column_name = 'ativo'
  ) THEN
    ALTER TABLE public.fin_categories ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✓ Coluna fin_categories.ativo adicionada';
  END IF;

  -- Adicionar created_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'fin_categories'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.fin_categories ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✓ Coluna fin_categories.created_at adicionada';
  END IF;

  -- Adicionar updated_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'fin_categories'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.fin_categories ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✓ Coluna fin_categories.updated_at adicionada';
  END IF;
END $$;

-- PASSO 2: Criar índices (agora que as colunas existem)
CREATE INDEX IF NOT EXISTS idx_fin_categories_name ON public.fin_categories(name);
CREATE INDEX IF NOT EXISTS idx_fin_categories_kind ON public.fin_categories(kind);

-- PASSO 3: Verificação
SELECT
  '✓ Coluna ' || column_name || ' existe em fin_categories' as resultado
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'fin_categories'
  AND column_name IN ('name', 'kind', 'description', 'ativo', 'created_at', 'updated_at')
ORDER BY column_name;
