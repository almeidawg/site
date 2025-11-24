-- =============================================
-- 7. Verificar estrutura criada
-- =============================================

-- Listar tabelas criadas
SELECT
  'Tabela' as tipo,
  table_name as nome,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('usuarios_perfis', 'user_profiles', 'propostas', 'storage_items', 'kanban_cards', 'kanban_colunas')
ORDER BY nome;

-- Listar views criadas
SELECT
  'View' as tipo,
  table_name as nome
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('v_kanban_cards_board', 'v_clientes_ativos_contratos')
ORDER BY nome;

-- Verificar colunas da storage_items
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'storage_items'
ORDER BY ordinal_position;
