-- Verificar todas as tabelas do módulo financeiro

SELECT
  table_name,
  CASE
    WHEN table_name IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories')
    THEN '✓ EXISTE'
    ELSE '  existe'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'cobrancas',
    'solicitacoes_pagamento',
    'categorias_custo',
    'comissoes',
    'catalog_items',
    'reembolsos',
    'fin_categories',
    'obras',
    'entities'
  )
ORDER BY table_name;

-- Verificar colunas especiais
SELECT
  '✓ obras.nome' as coluna_alias
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'obras'
  AND column_name = 'nome'
)
UNION ALL
SELECT
  '✓ entities.nome_razao_social' as coluna_alias
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'entities'
  AND column_name = 'nome_razao_social'
);
