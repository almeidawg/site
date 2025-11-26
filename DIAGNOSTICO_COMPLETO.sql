-- =============================================
-- DIAGNÓSTICO COMPLETO DO BANCO DE DADOS
-- =============================================

-- 1. Verificar todas as tabelas no schema public
SELECT '=== TODAS AS TABELAS ===' as info;
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar especificamente as tabelas financeiras
SELECT '=== TABELAS FINANCEIRAS ===' as info;
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cobrancas')
    THEN '✓ cobrancas EXISTE'
    ELSE '✗ cobrancas NÃO EXISTE'
  END as status
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'solicitacoes_pagamento')
    THEN '✓ solicitacoes_pagamento EXISTE'
    ELSE '✗ solicitacoes_pagamento NÃO EXISTE'
  END
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categorias_custo')
    THEN '✓ categorias_custo EXISTE'
    ELSE '✗ categorias_custo NÃO EXISTE'
  END
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comissoes')
    THEN '✓ comissoes EXISTE'
    ELSE '✗ comissoes NÃO EXISTE'
  END
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'catalog_items')
    THEN '✓ catalog_items EXISTE'
    ELSE '✗ catalog_items NÃO EXISTE'
  END
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reembolsos')
    THEN '✓ reembolsos EXISTE'
    ELSE '✗ reembolsos NÃO EXISTE'
  END
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fin_categories')
    THEN '✓ fin_categories EXISTE'
    ELSE '✗ fin_categories NÃO EXISTE'
  END;

-- 3. Verificar colunas da tabela entities
SELECT '=== COLUNAS DA TABELA ENTITIES ===' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'entities'
ORDER BY ordinal_position;

-- 4. Verificar colunas da tabela obras
SELECT '=== COLUNAS DA TABELA OBRAS ===' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'obras'
ORDER BY ordinal_position;

-- 5. Recarregar schema cache
NOTIFY pgrst, 'reload schema';
SELECT 'Schema cache reload solicitado' as resultado;
