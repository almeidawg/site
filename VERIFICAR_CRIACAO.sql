-- Verificar se as tabelas foram criadas
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cobrancas', 'solicitacoes_pagamento', 'categorias_custo', 'comissoes', 'catalog_items', 'reembolsos', 'fin_categories')
ORDER BY tablename;
