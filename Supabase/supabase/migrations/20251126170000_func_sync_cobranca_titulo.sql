-- =============================================
-- Função: Sincronizar cobrança com título financeiro
-- Data: 2025-11-26
-- Descrição: Cria ou atualiza título financeiro baseado em cobrança
--            Vincula centro de custo e categoria automaticamente
-- =============================================

BEGIN;

DROP FUNCTION IF EXISTS api_sync_cobranca_titulo(UUID);

CREATE OR REPLACE FUNCTION api_sync_cobranca_titulo(p_cobranca_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cobranca RECORD;
  v_titulo_id UUID;
  v_centro_custo_id UUID;
  v_categoria_id UUID;
  v_empresa_id UUID;
BEGIN
  RAISE NOTICE 'api_sync_cobranca_titulo - Sincronizando cobrança: %', p_cobranca_id;

  -- Buscar cobrança
  SELECT * INTO v_cobranca FROM cobrancas WHERE id = p_cobranca_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cobrança não encontrada: %', p_cobranca_id;
  END IF;

  -- Determinar empresa_id (do projeto ou do usuário autenticado)
  IF v_cobranca.project_id IS NOT NULL THEN
    SELECT empresa_id INTO v_empresa_id
    FROM projects
    WHERE id = v_cobranca.project_id;
  END IF;

  -- Fallback: usar empresa do usuário autenticado
  IF v_empresa_id IS NULL THEN
    SELECT empresa_id INTO v_empresa_id
    FROM profiles
    WHERE id = auth.uid();
  END IF;

  -- Determinar centro de custo
  IF v_cobranca.centro_custo_id IS NOT NULL THEN
    v_centro_custo_id := v_cobranca.centro_custo_id;
  ELSE
    -- Buscar centro de custo padrão do cliente
    SELECT centro_custo_padrao_id INTO v_centro_custo_id
    FROM entities
    WHERE id = v_cobranca.cliente_id;

    -- Se não encontrou, usar centro de custo padrão "Arquitetura"
    IF v_centro_custo_id IS NULL THEN
      SELECT id INTO v_centro_custo_id
      FROM centros_custo
      WHERE codigo = 'CC001' -- Arquitetura
      LIMIT 1;
    END IF;

    -- Atualizar cobrança com centro de custo encontrado
    UPDATE cobrancas
    SET centro_custo_id = v_centro_custo_id
    WHERE id = p_cobranca_id;
  END IF;

  -- Determinar categoria (padrão: Honorários de Projeto)
  IF v_cobranca.categoria_id IS NOT NULL THEN
    v_categoria_id := v_cobranca.categoria_id;
  ELSE
    SELECT id INTO v_categoria_id
    FROM plano_contas
    WHERE codigo = 'R001' -- Honorários de Projeto
    LIMIT 1;

    -- Atualizar cobrança com categoria encontrada
    UPDATE cobrancas
    SET categoria_id = v_categoria_id
    WHERE id = p_cobranca_id;
  END IF;

  -- Verificar se título já existe
  IF v_cobranca.titulo_financeiro_id IS NOT NULL THEN
    RAISE NOTICE 'Título já existe: %. Atualizando...', v_cobranca.titulo_financeiro_id;

    -- Atualizar título existente
    UPDATE titulos_financeiros
    SET
      valor = v_cobranca.valor,
      data_vencimento = v_cobranca.vencimento,
      status = CASE v_cobranca.status
        WHEN 'Pago' THEN 'Pago'
        WHEN 'Cancelado' THEN 'Cancelado'
        WHEN 'EmAberto' THEN 'Aprovado'
        ELSE 'Previsto'
      END,
      centro_custo_id = v_centro_custo_id,
      categoria_id = v_categoria_id,
      updated_at = NOW()
    WHERE id = v_cobranca.titulo_financeiro_id;

    RETURN v_cobranca.titulo_financeiro_id;
  ELSE
    RAISE NOTICE 'Criando novo título financeiro...';

    -- Criar novo título
    INSERT INTO titulos_financeiros (
      empresa_id,
      tipo,
      descricao,
      valor,
      data_emissao,
      data_vencimento,
      status,
      categoria_id,
      centro_custo_id,
      fornecedor_cliente,
      observacao
    ) VALUES (
      v_empresa_id,
      'Receber',
      COALESCE(v_cobranca.descricao, 'Cobrança - Projeto'),
      v_cobranca.valor,
      CURRENT_DATE,
      v_cobranca.vencimento,
      CASE v_cobranca.status
        WHEN 'Pago' THEN 'Pago'
        WHEN 'Cancelado' THEN 'Cancelado'
        WHEN 'EmAberto' THEN 'Aprovado'
        ELSE 'Previsto'
      END,
      v_categoria_id,
      v_centro_custo_id,
      (SELECT nome_razao_social FROM entities WHERE id = v_cobranca.cliente_id),
      'Gerado automaticamente a partir de cobrança'
    )
    RETURNING id INTO v_titulo_id;

    -- Atualizar cobrança com vínculo
    UPDATE cobrancas
    SET titulo_financeiro_id = v_titulo_id
    WHERE id = p_cobranca_id;

    RAISE NOTICE 'Título criado com sucesso: %', v_titulo_id;
    RETURN v_titulo_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION api_sync_cobranca_titulo IS 'Sincroniza cobrança com título financeiro (cria ou atualiza)';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Função api_sync_cobranca_titulo criada
-- ✅ Determina automaticamente centro de custo e categoria
-- ✅ Atualiza título existente ou cria novo
