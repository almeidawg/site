-- =============================================
-- MIGRATION: 013
-- Descrição: Criar bucket storage para registros de trabalho
-- Data: 2025-11-02
-- Autor: Supabase MCP Expert
-- =============================================
-- O que será criado:
--   - Bucket 'registros' (para anexos de registros_trabalho)
--   - Políticas de acesso ao bucket
-- =============================================


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CRIAR BUCKET STORAGE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'registros',
  'registros',
  false, -- Não público (requer autenticação)
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS 'Bucket para armazenar anexos de registros de trabalho';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. POLÍTICAS DE ACESSO (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Habilitar RLS no bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem fazer upload
DROP POLICY IF EXISTS "Usuários podem fazer upload em registros" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload em registros"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'registros');

-- Policy: Usuários autenticados podem visualizar seus próprios uploads
DROP POLICY IF EXISTS "Usuários podem ver seus uploads em registros" ON storage.objects;
CREATE POLICY "Usuários podem ver seus uploads em registros"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'registros' AND auth.uid() = owner);

-- Policy: Admins podem ver todos os arquivos
DROP POLICY IF EXISTS "Admins podem ver todos arquivos em registros" ON storage.objects;
CREATE POLICY "Admins podem ver todos arquivos em registros"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'registros'
  AND EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);

-- Policy: Usuários podem deletar seus próprios uploads
DROP POLICY IF EXISTS "Usuários podem deletar seus uploads em registros" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus uploads em registros"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'registros' AND auth.uid() = owner);

-- Policy: Admins podem deletar qualquer arquivo
DROP POLICY IF EXISTS "Admins podem deletar qualquer arquivo em registros" ON storage.objects;
CREATE POLICY "Admins podem deletar qualquer arquivo em registros"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'registros'
  AND EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION 013
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
