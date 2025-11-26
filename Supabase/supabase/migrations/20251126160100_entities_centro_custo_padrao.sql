-- =============================================
-- Migration: Adicionar centro de custo padrão em entities
-- Data: 2025-11-26
-- Descrição: Adiciona campo para definir centro de custo padrão de cada entidade
--            e campo nucleo para classificação (arquitetura, engenharia, marcenaria)
-- =============================================

BEGIN;

-- Adicionar colunas
ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS centro_custo_padrao_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nucleo TEXT CHECK (nucleo IN ('arquitetura', 'engenharia', 'marcenaria'));

-- Índices
CREATE INDEX IF NOT EXISTS idx_entities_centro_custo ON entities(centro_custo_padrao_id);
CREATE INDEX IF NOT EXISTS idx_entities_nucleo ON entities(nucleo);

-- Comentários
COMMENT ON COLUMN entities.centro_custo_padrao_id IS 'Centro de custo padrão para lançamentos relacionados a esta entidade';
COMMENT ON COLUMN entities.nucleo IS 'Núcleo de atuação do cliente (arquitetura, engenharia, marcenaria)';

-- Popular núcleo baseado em centro de custo existente (se houver)
-- Esta query tenta identificar o núcleo pelo nome do centro de custo
UPDATE entities e
SET nucleo = CASE
  WHEN cc.nome ILIKE '%arquitetura%' THEN 'arquitetura'
  WHEN cc.nome ILIKE '%engenharia%' THEN 'engenharia'
  WHEN cc.nome ILIKE '%marcenaria%' THEN 'marcenaria'
  ELSE NULL
END,
centro_custo_padrao_id = cc.id
FROM centros_custo cc
WHERE e.centro_custo_padrao_id IS NULL
AND cc.nome IN ('Arquitetura', 'Engenharia', 'Marcenaria')
AND e.tipo = 'cliente';

-- Popular centro de custo padrão para clientes sem núcleo definido
-- Usar "Arquitetura" como padrão se não houver match
UPDATE entities
SET centro_custo_padrao_id = (SELECT id FROM centros_custo WHERE codigo = 'CC001' LIMIT 1)
WHERE tipo = 'cliente'
AND centro_custo_padrao_id IS NULL;

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Colunas adicionadas em entities
-- ✅ Índices criados
-- ✅ Núcleos populados automaticamente quando possível
