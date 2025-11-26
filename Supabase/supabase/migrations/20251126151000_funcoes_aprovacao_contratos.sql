-- =============================================
-- Funções de Aprovação e Integração de Contratos
-- Data: 2025-11-26
-- Descrição: Funções para aprovar contratos e gerar automaticamente
--            projetos e cobranças
-- =============================================

BEGIN;

-- =============================================
-- Função: Gerar Projeto a partir de Contrato
-- =============================================

CREATE OR REPLACE FUNCTION api_gerar_projeto_contrato(
  p_contrato_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contrato RECORD;
  v_projeto_id UUID;
  v_codigo TEXT;
BEGIN
  -- Buscar contrato
  SELECT * INTO v_contrato
  FROM project_contracts
  WHERE id = p_contrato_id
  AND aprovado = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado ou não aprovado';
  END IF;

  -- Verificar se projeto já foi gerado
  IF v_contrato.cronograma_gerado AND v_contrato.project_id IS NOT NULL THEN
    RETURN v_contrato.project_id;
  END IF;

  -- Gerar código único
  v_codigo := 'PROJ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8);

  -- Criar projeto
  INSERT INTO projects (
    empresa_id,
    codigo,
    titulo,
    descricao,
    data_inicio,
    data_fim_prevista,
    status,
    orcamento_total,
    responsavel_id,
    created_by
  ) VALUES (
    (SELECT empresa_id FROM profiles WHERE id = auth.uid()),
    v_codigo,
    'Projeto - Contrato ' || COALESCE(v_contrato.numero, v_contrato.id::TEXT),
    COALESCE(v_contrato.descricao, 'Projeto gerado automaticamente a partir do contrato'),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'planejamento',
    v_contrato.valor_total,
    auth.uid(),
    auth.uid()
  ) RETURNING id INTO v_projeto_id;

  -- Atualizar relacionamento contrato → projeto
  UPDATE project_contracts
  SET
    project_id = v_projeto_id,
    cronograma_gerado = TRUE
  WHERE id = p_contrato_id;

  -- Criar tarefa inicial (marco)
  INSERT INTO tasks (
    project_id,
    titulo,
    descricao,
    status,
    prazo,
    criado_em
  ) VALUES (
    v_projeto_id,
    'Início do Projeto',
    'Marco inicial do projeto gerado automaticamente',
    'pendente',
    CURRENT_DATE,
    NOW()
  );

  RETURN v_projeto_id;
END;
$$;

COMMENT ON FUNCTION api_gerar_projeto_contrato IS 'Gera projeto no cronograma a partir de contrato aprovado';

-- =============================================
-- Função: Aprovar Contrato (com integração)
-- =============================================

CREATE OR REPLACE FUNCTION api_aprovar_contrato(
  p_contrato_id UUID,
  p_gerar_integracao BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contrato RECORD;
  v_projeto_id UUID;
  v_result JSONB;
BEGIN
  -- Buscar contrato
  SELECT * INTO v_contrato
  FROM project_contracts
  WHERE id = p_contrato_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado';
  END IF;

  -- Verificar se já está aprovado
  IF v_contrato.aprovado THEN
    RAISE EXCEPTION 'Contrato já está aprovado';
  END IF;

  -- Aprovar contrato
  UPDATE project_contracts
  SET
    aprovado = TRUE,
    aprovado_por = auth.uid(),
    aprovado_em = NOW(),
    status = 'assinado'
  WHERE id = p_contrato_id;

  v_result := jsonb_build_object(
    'contrato_aprovado', TRUE,
    'contrato_id', p_contrato_id
  );

  -- Gerar integrações se solicitado
  IF p_gerar_integracao THEN
    -- Gerar projeto no cronograma
    v_projeto_id := api_gerar_projeto_contrato(p_contrato_id);
    v_result := v_result || jsonb_build_object('projeto_id', v_projeto_id);

    -- Gerar cobranças no financeiro (se houver condições)
    IF v_contrato.condicoes_pagamento IS NOT NULL
       AND jsonb_array_length(v_contrato.condicoes_pagamento) > 0 THEN
      PERFORM api_gerar_cobrancas_contrato(p_contrato_id);
      v_result := v_result || jsonb_build_object('financeiro_gerado', TRUE);
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION api_aprovar_contrato IS 'Aprova contrato e gera integrações com projeto e financeiro';

-- =============================================
-- Função: Rejeitar Contrato
-- =============================================

CREATE OR REPLACE FUNCTION api_rejeitar_contrato(
  p_contrato_id UUID,
  p_motivo TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE project_contracts
  SET
    aprovado = FALSE,
    status = 'cancelado',
    motivo_rejeicao = p_motivo
  WHERE id = p_contrato_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado';
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION api_rejeitar_contrato IS 'Rejeita contrato com motivo';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ api_gerar_projeto_contrato criada
-- ✅ api_aprovar_contrato criada (com integração automática)
-- ✅ api_rejeitar_contrato criada
