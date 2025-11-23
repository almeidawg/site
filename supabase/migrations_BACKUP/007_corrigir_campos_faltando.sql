-- =============================================
-- MIGRATION: 007
-- Descrição: Corrigir campos faltando em tabelas existentes
-- Data: 2025-10-30
-- Autor: Equipe WG
-- =============================================
-- Alterações:
--   - Adicionar campo 'apelido' em contas_financeiras
--   - Adicionar campo 'empresa_id' em plano_contas
--   - Adicionar campo 'empresa_id' em centros_custo
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. ADICIONAR CAMPOS em contas_financeiras
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE contas_financeiras
ADD COLUMN IF NOT EXISTS apelido TEXT;

COMMENT ON COLUMN contas_financeiras.apelido IS 'Nome amigável para identificação rápida da conta (ex: "Conta Principal Santander")';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. ADICIONAR CAMPOS em plano_contas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE plano_contas
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;

-- Índice
CREATE INDEX IF NOT EXISTS idx_plano_contas_empresa ON plano_contas(empresa_id);

COMMENT ON COLUMN plano_contas.empresa_id IS 'Empresa dona do plano de contas (NULL = compartilhado entre todas)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. ADICIONAR CAMPOS em centros_custo
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE centros_custo
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;

-- Índice
CREATE INDEX IF NOT EXISTS idx_centros_custo_empresa ON centros_custo(empresa_id);

COMMENT ON COLUMN centros_custo.empresa_id IS 'Empresa dona do centro de custo (NULL = compartilhado entre todas)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. ATUALIZAR DADOS EXISTENTES (opcional)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Gerar apelidos para contas existentes (se houver)
UPDATE contas_financeiras
SET apelido = banco || ' - ' || COALESCE(agencia, 'S/A') || '/' || conta
WHERE apelido IS NULL;

-- Se quiser vincular plano de contas/centros custo à primeira empresa:
-- UPDATE plano_contas SET empresa_id = (SELECT id FROM empresas LIMIT 1) WHERE empresa_id IS NULL;
-- UPDATE centros_custo SET empresa_id = (SELECT id FROM empresas LIMIT 1) WHERE empresa_id IS NULL;
