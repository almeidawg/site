-- =============================================
-- MIGRATION: 003
-- Descrição: Criar tabelas do sistema Kanban/Pipeline
-- Data: 2025-10-30
-- Autor: Equipe WG
-- =============================================
-- Tabelas criadas:
--   - entities (entidades genéricas: clientes, leads, fornecedores)
--   - kanban_boards (quadros kanban)
--   - kanban_colunas (colunas dos quadros)
--   - kanban_cards (cards/oportunidades)
--   - pipelines (histórico de pipeline)
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. TABELA: entities (entidades genéricas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'lead', 'fornecedor')),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  dados JSONB DEFAULT '{}'::jsonb,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_entities_tipo ON entities(tipo);
CREATE INDEX idx_entities_ativo ON entities(ativo);
CREATE INDEX idx_entities_email ON entities(email);
CREATE INDEX idx_entities_cpf_cnpj ON entities(cpf_cnpj);
CREATE INDEX idx_entities_dados ON entities USING gin (dados);

-- Trigger
CREATE TRIGGER entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE entities IS 'Entidades genéricas: clientes, leads, fornecedores';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. TABELA: kanban_boards (quadros kanban)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambiente TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_kanban_boards_ambiente ON kanban_boards(ambiente);

-- Comentário
COMMENT ON TABLE kanban_boards IS 'Quadros Kanban para diferentes contextos';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. TABELA: kanban_colunas (colunas dos quadros)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.kanban_colunas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES kanban_boards(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  cor TEXT DEFAULT '#94a3b8',
  posicao INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, posicao)
);

-- Índices
CREATE INDEX idx_kanban_colunas_board ON kanban_colunas(board_id);
CREATE INDEX idx_kanban_colunas_posicao ON kanban_colunas(posicao);

-- Comentário
COMMENT ON TABLE kanban_colunas IS 'Colunas dos quadros Kanban';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. TABELA: kanban_cards (cards/oportunidades)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coluna_id UUID REFERENCES kanban_colunas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(15, 2),
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  posicao INTEGER NOT NULL DEFAULT 0,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_kanban_cards_coluna ON kanban_cards(coluna_id);
CREATE INDEX idx_kanban_cards_responsavel ON kanban_cards(responsavel_id);
CREATE INDEX idx_kanban_cards_entity ON kanban_cards(entity_id);
CREATE INDEX idx_kanban_cards_dados ON kanban_cards USING gin (dados);

-- Trigger
CREATE TRIGGER kanban_cards_updated_at
  BEFORE UPDATE ON kanban_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE kanban_cards IS 'Cards do Kanban (oportunidades, leads, etc)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. TABELA: pipelines (histórico de pipeline)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  estagio TEXT,
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  valor NUMERIC(15, 2),
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pipelines_entity ON pipelines(entity_id);
CREATE INDEX idx_pipelines_estagio ON pipelines(estagio);

-- Comentário
COMMENT ON TABLE pipelines IS 'Histórico de pipelines de vendas';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DADOS INICIAIS (seed)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Criar board de oportunidades
INSERT INTO kanban_boards (ambiente, titulo, descricao) VALUES
  ('oportunidades', 'Pipeline de Vendas', 'Funil de vendas com oportunidades')
ON CONFLICT (ambiente) DO NOTHING;

-- Criar colunas padrão para oportunidades
DO $$
DECLARE
  v_board_id UUID;
BEGIN
  SELECT id INTO v_board_id FROM kanban_boards WHERE ambiente = 'oportunidades';

  IF v_board_id IS NOT NULL THEN
    INSERT INTO kanban_colunas (board_id, titulo, cor, posicao) VALUES
      (v_board_id, 'Lead', '#ef4444', 0),
      (v_board_id, 'Qualificação', '#f59e0b', 1),
      (v_board_id, 'Proposta', '#3b82f6', 2),
      (v_board_id, 'Negociação', '#8b5cf6', 3),
      (v_board_id, 'Fechamento', '#10b981', 4)
    ON CONFLICT (board_id, posicao) DO NOTHING;
  END IF;
END;
$$;

-- Criar board de leads
INSERT INTO kanban_boards (ambiente, titulo, descricao) VALUES
  ('leads', 'Captação de Leads', 'Gestão de leads capturados')
ON CONFLICT (ambiente) DO NOTHING;

-- Criar board de obras
INSERT INTO kanban_boards (ambiente, titulo, descricao) VALUES
  ('obras', 'Gestão de Obras', 'Acompanhamento de projetos em execução')
ON CONFLICT (ambiente) DO NOTHING;
