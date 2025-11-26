-- =============================================
-- Add avatar support to entities
-- =============================================

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS avatar_source text;

COMMENT ON COLUMN public.entities.avatar_url IS 'URL da foto de perfil (upload ou fetch externo)';
COMMENT ON COLUMN public.entities.avatar_source IS 'Origem da foto (upload, whatsapp, etc)';
