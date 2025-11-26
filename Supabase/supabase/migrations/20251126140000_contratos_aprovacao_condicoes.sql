-- =============================================
-- Migration: Contratos - Aprovação e Condições de Pagamento
-- Data: 2025-11-26
-- Descrição: Adiciona campos de aprovação, condições de pagamento
--            e integração com financeiro/cronograma em project_contracts
-- =============================================

BEGIN;

-- =============================================
-- 1. ADICIONAR CAMPOS EM project_contracts
-- =============================================

-- Campos de aprovação
ALTER TABLE public.project_contracts
  ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;

-- Campos de condições de pagamento
ALTER TABLE public.project_contracts
  ADD COLUMN IF NOT EXISTS condicoes_pagamento JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT CHECK (forma_pagamento IN ('boleto', 'pix', 'transferencia', 'cartao', 'dinheiro')),
  ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT 1 CHECK (parcelas >= 1);

-- Campos de integração
ALTER TABLE public.project_contracts
  ADD COLUMN IF NOT EXISTS cronograma_gerado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS financeiro_gerado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS conteudo_contrato TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_project_contracts_aprovado ON project_contracts(aprovado);
CREATE INDEX IF NOT EXISTS idx_project_contracts_aprovado_por ON project_contracts(aprovado_por);

COMMENT ON COLUMN project_contracts.aprovado IS 'Indica se o contrato foi aprovado';
COMMENT ON COLUMN project_contracts.aprovado_por IS 'Usuário que aprovou o contrato';
COMMENT ON COLUMN project_contracts.aprovado_em IS 'Data/hora da aprovação';
COMMENT ON COLUMN project_contracts.condicoes_pagamento IS 'Array JSON com condições de pagamento: [{parcela: 1, percentual: 30, dias: 0, descricao: "Entrada"}]';
COMMENT ON COLUMN project_contracts.cronograma_gerado IS 'Indica se o cronograma foi gerado automaticamente';
COMMENT ON COLUMN project_contracts.financeiro_gerado IS 'Indica se as cobranças foram geradas no financeiro';

-- =============================================
-- 2. FUNÇÃO: Aprovar Contrato
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
  WHERE id = p_contrato_id
  AND empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado ou sem permissão';
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
    status = 'assinado',
    updated_at = NOW()
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

    -- Gerar cobranças no financeiro
    PERFORM api_gerar_cobrancas_contrato(p_contrato_id);
    v_result := v_result || jsonb_build_object('financeiro_gerado', TRUE);
  END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION api_aprovar_contrato IS 'Aprova contrato e gera integrações com projeto e financeiro';

-- =============================================
-- 3. FUNÇÃO: Gerar Projeto a partir de Contrato
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
  IF v_contrato.cronograma_gerado THEN
    -- Buscar projeto existente
    SELECT id INTO v_projeto_id
    FROM projects
    WHERE obra_id IN (
      SELECT id FROM obras WHERE entity_id = v_contrato.cliente_id LIMIT 1
    )
    LIMIT 1;

    IF FOUND THEN
      RETURN v_projeto_id;
    END IF;
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
    v_contrato.empresa_id,
    v_codigo,
    'Projeto - Contrato ' || COALESCE(v_contrato.numero_contrato, v_contrato.id::TEXT),
    'Projeto gerado automaticamente a partir do contrato',
    COALESCE(v_contrato.data_inicio, CURRENT_DATE),
    COALESCE(v_contrato.data_termino_previsto, CURRENT_DATE + INTERVAL '30 days'),
    'planejamento',
    v_contrato.valor_total,
    auth.uid(),
    auth.uid()
  ) RETURNING id INTO v_projeto_id;

  -- Atualizar relacionamento contrato → projeto
  UPDATE project_contracts
  SET
    project_id = v_projeto_id,
    cronograma_gerado = TRUE,
    updated_at = NOW()
  WHERE id = p_contrato_id;

  -- Criar tarefa inicial (marco)
  INSERT INTO tasks (
    project_id,
    empresa_id,
    titulo,
    descricao,
    tipo,
    data_inicio_prevista,
    data_fim_prevista,
    duracao_dias,
    status,
    created_by
  ) VALUES (
    v_projeto_id,
    v_contrato.empresa_id,
    'Início do Projeto',
    'Marco inicial do projeto',
    'marco',
    COALESCE(v_contrato.data_inicio, CURRENT_DATE),
    COALESCE(v_contrato.data_inicio, CURRENT_DATE),
    1,
    'nao_iniciada',
    auth.uid()
  );

  RETURN v_projeto_id;
