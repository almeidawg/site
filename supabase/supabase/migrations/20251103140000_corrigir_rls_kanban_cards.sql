-- =============================================
-- Migration: Corrigir RLS Policies - Kanban Cards
-- Arquivo: 20251103140000_corrigir_rls_kanban_cards.sql
-- Data: 2025-11-03
-- Autor: Claude Code
--
-- Descrição:
--   Simplifica e corrige políticas RLS da tabela kanban_cards
--   para permitir que usuários autenticados possam mover cards.
--
-- Problema:
--   UPDATE via supabase.from('kanban_cards').update(...) não persistia.
--   Card movia visualmente mas voltava ao recarregar página.
--
-- Causa:
--   Políticas RLS conflitantes e faltando WITH CHECK em UPDATE.
--
-- Solução:
--   - Remove políticas antigas conflitantes
--   - Cria políticas simples e claras
--   - Garante USING + WITH CHECK em UPDATE
--   - Mantém DELETE apenas para admins/gestores
--
-- Referências:
--   - https://supabase.com/docs/guides/database/postgres/row-level-security
--   - https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8
-- =============================================

BEGIN;

-- =============================================
-- PASSO 1: Remover Políticas Antigas
-- =============================================

DROP POLICY IF EXISTS "Any user can update cards" ON kanban_cards;
DROP POLICY IF EXISTS "Authenticated users can view cards" ON kanban_cards;
DROP POLICY IF EXISTS "Managers can do everything with cards" ON kanban_cards;
DROP POLICY IF EXISTS "Sellers can create cards" ON kanban_cards;

-- =============================================
-- PASSO 2: Criar Políticas Simplificadas
-- =============================================

-- Policy 1: SELECT
-- Todos usuários autenticados podem visualizar cards
CREATE POLICY "authenticated_users_can_view_cards"
ON kanban_cards FOR SELECT
TO authenticated
USING (true);

-- Policy 2: INSERT
-- Todos usuários autenticados podem criar cards
CREATE POLICY "authenticated_users_can_create_cards"
ON kanban_cards FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: UPDATE
-- Todos usuários autenticados podem atualizar cards
-- IMPORTANTE: UPDATE requer USING (como SELECT) e WITH CHECK (como INSERT)
CREATE POLICY "authenticated_users_can_update_cards"
ON kanban_cards FOR UPDATE
TO authenticated
USING (true)       -- Quais linhas podem ser atualizadas (filtra primeiro)
WITH CHECK (true); -- Validação dos novos valores (aplica depois)

-- Policy 4: DELETE
-- Apenas admins e gestores podem deletar cards
CREATE POLICY "managers_can_delete_cards"
ON kanban_cards FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);

-- =============================================
-- PASSO 3: Garantir que RLS está Ativo
-- =============================================

ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PASSO 4: Adicionar Comentários (Documentação)
-- =============================================

COMMENT ON POLICY "authenticated_users_can_view_cards" ON kanban_cards IS
  'Permite que qualquer usuário autenticado visualize cards do kanban. Política permissiva para colaboração.';

COMMENT ON POLICY "authenticated_users_can_create_cards" ON kanban_cards IS
  'Permite que qualquer usuário autenticado crie novos cards no kanban. Facilita workflow colaborativo.';

COMMENT ON POLICY "authenticated_users_can_update_cards" ON kanban_cards IS
  'Permite que qualquer usuário autenticado atualize cards (mover entre colunas, editar campos, etc). Essencial para kanban colaborativo.';

COMMENT ON POLICY "managers_can_delete_cards" ON kanban_cards IS
  'Restringe deleção de cards apenas para usuários com perfil admin ou gestor. Protege contra deleções acidentais.';

-- =============================================
-- PASSO 5: Log de Sucesso
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies para kanban_cards atualizadas com sucesso!';
  RAISE NOTICE 'Políticas criadas:';
  RAISE NOTICE '  - SELECT:  authenticated_users_can_view_cards';
  RAISE NOTICE '  - INSERT:  authenticated_users_can_create_cards';
  RAISE NOTICE '  - UPDATE:  authenticated_users_can_update_cards';
  RAISE NOTICE '  - DELETE:  managers_can_delete_cards';
END $$;

COMMIT;

-- =============================================
-- VALIDAÇÃO (Executar após aplicar migration)
-- =============================================

-- Verificar políticas criadas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'kanban_cards'
-- ORDER BY cmd, policyname;

-- Testar UPDATE (substitua <card_id> por ID real):
-- BEGIN;
--   UPDATE kanban_cards SET posicao = 999 WHERE id = '<card_id>';
--   SELECT id, titulo, posicao FROM kanban_cards WHERE id = '<card_id>';
-- ROLLBACK;
