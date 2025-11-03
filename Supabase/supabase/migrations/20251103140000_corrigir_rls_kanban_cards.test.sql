-- =============================================
-- Testes: RLS Policies - Kanban Cards
-- Arquivo: 20251103140000_corrigir_rls_kanban_cards.test.sql
-- Data: 2025-11-03
--
-- Executa testes de validação das políticas RLS
-- IMPORTANTE: Usar BEGIN/ROLLBACK para não afetar dados
-- =============================================

BEGIN;

-- =============================================
-- SETUP: Criar dados de teste
-- =============================================

-- Criar usuário teste (simulado)
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
  test_coluna_id uuid;
  test_card_id uuid;
BEGIN

  -- Buscar primeira coluna existente (ou criar uma)
  SELECT id INTO test_coluna_id
  FROM kanban_colunas
  LIMIT 1;

  IF test_coluna_id IS NULL THEN
    INSERT INTO kanban_colunas (nome, posicao)
    VALUES ('Teste', 999)
    RETURNING id INTO test_coluna_id;
    RAISE NOTICE '✅ Coluna de teste criada: %', test_coluna_id;
  END IF;

  -- Criar card de teste
  INSERT INTO kanban_cards (
    coluna_id,
    titulo,
    descricao,
    posicao
  ) VALUES (
    test_coluna_id,
    'Card Teste RLS',
    'Card criado para testar políticas RLS',
    9999
  )
  RETURNING id INTO test_card_id;

  RAISE NOTICE '✅ Card de teste criado: %', test_card_id;

  -- =============================================
  -- TESTE 1: Verificar se políticas foram criadas
  -- =============================================

  RAISE NOTICE '🧪 TESTE 1: Verificando políticas criadas...';

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kanban_cards'
    AND policyname = 'authenticated_users_can_view_cards'
  ) THEN
    RAISE NOTICE '  ✅ Policy SELECT criada';
  ELSE
    RAISE EXCEPTION '  ❌ Policy SELECT NÃO encontrada!';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kanban_cards'
    AND policyname = 'authenticated_users_can_create_cards'
  ) THEN
    RAISE NOTICE '  ✅ Policy INSERT criada';
  ELSE
    RAISE EXCEPTION '  ❌ Policy INSERT NÃO encontrada!';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kanban_cards'
    AND policyname = 'authenticated_users_can_update_cards'
  ) THEN
    RAISE NOTICE '  ✅ Policy UPDATE criada';
  ELSE
    RAISE EXCEPTION '  ❌ Policy UPDATE NÃO encontrada!';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kanban_cards'
    AND policyname = 'managers_can_delete_cards'
  ) THEN
    RAISE NOTICE '  ✅ Policy DELETE criada';
  ELSE
    RAISE EXCEPTION '  ❌ Policy DELETE NÃO encontrada!';
  END IF;

  -- =============================================
  -- TESTE 2: Verificar se políticas antigas foram removidas
  -- =============================================

  RAISE NOTICE '🧪 TESTE 2: Verificando remoção de políticas antigas...';

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kanban_cards'
    AND policyname = 'Any user can update cards'
  ) THEN
    RAISE NOTICE '  ✅ Policy antiga "Any user can update cards" removida';
  ELSE
    RAISE EXCEPTION '  ❌ Policy antiga ainda existe!';
  END IF;

  -- =============================================
  -- TESTE 3: Testar SELECT (sempre deve funcionar)
  -- =============================================

  RAISE NOTICE '🧪 TESTE 3: Testando SELECT...';

  DECLARE
    card_count integer;
  BEGIN
    SELECT COUNT(*) INTO card_count
    FROM kanban_cards
    WHERE id = test_card_id;

    IF card_count = 1 THEN
      RAISE NOTICE '  ✅ SELECT funcionou (1 card encontrado)';
    ELSE
      RAISE EXCEPTION '  ❌ SELECT falhou (esperado 1, encontrado %)', card_count;
    END IF;
  END;

  -- =============================================
  -- TESTE 4: Testar UPDATE
  -- =============================================

  RAISE NOTICE '🧪 TESTE 4: Testando UPDATE...';

  DECLARE
    old_posicao integer;
    new_posicao integer := 1234;
    updated_posicao integer;
  BEGIN
    -- Salvar valor antigo
    SELECT posicao INTO old_posicao
    FROM kanban_cards
    WHERE id = test_card_id;

    RAISE NOTICE '  Posição antes: %', old_posicao;

    -- Fazer UPDATE
    UPDATE kanban_cards
    SET posicao = new_posicao
    WHERE id = test_card_id;

    -- Verificar se UPDATE funcionou
    SELECT posicao INTO updated_posicao
    FROM kanban_cards
    WHERE id = test_card_id;

    RAISE NOTICE '  Posição depois: %', updated_posicao;

    IF updated_posicao = new_posicao THEN
      RAISE NOTICE '  ✅ UPDATE funcionou (posição alterada)';
    ELSE
      RAISE EXCEPTION '  ❌ UPDATE falhou (esperado %, obtido %)', new_posicao, updated_posicao;
    END IF;
  END;

  -- =============================================
  -- TESTE 5: Testar INSERT
  -- =============================================

  RAISE NOTICE '🧪 TESTE 5: Testando INSERT...';

  DECLARE
    new_card_id uuid;
  BEGIN
    INSERT INTO kanban_cards (
      coluna_id,
      titulo,
      posicao
    ) VALUES (
      test_coluna_id,
      'Segundo Card Teste',
      8888
    )
    RETURNING id INTO new_card_id;

    IF new_card_id IS NOT NULL THEN
      RAISE NOTICE '  ✅ INSERT funcionou (card criado: %)', new_card_id;
    ELSE
      RAISE EXCEPTION '  ❌ INSERT falhou';
    END IF;
  END;

  -- =============================================
  -- TESTE 6: Verificar WITH CHECK em UPDATE
  -- =============================================

  RAISE NOTICE '🧪 TESTE 6: Verificando WITH CHECK em UPDATE...';

  DECLARE
    policy_check text;
  BEGIN
    SELECT with_check INTO policy_check
    FROM pg_policies
    WHERE tablename = 'kanban_cards'
    AND policyname = 'authenticated_users_can_update_cards';

    IF policy_check IS NOT NULL AND policy_check != '' THEN
      RAISE NOTICE '  ✅ WITH CHECK presente: %', policy_check;
    ELSE
      RAISE EXCEPTION '  ❌ WITH CHECK ausente ou vazio!';
    END IF;
  END;

  -- =============================================
  -- TESTE 7: Verificar USING em UPDATE
  -- =============================================

  RAISE NOTICE '🧪 TESTE 7: Verificando USING em UPDATE...';

  DECLARE
    policy_using text;
  BEGIN
    SELECT qual INTO policy_using
    FROM pg_policies
    WHERE tablename = 'kanban_cards'
    AND policyname = 'authenticated_users_can_update_cards';

    IF policy_using IS NOT NULL AND policy_using != '' THEN
      RAISE NOTICE '  ✅ USING presente: %', policy_using;
    ELSE
      RAISE EXCEPTION '  ❌ USING ausente ou vazio!';
    END IF;
  END;

  -- =============================================
  -- RESUMO DOS TESTES
  -- =============================================

  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ TODOS OS TESTES PASSARAM!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Políticas RLS para kanban_cards estão corretas.';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Aplicar migration no ambiente local';
  RAISE NOTICE '2. Testar UPDATE via frontend';
  RAISE NOTICE '3. Se funcionar, aplicar no LIVE';
  RAISE NOTICE '';

END $$;

ROLLBACK;

-- =============================================
-- INSTRUÇÕES DE USO
-- =============================================

-- Para executar este teste:
--
-- 1. Via Docker (LOCAL):
--    docker exec -i supabase_db_WG psql -U postgres -d postgres < 20251103140000_corrigir_rls_kanban_cards.test.sql
--
-- 2. Via psql direto:
--    \i 20251103140000_corrigir_rls_kanban_cards.test.sql
--
-- 3. Via Supabase Studio:
--    Copiar e colar no SQL Editor
--
-- Observações:
-- - Este script usa BEGIN/ROLLBACK, então NÃO afeta dados reais
-- - Se todos testes passarem, migration está OK para aplicar
-- - Se algum teste falhar, verificar logs e corrigir migration
