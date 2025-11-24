-- =============================================
-- 4. Garantir tabelas kanban existem
-- =============================================

-- Garantir que kanban_colunas existe
CREATE TABLE IF NOT EXISTS public.kanban_colunas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  ordem integer DEFAULT 0,
  cor text,
  limite_wip integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_kanban_colunas_ordem ON kanban_colunas(ordem);

-- Comentário
COMMENT ON TABLE kanban_colunas IS 'Colunas do quadro kanban';

-- =============================================

-- Garantir que kanban_cards existe
CREATE TABLE IF NOT EXISTS public.kanban_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  coluna_id uuid REFERENCES kanban_colunas(id) ON DELETE CASCADE,
  ordem integer DEFAULT 0,
  prioridade text DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_kanban_cards_coluna_id ON kanban_cards(coluna_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_ordem ON kanban_cards(ordem);

-- Comentário
COMMENT ON TABLE kanban_cards IS 'Cards do quadro kanban';

-- Triggers
DROP TRIGGER IF EXISTS update_kanban_cards_updated_at ON kanban_cards;
CREATE TRIGGER update_kanban_cards_updated_at
  BEFORE UPDATE ON kanban_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kanban_colunas_updated_at ON kanban_colunas;
CREATE TRIGGER update_kanban_colunas_updated_at
  BEFORE UPDATE ON kanban_colunas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
