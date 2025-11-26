-- =============================================
-- Migration: Adicionar avatar e correções no módulo Pessoas/Entities
-- Data: 2025-11-26
-- Descrição:
--   1. Adiciona coluna avatar_url à tabela entities
--   2. Cria bucket de storage para avatars de entities
--   3. Configura políticas de acesso (RLS)
--   4. Corrige campos nullable/obrigatórios conforme uso real
-- =============================================

-- =============================================
-- PARTE 1: Adicionar coluna avatar_url
-- =============================================

-- Adicionar coluna avatar_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'entities'
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.entities ADD COLUMN avatar_url TEXT;

        -- Comentário descritivo
        COMMENT ON COLUMN public.entities.avatar_url IS
            'URL pública do avatar armazenado no Supabase Storage (bucket: avatars-entities)';
    END IF;
END $$;

-- Criar índice para busca rápida (apenas registros com avatar)
CREATE INDEX IF NOT EXISTS idx_entities_avatar
ON public.entities(id)
WHERE avatar_url IS NOT NULL;

-- =============================================
-- PARTE 2: Criar bucket de Storage
-- =============================================

-- Inserir bucket para avatars de entities (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars-entities',
    'avatars-entities',
    true,  -- Público para facilitar acesso
    2097152,  -- 2MB máximo por arquivo
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- =============================================
-- PARTE 3: Políticas de Storage (RLS)
-- =============================================

-- Policy 1: Usuários autenticados podem fazer upload
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de avatars"
ON storage.objects;

CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars-entities');

-- Policy 2: Avatars são públicos para leitura
DROP POLICY IF EXISTS "Avatars de entities são públicos para leitura"
ON storage.objects;

CREATE POLICY "Avatars de entities são públicos para leitura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars-entities');

-- Policy 3: Apenas criadores podem deletar seus avatars
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatars"
ON storage.objects;

CREATE POLICY "Usuários podem deletar seus próprios avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars-entities' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Atualização (sobrescrever arquivo)
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatars"
ON storage.objects;

CREATE POLICY "Usuários podem atualizar seus próprios avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars-entities' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars-entities');

-- =============================================
-- PARTE 4: Correções de Schema - Campos Nullable
-- =============================================

-- Garantir que campos opcionais sejam NULL-able
-- (Ajustes baseados no uso real do formulário)

-- Email: opcional
ALTER TABLE public.entities
ALTER COLUMN email DROP NOT NULL;

-- Telefone: opcional
ALTER TABLE public.entities
ALTER COLUMN telefone DROP NOT NULL;

-- CPF/CNPJ: obrigatório mantém
-- RG/IE: opcional
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'entities'
        AND column_name = 'rg_ie'
    ) THEN
        ALTER TABLE public.entities ALTER COLUMN rg_ie DROP NOT NULL;
    END IF;
END $$;

-- Endereço: JSONB, sempre aceita null ou objeto vazio
-- Observações: opcional
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'entities'
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE public.entities ALTER COLUMN observacoes DROP NOT NULL;
    END IF;
END $$;

-- =============================================
-- PARTE 5: Função Helper - Obter Avatar URL
-- =============================================

-- Função para obter URL pública do avatar de uma entity
CREATE OR REPLACE FUNCTION public.get_entity_avatar_url(entity_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_avatar_url TEXT;
BEGIN
    SELECT avatar_url INTO v_avatar_url
    FROM public.entities
    WHERE id = entity_id;

    RETURN v_avatar_url;
END;
$$;

COMMENT ON FUNCTION public.get_entity_avatar_url IS
    'Retorna a URL pública do avatar de uma entity (cliente/fornecedor/colaborador)';

-- =============================================
-- PARTE 6: Trigger - Limpar avatar ao deletar entity
-- =============================================

-- Função trigger para limpar arquivo de avatar ao deletar entity
CREATE OR REPLACE FUNCTION public.cleanup_entity_avatar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_file_path TEXT;
BEGIN
    -- Se tinha avatar, tentar deletar do storage
    IF OLD.avatar_url IS NOT NULL THEN
        -- Extrair path do arquivo da URL
        -- Exemplo: https://[...]/storage/v1/object/public/avatars-entities/uuid/arquivo.png
        -- Queremos apenas: uuid/arquivo.png
        v_file_path := substring(OLD.avatar_url from 'avatars-entities/(.+)$');

        IF v_file_path IS NOT NULL THEN
            -- Deletar arquivo do storage (ignora erro se não existir)
            PERFORM storage.delete_object('avatars-entities', v_file_path);
        END IF;
    END IF;

    RETURN OLD;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_cleanup_entity_avatar ON public.entities;

CREATE TRIGGER trg_cleanup_entity_avatar
BEFORE DELETE ON public.entities
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_entity_avatar();

COMMENT ON TRIGGER trg_cleanup_entity_avatar ON public.entities IS
    'Limpa arquivo de avatar do storage ao deletar entity';

-- =============================================
-- PARTE 7: Grants de Permissão
-- =============================================

-- Garantir que authenticated users tenham acesso
GRANT SELECT, INSERT, UPDATE ON public.entities TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- =============================================
-- PARTE 8: Validação e Logs
-- =============================================

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE 'Migration 20251126000000_add_avatar_to_entities executada com sucesso!';
    RAISE NOTICE '✅ Coluna avatar_url adicionada';
    RAISE NOTICE '✅ Bucket avatars-entities criado';
    RAISE NOTICE '✅ Políticas de Storage configuradas';
    RAISE NOTICE '✅ Schema corrigido (campos nullable)';
    RAISE NOTICE '✅ Trigger de limpeza criado';
END $$;

-- Verificação final
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'entities'
            AND column_name = 'avatar_url'
        ) THEN '✅ avatar_url existe'
        ELSE '❌ avatar_url NÃO existe'
    END AS status_avatar,

    CASE
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets
            WHERE id = 'avatars-entities'
        ) THEN '✅ bucket existe'
        ELSE '❌ bucket NÃO existe'
    END AS status_bucket;
