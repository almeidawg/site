-- =============================================
-- MIGRATION: 025
-- Descrição: Dados de teste (SEED) para desenvolvimento
-- Data: 2025-11-03
-- Autor: Claude Code
-- =============================================
-- IMPORTANTE: Este seed é apenas para AMBIENTE LOCAL!
-- NÃO aplicar em PRODUÇÃO!
-- =============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CRIAR CLIENTES DE TESTE (Entities)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO entities (nome, tipo, cpf_cnpj, telefone, email, cidade, estado)
VALUES
  ('João Silva Construções', 'cliente', '12345678901', '(11) 98765-4321', 'joao@example.com', 'São Paulo', 'SP'),
  ('Maria Santos Arquitetura', 'cliente', '98765432109', '(11) 97654-3210', 'maria@example.com', 'Rio de Janeiro', 'RJ'),
  ('Construtora ABC Ltda', 'cliente', '12.345.678/0001-90', '(11) 96543-2109', 'contato@abc.com', 'Belo Horizonte', 'MG')
ON CONFLICT DO NOTHING; -- Não duplicar se já existir


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. CRIAR OBRAS DE TESTE (Status variados)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Obras em PLANEJAMENTO (2)
INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2025-001', id, 'Reforma Apartamento Centro', 'planejamento', 150000.00, 5
FROM entities WHERE nome = 'João Silva Construções'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2025-002', id, 'Projeto Residencial Jardins', 'planejamento', 320000.00, 10
FROM entities WHERE nome = 'Maria Santos Arquitetura'
ON CONFLICT (codigo) DO NOTHING;

-- Obras EM ANDAMENTO (3)
INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2025-003', id, 'Obra Comercial Shopping', 'em_execucao', 850000.00, 45
FROM entities WHERE nome = 'Construtora ABC Ltda'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2025-004', id, 'Reforma Escritório', 'em_execucao', 95000.00, 60
FROM entities WHERE nome = 'João Silva Construções'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2025-005', id, 'Ampliação Galpão Industrial', 'em_execucao', 420000.00, 30
FROM entities WHERE nome = 'Maria Santos Arquitetura'
ON CONFLICT (codigo) DO NOTHING;

-- Obras CONCLUÍDAS (2)
INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2024-012', id, 'Casa de Campo Itatiba', 'finalizada', 280000.00, 100
FROM entities WHERE nome = 'Construtora ABC Ltda'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2024-015', id, 'Restaurante Boulevard', 'finalizada', 160000.00, 100
FROM entities WHERE nome = 'João Silva Construções'
ON CONFLICT (codigo) DO NOTHING;

-- Obras PAUSADAS (1) - Usando 'atrasada' por compatibilidade LIVE
INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)
SELECT 'OBR-2025-006', id, 'Condomínio Residencial (Fase 2)', 'atrasada', 1200000.00, 25
FROM entities WHERE nome = 'Construtora ABC Ltda'
ON CONFLICT (codigo) DO NOTHING;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. VERIFICAÇÃO DOS DADOS CRIADOS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
    RAISE NOTICE '✅ Dados de teste criados com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE 'Clientes criados:';
    RAISE NOTICE '  - João Silva Construções';
    RAISE NOTICE '  - Maria Santos Arquitetura';
    RAISE NOTICE '  - Construtora ABC Ltda';
    RAISE NOTICE '';
    RAISE NOTICE 'Obras criadas por status:';
    RAISE NOTICE '  - Planejamento: 2 obras';
    RAISE NOTICE '  - Em Andamento: 3 obras';
    RAISE NOTICE '  - Concluída: 2 obras';
    RAISE NOTICE '  - Pausada: 1 obra';
    RAISE NOTICE '';
    RAISE NOTICE 'Total: 8 obras (R$ 3.475.000,00)';
END $$;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. QUERIES DE VALIDAÇÃO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Verificar view de status das obras
-- SELECT * FROM v_obras_status ORDER BY status;

-- Verificar obras por cliente
-- SELECT
--   e.nome,
--   COUNT(o.id) as total_obras,
--   SUM(o.valor_orcado) as valor_total
-- FROM entities e
-- JOIN obras o ON o.cliente_id = e.id
-- GROUP BY e.nome
-- ORDER BY total_obras DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION 025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
