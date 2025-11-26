-- =============================================
-- Migration: Supabase Storage - Bucket Avatars
-- Data: 2025-11-26
-- Descrição: Cria bucket para armazenar avatars de usuários e entities
--            com políticas de segurança (RLS)
-- =============================================

BEGIN;

-- =============================================
-- 1. CRIAR BUCKET
-- =============================================

-- Criar bucket 'avatars' (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. POLÍTICAS DE ACESSO (RLS)
-- =============================================

-- Policy: Qualquer usuário autenticado pode FAZER UPLOAD
DROP POLICY IF EXISTS "Usuários podem fazer upload de avatars" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
  );

-- Policy: Qualquer pessoa pode VISUALIZAR avatars (público)
DROP POLICY IF EXISTS "Avatars são públicos" ON storage.objects;
CREATE POLICY "Avatars são públicos"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'avatars'
  );

-- Policy: Apenas o dono pode ATUALIZAR seu avatar
DROP POLICY IF EXISTS "Usuários podem atualizar próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem atualizar próprios avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Policy: Apenas o dono pode DELETAR seu avatar
DROP POLICY IF EXISTS "Usuários podem deletar próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem deletar próprios avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- =============================================
-- 3. FUNÇÃO AUXILIAR: Limpar avatars antigos
-- =============================================

CREATE OR REPLACE FUNCTION limpar_avatars_antigos(p_entity_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_file RECORD;
BEGIN
  -- Buscar todos os arquivos do entity (menos o mais recente)
  FOR v_file IN
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'avatars'
    AND name LIKE p_entity_id || '%'
    ORDER BY created_at DESC
    OFFSET 1
  LOOP
    -- Deletar arquivo antigo
    DELETE FROM storage.objects
    WHERE bucket_id = 'avatars'
    AND name = v_file.name;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION limpar_avatars_antigos IS 'Remove avatars antigos mantendo apenas o mais recente por entity';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Bucket 'avatars' criado e público
-- ✅ RLS configurado (usuários autenticados podem upload)
-- ✅ Avatars são públicos para visualização
-- ✅ Apenas dono pode atualizar/deletar
