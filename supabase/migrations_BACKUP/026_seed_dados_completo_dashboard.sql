-- =============================================
-- MIGRATION: 026
-- Descrição: Seed completo de dados para testar Dashboard
-- Data: 2025-11-03
-- Autor: Claude Code
-- =============================================
-- IMPORTANTE: Este seed é apenas para AMBIENTE LOCAL!
-- NÃO aplicar em PRODUÇÃO!
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CRIAR KANBAN CARDS (Oportunidades) - 10 cards
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Board: oportunidades (Pipeline de Vendas)
-- Colunas: Lead, Qualificação, Proposta, Negociação, Fechamento

-- Lead (2 cards)
INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  '4d3e40a5-112e-4249-b828-d8c8f379fbb1', -- Coluna "Lead"
  'Reforma Corporativa Faria Lima',
  'Empresa de tecnologia interessada em reforma de escritório moderno',
  85000.00,
  id,
  1
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  '4d3e40a5-112e-4249-b828-d8c8f379fbb1', -- Coluna "Lead"
  'Casa de Alto Padrão Alphaville',
  'Cliente interessado em construção de casa 400m²',
  650000.00,
  id,
  2
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Qualificação (2 cards)
INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  'b110012e-cf16-49c0-948f-79ae7e20f0a0', -- Coluna "Qualificação"
  'Expansão Fábrica Campinas',
  'Ampliação de fábrica com novo pavilhão industrial',
  1200000.00,
  id,
  1
FROM entities WHERE nome = 'Construtora ABC Ltda'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  'b110012e-cf16-49c0-948f-79ae7e20f0a0', -- Coluna "Qualificação"
  'Retrofit Edifício Comercial',
  'Modernização de prédio comercial nos Jardins',
  380000.00,
  id,
  2
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Proposta (2 cards)
INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  '9df676e7-3aa1-4974-bb0c-63e92af77840', -- Coluna "Proposta"
  'Loja Conceito Shopping Iguatemi',
  'Projeto completo de loja premium de moda',
  225000.00,
  id,
  1
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  '9df676e7-3aa1-4974-bb0c-63e92af77840', -- Coluna "Proposta"
  'Academia Premium Vila Madalena',
  'Reforma completa com área de crossfit e pilates',
  175000.00,
  id,
  2
FROM entities WHERE nome = 'Construtora ABC Ltda'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Negociação (2 cards)
INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  'ac58d197-a4e5-4ec9-809f-635aab39d639', -- Coluna "Negociação"
  'Consultório Médico Itaim Bibi',
  'Reforma de consultório médico de alto padrão',
  95000.00,
  id,
  1
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  'ac58d197-a4e5-4ec9-809f-635aab39d639', -- Coluna "Negociação"
  'Restaurante Gourmet Pinheiros',
  'Projeto completo de restaurante sofisticado',
  310000.00,
  id,
  2
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Fechamento (2 cards)
INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  '364d5972-3ebb-498f-86c2-4f68ce9ac903', -- Coluna "Fechamento"
  'Marcenaria Sob Medida Residencial',
  'Projeto completo de marcenaria para apartamento 150m²',
  82000.00,
  id,
  1
FROM entities WHERE nome = 'Construtora ABC Ltda'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO kanban_cards (coluna_id, titulo, descricao, valor, entity_id, posicao)
SELECT
  '364d5972-3ebb-498f-86c2-4f68ce9ac903', -- Coluna "Fechamento"
  'Projeto Luminotécnico Triplex',
  'Iluminação completa para cobertura duplex',
  45000.00,
  id,
  2
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT DO NOTHING;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. CRIAR PROPOSTAS - 6 propostas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Proposta 1: Enviada (Arquitetura)
INSERT INTO propostas (numero, cliente_id, titulo, descricao, valor_total, status, tipo, data_emissao, validade_dias)
SELECT
  'PROP-2025-001',
  id,
  'Projeto Arquitetônico Residencial',
  'Projeto arquitetônico completo para residência unifamiliar',
  85000.00,
  'enviada',
  'arquitetura',
  CURRENT_DATE - INTERVAL '5 days',
  30
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Proposta 2: Aprovada (Marcenaria) → vai virar contrato
INSERT INTO propostas (numero, cliente_id, titulo, descricao, valor_total, status, tipo, data_emissao, validade_dias)
SELECT
  'PROP-2025-002',
  id,
  'Marcenaria Corporativa Premium',
  'Móveis planejados para escritório executivo 200m²',
  125000.00,
  'aprovada',
  'marcenaria',
  CURRENT_DATE - INTERVAL '15 days',
  45
