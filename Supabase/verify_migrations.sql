-- =============================================
-- Verificação das Migrations Aplicadas
-- Data: 2025-11-26
-- =============================================

-- 1. Verificar tabelas criadas
SELECT 'TABELAS:' as tipo, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cobrancas', 'pricelist', 'project_team', 'project_shares', 'solicitacoes_pagamento', 'reembolsos', 'plano_contas', 'categorias_financeiras')
ORDER BY table_name;

-- 2. Verificar VIEWs criadas
SELECT 'VIEWS:' as tipo, table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('v_entities_compat', 'catalog_items', 'categorias_custo', 'fin_categories', 'v_precos_atuais', 'v_project_team_completo')
ORDER BY table_name;

-- 3. Verificar funções criadas
SELECT 'FUNCOES:' as tipo, routine_name as function_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('add_member_to_project', 'remove_member_from_project', 'create_project_share', 'calc_margem_pricelist')
ORDER BY routine_name;

-- 4. Verificar campos adicionados em entities
SELECT 'CAMPOS ENTITIES:' as tipo, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'entities'
  AND column_name IN ('tipo_pessoa', 'nome_fantasia', 'rg_ie', 'logradouro', 'numero', 'complemento', 'bairro', 'observacoes', 'avatar_url', 'avatar_source', 'obra_mesmo_endereco', 'endereco_obra')
ORDER BY column_name;

-- 5. Verificar campos adicionados em produtos_servicos
SELECT 'CAMPOS PRODUTOS_SERVICOS:' as tipo, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'produtos_servicos'
  AND column_name IN ('descricao_detalhada', 'unidade_medida', 'codigo_interno', 'categoria', 'ativo', 'estoque_minimo', 'estoque_atual', 'fornecedor_id', 'imagem_url', 'tags')
ORDER BY column_name;

-- 6. Verificar campo name em projects
SELECT 'CAMPO NAME PROJECTS:' as tipo, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
  AND column_name = 'name';
