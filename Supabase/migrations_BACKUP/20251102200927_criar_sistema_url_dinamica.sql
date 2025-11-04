-- =============================================
-- Migration: Sistema de URL Dinâmica
-- Descrição: Cria tabela app_config e função get_api_url()
--            para detectar automaticamente ambiente LOCAL/LIVE
-- Objetivo: Edge Functions podem buscar URL sem hardcode
-- Benefício: Deploy sem preocupação com URLs
-- Criado: 02/11/2025
-- =============================================

-- =============================================
-- 1. TABELA DE CONFIGURAÇÃO
-- =============================================

-- Criar tabela para armazenar configurações do app
CREATE TABLE IF NOT EXISTS public.app_config (
    key text PRIMARY KEY,
    value text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Comentário
COMMENT ON TABLE public.app_config IS
    'Configurações gerais do aplicativo (ambiente, URLs, features flags, etc)';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_app_config_updated_at ON public.app_config;
CREATE TRIGGER update_app_config_updated_at
    BEFORE UPDATE ON public.app_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão (LOCAL)
-- IMPORTANTE: Ao fazer deploy em LIVE, rodar UPDATE para mudar valores!
INSERT INTO public.app_config (key, value, description)
VALUES
    ('environment', 'local', 'Ambiente atual: local ou live'),
    ('api_url', 'http://127.0.0.1:54321', 'URL base da API Supabase'),
    ('project_id', 'WG', 'Project ID do Supabase'),
    ('version', '1.0.0', 'Versão do sistema')
ON CONFLICT (key) DO NOTHING; -- Não sobrescrever se já existe

-- =============================================
-- 2. FUNÇÃO get_api_url()
-- =============================================

-- Dropar versões antigas se existirem
DROP FUNCTION IF EXISTS public.get_api_url();

-- Criar função que retorna URL baseada no ambiente
CREATE OR REPLACE FUNCTION public.get_api_url()
RETURNS text
LANGUAGE plpgsql
STABLE -- Resultado pode ser cacheado durante a query
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_api_url text;
BEGIN
    -- Buscar URL da tabela de configuração
    SELECT value INTO v_api_url
    FROM app_config
    WHERE key = 'api_url';

    -- Se não encontrou, retornar LIVE como fallback
    IF v_api_url IS NULL THEN
        v_api_url := 'https://vyxscnevgeubfgfstmtf.supabase.co';
    END IF;

    RETURN v_api_url;

EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar LIVE como fallback seguro
        RAISE LOG 'Erro em get_api_url: %', SQLERRM;
        RETURN 'https://vyxscnevgeubfgfstmtf.supabase.co';
END;
$$;

COMMENT ON FUNCTION public.get_api_url IS
    'Retorna URL da API Supabase baseado no ambiente (local ou live). Usada em Edge Functions para deploy sem preocupação.';

-- =============================================
-- 3. FUNÇÃO get_environment()
-- =============================================

-- Função auxiliar para checar ambiente
DROP FUNCTION IF EXISTS public.get_environment();

CREATE OR REPLACE FUNCTION public.get_environment()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_environment text;
BEGIN
    SELECT value INTO v_environment
    FROM app_config
    WHERE key = 'environment';

    -- Default: live
    IF v_environment IS NULL THEN
        v_environment := 'live';
    END IF;

    RETURN v_environment;

EXCEPTION
    WHEN OTHERS THEN
        RETURN 'live';
END;
$$;

COMMENT ON FUNCTION public.get_environment IS
    'Retorna ambiente atual: local ou live';

-- =============================================
-- 4. FUNÇÃO is_local_environment()
-- =============================================

-- Helper booleano para checar se é local
DROP FUNCTION IF EXISTS public.is_local_environment();

CREATE OR REPLACE FUNCTION public.is_local_environment()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT get_environment() = 'local');
END;
$$;

COMMENT ON FUNCTION public.is_local_environment IS
    'Retorna true se ambiente é local, false se live';

-- =============================================
-- 5. PERMISSÕES
-- =============================================

-- Permitir leitura para usuários autenticados
GRANT SELECT ON public.app_config TO authenticated;
GRANT SELECT ON public.app_config TO anon;

-- Funções podem ser chamadas por qualquer usuário
GRANT EXECUTE ON FUNCTION public.get_api_url() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_api_url() TO anon;
GRANT EXECUTE ON FUNCTION public.get_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_environment() TO anon;
GRANT EXECUTE ON FUNCTION public.is_local_environment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_local_environment() TO anon;

-- =============================================
-- 6. TESTES (executar manualmente)
-- =============================================

-- Testar funções:
-- SELECT get_api_url();         -- Deve retornar: http://127.0.0.1:54321 (local)
-- SELECT get_environment();     -- Deve retornar: local
-- SELECT is_local_environment(); -- Deve retornar: true

-- =============================================
-- 7. INSTRUÇÕES PARA DEPLOY EM LIVE
-- =============================================

/*
Quando fazer deploy em LIVE, execute:

UPDATE app_config
SET value = 'live'
WHERE key = 'environment';

UPDATE app_config
SET value = 'https://vyxscnevgeubfgfstmtf.supabase.co'
WHERE key = 'api_url';

UPDATE app_config
SET value = 'vyxscnevgeubfgfstmtf'
WHERE key = 'project_id';

-- Verificar:
SELECT get_api_url();         -- Deve retornar: https://vyxscnevgeubfgfstmtf.supabase.co
SELECT get_environment();     -- Deve retornar: live
SELECT is_local_environment(); -- Deve retornar: false
*/

-- =============================================
-- FIM DA MIGRATION
-- =============================================
