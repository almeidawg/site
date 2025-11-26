-- DIAGNÓSTICO: Verificar estado atual da tabela fin_categories

-- 1. Verificar se a tabela existe
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fin_categories')
    THEN '✓ Tabela fin_categories EXISTE'
    ELSE '✗ Tabela fin_categories NÃO EXISTE'
  END as status_tabela;

-- 2. Listar TODAS as colunas da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'fin_categories'
ORDER BY ordinal_position;

-- 3. Verificar índices existentes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'fin_categories';
