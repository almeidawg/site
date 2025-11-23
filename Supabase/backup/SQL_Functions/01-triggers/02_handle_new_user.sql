-- =============================================
-- TRIGGER FUNCTION: handle_new_user
-- Descrição: Cria profile automaticamente ao cadastrar usuário
-- Uso: Trigger em auth.users (DEVE SER CRIADO NO DASHBOARD!)
-- =============================================

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email, cargo, ativo)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'cargo', 'usuário'),
        TRUE
    );
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_user IS 'Cria profile automaticamente quando usuário se cadastra';

-- =============================================
-- ⚠️ IMPORTANTE: CRIAR TRIGGER NO DASHBOARD
-- =============================================
-- Este trigger DEVE ser criado via Dashboard Supabase:
--
-- 1. Ir em: Database → Triggers
-- 2. Criar novo trigger:
--    - Table: auth.users
--    - Event: INSERT
--    - Function: handle_new_user()
--
-- NÃO PODE ser criado via migration pois acessa schema 'auth'!
-- =============================================
