
-- ============================================================================
-- AUDITORIA ESTRUTURAL COMPLETA - BANCO WGEASY (Schema: public)
-- ============================================================================
-- Você está conectado a um banco de dados PostgreSQL do sistema WGEasy.
-- Esta auditoria segue passos estruturados, sempre usando apenas SQL.

-- PASSO 1: Listar todos os schemas
-- Objetivo: Identificar todos os schemas do banco
SELECT 
  schema_name,
  schema_owner
FROM information_schema.schemata 
ORDER BY schema_name;

-- PASSO 2: Inventário completo de tabelas no schema public
-- Objetivo: Gerar tabela com nome, linhas, PKs, UNIQUEs, FKs
SELECT 
  t.table_name,
  (SELECT n_live_tup FROM pg_stat_user_tables WHERE relname=t.table_name AND schemaname='public') as linhas_aproximadas,
  CASE WHEN pk.constraint_name IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_pk,
  CASE WHEN uq.constraint_name IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_unique,
  CASE WHEN fk.constraint_name IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_fk
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints pk ON t.table_name=pk.table_name AND pk.constraint_type='PRIMARY KEY' AND pk.table_schema='public'
LEFT JOIN information_schema.table_constraints uq ON t.table_name=uq.table_name AND uq.constraint_type='UNIQUE' AND uq.table_schema='public'
LEFT JOIN information_schema.table_constraints fk ON t.table_name=fk.table_name AND fk.constraint_type='FOREIGN KEY' AND fk.table_schema='public'
WHERE t.table_schema='public'
GROUP BY t.table_name, pk.constraint_name, uq.constraint_name, fk.constraint_name
ORDER BY t.table_name;

-- PASSO 3: Identificar tabelas SEM chave primária (CRÍTICO)
-- Objetivo: Encontrar tabelas órfãs e propor PKs candidatas
SELECT 
  t.table_name,
  string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as colunas,
  string_agg(c.data_type, ', ' ORDER BY c.ordinal_position) as tipos,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name=t.table_name AND column_name='id') THEN 'id (candidata)'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name=t.table_name AND column_name LIKE '%_id' LIMIT 1) THEN 'Primeira coluna *_id'
    ELSE 'Revisar manualmente'
  END as pk_candidata
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name=c.table_name AND c.table_schema='public'
LEFT JOIN information_schema.table_constraints pk ON t.table_name=pk.table_name AND pk.constraint_type='PRIMARY KEY' AND pk.table_schema='public'
WHERE t.table_schema='public' AND pk.constraint_name IS NULL
GROUP BY t.table_name
ORDER BY t.table_name;

-- PASSO 4: Mapeamento completo de chaves estrangeiras
-- Objetivo: Mostrar todas as FKs, tabelas pai/filha, ações ON DELETE/UPDATE
SELECT 
  tc.table_name as tabela_filha,
  kcu.column_name as coluna_fk,
  ccu.table_name as tabela_pai,
  ccu.column_name as coluna_pk,
  rc.update_rule as on_update,
  rc.delete_rule as on_delete,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name=tc.constraint_name AND ccu.table_schema=tc.table_schema
JOIN information_schema.referential_constraints rc ON rc.constraint_name=tc.constraint_name
WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public'
ORDER BY tc.table_name, kcu.column_name;

-- PASSO 5: Colunas que deveriam ser NOT NULL mas aceitam NULL
-- Objetivo: Identificar colunas críticas com valores nulos
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  (SELECT COUNT(*) FROM information_schema.tables t WHERE t.table_name=c.table_name AND t.table_schema='public') as total_linhas
FROM information_schema.columns c
WHERE table_schema='public' 
  AND is_nullable='YES'
  AND column_name IN ('nome', 'email', 'status', 'created_at', 'descricao', 'titulo', 'valor', 'data')
ORDER BY table_name, column_name;

