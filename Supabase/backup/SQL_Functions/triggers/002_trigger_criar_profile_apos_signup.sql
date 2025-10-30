-- =============================================
-- TRIGGER: Criar profile após signup
-- Descrição: Quando um usuário se registra (auth.users),
--            cria automaticamente um registro em profiles
-- Tabela: auth.users (AFTER INSERT)
-- Criado: 2025-10-30
-- =============================================

-- Função do trigger
DROP FUNCTION IF EXISTS trigger_criar_profile_apos_signup() CASCADE;

CREATE OR REPLACE FUNCTION trigger_criar_profile_apos_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    avatar_url
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Criar perfil padrão (readonly)
  INSERT INTO public.usuarios_perfis (
    user_id,
    perfil,
    permissoes
  ) VALUES (
    NEW.id,
    'readonly',
    '{"can_view": true, "can_edit": false}'::jsonb
  );

  RAISE NOTICE 'Profile criado para usuário: % (%)', NEW.email, NEW.id;

  RETURN NEW;
END;
$$;

-- Criar trigger (necessita permissão SUPERUSER)
-- ⚠️ EXECUTAR MANUALMENTE NO SUPABASE DASHBOARD
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_criar_profile_apos_signup();
*/

COMMENT ON FUNCTION trigger_criar_profile_apos_signup() IS
'Cria automaticamente profile em public.profiles quando usuário faz signup';


-- ==========================================
-- NOTA IMPORTANTE
-- ==========================================
/*
Este trigger opera na tabela auth.users, que requer permissões especiais.

Para criar o trigger:
1. Acesse Supabase Dashboard → SQL Editor
2. Execute o código SQL acima (comentado)
3. Ou use o seguinte via API:

await supabase.auth.admin.createUser({
  email: 'user@example.com',
  password: 'senha123',
  user_metadata: {
    nome: 'João Silva',
    avatar_url: 'https://...'
  }
});

O trigger irá:
1. Criar registro em profiles com nome e email
2. Criar perfil padrão (readonly) em usuarios_perfis
3. Usuário pode fazer login imediatamente
*/
