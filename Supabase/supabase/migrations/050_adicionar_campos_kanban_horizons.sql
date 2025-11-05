-- =============================================
-- Migration: Adicionar campos Kanban (Horizons compatibility)
-- Data: 2025-11-04
-- Objetivo: Compatibilizar schema local com código Horizons
-- =============================================

-- 1. kanban_boards: Adicionar coluna modulo
ALTER TABLE IF EXISTS public.kanban_boards
  ADD COLUMN IF NOT EXISTS modulo VARCHAR(50);

-- Copiar dados de ambiente para modulo (se existir)
UPDATE public.kanban_boards
SET modulo = ambiente
WHERE modulo IS NULL AND ambiente IS NOT NULL;

-- 2. kanban_colunas: Renomear titulo → nome
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='kanban_colunas' AND column_name='titulo') THEN
    ALTER TABLE public.kanban_colunas RENAME COLUMN titulo TO nome;
  END IF;
END $$;

-- 3. kanban_colunas: Renomear posicao → pos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='kanban_colunas' AND column_name='posicao') THEN
    ALTER TABLE public.kanban_colunas RENAME COLUMN posicao TO pos;
  END IF;
END $$;

-- 4. kanban_cards: Adicionar ordem
ALTER TABLE IF EXISTS public.kanban_cards
  ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Preencher ordem com posicao atual (campo existente)
UPDATE public.kanban_cards
SET ordem = posicao
WHERE ordem = 0 AND posicao IS NOT NULL;

-- 5. kanban_cards: Adicionar deleted_at (soft delete)
ALTER TABLE IF EXISTS public.kanban_cards
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 6. kanban_cards: Adicionar ou alterar payload para JSONB
DO $$
BEGIN
  -- Verificar se coluna payload existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='kanban_cards'
                   AND column_name='payload') THEN
    -- Se não existe, criar como JSONB
    ALTER TABLE public.kanban_cards ADD COLUMN payload JSONB DEFAULT '{}'::jsonb;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name='kanban_cards'
                  AND column_name='payload'
                  AND data_type != 'jsonb') THEN
    -- Se existe mas não é JSONB, converter
    ALTER TABLE public.kanban_cards ADD COLUMN payload_temp JSONB;

    -- Converter TEXT/VARCHAR para JSONB
    UPDATE public.kanban_cards
    SET payload_temp = COALESCE(payload::jsonb, '{}'::jsonb)
    WHERE payload IS NOT NULL;

    -- Dropar coluna antiga e renomear
    ALTER TABLE public.kanban_cards DROP COLUMN payload;
    ALTER TABLE public.kanban_cards RENAME COLUMN payload_temp TO payload;

    -- Adicionar default
    ALTER TABLE public.kanban_cards
      ALTER COLUMN payload SET DEFAULT '{}'::jsonb;
  ELSE
    -- Se já é JSONB, apenas garantir o default
    ALTER TABLE public.kanban_cards
      ALTER COLUMN payload SET DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_kanban_cards_deleted_at
  ON public.kanban_cards(deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_cards_ordem
  ON public.kanban_cards(ordem);

CREATE INDEX IF NOT EXISTS idx_kanban_colunas_pos
  ON public.kanban_colunas(pos);

-- 8. Atualizar trigger para usar novo nome 'pos'
DROP TRIGGER IF EXISTS kanban_colunas_set_pos ON kanban_colunas;
DROP FUNCTION IF EXISTS trigger_kanban_colunas_set_pos();

CREATE OR REPLACE FUNCTION trigger_kanban_colunas_set_pos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_pos integer;
BEGIN
    -- Ao inserir nova coluna
    IF TG_OP = 'INSERT' THEN
        -- Se não foi especificada posição, colocar no final
        IF NEW.pos IS NULL OR NEW.pos = 0 THEN
            SELECT COALESCE(MAX(pos), 0) + 1
            INTO v_max_pos
            FROM kanban_colunas
            WHERE board_id = NEW.board_id;

            NEW.pos := v_max_pos;
            RAISE NOTICE 'Coluna inserida na posição % do board %', NEW.pos, NEW.board_id;
        ELSE
            -- Abrir espaço se necessário
            UPDATE kanban_colunas
            SET pos = pos + 1
            WHERE board_id = NEW.board_id
                AND pos >= NEW.pos
                AND id != NEW.id;
        END IF;

        NEW.created_at := NOW();
    END IF;

    -- Ao atualizar posição
    IF TG_OP = 'UPDATE' AND OLD.pos != NEW.pos THEN
        IF NEW.pos > OLD.pos THEN
            -- Movendo para direita
            UPDATE kanban_colunas
            SET pos = pos - 1
            WHERE board_id = NEW.board_id
                AND pos > OLD.pos
                AND pos <= NEW.pos
                AND id != NEW.id;
        ELSE
            -- Movendo para esquerda
            UPDATE kanban_colunas
            SET pos = pos + 1
            WHERE board_id = NEW.board_id
                AND pos >= NEW.pos
                AND pos < OLD.pos
                AND id != NEW.id;
        END IF;

        RAISE NOTICE 'Coluna reposicionada de % para %', OLD.pos, NEW.pos;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER kanban_colunas_set_pos
    BEFORE INSERT OR UPDATE OF pos ON kanban_colunas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_kanban_colunas_set_pos();

-- Comentários para documentação
COMMENT ON COLUMN public.kanban_boards.modulo IS 'Módulo do board (arquitetura, engenharia, marcenaria)';
COMMENT ON COLUMN public.kanban_cards.ordem IS 'Ordem do card na coluna (drag-and-drop)';
COMMENT ON COLUMN public.kanban_cards.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN public.kanban_cards.payload IS 'Dados extras do card (comentários, checklist, etc) em JSONB';