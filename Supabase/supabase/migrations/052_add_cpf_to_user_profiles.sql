-- =============================================
-- MIGRATION: 052
-- Descrição: Adicionar suporte a CPF e campos auxiliares para usuários
-- Data: 2025-11-27
-- Autor: Codex
-- =============================================

-- Esse migration prepara os perfis para login por CPF e rastreio de permissões.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cpf TEXT;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS cpf_normalized TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_cpf_normalized
  ON public.user_profiles (cpf_normalized);

COMMENT ON COLUMN public.user_profiles.cpf IS 'CPF oficial associado ao perfil';
COMMENT ON COLUMN public.user_profiles.cpf_normalized IS 'CPF apenas com dígitos (utilizado para busca e login)';

