-- =============================================
-- Migration: Corrigir tabela entities com todos campos necessários
-- Data: 2025-11-26
-- Objetivo: Adicionar campos faltantes + criar VIEW de compatibilidade
-- =============================================

-- Adicionar campos faltantes em entities
ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS tipo_pessoa TEXT CHECK (tipo_pessoa IN ('fisica', 'juridica')),
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
  ADD COLUMN IF NOT EXISTS rg_ie TEXT,
  ADD COLUMN IF NOT EXISTS logradouro TEXT,
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS complemento TEXT,
  ADD COLUMN IF NOT EXISTS bairro TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_source TEXT CHECK (avatar_source IN ('upload', 'google', 'gravatar')),
  ADD COLUMN IF NOT EXISTS obra_mesmo_endereco BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS endereco_obra JSONB;

-- Expandir CHECK constraint de tipo para incluir colaborador e especificador
ALTER TABLE public.entities DROP CONSTRAINT IF EXISTS entities_tipo_check;
ALTER TABLE public.entities
  ADD CONSTRAINT entities_tipo_check
  CHECK (tipo IN ('cliente', 'fornecedor', 'colaborador', 'especificador', 'prospect'));

-- Criar VIEW de compatibilidade para nome_razao_social
CREATE OR REPLACE VIEW public.v_entities_compat AS
SELECT
  id,
  tipo,
  nome,
  nome AS nome_razao_social,  -- ALIAS para compatibilidade com código antigo
  nome_fantasia,
  email,
  telefone,
  cpf_cnpj,
  rg_ie,
  cep,
  cidade,
  estado,
  logradouro,
  numero,
  complemento,
  bairro,
  tipo_pessoa,
  observacoes,
  avatar_url,
  avatar_source,
  obra_mesmo_endereco,
  endereco_obra,
  empresa_id,
  user_id,
  created_at,
  updated_at
FROM public.entities;

-- Comentários
COMMENT ON VIEW v_entities_compat IS 'VIEW de compatibilidade: expõe nome como nome_razao_social para queries antigas';
COMMENT ON COLUMN entities.avatar_url IS 'URL do avatar do usuário (storage ou externo)';
COMMENT ON COLUMN entities.avatar_source IS 'Origem do avatar: upload, google, gravatar';
COMMENT ON COLUMN entities.endereco_obra IS 'Endereço da obra se diferente do cadastral';
