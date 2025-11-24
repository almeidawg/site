-- =============================================
-- Script: Criar Usuário Master
-- Email: william@wgalmeida.com.br
-- Projeto: WG CRM (vyxscnevgeubfgfstmtf)
-- Data: 2025-11-23
-- =============================================

-- PASSO 1: Verificar se usuário já existe
DO $$
DECLARE
    v_user_exists boolean;
    v_user_id uuid;
BEGIN
    -- Verificar existência
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'william@wgalmeida.com.br'
    ) INTO v_user_exists;

    IF v_user_exists THEN
        RAISE NOTICE 'Usuário já existe com email william@wgalmeida.com.br';

        -- Obter ID do usuário existente
        SELECT id INTO v_user_id
        FROM auth.users
        WHERE email = 'william@wgalmeida.com.br';

        -- Atualizar senha e confirmar email (caso não esteja confirmado)
        UPDATE auth.users
        SET
            encrypted_password = crypt('130300@$Wg', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = v_user_id;

        RAISE NOTICE 'Senha atualizada e email confirmado para usuário: %', v_user_id;
    ELSE
        RAISE NOTICE 'Criando novo usuário master...';

        -- Criar novo usuário
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token,
            raw_app_meta_data,
            raw_user_meta_data
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'william@wgalmeida.com.br',
            crypt('130300@$Wg', gen_salt('bf')),
            NOW(), -- Email já confirmado
            NOW(),
            NOW(),
            '', -- Sem token de confirmação (já confirmado)
            '',
            '',
            '',
            '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
            '{"name": "William", "role": "admin"}'::jsonb
        )
        RETURNING id INTO v_user_id;

        RAISE NOTICE 'Usuário criado com sucesso! ID: %', v_user_id;
    END IF;

    -- PASSO 2: Criar/Atualizar perfil do usuário (se tabela existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
        VALUES (
            v_user_id,
            'william@wgalmeida.com.br',
            'William Almeida',
            'admin',
            NOW(),
            NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = NOW();

        RAISE NOTICE 'Perfil criado/atualizado na tabela profiles';
    ELSE
        RAISE NOTICE 'Tabela profiles não existe - ignorando criação de perfil';
    END IF;

END $$;

-- PASSO 3: Verificar resultado
SELECT
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users
WHERE email = 'william@wgalmeida.com.br';

-- PASSO 4: Verificar perfil (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE 'Verificando perfil na tabela profiles:';
    END IF;
END $$;

SELECT
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
WHERE email = 'william@wgalmeida.com.br'
LIMIT 1;
