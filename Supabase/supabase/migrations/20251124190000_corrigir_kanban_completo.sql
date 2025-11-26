-- =============================================
-- Migration: Corrigir módulo Kanban completo
-- Data: 2025-11-24
-- Descrição:
--   1. Criar função api_deletar_card_kanban (CRÍTICO)
--   2. Adicionar campo unidades ao payload (replicação)
--   3. Adicionar campo responsavel_id
--   4. Adicionar campos de deadline e comentários ao payload
--   5. Ajustar view v_kanban_cards (entity_nome → cliente_nome)
--   6. Corrigir função api_criar_card_kanban (entity_id)
-- =============================================

BEGIN;

-- =============================================
-- 1. CRIAR FUNÇÃO api_deletar_card_kanban (SOFT DELETE)
-- =============================================

CREATE OR REPLACE FUNCTION api_deletar_card_kanban(
  p_card_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar se card existe
  IF NOT EXISTS (SELECT 1 FROM kanban_cards WHERE id = p_card_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Card não encontrado ou já deletado';
  END IF;

  -- Soft delete: marcar como deletado
  UPDATE kanban_cards
  SET
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_card_id;

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_deletar_card_kanban: %', SQLERRM;
    RAISE;
END;
$$;

COMMENT ON FUNCTION api_deletar_card_kanban IS
  'Deleta (soft delete) um card do kanban. Marca deleted_at = NOW()';

-- =============================================
-- 2. ADICIONAR CAMPO responsavel_id SE NÃO EXISTIR
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'kanban_cards'
    AND column_name = 'responsavel_id'
  ) THEN
    ALTER TABLE public.kanban_cards
      ADD COLUMN responsavel_id UUID REFERENCES auth.users(id);

    CREATE INDEX IF NOT EXISTS idx_kanban_cards_responsavel
      ON kanban_cards(responsavel_id) WHERE deleted_at IS NULL;
  END IF;
END $$;

COMMENT ON COLUMN kanban_cards.responsavel_id IS
  'Responsável pela oportunidade/card (referência a auth.users ou profiles)';

-- =============================================
-- 3. GARANTIR QUE CAMPO payload EXISTE E TEM DEFAULT
-- =============================================

DO $$
BEGIN
  -- Adicionar coluna payload se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'kanban_cards'
    AND column_name = 'payload'
  ) THEN
    ALTER TABLE public.kanban_cards
      ADD COLUMN payload JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Garantir que payload não é NULL
  UPDATE kanban_cards SET payload = '{}'::jsonb WHERE payload IS NULL;
END $$;

COMMENT ON COLUMN kanban_cards.payload IS
  'Dados flexíveis: unidades[], comentários[], checklist[], deadline, etc';

-- =============================================
-- 4. RECRIAR VIEW v_kanban_cards COM CAMPOS CORRETOS
-- =============================================

DROP VIEW IF EXISTS v_kanban_cards CASCADE;

CREATE OR REPLACE VIEW v_kanban_cards AS
SELECT
  kc.id,
  kc.coluna_id,
  kc.nome AS titulo,                    -- ← ALIAS: nome → titulo
  kc.descricao,
  kc.valor_previsto AS valor,           -- ← ALIAS: valor_previsto → valor
  kc.ordem,
  kc.posicao,
  kc.responsavel_id,
  kc.entity_id,
  kc.payload,
  kc.servicos_contratados,             -- ← Array de unidades
  kc.vendedor,
  kc.indicador,
  kc.responsavel_avatar,
  kc.fase,
  kc.created_at,
  kc.updated_at,
  kc.deleted_at,

  -- Nome do cliente (já está desnormalizado na tabela)
  kc.cliente_nome,

  -- Dados da coluna
  kcol.nome AS coluna_nome,
  kcol.pos AS coluna_pos,
  kcol.cor AS coluna_cor,
  kcol.board_id,

  -- Dados do board
  kb.titulo AS board_titulo,
  kb.ambiente AS board_ambiente,
  kb.modulo AS board_modulo,

  -- Dados da entity (cliente/lead) - JOIN adicional
  e.id AS entity_id_full,
  e.nome AS entity_nome,
  e.tipo AS entity_tipo,
  e.email AS entity_email,
  e.telefone AS entity_telefone,
  e.cpf_cnpj AS entity_cpf_cnpj,
  e.cidade AS entity_cidade,
  e.estado AS entity_estado,

  -- Dados do responsável (se tiver)
  u.email AS responsavel_email,
  u.raw_user_meta_data->>'name' AS responsavel_nome

FROM kanban_cards kc
LEFT JOIN kanban_colunas kcol ON kc.coluna_id = kcol.id
LEFT JOIN kanban_boards kb ON kcol.board_id = kb.id
LEFT JOIN entities e ON kc.entity_id = e.id
LEFT JOIN auth.users u ON kc.responsavel_id = u.id
WHERE kc.deleted_at IS NULL;

COMMENT ON VIEW v_kanban_cards IS
  'View consolidada de cards do kanban com joins de colunas, boards, entities e responsáveis. Filtra apenas cards não deletados.';

-- =============================================
-- 5. RECRIAR FUNÇÃO api_criar_card_kanban COM entity_id
-- =============================================

