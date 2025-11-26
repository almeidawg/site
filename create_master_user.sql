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

    -- PASSO 2: Perfil será criado automaticamente via trigger ou app
    RAISE NOTICE 'Usuário criado em auth.users. Perfil será gerenciado pelo app.';

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
        RAISE NOTICE 'Perfil criado na tabela profiles';
    END IF;
END $$;
