-- =============================================
-- Migration: Atualizar tipos da tabela entities
-- Data: 2025-11-24
-- Descrição: Adiciona tipos 'colaborador' e 'especificador'
-- =============================================

BEGIN;

-- 1. Remover constraint antiga
ALTER TABLE IF EXISTS public.entities
  DROP CONSTRAINT IF EXISTS entities_tipo_check;

-- 2. Adicionar nova constraint com todos os tipos
ALTER TABLE public.entities
  ADD CONSTRAINT entities_tipo_check
  CHECK (tipo IN ('cliente', 'lead', 'fornecedor', 'colaborador', 'especificador'));

-- 3. Adicionar campos adicionais para dados estruturados (se não existirem)
ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
  ADD COLUMN IF NOT EXISTS rg_ie TEXT,
  ADD COLUMN IF NOT EXISTS logradouro TEXT,
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS complemento TEXT,
  ADD COLUMN IF NOT EXISTS bairro TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS tipo_pessoa VARCHAR(2) DEFAULT 'PF' CHECK (tipo_pessoa IN ('PF', 'PJ'));

-- 4. Criar índices para novos campos
CREATE INDEX IF NOT EXISTS idx_entities_tipo_pessoa ON entities(tipo_pessoa);
CREATE INDEX IF NOT EXISTS idx_entities_nome_fantasia ON entities(nome_fantasia) WHERE nome_fantasia IS NOT NULL;

-- 5. Comentários para documentação
COMMENT ON COLUMN entities.tipo IS 'Tipo da entidade: cliente, lead, fornecedor, colaborador, especificador';
COMMENT ON COLUMN entities.tipo_pessoa IS 'PF = Pessoa Física, PJ = Pessoa Jurídica';
COMMENT ON COLUMN entities.nome_fantasia IS 'Nome fantasia (apenas para PJ)';
COMMENT ON COLUMN entities.rg_ie IS 'RG para PF ou Inscrição Estadual para PJ';
COMMENT ON COLUMN entities.dados IS 'Dados adicionais em formato JSONB (flexível para cada tipo)';

COMMIT;
