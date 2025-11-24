-- =============================================
-- 3. Criar tabela propostas
-- =============================================

CREATE TABLE IF NOT EXISTS public.propostas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  valor numeric(10,2),
  status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviada', 'aprovada', 'rejeitada')),
  cliente_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propostas_cliente_id ON propostas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);
CREATE INDEX IF NOT EXISTS idx_propostas_created_at ON propostas(created_at DESC);

-- Comentário
COMMENT ON TABLE propostas IS 'Propostas comerciais';
COMMENT ON COLUMN propostas.status IS 'Status: rascunho, enviada, aprovada, rejeitada';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_propostas_updated_at ON propostas;
CREATE TRIGGER update_propostas_updated_at
  BEFORE UPDATE ON propostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
