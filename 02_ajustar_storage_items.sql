-- =============================================
-- 2. Ajustar tabela storage_items
-- =============================================

-- Adicionar coluna name se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'storage_items'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE storage_items ADD COLUMN name text;
    COMMENT ON COLUMN storage_items.name IS 'Nome do item';
  END IF;
END $$;

-- Adicionar coluna description se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'storage_items'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE storage_items ADD COLUMN description text;
    COMMENT ON COLUMN storage_items.description IS 'Descrição do item';
  END IF;
END $$;

-- Verificar resultado
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'storage_items'
  AND column_name IN ('name', 'description');
