-- =============================================
-- MIGRATION: 006
-- Descrição: Criar tabelas faltando (CRÍTICAS!)
-- Data: 2025-10-30
-- Autor: Equipe WG
-- =============================================
-- Tabelas criadas:
--   - assistencias (ordens de serviço / assistência técnica)
--   - produtos_servicos (catálogo de produtos e serviços)
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. TABELA: assistencias (CRÍTICA - Estava faltando!)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.assistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,
  cliente_nome TEXT,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'agendado', 'em_atendimento', 'atendido', 'em_atraso')),
  data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  observacoes TEXT,
  data_agendamento TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_assistencias_cliente ON assistencias(cliente_id);
CREATE INDEX idx_assistencias_status ON assistencias(status);
CREATE INDEX idx_assistencias_codigo ON assistencias(codigo);
CREATE INDEX idx_assistencias_data ON assistencias(data_solicitacao);
CREATE INDEX idx_assistencias_responsavel ON assistencias(responsavel_id);

-- Trigger
CREATE TRIGGER assistencias_updated_at
  BEFORE UPDATE ON assistencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE assistencias IS 'Ordens de Serviço / Assistências técnicas';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. TABELA: produtos_servicos (CRÍTICA - Estava faltando!)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.produtos_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  categoria TEXT,
  tipo TEXT CHECK (tipo IN ('produto', 'servico', 'ambos')),
  preco NUMERIC(15, 2) DEFAULT 0,
  unidade TEXT DEFAULT 'un',
  codigo_interno TEXT UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  imagem_url TEXT,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_produtos_servicos_ativo ON produtos_servicos(ativo);
CREATE INDEX idx_produtos_servicos_nome ON produtos_servicos(nome);
CREATE INDEX idx_produtos_servicos_categoria ON produtos_servicos(categoria);
CREATE INDEX idx_produtos_servicos_tipo ON produtos_servicos(tipo);
CREATE INDEX idx_produtos_servicos_codigo ON produtos_servicos(codigo_interno);

-- Trigger
CREATE TRIGGER produtos_servicos_updated_at
  BEFORE UPDATE ON produtos_servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE produtos_servicos IS 'Catálogo de produtos e serviços oferecidos pela empresa';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DADOS INICIAIS (seed)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Produtos/Serviços padrão
INSERT INTO produtos_servicos (nome, descricao, categoria, tipo, preco, unidade) VALUES
  ('Projeto Arquitetônico', 'Projeto arquitetônico completo', 'Arquitetura', 'servico', 5000.00, 'm²'),
  ('Projeto de Interiores', 'Projeto de design de interiores', 'Arquitetura', 'servico', 3000.00, 'm²'),
  ('Acompanhamento de Obra', 'Acompanhamento técnico de obra', 'Obras', 'servico', 2000.00, 'mês'),
  ('Móvel Planejado', 'Móveis planejados sob medida', 'Marcenaria', 'produto', 1500.00, 'm²')
ON CONFLICT (nome) DO NOTHING;
