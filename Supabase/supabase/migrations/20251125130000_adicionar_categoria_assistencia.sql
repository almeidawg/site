-- =============================================
-- Migration: Adicionar campo categoria em assistências
-- Data: 2025-11-25
-- Descrição: Adiciona categoria para classificar tipos de assistência
-- =============================================

-- Adicionar coluna categoria à tabela assistencias
ALTER TABLE IF EXISTS public.assistencias
  ADD COLUMN IF NOT EXISTS categoria text;

-- Criar índice para facilitar buscas por categoria
CREATE INDEX IF NOT EXISTS idx_assistencias_categoria
  ON public.assistencias(categoria);

-- Adicionar comentário
COMMENT ON COLUMN public.assistencias.categoria IS
  'Categoria da assistência (ex: hidráulica, elétrica, marcenaria, pintura, etc)';

-- Popular com algumas categorias padrão (opcional - você pode remover se não quiser valores default)
-- UPDATE public.assistencias
-- SET categoria = 'geral'
-- WHERE categoria IS NULL;
