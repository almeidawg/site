-- =============================================
-- Migration: Remover Triggers Problemáticos do Kanban
-- Arquivo: 20251103230000_remover_triggers_kanban_autordem.sql
-- Data: 2025-11-03
-- Autor: Claude Code
--
-- Descrição:
--   Remove triggers de auto-ordenação que causavam loop infinito
--   recursivo no banco de dados (stack overflow).
--
-- Problema:
--   Triggers kanban_cards_autordem_ins e kanban_cards_autordem_upd
--   causavam "stack depth limit exceeded" ao tentar reordenar cards.
--
-- Causa:
--   Os triggers atualizavam outros cards, o que disparava os triggers
--   novamente, criando um loop infinito recursivo.
--
-- Solução:
--   Remover os triggers problemáticos. A ordenação será gerenciada
--   pelo frontend usando múltiplos de 10 para as posições.
--
-- Referências:
--   - Migration original: 022_criar_triggers_kanban_autordem.sql
--   - Documentação: KANBAN_FIX_DRAG_DROP.md
-- =============================================

BEGIN;

-- =============================================
-- PASSO 1: Remover Triggers de Auto-Ordenação
-- =============================================

-- Trigger de INSERT (também problemático)
DROP TRIGGER IF EXISTS kanban_cards_autordem_ins ON kanban_cards;

-- Trigger de UPDATE (causa loop infinito)
DROP TRIGGER IF EXISTS kanban_cards_autordem_upd ON kanban_cards;

-- =============================================
-- PASSO 2: Remover Funções dos Triggers
-- =============================================

-- Função do trigger de INSERT
DROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_ins();

-- Função do trigger de UPDATE
DROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_upd();

-- =============================================
-- PASSO 3: Validar Remoção
-- =============================================

DO $$
DECLARE
    v_trigger_count INT;
BEGIN
    -- Contar triggers restantes na tabela kanban_cards
    SELECT COUNT(*) INTO v_trigger_count
    FROM pg_trigger
    WHERE tgrelid = 'kanban_cards'::regclass
    AND tgname LIKE '%autordem%';

    IF v_trigger_count > 0 THEN
        RAISE EXCEPTION 'Ainda existem % triggers de autordem na tabela kanban_cards', v_trigger_count;
    END IF;

    RAISE NOTICE '✅ Triggers de auto-ordenação removidos com sucesso!';
    RAISE NOTICE 'A ordenação será gerenciada pelo frontend.';
    RAISE NOTICE 'Posições devem ser múltiplos de 10 (10, 20, 30...).';
END $$;

COMMIT;

-- =============================================
-- OBSERVAÇÕES IMPORTANTES
-- =============================================

-- 1. FRONTEND RESPONSÁVEL PELA ORDENAÇÃO:
--    O código React em Oportunidades.jsx já está preparado para
--    gerenciar a ordenação usando múltiplos de 10.
--
-- 2. FORMATO DAS POSIÇÕES:
--    - Index 0 → Posição 10
--    - Index 1 → Posição 20
--    - Index 2 → Posição 30
--    Formula: (index + 1) * 10
--
-- 3. POR QUE MÚLTIPLOS DE 10?:
--    Permite inserir cards entre outros sem reordenar tudo.
--    Exemplo: Card entre posição 10 e 20 pode ser posição 15.
--
-- 4. TRIGGERS RESTANTES (OK):
--    - kanban_cards_updated_at: Atualiza campo updated_at (seguro)
--    - RI_ConstraintTrigger_*: Triggers de foreign keys (seguro)
--
-- 5. RLS POLICIES:
--    As políticas RLS criadas pela migration anterior
--    (20251103140000_corrigir_rls_kanban_cards.sql) continuam ativas
--    e funcionando corretamente.

-- =============================================
-- VALIDAÇÃO PÓS-MIGRATION (executar manualmente)
-- =============================================

-- Listar triggers restantes (deve mostrar apenas updated_at e RI_Constraint):
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'kanban_cards'::regclass;

-- Testar UPDATE manual:
-- BEGIN;
--   UPDATE kanban_cards SET posicao = 999 WHERE id = '<algum-id>';
--   SELECT id, titulo, posicao FROM kanban_cards WHERE id = '<algum-id>';
-- ROLLBACK;
