-- =============================================
-- MIGRATION: 012
-- Descrição: Sistema completo - Tabelas faltantes, Registros de Trabalho e Views Críticas
-- Data: 2025-11-02
-- Autor: Supabase MCP Expert
-- =============================================
-- O que será criado:
--   PARTE 1: Tabelas Base Faltantes (4 tabelas)
--     - contratos (contratos com clientes)
--     - propostas (propostas comerciais)
--     - obras (gestão de obras/projetos)
--     - lancamentos_financeiros (lançamentos financeiros detalhados)
--
--   PARTE 2: Sistema de Registros de Trabalho (2 tabelas)
--     - registro_categorias (categorias de registros)
--     - registros_trabalho (registros diários de trabalho)
--
--   PARTE 3: Views SQL Críticas (7 views)
--     - v_clientes_ativos_contratos
--     - v_fluxo_caixa
--     - v_despesas_mes_categoria
--     - v_top10_clientes_receita
--     - vw_pipeline_oportunidades (atualizada)
--     - v_kanban_cards_board
--     - v_registros_trabalho
-- =============================================


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 1: TABELAS BASE FALTANTES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1.1 TABELA: contratos
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,
  proposta_id UUID, -- FK será adicionada depois que propostas for criada
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  data_assinatura DATE,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'concluido', 'cancelado')),
  tipo TEXT CHECK (tipo IN ('arquitetura', 'marcenaria', 'engenharia', 'consultoria', 'outros')),
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_proposta ON contratos(proposta_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_numero ON contratos(numero);
CREATE INDEX IF NOT EXISTS idx_contratos_responsavel ON contratos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_contratos_dados ON contratos USING gin (dados);

-- Trigger
CREATE TRIGGER contratos_updated_at
  BEFORE UPDATE ON contratos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE contratos IS 'Contratos firmados com clientes';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1.2 TABELA: propostas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  validade_dias INTEGER DEFAULT 30,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_validade DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('rascunho', 'pendente', 'enviada', 'aprovada', 'rejeitada', 'cancelada')),
  tipo TEXT CHECK (tipo IN ('arquitetura', 'marcenaria', 'engenharia', 'consultoria', 'outros')),
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  observacoes TEXT,
  itens JSONB DEFAULT '[]'::jsonb,
  anexos JSONB DEFAULT '[]'::jsonb,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propostas_cliente ON propostas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);
CREATE INDEX IF NOT EXISTS idx_propostas_numero ON propostas(numero);
CREATE INDEX IF NOT EXISTS idx_propostas_responsavel ON propostas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_propostas_data_emissao ON propostas(data_emissao);
CREATE INDEX IF NOT EXISTS idx_propostas_dados ON propostas USING gin (dados);
CREATE INDEX IF NOT EXISTS idx_propostas_itens ON propostas USING gin (itens);

-- Trigger
CREATE TRIGGER propostas_updated_at
  BEFORE UPDATE ON propostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE propostas IS 'Propostas comerciais enviadas para clientes';

-- Adicionar foreign key para contratos agora que propostas existe
ALTER TABLE contratos ADD CONSTRAINT contratos_proposta_id_fkey
  FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE SET NULL;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1.3 TABELA: obras
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,
  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  status TEXT DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'em_execucao', 'finalizada', 'atrasada')),
  data_inicio DATE,
  data_fim_prevista DATE,
  data_fim_real DATE,
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  valor_orcado NUMERIC(15, 2) DEFAULT 0,
  valor_realizado NUMERIC(15, 2) DEFAULT 0,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_obras_cliente ON obras(cliente_id);
