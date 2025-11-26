-- =============================================
-- TESTES: Integração Financeiro + Cronograma
-- Objetivo: validar se as tabelas e FKs mínimas
--           para o fluxo contrato -> título -> lançamento existem.
-- =============================================

BEGIN;

-- 1) Tabelas obrigatórias presentes
DO $$
DECLARE
  missing text;
BEGIN
  SELECT string_agg(table_name, ', ')
    INTO missing
  FROM (
    SELECT 'projects' AS table_name UNION
    SELECT 'project_contracts' UNION
    SELECT 'project_measurements' UNION
    SELECT 'titulos_financeiros' UNION
    SELECT 'lancamentos' UNION
    SELECT 'entities'
  ) t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t.table_name
  );

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'Tabelas faltando: %', missing;
  END IF;
END $$;

-- 2) FK: contratos -> projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'project_contracts'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'project_id'
  ) THEN
    RAISE EXCEPTION 'FK project_contracts.project_id ausente';
  END IF;
END $$;

-- 3) FK: medições -> contratos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'project_measurements'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'contract_id'
  ) THEN
    RAISE EXCEPTION 'FK project_measurements.contract_id ausente';
  END IF;
END $$;

-- 4) FK: lançamentos -> títulos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'lancamentos'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'titulo_id'
  ) THEN
    RAISE EXCEPTION 'FK lancamentos.titulo_id ausente';
  END IF;
END $$;

-- 5) Colunas mínimas para título financeiro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'titulos_financeiros'
      AND column_name IN ('tipo', 'valor', 'data_vencimento')
    GROUP BY table_name
    HAVING count(*) = 3
  ) THEN
    RAISE EXCEPTION 'Colunas esperadas em titulos_financeiros ausentes (tipo, valor, data_vencimento)';
  END IF;
END $$;

ROLLBACK;

-- Resultado consolidado
SELECT '
========================================
✅ Testes Financeiro + Cronograma (smoke)
========================================
1. Tabelas bases: OK
2. FK contratos -> projetos: OK
3. FK medições -> contratos: OK
4. FK lançamentos -> títulos: OK
5. Colunas essenciais em títulos: OK
========================================
' AS resultado_final;
