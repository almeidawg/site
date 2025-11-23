
-- =====================================================================
-- ARQUIVO DE AUDITORIA E DIAGNÓSTICO DO BANCO DE DADOS
-- Foco: Integridade, Estrutura e Dados Órfãos
-- =====================================================================

-- =====================================================================
-- SEÇÃO 1: DOCUMENTAÇÃO DA ESTRUTURA
-- Queries para entender o schema atual do banco de dados.
-- =====================================================================

-- Query 1.1: Listar todas as tabelas no schema 'public'
-- Ajuda a ter uma visão geral de todas as entidades de dados.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Query 1.2: Detalhar colunas, tipos de dados e nulidade para uma tabela específica
-- Substitua 'entities' pelo nome da tabela que deseja inspecionar.
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'entities'
ORDER BY ordinal_position;

-- Query 1.3: Listar todas as chaves estrangeiras (Foreign Keys)
-- Essencial para entender os relacionamentos entre as tabelas e garantir a integridade referencial.
SELECT
    kcu.table_name AS foreign_table,
    kcu.column_name AS foreign_column,
    ccu.table_name AS primary_table,
    ccu.column_name AS primary_column,
    kcu.constraint_name
FROM 
    information_schema.key_column_usage AS kcu
JOIN 
    information_schema.table_constraints AS tc ON tc.constraint_name = kcu.constraint_name
JOIN 
    information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' AND kcu.table_schema = 'public'
ORDER BY
    kcu.table_name, kcu.column_name;

-- =====================================================================
-- SEÇÃO 2: VERIFICAÇÃO DE INTEGRIDADE E DADOS ÓRFÃOS
-- Queries para encontrar registros que violam a lógica de negócio ou que perderam sua referência.
-- =====================================================================

-- Query 2.1: Encontrar contas bancárias ('bank_accounts') sem uma entidade ('entities') associada
-- Dados órfãos que podem causar erros em relatórios financeiros ou cadastros.
SELECT id, entity_id, banco, conta
FROM public.bank_accounts
WHERE entity_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.entities WHERE id = public.bank_accounts.entity_id
);

-- Query 2.2: Encontrar propostas ('propostas') associadas a clientes inexistentes
-- Garante que toda proposta pertence a um cliente válido no sistema.
SELECT id, cliente_id, codigo, valor_total
FROM public.propostas
WHERE cliente_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.entities WHERE id = public.propostas.cliente_id
);

-- Query 2.3: Encontrar cards do Kanban ('kanban_cards') com colunas ou quadros inválidos
-- Ajuda a limpar o Kanban de "cards fantasmas" que não podem ser exibidos.
SELECT id, title, board_id, coluna_id
FROM public.kanban_cards
WHERE 
    (board_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE id = public.kanban_cards.board_id))
    OR
    (coluna_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.kanban_colunas WHERE id = public.kanban_cards.coluna_id));

-- Query 2.4: Identificar 'entities' com UUIDs inválidos em campos de relacionamento
-- Procura por valores como 'none', 'undefined' ou strings vazias que foram inseridos erroneamente.
SELECT id, nome_razao_social, procedencia_id, setor_id, categoria_id, responsavel_id
FROM public.entities
WHERE 
    procedencia_id::text ~* 'none|undefined|^$' OR
    setor_id::text ~* 'none|undefined|^$' OR
    categoria_id::text ~* 'none|undefined|^$' OR
    responsavel_id::text ~* 'none|undefined|^$';

-- =====================================================================
-- SEÇÃO 3: ANÁLISE DE DADOS E DISTRIBUIÇÃO
-- Queries para entender o volume e a distribuição dos dados.
-- =====================================================================

-- Query 3.1: Contagem de registros nas tabelas principais
-- Oferece uma visão rápida do volume de dados em cada parte do sistema.
SELECT 'entities' AS tabela, COUNT(*) AS total_registros FROM public.entities UNION ALL
SELECT 'propostas' AS tabela, COUNT(*) FROM public.propostas UNION ALL
SELECT 'contratos' AS tabela, COUNT(*) FROM public.contratos UNION ALL
SELECT 'kanban_cards' AS tabela, COUNT(*) FROM public.kanban_cards UNION ALL
SELECT 'fin_transactions' AS tabela, COUNT(*) FROM public.fin_transactions;

-- Query 3.2: Distribuição de 'entities' por tipo (cliente, fornecedor, etc.)
-- Ajuda a entender a composição da base de cadastros.
SELECT tipo, COUNT(*) AS quantidade
FROM public.entities
GROUP BY tipo
ORDER BY quantidade DESC;

-- Query 3.3: Distribuição de cards do Kanban por status/coluna
-- Útil para identificar gargalos nos processos (muitos cards em uma mesma coluna).
SELECT kc.nome AS nome_coluna, COUNT(k.id) AS quantidade_cards
FROM public.kanban_cards k
JOIN public.kanban_colunas kc ON k.coluna_id = kc.id
GROUP BY kc.nome, kc.pos
ORDER BY kc.pos;

-- =====================================================================
-- SEÇÃO 4: PLANO DE AÇÃO (SQL PARA LIMPEZA)
-- Comandos DML (UPDATE/DELETE) para corrigir os problemas encontrados.
-- ATENÇÃO: Execute com cautela e, preferencialmente, após um backup.
-- =====================================================================

-- Ação 4.1: Excluir contas bancárias órfãs (encontradas na Query 2.1)
/*
DELETE FROM public.bank_accounts
WHERE entity_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.entities WHERE id = public.bank_accounts.entity_id
);
*/

-- Ação 4.2: Normalizar UUIDs inválidos na tabela 'entities' (encontrados na Query 2.4)
-- Define como NULL os campos que contêm valores como 'none' ou 'undefined'.
/*
UPDATE public.entities
SET 
    procedencia_id = NULLIF(procedencia_id::text, 'none')::uuid,
    setor_id = NULLIF(setor_id::text, 'none')::uuid,
    categoria_id = NULLIF(categoria_id::text, 'none')::uuid,
    responsavel_id = NULLIF(responsavel_id::text, 'none')::uuid
WHERE 
    procedencia_id::text = 'none' OR
    setor_id::text = 'none' OR
    categoria_id::text = 'none' OR
    responsavel_id::text = 'none';
*/

-- Ação 4.3: Arquivar ou excluir cards do Kanban que apontam para colunas/quadros inexistentes (encontrados na Query 2.3)
-- A estratégia (DELETE vs UPDATE) depende da regra de negócio. Excluir é mais simples se não houver necessidade de histórico.
/*
DELETE FROM public.kanban_cards
WHERE 
    (board_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE id = public.kanban_cards.board_id))
    OR
    (coluna_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.kanban_colunas WHERE id = public.kanban_cards.coluna_id));
*/

-- Fim do arquivo de auditoria.
