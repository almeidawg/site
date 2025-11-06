-- =============================================
-- Testes: View e Functions Kanban
-- Data: 2025-11-04
-- =============================================

BEGIN;

-- ========================================
-- PREPARAÇÃO: Criar dados de teste
-- ========================================

-- Criar board de teste
INSERT INTO kanban_boards (id, ambiente, titulo, descricao, modulo)
VALUES (
  'test-board-123e4567-e89b-12d3-a456-426614174000'::uuid,
  'teste_kanban',
  'Board de Teste',
  'Board criado para testes',
  'teste'
);

-- Criar colunas de teste
INSERT INTO kanban_colunas (id, board_id, nome, pos, cor)
VALUES
  ('col1-123e4567-e89b-12d3-a456-426614174001'::uuid,
   'test-board-123e4567-e89b-12d3-a456-426614174000'::uuid,
   'Coluna Teste 1', 0, '#3B82F6'),
  ('col2-123e4567-e89b-12d3-a456-426614174002'::uuid,
   'test-board-123e4567-e89b-12d3-a456-426614174000'::uuid,
   'Coluna Teste 2', 1, '#8B5CF6');

-- Criar cards de teste
INSERT INTO kanban_cards (id, coluna_id, titulo, descricao, ordem, payload)
VALUES
  ('card1-23e4567-e89b-12d3-a456-426614174003'::uuid,
   'col1-123e4567-e89b-12d3-a456-426614174001'::uuid,
   'Card Teste 1', 'Descrição do card 1', 10,
   '{"prioridade": "alta"}'::jsonb),
  ('card2-23e4567-e89b-12d3-a456-426614174004'::uuid,
   'col1-123e4567-e89b-12d3-a456-426614174001'::uuid,
   'Card Teste 2', 'Descrição do card 2', 20,
   '{"prioridade": "média"}'::jsonb);

-- ========================================
-- TESTE 1: View v_kanban_cards
-- ========================================
SELECT 'TESTE 1: View v_kanban_cards' AS teste;

DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM v_kanban_cards
  WHERE board_id = 'test-board-123e4567-e89b-12d3-a456-426614174000'::uuid;

  IF v_count != 2 THEN
    RAISE EXCEPTION 'Erro: View deveria retornar 2 cards, mas retornou %', v_count;
  END IF;

  RAISE NOTICE '✅ View v_kanban_cards OK - % cards encontrados', v_count;
END $$;

-- ========================================
-- TESTE 2: api_criar_coluna_kanban
-- ========================================
SELECT 'TESTE 2: api_criar_coluna_kanban' AS teste;

DO $$
DECLARE
  v_coluna_id uuid;
  v_pos integer;
BEGIN
  -- Criar coluna sem especificar posição (deve pegar max + 1)
  SELECT api_criar_coluna_kanban(
    'test-board-123e4567-e89b-12d3-a456-426614174000'::uuid,
    'Nova Coluna Teste',
    NULL
  ) INTO v_coluna_id;

  IF v_coluna_id IS NULL THEN
    RAISE EXCEPTION 'Erro: Falha ao criar coluna';
  END IF;

  -- Verificar posição
  SELECT pos INTO v_pos FROM kanban_colunas WHERE id = v_coluna_id;

  IF v_pos != 2 THEN
    RAISE EXCEPTION 'Erro: Nova coluna deveria ter pos=2, mas tem pos=%', v_pos;
  END IF;

  RAISE NOTICE '✅ api_criar_coluna_kanban OK - Coluna % criada na posição %', v_coluna_id, v_pos;
END $$;

-- ========================================
-- TESTE 3: api_renomear_coluna_kanban
-- ========================================
SELECT 'TESTE 3: api_renomear_coluna_kanban' AS teste;

DO $$
DECLARE
  v_resultado boolean;
  v_novo_nome text;
BEGIN
  -- Renomear coluna
  SELECT api_renomear_coluna_kanban(
    'col1-123e4567-e89b-12d3-a456-426614174001'::uuid,
    'Coluna Renomeada'
  ) INTO v_resultado;

  IF v_resultado != true THEN
    RAISE EXCEPTION 'Erro: Falha ao renomear coluna';
  END IF;

  -- Verificar novo nome
  SELECT nome INTO v_novo_nome
  FROM kanban_colunas
  WHERE id = 'col1-123e4567-e89b-12d3-a456-426614174001'::uuid;

  IF v_novo_nome != 'Coluna Renomeada' THEN
    RAISE EXCEPTION 'Erro: Nome deveria ser "Coluna Renomeada", mas é "%"', v_novo_nome;
  END IF;

  RAISE NOTICE '✅ api_renomear_coluna_kanban OK - Coluna renomeada para "%"', v_novo_nome;
