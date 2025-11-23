-- =============================================
-- Migration: Instalar Extensões Essenciais
-- Data: 2025-11-03
-- Descrição: Instala extensões necessárias para o sistema
-- =============================================

-- =============================================
-- 1. pg_trgm - Similaridade de Texto
-- =============================================
-- Necessária para: busca fuzzy, similaridade, autocomplete

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

COMMENT ON EXTENSION pg_trgm IS 'Módulo de trigrama para busca por similaridade de texto';

-- =============================================
-- 2. unaccent - Remover Acentos
-- =============================================
-- Útil para: normalizar buscas, ignorar acentos

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

COMMENT ON EXTENSION unaccent IS 'Dicionário de remoção de acentos para busca de texto';

-- =============================================
-- 3. postgres_fdw - Foreign Data Wrapper (opcional)
-- =============================================
-- Útil para: conectar a outros bancos PostgreSQL
-- Descomente se necessário:
-- CREATE EXTENSION IF NOT EXISTS postgres_fdw WITH SCHEMA extensions;

-- =============================================
-- Verificar extensões instaladas
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Extensões instaladas com sucesso:';
    RAISE NOTICE '✅ pg_trgm - Busca por similaridade';
    RAISE NOTICE '✅ unaccent - Normalização de acentos';
END;
$$;