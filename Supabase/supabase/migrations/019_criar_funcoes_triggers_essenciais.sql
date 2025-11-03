-- =============================================
-- Migration: Funções e Triggers Essenciais do Sistema
-- Data: 2025-11-03
-- Descrição: Cria funções helpers e triggers fundamentais
-- =============================================

-- =============================================
-- 1. FUNÇÃO: handle_new_user
-- Cria profile automaticamente ao cadastrar usuário
-- NOTA: Trigger deve ser criado manualmente no Dashboard
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
-- 2. FUNÇÕES HELPER: Auth Context
-- Funções para acessar contexto do usuário autenticado
-- =============================================

-- current_user_id: Retorna UUID do usuário autenticado
DROP FUNCTION IF EXISTS current_user_id() CASCADE;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT auth.uid();
$$;

COMMENT ON FUNCTION current_user_id IS 'Retorna o UUID do usuário autenticado';

-- current_user_email: Retorna email do usuário autenticado
DROP FUNCTION IF EXISTS current_user_email() CASCADE;

CREATE OR REPLACE FUNCTION current_user_email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT auth.jwt()->>'email';
$$;

COMMENT ON FUNCTION current_user_email IS 'Retorna o email do usuário autenticado';

-- current_user_role: Retorna role do usuário autenticado
DROP FUNCTION IF EXISTS current_user_role() CASCADE;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT auth.role();
$$;

COMMENT ON FUNCTION current_user_role IS 'Retorna o role do usuário autenticado';

-- =============================================
-- 3. FUNÇÃO HELPER: current_empresa_id
-- Retorna empresa do usuário (para multi-tenancy)
-- =============================================

DROP FUNCTION IF EXISTS current_empresa_id() CASCADE;

CREATE OR REPLACE FUNCTION current_empresa_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_empresa_id uuid;
BEGIN
    -- Buscar empresa_id do profile do usuário
    SELECT empresa_id INTO v_empresa_id
    FROM profiles
    WHERE id = auth.uid();

    RETURN v_empresa_id;
END;
$$;

COMMENT ON FUNCTION current_empresa_id IS 'Retorna o UUID da empresa do usuário autenticado';

-- =============================================
-- 4. FUNÇÃO HELPER: has_role
-- Verifica se usuário tem determinado cargo/role
-- =============================================

DROP FUNCTION IF EXISTS has_role(text) CASCADE;

CREATE OR REPLACE FUNCTION has_role(p_role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_user_cargo text;
BEGIN
    -- Buscar cargo do profile
    SELECT cargo INTO v_user_cargo
    FROM profiles
    WHERE id = auth.uid();

    -- Verificar se cargo corresponde
    RETURN v_user_cargo = p_role OR v_user_cargo = 'admin';
END;
$$;

COMMENT ON FUNCTION has_role IS 'Verifica se usuário tem determinado cargo ou é admin';

-- =============================================
-- 5. FUNÇÃO HELPER: is_admin
-- Verifica se usuário é admin
-- =============================================

DROP FUNCTION IF EXISTS is_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT has_role('admin');
$$;

COMMENT ON FUNCTION is_admin IS 'Verifica se usuário é admin';

-- =============================================
-- 6. FUNÇÃO HELPER: get_jwt_claim
-- Extrai claim específico do JWT
-- =============================================

DROP FUNCTION IF EXISTS get_jwt_claim(text) CASCADE;

CREATE OR REPLACE FUNCTION get_jwt_claim(claim_name text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT auth.jwt()->>claim_name;
$$;

COMMENT ON FUNCTION get_jwt_claim IS 'Extrai valor de um claim específico do JWT';

-- =============================================
-- RESUMO
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Funções de triggers e helpers criadas:';
    RAISE NOTICE '  - handle_new_user() - Criar profile ao cadastrar';
    RAISE NOTICE '  - current_user_id() - UUID do usuário';
    RAISE NOTICE '  - current_user_email() - Email do usuário';
    RAISE NOTICE '  - current_user_role() - Role do usuário';
    RAISE NOTICE '  - current_empresa_id() - Empresa do usuário';
    RAISE NOTICE '  - has_role(role) - Verifica cargo';
    RAISE NOTICE '  - is_admin() - Verifica se é admin';
    RAISE NOTICE '  - get_jwt_claim(name) - Extrai claim do JWT';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE: Criar trigger para handle_new_user via Dashboard:';
    RAISE NOTICE '   Table: auth.users | Event: INSERT | Function: handle_new_user()';
END;
$$;