-- PASSO 6: Verificar duplicatas em colunas UNIQUE
-- Objetivo: Encontrar violações de unicidade (casos legados)
SELECT 
  tc.table_name,
  string_agg(kcu.column_name, ', ') as colunas_unique,
  COUNT(*) as total_constraints
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
WHERE tc.constraint_type='UNIQUE' AND tc.table_schema='public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- PASSO 7: Tipos de dados inconsistentes
-- Objetivo: Encontrar colunas com mesmo nome mas tipos diferentes
SELECT 
  column_name,
  data_type,
  string_agg(DISTINCT table_name, ', ') as tabelas,
  COUNT(DISTINCT data_type) as tipos_diferentes
FROM information_schema.columns
WHERE table_schema='public'
GROUP BY column_name, data_type
HAVING COUNT(DISTINCT table_name) > 1
ORDER BY column_name;

-- PASSO 8: Contagem de linhas por tabela
-- Objetivo: Visão geral do volume de dados
SELECT 
  schemaname,
  tablename,
  n_live_tup as linhas_aproximadas,
  n_dead_tup as linhas_mortas,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname='public'
ORDER BY n_live_tup DESC;

-- PASSO 9: Índices existentes
-- Objetivo: Mapear índices e identificar gaps
SELECT 
  tablename,
  indexname,
  indexdef,
  idx_scan as scans_realizados,
  idx_tup_read as tuplas_lidas,
  idx_tup_fetch as tuplas_retornadas
FROM pg_stat_user_indexes
WHERE schemaname='public'
ORDER BY tablename, indexname;

-- PASSO 10: Verificar linhas órfãs (FK apontando para registros inexistentes)
-- Objetivo: Encontrar integridade referencial quebrada
-- Nota: Customize conforme as FKs encontradas no PASSO 4
-- Exemplo para tabela 'contas_bancarias' com FK 'cliente_id':
-- SELECT cb.* FROM contas_bancarias cb 
-- WHERE cb.cliente_id NOT IN (SELECT id FROM clientes);

-- ============================================================================
-- PLANO DE AÇÃO (Propostas de correção - NÃO EXECUTAR AUTOMATICAMENTE)
-- ============================================================================

-- 1. ADICIONAR NOT NULL em colunas críticas
-- Diagnóstico: SELECT * FROM [tabela] WHERE [coluna] IS NULL;
-- Ação: UPDATE [tabela] SET [coluna] = 'valor_padrao' WHERE [coluna] IS NULL;
-- Depois: ALTER TABLE [tabela] ALTER COLUMN [coluna] SET NOT NULL;

-- 2. CRIAR CHAVE PRIMÁRIA em tabelas órfãs
-- Diagnóstico: SELECT * FROM [tabela] WHERE id IS NULL OR id = '';
-- Ação: ALTER TABLE [tabela] ADD PRIMARY KEY (id);

-- 3. CRIAR ÍNDICES para colunas usadas em JOINs/FILTROs
-- Diagnóstico: EXPLAIN ANALYZE SELECT * FROM [tabela] WHERE [coluna] = 'valor';
-- Ação: CREATE INDEX idx_[tabela]_[coluna] ON [tabela]([coluna]);

-- 4. REMOVER LINHAS ÓRFÃS (após validação)
-- Diagnóstico: SELECT * FROM [tabela_filha] WHERE [fk_coluna] NOT IN (SELECT id FROM [tabela_pai]);
-- Ação: DELETE FROM [tabela_filha] WHERE [fk_coluna] NOT IN (SELECT id FROM [tabela_pai]);

-- 5. PADRONIZAR TIPOS (criar ENUM para status)
-- Diagnóstico: SELECT DISTINCT status FROM [tabela];
-- Ação: CREATE TYPE status_enum AS ENUM ('ativo', 'inativo', 'pendente');
-- Depois: ALTER TABLE [tabela] ALTER COLUMN status TYPE status_enum USING status::status_enum;

-- 6. ADICIONAR CONSTRAINTS de CHECK
-- Ação: ALTER TABLE [tabela] ADD CONSTRAINT chk_[coluna] CHECK ([coluna] > 0);

-- ============================================================================
-- FIM DA AUDITORIA
-- ============================================================================