END;
$$;

COMMENT ON FUNCTION api_gerar_projeto_contrato IS 'Gera projeto no cronograma a partir de contrato aprovado';

-- =============================================
-- 4. FUNÇÃO: Gerar Cobranças a partir de Contrato
-- =============================================

CREATE OR REPLACE FUNCTION api_gerar_cobrancas_contrato(
  p_contrato_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contrato RECORD;
  v_condicao JSONB;
  v_valor_parcela NUMERIC;
  v_vencimento DATE;
  v_count INTEGER := 0;
  v_project_id UUID;
BEGIN
  -- Buscar contrato
  SELECT * INTO v_contrato
  FROM project_contracts
  WHERE id = p_contrato_id
  AND aprovado = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado ou não aprovado';
  END IF;

  -- Verificar se já gerou
  IF v_contrato.financeiro_gerado THEN
    RETURN 0;
  END IF;

  -- Se tem condições de pagamento customizadas (JSONB)
  IF v_contrato.condicoes_pagamento IS NOT NULL AND jsonb_array_length(v_contrato.condicoes_pagamento) > 0 THEN
    -- Iterar sobre condições
    FOR v_condicao IN SELECT * FROM jsonb_array_elements(v_contrato.condicoes_pagamento)
    LOOP
      v_valor_parcela := (v_condicao->>'percentual')::NUMERIC / 100.0 * v_contrato.valor_total;
      v_vencimento := COALESCE(v_contrato.data_assinatura, CURRENT_DATE) + (COALESCE((v_condicao->>'dias')::INTEGER, 0) || ' days')::INTERVAL;

      INSERT INTO cobrancas (
        cliente_id,
        project_id,
        descricao,
        valor,
        vencimento,
        status
      ) VALUES (
        v_contrato.cliente_id,
        v_contrato.project_id,
        COALESCE(v_condicao->>'descricao', 'Parcela ' || (v_condicao->>'parcela')::TEXT),
        v_valor_parcela,
        v_vencimento,
        'Pendente'
      );

      v_count := v_count + 1;
    END LOOP;

  -- Se não tem condições customizadas, dividir em parcelas iguais
  ELSIF v_contrato.parcelas IS NOT NULL AND v_contrato.parcelas > 0 THEN
    v_valor_parcela := v_contrato.valor_total / v_contrato.parcelas;

    FOR i IN 1..v_contrato.parcelas LOOP
      v_vencimento := COALESCE(v_contrato.data_assinatura, CURRENT_DATE) + ((i - 1) * 30 || ' days')::INTERVAL;

      INSERT INTO cobrancas (
        cliente_id,
        project_id,
        descricao,
        valor,
        vencimento,
        status
      ) VALUES (
        v_contrato.cliente_id,
        v_contrato.project_id,
        'Parcela ' || i || '/' || v_contrato.parcelas,
        v_valor_parcela,
        v_vencimento,
        'Pendente'
      );

      v_count := v_count + 1;
    END LOOP;

  -- Caso padrão: cobrança única
  ELSE
    INSERT INTO cobrancas (
      cliente_id,
      project_id,
      descricao,
      valor,
      vencimento,
      status
    ) VALUES (
      v_contrato.cliente_id,
      v_contrato.project_id,
      'Pagamento integral - Contrato ' || COALESCE(v_contrato.numero_contrato, ''),
      v_contrato.valor_total,
      COALESCE(v_contrato.data_assinatura, CURRENT_DATE) + INTERVAL '30 days',
      'Pendente'
    );

    v_count := 1;
  END IF;

  -- Atualizar flag
  UPDATE project_contracts
  SET
    financeiro_gerado = TRUE,
    updated_at = NOW()
  WHERE id = p_contrato_id;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION api_gerar_cobrancas_contrato IS 'Gera cobranças no financeiro baseado nas condições de pagamento do contrato';

-- =============================================
-- 5. FUNÇÃO: Rejeitar Contrato
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
    motivo_rejeicao = p_motivo,
    updated_at = NOW()
  WHERE id = p_contrato_id
  AND empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado ou sem permissão';
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION api_rejeitar_contrato IS 'Rejeita contrato com motivo';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Campos de aprovação adicionados
-- ✅ Condições de pagamento configuráveis (JSONB)
-- ✅ Função de aprovação com integração automática
-- ✅ Geração automática de projeto no cronograma
-- ✅ Geração automática de cobranças no financeiro
