-- =============================================
-- Migration: Fix Kanban Cards RLS Policy
-- Data: 2025-11-03
-- Descrição: Permite que usuários autenticados movam cards no kanban
--
-- PROBLEMA RESOLVIDO:
-- - Drag-and-drop não salvava no banco
-- - RLS bloqueava UPDATE para usuários não-responsáveis
-- - Agora qualquer usuário autenticado pode mover cards
-- =============================================

-- Remover políticas antigas de UPDATE que bloqueavam movimento
DROP POLICY IF EXISTS "Managers can edit any card" ON kanban_cards;
DROP POLICY IF EXISTS "Responsible can edit own cards" ON kanban_cards;
DROP POLICY IF EXISTS "Users can update cards" ON kanban_cards;
DROP POLICY IF EXISTS "All authenticated can move cards" ON kanban_cards;
DROP POLICY IF EXISTS "Authenticated users can move cards" ON kanban_cards;

-- Recriar política para gestores/admin (mantém controle total)
-- Nota: Se já existe, será ignorada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polname = 'Managers can do everything with cards'
        AND polrelid = 'kanban_cards'::regclass
    ) THEN
        CREATE POLICY "Managers can do everything with cards"
        ON kanban_cards
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1
                FROM usuarios_perfis
                WHERE user_id = auth.uid()
                AND perfil IN ('admin', 'gestor')
            )
        );
    END IF;
END $$;

-- POLÍTICA PRINCIPAL: Qualquer usuário autenticado pode fazer UPDATE
-- Isso permite drag-and-drop no kanban para todos os usuários
CREATE POLICY "Any user can update cards"
ON kanban_cards
FOR UPDATE
TO authenticated
USING (true)      -- Qualquer usuário autenticado pode
WITH CHECK (true); -- Sempre permitir

-- Comentário explicativo
COMMENT ON POLICY "Any user can update cards" ON kanban_cards IS
'Permite que qualquer usuário autenticado faça UPDATE em cards.
Essencial para o funcionamento do drag-and-drop no kanban.
A aplicação frontend controla quais campos podem ser editados.';

-- Verificar resultado final
SELECT
    polname as policy_name,
    CASE polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command,
    polroles::regrole[] as roles
FROM pg_policy
WHERE polrelid = 'kanban_cards'::regclass
ORDER BY polcmd, polname;