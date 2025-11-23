
-- ============================================================================
-- AUDITORIA ESTRUTURAL COMPLETA - BANCO WGEASY (Schema: public)
-- ============================================================================
-- Este script realiza diagnóstico completo do banco PostgreSQL
-- Mostre primeiro o SELECT, depois proponha ALTER/UPDATE/DELETE

-- PASSO 1: Listar todos os schemas
SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;

-- PASSO 2: Inventário de tabelas no schema public
SELECT 
  t.table_name,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name=t.table_name) as existe,
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

-- PASSO 3: Tabelas SEM chave primária (CRÍTICO)
SELECT 
  t.table_name,
  string_agg(c.column_name, ', ') as colunas_candidatas_pk
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name=c.table_name AND c.table_schema='public'
LEFT JOIN information_schema.table_constraints pk ON t.table_name=pk.table_name AND pk.constraint_type='PRIMARY KEY' AND pk.table_schema='public'
WHERE t.table_schema='public' AND pk.constraint_name IS NULL
GROUP BY t.table_name
ORDER BY t.table_name;

-- PASSO 4: Mapeamento de chaves estrangeiras
SELECT 
  tc.table_name as tabela_filha,
  kcu.column_name as coluna_fk,
  ccu.table_name as tabela_pai,
  ccu.column_name as coluna_pk,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name=tc.constraint_name AND ccu.table_schema=tc.table_schema
JOIN information_schema.referential_constraints rc ON rc.constraint_name=tc.constraint_name
WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public'
ORDER BY tc.table_name, kcu.column_name;

-- PASSO 5: Colunas que deveriam ser NOT NULL mas aceitam NULL
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  (SELECT COUNT(*) FROM information_schema.tables t WHERE t.table_name=c.table_name AND t.table_schema='public') as total_linhas
FROM information_schema.columns c
WHERE table_schema='public' 
  AND is_nullable='YES'
  AND column_name IN ('nome', 'email', 'status', 'created_at', 'descricao', 'titulo')
ORDER BY table_name, column_name;

-- PASSO 6: Verificar duplicatas em colunas UNIQUE
SELECT 
  tc.table_name,
  string_agg(kcu.column_name, ', ') as colunas_unique,
  COUNT(*) as duplicatas_encontradas
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
WHERE tc.constraint_type='UNIQUE' AND tc.table_schema='public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- PASSO 7: Tipos de dados inconsistentes (mesmo nome lógico, tipos diferentes)
SELECT 
  column_name,
  data_type,
  string_agg(DISTINCT table_name, ', ') as tabelas,
  COUNT(DISTINCT data_type) as tipos_diferentes
FROM information_schema.columns
WHERE table_schema='public'
GROUP BY column_name, data_type
HAVING COUNT(DISTINCT data_type) > 1
ORDER BY column_name;

-- PASSO 8: Linhas órfãs (FK apontando para registros inexistentes)
-- Exemplo: contas_bancarias.cliente_id que não existe em clientes.id
-- (Este será customizado conforme as FKs encontradas no PASSO 4)

-- PASSO 9: Contagem de linhas por tabela
SELECT 
  schemaname,
  tablename,
  n_live_tup as linhas_aproximadas
FROM pg_stat_user_tables
WHERE schemaname='public'
ORDER BY n_live_tup DESC;

-- PASSO 10: Índices existentes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname='public'
ORDER BY tablename, indexname;

-- ============================================================================
-- PLANO DE AÇÃO (Propostas de correção - NÃO EXECUTAR AUTOMATICAMENTE)
-- ============================================================================

-- 1. Adicionar NOT NULL em colunas críticas
-- ALTER TABLE [tabela] ALTER COLUMN [coluna] SET NOT NULL;

-- 2. Criar chave primária em tabelas órfãs
-- ALTER TABLE [tabela] ADD PRIMARY KEY ([coluna]);

-- 3. Criar índices para colunas usadas em JOINs/FILTROs
-- CREATE INDEX idx_[tabela]_[coluna] ON [tabela]([coluna]);

-- 4. Remover linhas órfãs (após validação)
-- DELETE FROM [tabela_filha] WHERE [fk_coluna] NOT IN (SELECT id FROM [tabela_pai]);

-- 5. Padronizar tipos (criar ENUM para status)
-- CREATE TYPE status_enum AS ENUM ('ativo', 'inativo', 'pendente');
-- ALTER TABLE [tabela] ALTER COLUMN status TYPE status_enum USING status::status_enum;
