-- =============================================
-- Migration: Criar tabela de alertas de pagamento
-- Data: 2025-11-26
-- Descrição: Cria sistema de alertas para vencimentos de cobranças
--            (5 dias antes, 1 dia antes, vencido)
-- =============================================

BEGIN;

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS public.alertas_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cobranca_id UUID REFERENCES cobrancas(id) ON DELETE CASCADE,
  tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN ('5_dias_antes', '1_dia_antes', 'vencido')),
  data_alerta DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'lido', 'ignorado')),
  metodo_envio TEXT[] DEFAULT ARRAY['popup'], -- ['popup', 'email', 'sms']
  enviado_em TIMESTAMPTZ,
  lido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_alertas_cobranca ON alertas_pagamento(cobranca_id);
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas_pagamento(data_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas_pagamento(status);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_pagamento(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_vencimento ON alertas_pagamento(data_vencimento);

-- Constraint única: apenas 1 alerta de cada tipo por cobrança por dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_alertas_unique ON alertas_pagamento(cobranca_id, tipo_alerta, data_alerta);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_alertas_pagamento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS alertas_pagamento_updated_at ON alertas_pagamento;
CREATE TRIGGER alertas_pagamento_updated_at
  BEFORE UPDATE ON alertas_pagamento
  FOR EACH ROW
  EXECUTE FUNCTION update_alertas_pagamento_updated_at();

-- RLS (Row Level Security)
ALTER TABLE alertas_pagamento ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem alertas da própria empresa
DROP POLICY IF EXISTS "Usuários veem alertas da própria empresa" ON alertas_pagamento;
CREATE POLICY "Usuários veem alertas da própria empresa"
  ON alertas_pagamento FOR SELECT
  USING (
    cobranca_id IN (
      SELECT c.id FROM cobrancas c
      INNER JOIN projects p ON p.id = c.project_id
      WHERE p.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Policy: Sistema pode inserir alertas
DROP POLICY IF EXISTS "Sistema pode inserir alertas" ON alertas_pagamento;
CREATE POLICY "Sistema pode inserir alertas"
  ON alertas_pagamento FOR INSERT
  WITH CHECK (TRUE); -- Permitir inserção via funções SECURITY DEFINER

-- Policy: Usuários podem atualizar seus alertas
DROP POLICY IF EXISTS "Usuários podem atualizar alertas da própria empresa" ON alertas_pagamento;
CREATE POLICY "Usuários podem atualizar alertas da própria empresa"
  ON alertas_pagamento FOR UPDATE
  USING (
    cobranca_id IN (
      SELECT c.id FROM cobrancas c
      INNER JOIN projects p ON p.id = c.project_id
      WHERE p.empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Comentários
COMMENT ON TABLE alertas_pagamento IS 'Alertas de vencimento de cobranças (5 dias antes, 1 dia antes, vencido)';
COMMENT ON COLUMN alertas_pagamento.tipo_alerta IS 'Tipo de alerta: 5_dias_antes, 1_dia_antes, vencido';
COMMENT ON COLUMN alertas_pagamento.status IS 'Status: pendente, enviado, lido, ignorado';
COMMENT ON COLUMN alertas_pagamento.metodo_envio IS 'Métodos de envio do alerta: popup, email, sms';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Tabela alertas_pagamento criada
-- ✅ Índices e constraints criados
-- ✅ RLS policies configuradas
-- ✅ Trigger updated_at criado