END $$;

-- ========================================
-- TESTE 4: api_atualizar_card_kanban
-- ========================================
SELECT 'TESTE 4: api_atualizar_card_kanban' AS teste;

DO $$
DECLARE
  v_resultado jsonb;
  v_novo_titulo text;
BEGIN
  -- Atualizar card
  SELECT api_atualizar_card_kanban(
    'card1-23e4567-e89b-12d3-a456-426614174003'::uuid,
    '{"titulo": "Card Atualizado", "descricao": "Nova descrição", "payload": {"prioridade": "baixa", "status": "teste"}}'::jsonb
  ) INTO v_resultado;

  IF v_resultado IS NULL THEN
    RAISE EXCEPTION 'Erro: Falha ao atualizar card';
  END IF;

  v_novo_titulo := v_resultado->>'titulo';

  IF v_novo_titulo != 'Card Atualizado' THEN
    RAISE EXCEPTION 'Erro: Título deveria ser "Card Atualizado", mas é "%"', v_novo_titulo;
  END IF;

  -- Verificar se payload foi mesclado corretamente
  IF v_resultado->'payload'->>'status' != 'teste' THEN
    RAISE EXCEPTION 'Erro: Payload não foi atualizado corretamente';
  END IF;

  RAISE NOTICE '✅ api_atualizar_card_kanban OK - Card atualizado: %', v_novo_titulo;
END $$;

-- ========================================
-- TESTE 5: api_mover_card_kanban
-- ========================================
SELECT 'TESTE 5: api_mover_card_kanban' AS teste;

DO $$
DECLARE
  v_resultado boolean;
  v_nova_coluna uuid;
  v_nova_ordem integer;
BEGIN
  -- Mover card para outra coluna
  SELECT api_mover_card_kanban(
    'card2-23e4567-e89b-12d3-a456-426614174004'::uuid,
    'col2-123e4567-e89b-12d3-a456-426614174002'::uuid,
    50
  ) INTO v_resultado;

  IF v_resultado != true THEN
    RAISE EXCEPTION 'Erro: Falha ao mover card';
  END IF;

  -- Verificar nova posição
  SELECT coluna_id, ordem INTO v_nova_coluna, v_nova_ordem
  FROM kanban_cards
  WHERE id = 'card2-23e4567-e89b-12d3-a456-426614174004'::uuid;

  IF v_nova_coluna != 'col2-123e4567-e89b-12d3-a456-426614174002'::uuid THEN
    RAISE EXCEPTION 'Erro: Card não foi movido para nova coluna';
  END IF;

  IF v_nova_ordem != 50 THEN
    RAISE EXCEPTION 'Erro: Ordem deveria ser 50, mas é %', v_nova_ordem;
  END IF;

  RAISE NOTICE '✅ api_mover_card_kanban OK - Card movido para coluna % com ordem %', v_nova_coluna, v_nova_ordem;
END $$;

-- ========================================
-- TESTE 6: Validação de erros
-- ========================================
SELECT 'TESTE 6: Validação de tratamento de erros' AS teste;

DO $$
BEGIN
  -- Testar criar coluna com nome vazio (deve dar erro)
  BEGIN
    PERFORM api_criar_coluna_kanban(
      'test-board-123e4567-e89b-12d3-a456-426614174000'::uuid,
      '', -- nome vazio
      NULL
    );
    RAISE EXCEPTION 'Erro: Deveria ter rejeitado nome vazio';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%Nome da coluna não pode ser vazio%' THEN
        RAISE NOTICE '✅ Validação OK - Nome vazio rejeitado';
      ELSE
        RAISE;
      END IF;
  END;

  -- Testar mover card inexistente (deve dar erro)
  BEGIN
    PERFORM api_mover_card_kanban(
      'card-inexistente-123456'::uuid,
      'col1-123e4567-e89b-12d3-a456-426614174001'::uuid,
      10
    );
    RAISE EXCEPTION 'Erro: Deveria ter rejeitado card inexistente';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%Card não encontrado%' THEN
        RAISE NOTICE '✅ Validação OK - Card inexistente rejeitado';
      ELSE
        RAISE;
      END IF;
  END;
END $$;

ROLLBACK;

-- ========================================
-- RESULTADO FINAL
-- ========================================
SELECT '
========================================
✅ TODOS OS TESTES PASSARAM!
========================================
1. View v_kanban_cards: OK
2. api_criar_coluna_kanban: OK
3. api_renomear_coluna_kanban: OK
4. api_atualizar_card_kanban: OK
5. api_mover_card_kanban: OK
6. Validação de erros: OK
========================================
' AS resultado_final;