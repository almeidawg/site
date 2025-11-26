-- =============================================
-- Migration: Unificar Pricelist em produtos_servicos
-- Data: 2025-11-26
-- Objetivo: Criar catálogo único de produtos/serviços
-- =============================================

-- Expandir produtos_servicos para ser o catálogo único
ALTER TABLE public.produtos_servicos
  ADD COLUMN IF NOT EXISTS descricao_detalhada TEXT,
  ADD COLUMN IF NOT EXISTS unidade_medida TEXT DEFAULT 'UN',
  ADD COLUMN IF NOT EXISTS codigo_interno TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS categoria TEXT,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS estoque_minimo NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS estoque_atual NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS fornecedor_id UUID REFERENCES entities(id),
  ADD COLUMN IF NOT EXISTS imagem_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_produtos_servicos_categoria ON produtos_servicos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_servicos_ativo ON produtos_servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_servicos_codigo ON produtos_servicos(codigo_interno);

-- Criar VIEW catalog_items apontando para produtos_servicos
CREATE OR REPLACE VIEW public.catalog_items AS
SELECT
  id,
  nome AS name,
  descricao AS description,
  descricao_detalhada AS detailed_description,
  tipo AS type,
  preco AS price,
  unidade_medida AS unit,
  codigo_interno AS code,
  categoria AS category,
  ativo AS active,
  imagem_url AS image_url,
  tags,
  created_at,
  updated_at
FROM public.produtos_servicos;

-- Criar tabela pricelist para histórico de preços
CREATE TABLE IF NOT EXISTS public.pricelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_servico_id UUID NOT NULL REFERENCES produtos_servicos(id) ON DELETE CASCADE,
  preco_base NUMERIC(15, 2) NOT NULL,
  preco_venda NUMERIC(15, 2) NOT NULL,
  margem_percentual NUMERIC(5, 2),
  validade_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  validade_fim DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para calcular margem automaticamente
CREATE OR REPLACE FUNCTION calc_margem_pricelist()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preco_base > 0 THEN
    NEW.margem_percentual := ((NEW.preco_venda - NEW.preco_base) / NEW.preco_base) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_margem_pricelist
  BEFORE INSERT OR UPDATE ON pricelist
  FOR EACH ROW
  EXECUTE FUNCTION calc_margem_pricelist();

-- Trigger updated_at
CREATE TRIGGER trg_updated_at_pricelist
  BEFORE UPDATE ON pricelist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar VIEW de preços atuais
CREATE OR REPLACE VIEW public.v_precos_atuais AS
SELECT DISTINCT ON (produto_servico_id)
  pl.id,
  pl.produto_servico_id,
  ps.nome,
  ps.tipo,
  pl.preco_base,
  pl.preco_venda,
  pl.margem_percentual,
  pl.validade_inicio,
  pl.validade_fim
FROM pricelist pl
JOIN produtos_servicos ps ON ps.id = pl.produto_servico_id
WHERE
  pl.validade_inicio <= CURRENT_DATE
  AND (pl.validade_fim IS NULL OR pl.validade_fim >= CURRENT_DATE)
ORDER BY produto_servico_id, validade_inicio DESC;

-- Seed data de exemplo
INSERT INTO produtos_servicos (nome, descricao, tipo, preco, unidade_medida, categoria, codigo_interno)
VALUES
  ('Projeto Arquitetônico Completo', 'Desenvolvimento de projeto arquitetônico completo', 'servico', 15000.00, 'UN', 'Arquitetura', 'ARQ-001'),
  ('Projeto Estrutural', 'Cálculo estrutural e projeto de fundações', 'servico', 8000.00, 'UN', 'Engenharia', 'ENG-001'),
  ('Marcenaria Personalizada', 'Móveis planejados sob medida', 'servico', 5000.00, 'M2', 'Marcenaria', 'MAR-001'),
  ('Cimento Portland', 'Cimento CP-II 50kg', 'produto', 35.00, 'SC', 'Construção', 'CONST-001'),
  ('Tinta Acrílica Premium', 'Tinta acrílica lavável 18L', 'produto', 280.00, 'UN', 'Acabamento', 'ACAB-001'),
  ('Porta de Madeira Maciça', 'Porta de madeira maciça 80x210cm', 'produto', 850.00, 'UN', 'Esquadrias', 'ESQ-001'),
  ('Consulta Técnica', 'Hora de consultoria técnica especializada', 'servico', 250.00, 'HR', 'Consultoria', 'CONS-001')
ON CONFLICT (codigo_interno) DO NOTHING;

-- RLS
ALTER TABLE pricelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver pricelist"
  ON pricelist FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas administradores podem modificar pricelist"
  ON pricelist FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Comentários
COMMENT ON TABLE pricelist IS 'Histórico de preços de produtos e serviços';
COMMENT ON VIEW catalog_items IS 'VIEW de compatibilidade: expõe produtos_servicos no formato antigo catalog_items';
COMMENT ON VIEW v_precos_atuais IS 'Preços vigentes atuais de cada produto/serviço';