FROM entities WHERE nome = 'Construtora ABC Ltda'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Proposta 3: Pendente (Engenharia)
INSERT INTO propostas (numero, cliente_id, titulo, descricao, valor_total, status, tipo, data_emissao, validade_dias)
SELECT
  'PROP-2025-003',
  id,
  'Projeto Estrutural Ampliação',
  'Cálculo estrutural para ampliação de edifício comercial',
  65000.00,
  'pendente',
  'engenharia',
  CURRENT_DATE - INTERVAL '2 days',
  30
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Proposta 4: Enviada (Consultoria)
INSERT INTO propostas (numero, cliente_id, titulo, descricao, valor_total, status, tipo, data_emissao, validade_dias)
SELECT
  'PROP-2025-004',
  id,
  'Consultoria Obras de Arte',
  'Consultoria técnica para grandes obras de arte',
  95000.00,
  'enviada',
  'consultoria',
  CURRENT_DATE - INTERVAL '8 days',
  60
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Proposta 5: Rascunho (Arquitetura)
INSERT INTO propostas (numero, cliente_id, titulo, descricao, valor_total, status, tipo, data_emissao, validade_dias)
SELECT
  'PROP-2025-005',
  id,
  'Reforma Apartamento Higienópolis',
  'Projeto de reforma completa apartamento 180m²',
  145000.00,
  'rascunho',
  'arquitetura',
  CURRENT_DATE,
  30
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Proposta 6: Aprovada (Engenharia) → vai virar contrato
INSERT INTO propostas (numero, cliente_id, titulo, descricao, valor_total, status, tipo, data_emissao, validade_dias)
SELECT
  'PROP-2025-006',
  id,
  'Instalações Prediais Comerciais',
  'Projeto de instalações elétricas e hidráulicas',
  78000.00,
  'aprovada',
  'engenharia',
  CURRENT_DATE - INTERVAL '20 days',
  45
FROM entities WHERE nome = 'Construtora ABC Ltda'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. CRIAR CONTRATOS - 5 contratos (1 por tipo + extras)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Contrato 1: Arquitetura (ATIVO) - vinculado a uma obra
INSERT INTO contratos (numero, cliente_id, proposta_id, titulo, descricao, valor_total, data_inicio, data_fim, data_assinatura, status, tipo)
SELECT
  'CONT-2025-001',
  e.id,
  NULL, -- Sem proposta vinculada
  'Reforma Apartamento Centro - Arquitetura',
  'Contrato de reforma arquitetônica completa',
  150000.00,
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '120 days',
  CURRENT_DATE - INTERVAL '30 days',
  'ativo',
  'arquitetura'
FROM entities e
WHERE e.nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Contrato 2: Marcenaria (ATIVO) - vinculado à proposta aprovada
INSERT INTO contratos (numero, cliente_id, proposta_id, titulo, descricao, valor_total, data_inicio, data_fim, data_assinatura, status, tipo)
SELECT
  'CONT-2025-002',
  e.id,
  p.id,
  'Marcenaria Corporativa Premium',
  'Contrato de móveis planejados executivos',
  125000.00,
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '90 days',
  CURRENT_DATE - INTERVAL '10 days',
  'ativo',
  'marcenaria'
