-- =============================================
-- RECARREGAR SCHEMA CACHE DO SUPABASE
-- =============================================
-- Execute este comando para forçar o Supabase a recarregar o cache do schema

NOTIFY pgrst, 'reload schema';

-- Verificar se as tabelas existem
SELECT
  schemaname,
  tablename,
  hasindexes,
  hastriggers,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'cobrancas',
    'solicitacoes_pagamento',
    'categorias_custo',
    'comissoes',
    'catalog_items',
    'reembolsos',
    'fin_categories'
  )
ORDER BY tablename;

-- Verificar se as colunas existem
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'obras' AND column_name = 'nome')
    OR (table_name = 'entities' AND column_name = 'nome_razao_social')
  )
ORDER BY table_name, column_name;