CREATE INDEX IF NOT EXISTS idx_obras_contrato ON obras(contrato_id);
CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);
CREATE INDEX IF NOT EXISTS idx_obras_codigo ON obras(codigo);
CREATE INDEX IF NOT EXISTS idx_obras_responsavel ON obras(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_obras_dados ON obras USING gin (dados);

-- Trigger
CREATE TRIGGER obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE obras IS 'Gestão de obras e projetos em execução';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1.4 TABELA: lancamentos_financeiros
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receber', 'pagar')),
  categoria TEXT,
  categoria_id UUID REFERENCES plano_contas(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'previsto' CHECK (status IN ('previsto', 'aprovado', 'recebido', 'pago', 'cancelado', 'vencido')),
  forma_pagamento TEXT,
  conta_financeira_id UUID REFERENCES contas_financeiras(id) ON DELETE SET NULL,
  centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  titulo_id UUID REFERENCES titulos_financeiros(id) ON DELETE SET NULL,
  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
  observacoes TEXT,
  documento TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_empresa ON lancamentos_financeiros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_cliente ON lancamentos_financeiros(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_tipo ON lancamentos_financeiros(tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_status ON lancamentos_financeiros(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_categoria ON lancamentos_financeiros(categoria);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_vencimento ON lancamentos_financeiros(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_emissao ON lancamentos_financeiros(data_emissao);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_contrato ON lancamentos_financeiros(contrato_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_financeiros_obra ON lancamentos_financeiros(obra_id);

-- Trigger
CREATE TRIGGER lancamentos_financeiros_updated_at
  BEFORE UPDATE ON lancamentos_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE lancamentos_financeiros IS 'Lançamentos financeiros detalhados (contas a pagar e receber)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 2: SISTEMA DE REGISTROS DE TRABALHO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2.1 TABELA: registro_categorias
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.registro_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_registro_categorias_ativo ON registro_categorias(ativo);
CREATE INDEX IF NOT EXISTS idx_registro_categorias_nome ON registro_categorias(nome);

-- Trigger
CREATE TRIGGER registro_categorias_updated_at
  BEFORE UPDATE ON registro_categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE registro_categorias IS 'Categorias para classificação de registros de trabalho';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2.2 TABELA: registros_trabalho
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.registros_trabalho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,
  proposta_id UUID REFERENCES propostas(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria_id UUID REFERENCES registro_categorias(id) ON DELETE SET NULL NOT NULL,
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10, 2) DEFAULT 1,
  unidade TEXT DEFAULT 'un',
  valor_unitario NUMERIC(15, 2) DEFAULT 0,
  valor_total NUMERIC(15, 2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  anexos JSONB DEFAULT '[]'::jsonb,
  aprovado BOOLEAN DEFAULT FALSE,
  aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_em TIMESTAMPTZ,
  gerar_lancamento BOOLEAN DEFAULT FALSE,
  lancamento_id UUID REFERENCES lancamentos_financeiros(id) ON DELETE SET NULL,
  observacoes TEXT,
  dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_profissional ON registros_trabalho(profissional_id);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_cliente ON registros_trabalho(cliente_id);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_proposta ON registros_trabalho(proposta_id);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_obra ON registros_trabalho(obra_id);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_contrato ON registros_trabalho(contrato_id);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_data ON registros_trabalho(data);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_categoria ON registros_trabalho(categoria_id);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_aprovado ON registros_trabalho(aprovado);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_lancamento ON registros_trabalho(lancamento_id);
CREATE INDEX IF NOT EXISTS idx_registros_trabalho_dados ON registros_trabalho USING gin (dados);

-- Trigger
CREATE TRIGGER registros_trabalho_updated_at
  BEFORE UPDATE ON registros_trabalho
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE registros_trabalho IS 'Registros diários de trabalho dos profissionais (horas, serviços, materiais)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 3: VIEWS SQL CRÍTICAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3.1 VIEW: v_clientes_ativos_contratos
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP VIEW IF EXISTS v_clientes_ativos_contratos CASCADE;

CREATE OR REPLACE VIEW v_clientes_ativos_contratos AS
SELECT
  e.id as cliente_id,
  e.nome as nome_razao_social,
  e.email,
  e.telefone,
  e.cidade,
  e.estado,
  COUNT(DISTINCT c.id) as total_contratos,
  COUNT(DISTINCT CASE WHEN c.status = 'ativo' THEN c.id END) as contratos_ativos,
  COALESCE(SUM(c.valor_total), 0) as valor_total_contratos,
  COALESCE(SUM(CASE WHEN c.status = 'ativo' THEN c.valor_total ELSE 0 END), 0) as valor_contratos_ativos,
  MAX(c.created_at) as ultimo_contrato_data
FROM entities e
LEFT JOIN contratos c ON c.cliente_id = e.id
WHERE e.tipo = 'cliente' AND e.ativo = TRUE
GROUP BY e.id, e.nome, e.email, e.telefone, e.cidade, e.estado
ORDER BY valor_total_contratos DESC;

COMMENT ON VIEW v_clientes_ativos_contratos IS 'Clientes ativos com estatísticas de contratos';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3.2 VIEW: v_fluxo_caixa
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP VIEW IF EXISTS v_fluxo_caixa CASCADE;

CREATE OR REPLACE VIEW v_fluxo_caixa AS
SELECT
  data_vencimento as data,
  SUM(CASE WHEN tipo = 'receber' THEN valor ELSE 0 END) as total_receber,
  SUM(CASE WHEN tipo = 'pagar' THEN valor ELSE 0 END) as total_pagar,
  SUM(CASE WHEN tipo = 'receber' THEN valor ELSE -valor END) as saldo_dia,
  status,
  COUNT(*) as quantidade_lancamentos
FROM lancamentos_financeiros
WHERE status NOT IN ('cancelado')
GROUP BY data_vencimento, status
ORDER BY data_vencimento;

COMMENT ON VIEW v_fluxo_caixa IS 'Fluxo de caixa diário (entradas vs saídas)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3.3 VIEW: v_despesas_mes_categoria
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP VIEW IF EXISTS v_despesas_mes_categoria CASCADE;

CREATE OR REPLACE VIEW v_despesas_mes_categoria AS
SELECT
  DATE_TRUNC('month', data_vencimento) as mes,
  COALESCE(categoria, 'Sem Categoria') as categoria,
  COUNT(*) as quantidade,
  SUM(valor) as total,
  AVG(valor) as media,
  status
FROM lancamentos_financeiros
WHERE tipo = 'pagar'
GROUP BY DATE_TRUNC('month', data_vencimento), categoria, status
ORDER BY mes DESC, total DESC;

COMMENT ON VIEW v_despesas_mes_categoria IS 'Despesas agrupadas por mês e categoria';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3.4 VIEW: v_top10_clientes_receita
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP VIEW IF EXISTS v_top10_clientes_receita CASCADE;

CREATE OR REPLACE VIEW v_top10_clientes_receita AS
SELECT
  e.id as cliente_id,
  e.nome as nome_razao_social,
  e.email,
  e.telefone,
  e.cidade,
  COUNT(DISTINCT lf.id) as total_lancamentos,
  SUM(CASE WHEN lf.status IN ('recebido', 'pago') THEN lf.valor ELSE 0 END) as receita_realizada,
  SUM(CASE WHEN lf.status IN ('previsto', 'aprovado') THEN lf.valor ELSE 0 END) as receita_prevista,
  SUM(lf.valor) as receita_total,
  MAX(lf.data_pagamento) as ultima_receita_data
FROM entities e
JOIN lancamentos_financeiros lf ON lf.cliente_id = e.id
WHERE e.tipo = 'cliente'
  AND lf.tipo = 'receber'
GROUP BY e.id, e.nome, e.email, e.telefone, e.cidade
ORDER BY receita_realizada DESC
LIMIT 10;

COMMENT ON VIEW v_top10_clientes_receita IS 'Top 10 clientes por receita realizada';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3.5 VIEW: vw_pipeline_oportunidades (ATUALIZADA)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP VIEW IF EXISTS vw_pipeline_oportunidades CASCADE;

CREATE OR REPLACE VIEW vw_pipeline_oportunidades AS
SELECT
  kc.id as coluna_id,
  kc.titulo as etapa,
  kc.cor as cor_etapa,
  kc.posicao,
  kb.ambiente as modulo,
  COUNT(k.id) as qtde_cards,
  COALESCE(SUM(k.valor), 0) as valor_total,
  COALESCE(AVG(k.valor), 0) as valor_medio,
  COUNT(CASE WHEN k.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as novos_ultimos_7_dias
FROM kanban_colunas kc
JOIN kanban_boards kb ON kb.id = kc.board_id
LEFT JOIN kanban_cards k ON k.coluna_id = kc.id
WHERE kb.ambiente = 'oportunidades'
GROUP BY kc.id, kc.titulo, kc.cor, kc.posicao, kb.ambiente
ORDER BY kc.posicao;

COMMENT ON VIEW vw_pipeline_oportunidades IS 'Pipeline de oportunidades com estatísticas por etapa';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3.6 VIEW: v_kanban_cards_board
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP VIEW IF EXISTS v_kanban_cards_board CASCADE;

CREATE OR REPLACE VIEW v_kanban_cards_board AS
SELECT
  k.id,
  k.titulo,
  k.descricao,
  k.valor,
  k.posicao,
  k.dados as payload,
  k.created_at,
  k.updated_at,
  kb.ambiente as modulo,
  kb.titulo as board_titulo,
  k.coluna_id,
  kc.titulo as status,
  kc.cor as status_cor,
  kc.posicao as status_posicao,
  p.id as responsavel_id,
  p.nome as responsavel_nome,
  e.id as entity_id,
  e.tipo as entity_tipo,
  e.nome as entity_nome
FROM kanban_cards k
JOIN kanban_colunas kc ON k.coluna_id = kc.id
JOIN kanban_boards kb ON kb.id = kc.board_id
LEFT JOIN profiles p ON k.responsavel_id = p.id
LEFT JOIN entities e ON k.entity_id = e.id
ORDER BY kb.ambiente, kc.posicao, k.posicao;

COMMENT ON VIEW v_kanban_cards_board IS 'Cards do kanban com informações completas do board';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3.7 VIEW: v_registros_trabalho
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP VIEW IF EXISTS v_registros_trabalho CASCADE;

CREATE OR REPLACE VIEW v_registros_trabalho AS
SELECT
  rt.id,
  rt.data,
  rt.descricao,
  rt.quantidade,
  rt.unidade,
  rt.valor_unitario,
  rt.valor_total,
  rt.aprovado,
  rt.aprovado_em,
  rt.gerar_lancamento,
  rt.observacoes,
  rt.created_at,

  -- Profissional
  ep.id as profissional_id,
  ep.nome as profissional_nome,
  ep.email as profissional_email,

  -- Cliente
  ec.id as cliente_id,
  ec.nome as cliente_nome,
  ec.email as cliente_email,

  -- Categoria
  rc.id as categoria_id,
  rc.nome as categoria_nome,
  rc.cor as categoria_cor,

  -- Aprovador
  ap.id as aprovador_id,
  ap.nome as aprovador_nome,

  -- Obra (se houver)
  o.id as obra_id,
  o.titulo as obra_titulo,
  o.codigo as obra_codigo,

  -- Proposta (se houver)
  pr.id as proposta_id,
  pr.numero as proposta_numero,

  -- Contrato (se houver)
  ct.id as contrato_id,
  ct.numero as contrato_numero,

  -- Lançamento Financeiro (se gerado)
  lf.id as lancamento_id,
  lf.status as lancamento_status

FROM registros_trabalho rt
JOIN profiles ep ON ep.id = rt.profissional_id
JOIN entities ec ON ec.id = rt.cliente_id
JOIN registro_categorias rc ON rc.id = rt.categoria_id
LEFT JOIN profiles ap ON ap.id = rt.aprovado_por
LEFT JOIN obras o ON o.id = rt.obra_id
LEFT JOIN propostas pr ON pr.id = rt.proposta_id
LEFT JOIN contratos ct ON ct.id = rt.contrato_id
LEFT JOIN lancamentos_financeiros lf ON lf.id = rt.lancamento_id
ORDER BY rt.data DESC, rt.created_at DESC;

COMMENT ON VIEW v_registros_trabalho IS 'Registros de trabalho com informações completas (profissional, cliente, categoria, etc)';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DADOS INICIAIS (SEED)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Categorias de registro padrão
INSERT INTO registro_categorias (nome, descricao, cor) VALUES
  ('Horas Trabalhadas', 'Registro de horas de trabalho', '#3b82f6'),
  ('Materiais', 'Materiais utilizados na obra', '#10b981'),
  ('Equipamentos', 'Uso de equipamentos', '#f59e0b'),
  ('Deslocamento', 'Deslocamento até obra', '#8b5cf6'),
  ('Consultoria', 'Horas de consultoria', '#06b6d4'),
  ('Projeto', 'Horas de projeto', '#ec4899')
ON CONFLICT (nome) DO NOTHING;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION 012
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