FROM entities e
CROSS JOIN propostas p
WHERE e.nome = 'Construtora ABC Ltda'
  AND p.numero = 'PROP-2025-002'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Contrato 3: Engenharia (ATIVO) - vinculado à proposta aprovada
INSERT INTO contratos (numero, cliente_id, proposta_id, titulo, descricao, valor_total, data_inicio, data_fim, data_assinatura, status, tipo)
SELECT
  'CONT-2025-003',
  e.id,
  p.id,
  'Instalações Prediais Comerciais',
  'Contrato de projetos de instalações',
  78000.00,
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '60 days',
  CURRENT_DATE - INTERVAL '5 days',
  'ativo',
  'engenharia'
FROM entities e
CROSS JOIN propostas p
WHERE e.nome = 'Construtora ABC Ltda'
  AND p.numero = 'PROP-2025-006'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Contrato 4: Arquitetura (CONCLUÍDO)
INSERT INTO contratos (numero, cliente_id, titulo, descricao, valor_total, data_inicio, data_fim, data_assinatura, status, tipo)
SELECT
  'CONT-2024-045',
  id,
  'Casa de Campo Itatiba - Projeto Arquitetônico',
  'Projeto arquitetônico completo (já concluído)',
  95000.00,
  CURRENT_DATE - INTERVAL '180 days',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '180 days',
  'concluido',
  'arquitetura'
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;

-- Contrato 5: Marcenaria (ATIVO)
INSERT INTO contratos (numero, cliente_id, titulo, descricao, valor_total, data_inicio, data_fim, data_assinatura, status, tipo)
SELECT
  'CONT-2025-004',
  id,
  'Marcenaria Residencial Jardins',
  'Móveis planejados para apartamento de alto padrão',
  92000.00,
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '75 days',
  CURRENT_DATE - INTERVAL '15 days',
  'ativo',
  'marcenaria'
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT (numero) DO NOTHING;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. CRIAR ASSISTÊNCIAS TÉCNICAS - 6 ordens de serviço
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- OS 1: Aberta (Alta prioridade)
INSERT INTO assistencias (codigo, cliente_id, descricao, status, prioridade, data_solicitacao)
SELECT
  'OS-2025-001',
  id,
  'Vazamento na marcenaria da cozinha - bancada soltou',
  'aberta',
  'alta',
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- OS 2: Agendado (Média prioridade)
INSERT INTO assistencias (codigo, cliente_id, descricao, status, prioridade, data_solicitacao, data_agendamento)
SELECT
  'OS-2025-002',
  id,
  'Porta do guarda-roupa desalinhada - precisa ajuste',
  'agendado',
  'media',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  CURRENT_TIMESTAMP + INTERVAL '2 days'
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- OS 3: Em Atendimento (Urgente)
INSERT INTO assistencias (codigo, cliente_id, descricao, status, prioridade, data_solicitacao, data_agendamento)
SELECT
  'OS-2025-003',
  id,
  'Problema elétrico no quadro - disjuntor desarmando',
  'em_atendimento',
  'urgente',
  CURRENT_TIMESTAMP - INTERVAL '3 hours',
  CURRENT_TIMESTAMP - INTERVAL '1 hour'
FROM entities WHERE nome = 'Construtora ABC Ltda'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- OS 4: Atendido (Baixa prioridade)
INSERT INTO assistencias (codigo, cliente_id, descricao, status, prioridade, data_solicitacao, data_agendamento, data_conclusao)
SELECT
  'OS-2025-004',
  id,
  'Retoque de pintura em pequenas áreas',
  'atendido',
  'baixa',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM entities WHERE nome = 'João Silva Construções'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- OS 5: Aberta (Urgente) - Em atraso se não atender hoje
