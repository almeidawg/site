-- =============================================
-- Função: Lançar cobrança paga em lançamentos
-- Data: 2025-11-26
-- Descrição: Cria lançamento financeiro quando cobrança é marcada como paga
--            Sincroniza título financeiro antes de criar lançamento
-- =============================================

BEGIN;

DROP FUNCTION IF EXISTS api_lancar_cobranca_paga(UUID, DATE);

CREATE OR REPLACE FUNCTION api_lancar_cobranca_paga(
  p_cobranca_id UUID,
  p_data_pagamento DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cobranca RECORD;
  v_lancamento_id UUID;
  v_lancamento_existente UUID;
BEGIN
  RAISE NOTICE 'api_lancar_cobranca_paga - Lançando cobrança: % em %', p_cobranca_id, p_data_pagamento;

  -- Buscar cobrança
  SELECT * INTO v_cobranca FROM cobrancas WHERE id = p_cobranca_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cobrança não encontrada: %', p_cobranca_id;
  END IF;

  -- Validar status
  IF v_cobranca.status != 'Pago' THEN
    RAISE EXCEPTION 'Cobrança deve estar com status Pago para gerar lançamento. Status atual: %', v_cobranca.status;
  END IF;

  -- Sincronizar título primeiro (garante que existe e está atualizado)
  PERFORM api_sync_cobranca_titulo(p_cobranca_id);

  -- Recarregar cobrança após sincronização
  SELECT * INTO v_cobranca FROM cobrancas WHERE id = p_cobranca_id;

  -- Verificar se já existe lançamento para esta cobrança nesta data
  SELECT id INTO v_lancamento_existente
  FROM lancamentos
  WHERE titulo_id = v_cobranca.titulo_financeiro_id
  AND data = p_data_pagamento
  LIMIT 1;

  IF v_lancamento_existente IS NOT NULL THEN
    RAISE WARNING 'Já existe lançamento para esta cobrança nesta data: %', v_lancamento_existente;
    RETURN v_lancamento_existente;
  END IF;

  -- Criar lançamento
  INSERT INTO lancamentos (
    titulo_id,
    valor,
    data,
    tipo_pagamento,
    centro_custo_cliente_id,
    categoria_id,
    observacao
  ) VALUES (
    v_cobranca.titulo_financeiro_id,
    v_cobranca.valor,
    p_data_pagamento,
    COALESCE(v_cobranca.forma_pagamento, 'não informado'),
    v_cobranca.centro_custo_id,
    v_cobranca.categoria_id,
    'Pagamento de cobrança - ' || COALESCE(v_cobranca.descricao, 'Sem descrição')
  )
  RETURNING id INTO v_lancamento_id;

  RAISE NOTICE 'Lançamento criado com sucesso: %', v_lancamento_id;
  RETURN v_lancamento_id;
END;
$$;

COMMENT ON FUNCTION api_lancar_cobranca_paga IS 'Cria lançamento financeiro quando cobrança é marcada como paga';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Função api_lancar_cobranca_paga criada
-- ✅ Sincroniza título antes de criar lançamento
-- ✅ Evita duplicação de lançamentos
