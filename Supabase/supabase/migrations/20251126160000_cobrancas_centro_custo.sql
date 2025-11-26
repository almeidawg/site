-- =============================================
-- Migration: Adicionar centro_custo_id e categoria_id em cobrancas
-- Data: 2025-11-26
-- Descrição: Adiciona campos para rastreamento de centro de custo e categoria
--            nas cobranças, permitindo vinculação com núcleo (arquitetura, engenharia, marcenaria)
-- =============================================

BEGIN;

-- Adicionar colunas
ALTER TABLE public.cobrancas
  ADD COLUMN IF NOT EXISTS centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES plano_contas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS titulo_financeiro_id UUID REFERENCES titulos_financeiros(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT CHECK (forma_pagamento IN ('boleto', 'pix', 'transferencia', 'cartao', 'dinheiro'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cobrancas_centro_custo ON cobrancas(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_categoria ON cobrancas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_titulo ON cobrancas(titulo_financeiro_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_forma_pagamento ON cobrancas(forma_pagamento);

-- Comentários
COMMENT ON COLUMN cobrancas.centro_custo_id IS 'Centro de custo da cobrança (núcleo: arquitetura, engenharia, marcenaria)';
COMMENT ON COLUMN cobrancas.categoria_id IS 'Categoria contábil da cobrança (plano de contas)';
COMMENT ON COLUMN cobrancas.titulo_financeiro_id IS 'Vínculo com título financeiro gerado automaticamente';
COMMENT ON COLUMN cobrancas.observacoes IS 'Observações adicionais sobre a cobrança';
COMMENT ON COLUMN cobrancas.forma_pagamento IS 'Forma de pagamento da cobrança (boleto, pix, transferencia, cartao, dinheiro)';

-- Popular categoria padrão para cobranças existentes (Honorários de Projeto)
UPDATE cobrancas
SET categoria_id = (SELECT id FROM plano_contas WHERE codigo = 'R001' LIMIT 1)
WHERE categoria_id IS NULL;

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Colunas adicionadas em cobrancas
-- ✅ Índices criados para performance
-- ✅ Categoria padrão populada