INSERT INTO assistencias (codigo, cliente_id, descricao, status, prioridade, data_solicitacao)
SELECT
  'OS-2025-005',
  id,
  'Infiltração no banheiro suite - mancha no teto',
  'aberta',
  'urgente',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM entities WHERE nome = 'Maria Santos Arquitetura'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- OS 6: Agendado (Alta prioridade)
INSERT INTO assistencias (codigo, cliente_id, descricao, status, prioridade, data_solicitacao, data_agendamento)
SELECT
  'OS-2024-152',
  id,
  'Troca de fechadura da porta principal',
  'agendado',
  'alta',
  CURRENT_TIMESTAMP - INTERVAL '12 hours',
  CURRENT_TIMESTAMP + INTERVAL '1 day'
FROM entities WHERE nome = 'Construtora ABC Ltda'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. VERIFICAÇÃO DOS DADOS CRIADOS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
DECLARE
  v_kanban_cards INT;
  v_propostas INT;
  v_contratos INT;
  v_assistencias INT;
BEGIN
  SELECT COUNT(*) INTO v_kanban_cards FROM kanban_cards;
  SELECT COUNT(*) INTO v_propostas FROM propostas;
  SELECT COUNT(*) INTO v_contratos FROM contratos;
  SELECT COUNT(*) INTO v_assistencias FROM assistencias;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Seed completo de dados criado com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO DOS DADOS:';
  RAISE NOTICE '  • Kanban Cards (Oportunidades): % cards', v_kanban_cards;
  RAISE NOTICE '    - Lead: 2 | Qualificação: 2 | Proposta: 2';
  RAISE NOTICE '    - Negociação: 2 | Fechamento: 2';
  RAISE NOTICE '';
  RAISE NOTICE '  • Propostas: % propostas', v_propostas;
  RAISE NOTICE '    - Rascunho: 1 | Pendente: 1 | Enviada: 2 | Aprovada: 2';
  RAISE NOTICE '    - Total: R$ 593.000,00';
  RAISE NOTICE '';
  RAISE NOTICE '  • Contratos: % contratos', v_contratos;
  RAISE NOTICE '    - Arquitetura: 2 | Engenharia: 1 | Marcenaria: 2';
  RAISE NOTICE '    - Ativos: 4 | Concluídos: 1';
  RAISE NOTICE '    - Total: R$ 540.000,00';
  RAISE NOTICE '';
  RAISE NOTICE '  • Assistências Técnicas: % OS', v_assistencias;
  RAISE NOTICE '    - Aberta: 2 | Agendado: 2 | Em Atendimento: 1 | Atendido: 1';
  RAISE NOTICE '    - Urgente: 2 | Alta: 2 | Média: 1 | Baixa: 1';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Todos os cards do Dashboard agora devem mostrar valores reais!';
END $$;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. QUERIES DE VALIDAÇÃO (COMENTADAS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Verificar cards por coluna do pipeline
-- SELECT
--   kc.titulo as coluna,
--   COUNT(ka.id) as total_cards,
--   SUM(ka.valor) as valor_total
-- FROM kanban_colunas kc
-- JOIN kanban_boards kb ON kb.id = kc.board_id
-- LEFT JOIN kanban_cards ka ON ka.coluna_id = kc.id
-- WHERE kb.ambiente = 'oportunidades'
-- GROUP BY kc.titulo, kc.posicao
-- ORDER BY kc.posicao;

-- Verificar propostas por status
-- SELECT status, COUNT(*) as total, SUM(valor_total) as valor_total
-- FROM propostas
-- GROUP BY status
-- ORDER BY status;

-- Verificar contratos por tipo e status
-- SELECT tipo, status, COUNT(*) as total, SUM(valor_total) as valor_total
-- FROM contratos
-- GROUP BY tipo, status
-- ORDER BY tipo, status;

-- Verificar assistências por status e prioridade
-- SELECT status, prioridade, COUNT(*) as total
-- FROM assistencias
-- GROUP BY status, prioridade
-- ORDER BY status, prioridade;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION 026
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
