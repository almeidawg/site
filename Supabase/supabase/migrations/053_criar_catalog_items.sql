-- =============================================
-- MIGRATION: 053
-- Descrição: Tabela de catálogo de preços (Price List)
-- Data: 2025-11-27
-- =============================================

CREATE TABLE IF NOT EXISTS public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Produto', 'Serviço')),
  unit TEXT DEFAULT 'm2',
  productivity NUMERIC(12,3) DEFAULT 0,
  setup_days NUMERIC(6,2) DEFAULT 0,
  value NUMERIC(14,4) DEFAULT 0,
  trade TEXT,
  image_url TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_name ON catalog_items(name);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_catalog_items_type ON catalog_items(type);

CREATE OR REPLACE FUNCTION update_catalog_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_catalog_items_updated_at ON catalog_items;
CREATE TRIGGER trg_catalog_items_updated_at
  BEFORE UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_catalog_items_updated_at();

ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Catalog select" ON catalog_items;
CREATE POLICY "Catalog select"
  ON catalog_items FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Catalog insert" ON catalog_items;
CREATE POLICY "Catalog insert"
  ON catalog_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
        AND perfil IN ('admin', 'gestor', 'financeiro')
    )
  );

DROP POLICY IF EXISTS "Catalog update" ON catalog_items;
CREATE POLICY "Catalog update"
  ON catalog_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
        AND perfil IN ('admin', 'gestor', 'financeiro')
    )
  );

DROP POLICY IF EXISTS "Catalog delete" ON catalog_items;
CREATE POLICY "Catalog delete"
  ON catalog_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis
      WHERE user_id = auth.uid()
        AND perfil IN ('admin', 'gestor')
    )
  );

COMMENT ON TABLE catalog_items IS 'Itens do catálogo de preço usado pelo Price List';
COMMENT ON COLUMN catalog_items.productivity IS 'Quantidade produtiva por dia';
COMMENT ON COLUMN catalog_items.value IS 'Valor unitário sugerido';

