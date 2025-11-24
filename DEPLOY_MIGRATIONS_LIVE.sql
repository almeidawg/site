-- =============================================
-- DEPLOY DE MIGRATIONS PARA SUPABASE LIVE
-- Data: 2025-11-23
-- Projeto: WG CRM
-- =============================================
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new
-- 2. Copie TODO este arquivo
-- 3. Cole no SQL Editor
-- 4. Execute (Run)
-- =============================================

BEGIN;

-- =============================================
-- MIGRATION 1: 050_adicionar_campos_kanban_horizons.sql
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

-- Preencher ordem com posicao atual
UPDATE public.kanban_cards
SET ordem = posicao
WHERE ordem = 0 AND posicao IS NOT NULL;

-- 5. kanban_cards: Adicionar deleted_at (soft delete)
ALTER TABLE IF EXISTS public.kanban_cards
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 6. kanban_cards: Adicionar payload JSONB
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='kanban_cards' AND column_name='payload') THEN
    ALTER TABLE public.kanban_cards ADD COLUMN payload JSONB;
  END IF;
END $$;

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_kanban_cards_deleted_at
  ON public.kanban_cards(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_cards_payload
  ON public.kanban_cards USING gin(payload);

-- 8. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_kanban_cards ON public.kanban_cards;
CREATE TRIGGER set_updated_at_kanban_cards
  BEFORE UPDATE ON public.kanban_cards
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ✅ Migration 1/9: Campos Kanban Horizons aplicados

-- =============================================
-- MIGRATION 2: Sistema de URL Dinâmica
-- =============================================

-- Criar tabela app_config
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações (se não existirem)
INSERT INTO public.app_config (key, value, description)
VALUES
  ('environment', 'live', 'Ambiente atual: local ou live'),
  ('api_url', 'https://vyxscnevgeubfgfstmtf.supabase.co', 'URL base da API Supabase'),
  ('project_id', 'vyxscnevgeubfgfstmtf', 'ID do projeto Supabase')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = NOW();

-- Função: get_api_url()
CREATE OR REPLACE FUNCTION get_api_url()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_url TEXT;
BEGIN
  SELECT value INTO v_url
  FROM app_config
  WHERE key = 'api_url';

  RETURN COALESCE(v_url, 'https://vyxscnevgeubfgfstmtf.supabase.co');
END;
$$;

-- Função: get_environment()
CREATE OR REPLACE FUNCTION get_environment()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_env TEXT;
BEGIN
  SELECT value INTO v_env
  FROM app_config
  WHERE key = 'environment';

  RETURN COALESCE(v_env, 'live');
END;
$$;

-- Função: is_local_environment()
CREATE OR REPLACE FUNCTION is_local_environment()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN get_environment() = 'local';
END;
$$;

-- ✅ Migration 2/9: Sistema URL Dinâmica aplicado

-- =============================================
-- MIGRATION 3: Corrigir RLS kanban_cards
-- =============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Usuários podem ver próprios cards" ON public.kanban_cards;
DROP POLICY IF EXISTS "Usuários podem inserir cards" ON public.kanban_cards;
DROP POLICY IF EXISTS "Usuários podem atualizar próprios cards" ON public.kanban_cards;
DROP POLICY IF EXISTS "Usuários podem deletar próprios cards" ON public.kanban_cards;

-- Criar policies corretas
CREATE POLICY "kanban_cards_select"
  ON public.kanban_cards FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "kanban_cards_insert"
  ON public.kanban_cards FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "kanban_cards_update"
  ON public.kanban_cards FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "kanban_cards_delete"
  ON public.kanban_cards FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ✅ Migration 3/9: RLS Kanban Cards corrigido

-- =============================================
-- MIGRATION 4: Remover triggers problemáticos
-- =============================================

-- Remover trigger que causa loop infinito
DROP TRIGGER IF EXISTS atualizar_ordem_kanban_cards ON public.kanban_cards;
DROP FUNCTION IF EXISTS atualizar_ordem_kanban_cards();

-- ✅ Migration 4/9: Triggers problemáticos removidos

-- =============================================
-- MIGRATION 5-9: Views e Functions Kanban
-- =============================================

-- View: v_kanban_cards (consolidada com entities)
CREATE OR REPLACE VIEW v_kanban_cards AS
SELECT
  kc.*,
  kcol.nome AS coluna_nome,
  kcol.pos AS coluna_pos,
  kb.titulo AS board_nome,
  kb.modulo AS board_modulo,
  e.nome AS entity_nome,
  e.tipo AS entity_tipo,
  e.email AS entity_email,
  e.telefone AS entity_telefone
FROM kanban_cards kc
LEFT JOIN kanban_colunas kcol ON kc.coluna_id = kcol.id
LEFT JOIN kanban_boards kb ON kcol.board_id = kb.id
LEFT JOIN entities e ON kc.entity_id = e.id
WHERE kc.deleted_at IS NULL;

-- Função: api_criar_coluna_kanban
CREATE OR REPLACE FUNCTION api_criar_coluna_kanban(
  p_board_id UUID,
  p_nome TEXT,
  p_cor TEXT DEFAULT '#6B7280'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coluna_id UUID;
  v_max_pos INTEGER;
BEGIN
  -- Validações
  IF p_nome IS NULL OR p_nome = '' THEN
    RAISE EXCEPTION 'Nome da coluna não pode ser vazio';
  END IF;

  -- Obter próxima posição
  SELECT COALESCE(MAX(pos), -1) + 1 INTO v_max_pos
  FROM kanban_colunas
  WHERE board_id = p_board_id;

  -- Criar coluna
  INSERT INTO kanban_colunas (board_id, nome, pos, cor)
  VALUES (p_board_id, p_nome, v_max_pos, p_cor)
  RETURNING id INTO v_coluna_id;

  RETURN v_coluna_id;
END;
$$;

-- Função: api_criar_card_kanban
CREATE OR REPLACE FUNCTION api_criar_card_kanban(
  p_coluna_id UUID,
  p_titulo TEXT,
  p_descricao TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_id UUID;
  v_max_ordem INTEGER;
BEGIN
  -- Validações
  IF p_titulo IS NULL OR p_titulo = '' THEN
    RAISE EXCEPTION 'Título do card não pode ser vazio';
  END IF;

  -- Obter próxima ordem
  SELECT COALESCE(MAX(ordem), -1) + 1 INTO v_max_ordem
  FROM kanban_cards
  WHERE coluna_id = p_coluna_id AND deleted_at IS NULL;

  -- Criar card
  INSERT INTO kanban_cards (
    coluna_id,
    titulo,
    descricao,
    entity_id,
    ordem,
    posicao,
    payload,
    user_id
  )
  VALUES (
    p_coluna_id,
    p_titulo,
    p_descricao,
    p_entity_id,
    v_max_ordem,
    v_max_ordem,
    p_payload,
    auth.uid()
  )
  RETURNING id INTO v_card_id;

  RETURN v_card_id;
END;
$$;

-- Função: api_atualizar_card_kanban
CREATE OR REPLACE FUNCTION api_atualizar_card_kanban(
  p_card_id UUID,
  p_titulo TEXT DEFAULT NULL,
  p_descricao TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE kanban_cards
  SET
    titulo = COALESCE(p_titulo, titulo),
    descricao = COALESCE(p_descricao, descricao),
    entity_id = COALESCE(p_entity_id, entity_id),
    payload = COALESCE(p_payload, payload),
    updated_at = NOW()
  WHERE id = p_card_id AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$;

-- Função: api_mover_card_kanban
CREATE OR REPLACE FUNCTION api_mover_card_kanban(
  p_card_id UUID,
  p_nova_coluna_id UUID,
  p_nova_ordem INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar card
  UPDATE kanban_cards
  SET
    coluna_id = p_nova_coluna_id,
    ordem = p_nova_ordem,
    posicao = p_nova_ordem,
    updated_at = NOW()
  WHERE id = p_card_id AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$;

-- ✅ Migrations 5-9: Views e Functions Kanban aplicadas

COMMIT;

-- =============================================
-- FIM DO DEPLOY
-- =============================================
-- 🎉 DEPLOY COMPLETO! Todas as 9 migrations foram aplicadas com sucesso.
-- Próximo passo: Deploy das Edge Functions