-- Dropar TODAS as versões anteriores
DROP FUNCTION IF EXISTS api_criar_card_kanban(UUID, UUID, TEXT, TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS api_criar_card_kanban(UUID, UUID, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS api_criar_card_kanban(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS api_criar_card_kanban CASCADE;

CREATE OR REPLACE FUNCTION api_criar_card_kanban(
  p_coluna_id UUID,
  p_titulo TEXT,
  p_descricao TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_responsavel_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_servicos_contratados TEXT[] DEFAULT '{}'::text[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_id UUID;
  v_max_ordem INTEGER;
  v_cliente_nome TEXT;
BEGIN
  -- Validações
  IF p_titulo IS NULL OR p_titulo = '' THEN
    RAISE EXCEPTION 'Título do card é obrigatório';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM kanban_colunas WHERE id = p_coluna_id) THEN
    RAISE EXCEPTION 'Coluna não encontrada';
  END IF;

  -- Buscar nome do cliente se entity_id fornecido
  IF p_entity_id IS NOT NULL THEN
    SELECT nome INTO v_cliente_nome
    FROM entities
    WHERE id = p_entity_id;
  END IF;

  -- Calcular próxima ordem
  SELECT COALESCE(MAX(ordem), 0) + 1 INTO v_max_ordem
  FROM kanban_cards
  WHERE coluna_id = p_coluna_id AND deleted_at IS NULL;

  -- Inserir card (usar "nome" não "titulo")
  INSERT INTO kanban_cards (
    coluna_id,
    nome,               -- ← Campo correto!
    descricao,
    entity_id,
    cliente_nome,       -- ← Desnormalizar nome do cliente
    responsavel_id,
    ordem,
    payload,
    servicos_contratados,
    created_at,
    updated_at
  ) VALUES (
    p_coluna_id,
    p_titulo,
    p_descricao,
    p_entity_id,
    v_cliente_nome,
    p_responsavel_id,
    v_max_ordem,
    COALESCE(p_payload, '{}'::jsonb),
    COALESCE(p_servicos_contratados, '{}'::text[]),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_card_id;

  RETURN v_card_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_criar_card_kanban: %', SQLERRM;
    RAISE;
END;
$$;

COMMENT ON FUNCTION api_criar_card_kanban IS
  'Cria novo card no kanban. Parâmetros: coluna_id, titulo, descricao?, entity_id?, responsavel_id?, payload?, servicos_contratados?';

-- =============================================
-- 6. ATUALIZAR FUNÇÃO api_atualizar_card_kanban
-- =============================================

-- Dropar TODAS as versões anteriores
DROP FUNCTION IF EXISTS api_atualizar_card_kanban(UUID, JSONB);
DROP FUNCTION IF EXISTS api_atualizar_card_kanban CASCADE;

CREATE OR REPLACE FUNCTION api_atualizar_card_kanban(
  p_card_id UUID,
  p_dados JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card JSONB;
  v_cliente_nome TEXT;
BEGIN
  -- Validar se card existe
  IF NOT EXISTS (SELECT 1 FROM kanban_cards WHERE id = p_card_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Card não encontrado';
  END IF;

  -- Se entity_id mudou, buscar novo nome do cliente
  IF p_dados ? 'entity_id' THEN
    SELECT nome INTO v_cliente_nome
    FROM entities
    WHERE id = (p_dados->>'entity_id')::uuid;
  END IF;

  -- Atualizar campos dinâmicos (usar "nome" não "titulo")
  UPDATE kanban_cards
  SET
    nome = COALESCE(p_dados->>'titulo', nome),  -- ← Campo correto!
    descricao = COALESCE(p_dados->>'descricao', descricao),
    valor_previsto = COALESCE((p_dados->>'valor')::numeric, valor_previsto),
    entity_id = COALESCE((p_dados->>'entity_id')::uuid, entity_id),
    cliente_nome = COALESCE(v_cliente_nome, cliente_nome),
    responsavel_id = COALESCE((p_dados->>'responsavel_id')::uuid, responsavel_id),
    payload = COALESCE(p_dados->'payload', payload),
    servicos_contratados = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(p_dados->'servicos_contratados')))::text[],
      servicos_contratados
    ),
    updated_at = NOW()
  WHERE id = p_card_id
  RETURNING to_jsonb(kanban_cards.*) INTO v_card;

  RETURN v_card;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_atualizar_card_kanban: %', SQLERRM;
    RAISE;
END;
$$;

COMMENT ON FUNCTION api_atualizar_card_kanban IS
  'Atualiza campos de um card. Recebe JSONB com campos a atualizar: titulo, descricao, valor, entity_id, responsavel_id, payload, servicos_contratados';

-- =============================================
-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_kanban_cards_entity
  ON kanban_cards(entity_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_cards_coluna_ordem
  ON kanban_cards(coluna_id, ordem) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_cards_deleted
  ON kanban_cards(deleted_at) WHERE deleted_at IS NULL;

-- =============================================
-- 8. ATUALIZAR RLS POLICIES (BÁSICAS)
-- =============================================

-- Habilitar RLS se não estiver
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver cards" ON kanban_cards;
DROP POLICY IF EXISTS "Usuários autenticados podem criar cards" ON kanban_cards;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar cards" ON kanban_cards;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar cards" ON kanban_cards;

-- Policies básicas (todos autenticados)
CREATE POLICY "Usuários autenticados podem ver cards"
  ON kanban_cards FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Usuários autenticados podem criar cards"
  ON kanban_cards FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar cards"
  ON kanban_cards FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar cards"
  ON kanban_cards FOR DELETE
  USING (auth.role() = 'authenticated');

-- TODO: Melhorar RLS baseado em ownership (responsavel_id = auth.uid())

COMMIT;
