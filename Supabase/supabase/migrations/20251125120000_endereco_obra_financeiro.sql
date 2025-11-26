-- =============================================
-- Migration: Endereço de Obra + Campos Financeiros de Contrato
-- Data: 2025-11-25
-- Objetivo:
--   1) entities: endereço da obra separado + flag "mesmo endereço"
--   2) contratos: campos de condições financeiras e payload flexível
-- =============================================

-- 1) entities: endereço da obra
ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS obra_mesmo_endereco boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS endereco_obra jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.entities.obra_mesmo_endereco IS 'Se true, usar endereco como endereço da obra; se false, usar endereco_obra';
COMMENT ON COLUMN public.entities.endereco_obra IS 'Endereço específico da obra (jsonb: cep, uf, cidade, logradouro, numero, bairro, complemento)';

-- 2) contratos: condições financeiras
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS entrada_valor numeric(14,2),
  ADD COLUMN IF NOT EXISTS parcelas integer,
  ADD COLUMN IF NOT EXISTS valor_parcela numeric(14,2),
  ADD COLUMN IF NOT EXISTS observacoes_financeiras text,
  ADD COLUMN IF NOT EXISTS payload_financeiro jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.contratos
  ADD CONSTRAINT contratos_forma_pagamento_check
    CHECK (forma_pagamento IN ('cartao', 'boleto', 'santander', 'pix', 'transferencia', 'dinheiro') OR forma_pagamento IS NULL);

COMMENT ON COLUMN public.contratos.forma_pagamento IS 'cartao|boleto|santander|pix|transferencia|dinheiro';
COMMENT ON COLUMN public.contratos.entrada_valor IS 'Valor de entrada (se houver)';
COMMENT ON COLUMN public.contratos.parcelas IS 'Número de parcelas';
COMMENT ON COLUMN public.contratos.valor_parcela IS 'Valor por parcela (se fixo)';
COMMENT ON COLUMN public.contratos.observacoes_financeiras IS 'Texto livre sobre negociação';
COMMENT ON COLUMN public.contratos.payload_financeiro IS 'JSONB flexível para variáveis dinâmicas (ex: datas vencimento, taxas cartão, etc)';

-- RLS: apenas garante que as colunas novas seguem políticas existentes (nenhuma policy nova é criada aqui)
