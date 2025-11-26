WARN: environment variable is unset: GOOGLE_CLIENT_ID
WARN: environment variable is unset: GOOGLE_CLIENT_SECRET
Initialising login role...
Dumping schemas from remote database...



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."_ensure_coluna"("p_board_id" "uuid", "p_titulo" "text", "p_posicao" integer, "p_cor" "text" DEFAULT '#94a3b8'::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_coluna_id uuid;
BEGIN
    RAISE NOTICE '_ensure_coluna - Board: %, Título: %, Posição: %', p_board_id, p_titulo, p_posicao;

    -- Verificar se a coluna já existe
    SELECT id INTO v_coluna_id
    FROM kanban_colunas
    WHERE board_id = p_board_id AND titulo = p_titulo;

    IF NOT FOUND THEN
        -- Criar nova coluna
        INSERT INTO kanban_colunas (board_id, titulo, posicao, cor)
        VALUES (p_board_id, p_titulo, p_posicao, p_cor)
        ON CONFLICT (board_id, posicao) DO UPDATE
        SET titulo = EXCLUDED.titulo, cor = EXCLUDED.cor;

        RAISE NOTICE 'Coluna criada: %', p_titulo;
    ELSE
        -- Atualizar posição e cor se diferente
        UPDATE kanban_colunas
        SET posicao = p_posicao, cor = p_cor
        WHERE id = v_coluna_id
            AND (posicao != p_posicao OR cor != p_cor);

        IF FOUND THEN
            RAISE NOTICE 'Coluna atualizada: %', p_titulo;
        END IF;
    END IF;

END;
$$;


ALTER FUNCTION "public"."_ensure_coluna"("p_board_id" "uuid", "p_titulo" "text", "p_posicao" integer, "p_cor" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."_ensure_coluna"("p_board_id" "uuid", "p_titulo" "text", "p_posicao" integer, "p_cor" "text") IS 'Cria ou atualiza uma coluna no board especificado (função auxiliar interna)';



CREATE OR REPLACE FUNCTION "public"."api_atualizar_card_kanban"("p_card_id" "uuid", "p_dados" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_card JSONB;
  v_cliente_nome TEXT;
BEGIN
  -- Validar se card existe
  IF NOT EXISTS (SELECT 1 FROM kanban_cards WHERE id = p_card_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Card não encontrado';
  END IF;

  -- Se entity_id mudou, buscar novo nome do cliente
  IF p_dados ? 'entity_id' THEN
    SELECT nome INTO v_cliente_nome
    FROM entities
    WHERE id = (p_dados->>'entity_id')::uuid;
  END IF;

  -- Atualizar campos dinâmicos (usar "nome" não "titulo")
  UPDATE kanban_cards
  SET
    nome = COALESCE(p_dados->>'titulo', nome),  -- ← Campo correto!
    descricao = COALESCE(p_dados->>'descricao', descricao),
    valor_previsto = COALESCE((p_dados->>'valor')::numeric, valor_previsto),
    entity_id = COALESCE((p_dados->>'entity_id')::uuid, entity_id),
    cliente_nome = COALESCE(v_cliente_nome, cliente_nome),
    responsavel_id = COALESCE((p_dados->>'responsavel_id')::uuid, responsavel_id),
    payload = COALESCE(p_dados->'payload', payload),
    servicos_contratados = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(p_dados->'servicos_contratados')))::text[],
      servicos_contratados
    ),
    updated_at = NOW()
  WHERE id = p_card_id
  RETURNING to_jsonb(kanban_cards.*) INTO v_card;

  RETURN v_card;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_atualizar_card_kanban: %', SQLERRM;
    RAISE;
END;
$$;


ALTER FUNCTION "public"."api_atualizar_card_kanban"("p_card_id" "uuid", "p_dados" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."api_atualizar_card_kanban"("p_card_id" "uuid", "p_dados" "jsonb") IS 'Atualiza campos de um card. Recebe JSONB com campos a atualizar: titulo, descricao, valor, entity_id, responsavel_id, payload, servicos_contratados';



CREATE OR REPLACE FUNCTION "public"."api_criar_card_kanban"("p_coluna_id" "uuid", "p_titulo" "text", "p_descricao" "text" DEFAULT NULL::"text", "p_entity_id" "uuid" DEFAULT NULL::"uuid", "p_responsavel_id" "uuid" DEFAULT NULL::"uuid", "p_payload" "jsonb" DEFAULT '{}'::"jsonb", "p_servicos_contratados" "text"[] DEFAULT '{}'::"text"[]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_card_id UUID;
  v_max_ordem INTEGER;
  v_cliente_nome TEXT;
BEGIN
  -- Validações
  IF p_titulo IS NULL OR p_titulo = '' THEN
    RAISE EXCEPTION 'Título do card é obrigatório';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM kanban_colunas WHERE id = p_coluna_id) THEN
    RAISE EXCEPTION 'Coluna não encontrada';
  END IF;

  -- Buscar nome do cliente se entity_id fornecido
  IF p_entity_id IS NOT NULL THEN
    SELECT nome INTO v_cliente_nome
    FROM entities
    WHERE id = p_entity_id;
  END IF;

  -- Calcular próxima ordem
  SELECT COALESCE(MAX(ordem), 0) + 1 INTO v_max_ordem
  FROM kanban_cards
  WHERE coluna_id = p_coluna_id AND deleted_at IS NULL;

  -- Inserir card (usar "nome" não "titulo")
  INSERT INTO kanban_cards (
    coluna_id,
    nome,               -- ← Campo correto!
    descricao,
    entity_id,
    cliente_nome,       -- ← Desnormalizar nome do cliente
    responsavel_id,
    ordem,
    payload,
    servicos_contratados,
    created_at,
    updated_at
  ) VALUES (
    p_coluna_id,
    p_titulo,
    p_descricao,
    p_entity_id,
    v_cliente_nome,
    p_responsavel_id,
    v_max_ordem,
    COALESCE(p_payload, '{}'::jsonb),
    COALESCE(p_servicos_contratados, '{}'::text[]),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_card_id;

  RETURN v_card_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_criar_card_kanban: %', SQLERRM;
    RAISE;
END;
$$;


ALTER FUNCTION "public"."api_criar_card_kanban"("p_coluna_id" "uuid", "p_titulo" "text", "p_descricao" "text", "p_entity_id" "uuid", "p_responsavel_id" "uuid", "p_payload" "jsonb", "p_servicos_contratados" "text"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."api_criar_card_kanban"("p_coluna_id" "uuid", "p_titulo" "text", "p_descricao" "text", "p_entity_id" "uuid", "p_responsavel_id" "uuid", "p_payload" "jsonb", "p_servicos_contratados" "text"[]) IS 'Cria novo card no kanban. Parâmetros: coluna_id, titulo, descricao?, entity_id?, responsavel_id?, payload?, servicos_contratados?';



CREATE OR REPLACE FUNCTION "public"."api_criar_coluna_kanban"("p_board_id" "uuid", "p_nome" "text", "p_cor" "text" DEFAULT '#6B7280'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_coluna_id UUID;
  v_max_pos INTEGER;
BEGIN
  -- Validações
  IF p_nome IS NULL OR p_nome = '' THEN
    RAISE EXCEPTION 'Nome da coluna não pode ser vazio';
  END IF;

  -- Obter próxima posição
  SELECT COALESCE(MAX(pos), -1) + 1 INTO v_max_pos
  FROM kanban_colunas
  WHERE board_id = p_board_id;

  -- Criar coluna
  INSERT INTO kanban_colunas (board_id, nome, pos, cor)
  VALUES (p_board_id, p_nome, v_max_pos, p_cor)
  RETURNING id INTO v_coluna_id;

  RETURN v_coluna_id;
END;
$$;


ALTER FUNCTION "public"."api_criar_coluna_kanban"("p_board_id" "uuid", "p_nome" "text", "p_cor" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."api_deletar_card_kanban"("p_card_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Validar se card existe
  IF NOT EXISTS (SELECT 1 FROM kanban_cards WHERE id = p_card_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Card não encontrado ou já deletado';
  END IF;

  -- Soft delete: marcar como deletado
  UPDATE kanban_cards
  SET
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_card_id;

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em api_deletar_card_kanban: %', SQLERRM;
    RAISE;
END;
$$;


ALTER FUNCTION "public"."api_deletar_card_kanban"("p_card_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."api_deletar_card_kanban"("p_card_id" "uuid") IS 'Deleta (soft delete) um card do kanban. Marca deleted_at = NOW()';



CREATE OR REPLACE FUNCTION "public"."api_mover_card_kanban"("p_card_id" "uuid", "p_nova_coluna_id" "uuid", "p_nova_ordem" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Atualizar card
  UPDATE kanban_cards
  SET
    coluna_id = p_nova_coluna_id,
    ordem = p_nova_ordem,
    posicao = p_nova_ordem,
    updated_at = NOW()
  WHERE id = p_card_id AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."api_mover_card_kanban"("p_card_id" "uuid", "p_nova_coluna_id" "uuid", "p_nova_ordem" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."atualizar_progresso_projeto"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE projects
  SET progresso_percentual = calcular_progresso_projeto(NEW.project_id),
      updated_at = NOW()
  WHERE id = NEW.project_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."atualizar_progresso_projeto"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calcular_progresso_projeto"("p_project_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_progresso NUMERIC;
BEGIN
  SELECT COALESCE(AVG(progresso_percentual), 0)
  INTO v_progresso
  FROM tasks
  WHERE project_id = p_project_id
  AND parent_task_id IS NULL; -- Apenas tarefas raiz

  RETURN v_progresso;
END;
$$;


ALTER FUNCTION "public"."calcular_progresso_projeto"("p_project_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_data"("p_days_to_keep" integer DEFAULT 90) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_cutoff_date date;
    v_deleted_titulos integer := 0;
    v_deleted_lancamentos integer := 0;
    v_deleted_cards integer := 0;
BEGIN
    v_cutoff_date := CURRENT_DATE - (p_days_to_keep || ' days')::interval;
    RAISE NOTICE 'cleanup_old_data - Removendo dados anteriores a %', v_cutoff_date;

    -- Limpar títulos cancelados antigos
    DELETE FROM titulos_financeiros
    WHERE status = 'Cancelado'
        AND updated_at < v_cutoff_date;
    GET DIAGNOSTICS v_deleted_titulos = ROW_COUNT;

    -- Limpar lançamentos cancelados
    DELETE FROM lancamentos_financeiros
    WHERE status = 'cancelado'
        AND updated_at < v_cutoff_date;
    GET DIAGNOSTICS v_deleted_lancamentos = ROW_COUNT;

    -- Limpar cards arquivados do kanban
    DELETE FROM kanban_cards
    WHERE dados->>'arquivado' = 'true'
        AND updated_at < v_cutoff_date;
    GET DIAGNOSTICS v_deleted_cards = ROW_COUNT;

    RAISE NOTICE 'Limpeza concluída - Títulos: %, Lançamentos: %, Cards: %',
        v_deleted_titulos, v_deleted_lancamentos, v_deleted_cards;

    RETURN json_build_object(
        'cutoff_date', v_cutoff_date,
        'deleted_titulos', v_deleted_titulos,
        'deleted_lancamentos', v_deleted_lancamentos,
        'deleted_cards', v_deleted_cards,
        'executed_at', NOW()
    );

END;
$$;


ALTER FUNCTION "public"."cleanup_old_data"("p_days_to_keep" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_data"("p_days_to_keep" integer) IS 'Remove dados antigos cancelados/arquivados para manutenção do banco (usar com cuidado)';



CREATE OR REPLACE FUNCTION "public"."current_empresa_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_empresa_id uuid;
BEGIN
    -- Buscar empresa_id do profile do usuário
    SELECT empresa_id INTO v_empresa_id
    FROM profiles
    WHERE id = auth.uid();

    RETURN v_empresa_id;
END;
$$;


ALTER FUNCTION "public"."current_empresa_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."current_empresa_id"() IS 'Retorna o UUID da empresa do usuário autenticado';



CREATE OR REPLACE FUNCTION "public"."current_org"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_empresa_id uuid;
BEGIN
    -- Primeiro tenta buscar empresa padrão do usuário atual
    SELECT empresa_id INTO v_empresa_id
    FROM profiles
    WHERE id = auth.uid();

    -- Se não encontrou, busca primeira empresa ativa
    IF v_empresa_id IS NULL THEN
        SELECT id INTO v_empresa_id
        FROM empresas
        WHERE ativo = true
        ORDER BY created_at
        LIMIT 1;
    END IF;

    -- Se ainda não encontrou, cria empresa padrão
    IF v_empresa_id IS NULL THEN
        INSERT INTO empresas (
            nome,
            razao_social,
            cnpj,
            ativo
        ) VALUES (
            'Empresa Padrão',
            'Empresa Padrão LTDA',
            '00000000000000',
            true
        )
        RETURNING id INTO v_empresa_id;

        RAISE NOTICE 'Empresa padrão criada: %', v_empresa_id;
    END IF;

    RETURN v_empresa_id;

END;
$$;


ALTER FUNCTION "public"."current_org"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."current_org"() IS 'Retorna o UUID da empresa/organização atual do contexto, criando uma padrão se necessário';



CREATE OR REPLACE FUNCTION "public"."current_user_email"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT auth.jwt()->>'email';
$$;


ALTER FUNCTION "public"."current_user_email"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."current_user_email"() IS 'Retorna o email do usuário autenticado';



CREATE OR REPLACE FUNCTION "public"."current_user_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT auth.uid();
$$;


ALTER FUNCTION "public"."current_user_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."current_user_id"() IS 'Retorna o UUID do usuário autenticado';



CREATE OR REPLACE FUNCTION "public"."current_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT auth.role();
$$;


ALTER FUNCTION "public"."current_user_role"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."current_user_role"() IS 'Retorna o role do usuário autenticado';



CREATE OR REPLACE FUNCTION "public"."ensure_default_pipelines"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RAISE NOTICE 'ensure_default_pipelines - Criando pipelines padrão';

    -- Pipeline de Vendas
    PERFORM ensure_pipeline(
        'vendas',
        'Pipeline de Vendas',
        ARRAY['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento', 'Pós-venda']
    );

    -- Pipeline de Projetos
    PERFORM ensure_pipeline(
        'projetos',
        'Pipeline de Projetos',
        ARRAY['Planejamento', 'Em Execução', 'Em Revisão', 'Aprovação', 'Concluído']
    );

    -- Pipeline de Suporte
    PERFORM ensure_pipeline(
        'suporte',
        'Pipeline de Suporte',
        ARRAY['Novo', 'Em Análise', 'Em Atendimento', 'Aguardando Cliente', 'Resolvido']
    );

    -- Pipeline de Marketing
    PERFORM ensure_pipeline(
        'marketing',
        'Pipeline de Marketing',
        ARRAY['Lead', 'MQL', 'SQL', 'Oportunidade', 'Cliente']
    );

    RAISE NOTICE 'Pipelines padrão criados/verificados';

END;
$$;


ALTER FUNCTION "public"."ensure_default_pipelines"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."ensure_default_pipelines"() IS 'Cria os pipelines padrão do sistema (vendas, projetos, suporte, marketing)';



CREATE OR REPLACE FUNCTION "public"."ensure_pipeline"("p_modulo" "text", "p_nome" "text", "p_stages" "text"[] DEFAULT ARRAY['Prospecção'::"text", 'Qualificação'::"text", 'Proposta'::"text", 'Negociação'::"text", 'Fechamento'::"text"]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_pipeline_id uuid;
    v_stage text;
    v_posicao integer := 0;
BEGIN
    RAISE NOTICE 'ensure_pipeline - Módulo: %, Nome: %', p_modulo, p_nome;

    -- Verificar se pipeline já existe (usando campo nome como identificador único por módulo)
    SELECT id INTO v_pipeline_id
    FROM pipelines
    WHERE nome = p_nome
        AND dados->>'modulo' = p_modulo
    LIMIT 1;

    IF NOT FOUND THEN
        -- Criar novo pipeline
        INSERT INTO pipelines (
            nome,
            estagio,
            probabilidade,
            dados
        ) VALUES (
            p_nome,
            p_stages[1], -- Primeiro estágio como padrão
            20, -- Probabilidade inicial
            jsonb_build_object(
                'modulo', p_modulo,
                'stages', p_stages,
                'criado_por', 'ensure_pipeline',
                'criado_em', NOW()
            )
        )
        RETURNING id INTO v_pipeline_id;

        RAISE NOTICE 'Pipeline criado: % (%)', p_nome, v_pipeline_id;

        -- Criar registros para cada estágio
        FOREACH v_stage IN ARRAY p_stages
        LOOP
            v_posicao := v_posicao + 1;

            INSERT INTO pipelines (
                nome,
                estagio,
                probabilidade,
                dados
            ) VALUES (
                p_nome || ' - ' || v_stage,
                v_stage,
                CASE v_posicao
                    WHEN 1 THEN 20  -- Prospecção
                    WHEN 2 THEN 40  -- Qualificação
                    WHEN 3 THEN 60  -- Proposta
                    WHEN 4 THEN 80  -- Negociação
                    WHEN 5 THEN 100 -- Fechamento
                    ELSE 50
                END,
                jsonb_build_object(
                    'modulo', p_modulo,
                    'pipeline_id', v_pipeline_id,
                    'posicao', v_posicao,
                    'tipo', 'stage'
                )
            );
        END LOOP;

        RAISE NOTICE 'Estágios criados: %', array_length(p_stages, 1);
    ELSE
        RAISE NOTICE 'Pipeline já existe: % (%)', p_nome, v_pipeline_id;
    END IF;

    RETURN v_pipeline_id;

END;
$$;


ALTER FUNCTION "public"."ensure_pipeline"("p_modulo" "text", "p_nome" "text", "p_stages" "text"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."ensure_pipeline"("p_modulo" "text", "p_nome" "text", "p_stages" "text"[]) IS 'Garante que um pipeline existe com os estágios especificados, criando se necessário';



CREATE OR REPLACE FUNCTION "public"."fin_card_soft_delete"("p_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_ativo boolean;
    v_saldo numeric;
BEGIN
    RAISE NOTICE 'fin_card_soft_delete - Desativando conta: %', p_id;

    -- Verificar conta
    SELECT ativo, saldo_atual INTO v_ativo, v_saldo
    FROM contas_financeiras
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta financeira não encontrada: %', p_id;
    END IF;

    IF NOT v_ativo THEN
        RAISE WARNING 'Conta já está desativada';
        RETURN FALSE;
    END IF;

    IF v_saldo != 0 THEN
        RAISE WARNING 'Conta possui saldo: %. Considere zerar antes de desativar', v_saldo;
    END IF;

    -- Desativar conta
    UPDATE contas_financeiras
    SET
        ativo = FALSE,
        updated_at = NOW()
    WHERE id = p_id;

    RAISE NOTICE 'Conta desativada com sucesso';
    RETURN TRUE;

END;
$$;


ALTER FUNCTION "public"."fin_card_soft_delete"("p_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fin_card_soft_delete"("p_id" "uuid") IS 'Desativa uma conta financeira (soft delete), alerta se houver saldo';



CREATE OR REPLACE FUNCTION "public"."fin_txn_duplicate"("p_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_new_id uuid;
    v_record RECORD;
BEGIN
    RAISE NOTICE 'fin_txn_duplicate - Duplicando título: %', p_id;

    -- Buscar registro original
    SELECT * INTO v_record
    FROM titulos_financeiros
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Título financeiro não encontrado: %', p_id;
    END IF;

    -- Criar cópia
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
        conta_financeira_id,
        observacao,
        documento,
        fornecedor_cliente
    ) VALUES (
        v_record.empresa_id,
        v_record.tipo,
        v_record.descricao || ' (Cópia)',
        v_record.valor,
        CURRENT_DATE,
        v_record.data_vencimento + INTERVAL '1 month', -- Vencimento próximo mês
        'Previsto', -- Status inicial
        v_record.categoria_id,
        v_record.centro_custo_id,
        v_record.conta_financeira_id,
        v_record.observacao,
        v_record.documento,
        v_record.fornecedor_cliente
    )
    RETURNING id INTO v_new_id;

    RAISE NOTICE 'Título duplicado com sucesso. Novo ID: %', v_new_id;
    RETURN v_new_id;

END;
$$;


ALTER FUNCTION "public"."fin_txn_duplicate"("p_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fin_txn_duplicate"("p_id" "uuid") IS 'Duplica uma transação financeira, útil para títulos recorrentes';



CREATE OR REPLACE FUNCTION "public"."fin_txn_soft_delete"("p_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_status text;
BEGIN
    RAISE NOTICE 'fin_txn_soft_delete - Cancelando título: %', p_id;

    -- Verificar status atual
    SELECT status INTO v_status
    FROM titulos_financeiros
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Título financeiro não encontrado: %', p_id;
    END IF;

    IF v_status = 'Pago' THEN
        RAISE EXCEPTION 'Não é possível cancelar título já pago';
    END IF;

    IF v_status = 'Cancelado' THEN
        RAISE WARNING 'Título já está cancelado';
        RETURN FALSE;
    END IF;

    -- Marcar como cancelado
    UPDATE titulos_financeiros
    SET
        status = 'Cancelado',
        updated_at = NOW(),
        observacao = COALESCE(observacao || E'\n', '') ||
            'Cancelado em ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || ' por ' || COALESCE(auth.uid()::text, 'sistema')
    WHERE id = p_id;

    RAISE NOTICE 'Título cancelado com sucesso';
    RETURN TRUE;

END;
$$;


ALTER FUNCTION "public"."fin_txn_soft_delete"("p_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fin_txn_soft_delete"("p_id" "uuid") IS 'Cancela uma transação financeira (soft delete), não permite cancelar títulos já pagos';



CREATE OR REPLACE FUNCTION "public"."finance_report"("p_data_ini" "date" DEFAULT NULL::"date", "p_data_fim" "date" DEFAULT NULL::"date", "p_tipo" "text" DEFAULT NULL::"text", "p_status" "text" DEFAULT NULL::"text", "p_categoria_id" "uuid" DEFAULT NULL::"uuid", "p_empresa_id" "uuid" DEFAULT NULL::"uuid", "p_conta_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("titulo" "text", "tipo" "text", "categoria" "text", "valor" numeric, "data_vencimento" "date", "data_pagamento" "date", "status" "text", "fornecedor_cliente" "text", "conta_financeira" "text", "dias_atraso" integer, "observacao" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RAISE NOTICE 'finance_report - Iniciando com filtros: data_ini=%, data_fim=%, tipo=%, status=%',
        p_data_ini, p_data_fim, p_tipo, p_status;

    RETURN QUERY
    SELECT
        t.descricao AS titulo,
        t.tipo,
        c.nome AS categoria,
        t.valor,
        t.data_vencimento,
        NULL::date AS data_pagamento, -- TODO: campo data_pagamento não existe, usar campo adequado
        t.status,
        t.fornecedor_cliente,
        cf.apelido AS conta_financeira,
        CASE
            WHEN t.status IN ('Previsto', 'Aprovado') AND t.data_vencimento < CURRENT_DATE
            THEN (CURRENT_DATE - t.data_vencimento)::integer
            ELSE 0
        END AS dias_atraso,
        t.observacao
    FROM titulos_financeiros t
    LEFT JOIN categorias c ON c.id = t.categoria_id
    LEFT JOIN contas_financeiras cf ON cf.id = t.conta_financeira_id
    WHERE
        (p_data_ini IS NULL OR t.data_vencimento >= p_data_ini)
        AND (p_data_fim IS NULL OR t.data_vencimento <= p_data_fim)
        AND (p_tipo IS NULL OR t.tipo = p_tipo)
        AND (p_status IS NULL OR t.status = p_status)
        AND (p_categoria_id IS NULL OR t.categoria_id = p_categoria_id)
        AND (p_empresa_id IS NULL OR t.empresa_id = p_empresa_id)
        AND (p_conta_id IS NULL OR t.conta_financeira_id = p_conta_id)
    ORDER BY t.data_vencimento DESC, t.created_at DESC;

END;
$$;


ALTER FUNCTION "public"."finance_report"("p_data_ini" "date", "p_data_fim" "date", "p_tipo" "text", "p_status" "text", "p_categoria_id" "uuid", "p_empresa_id" "uuid", "p_conta_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."finance_report"("p_data_ini" "date", "p_data_fim" "date", "p_tipo" "text", "p_status" "text", "p_categoria_id" "uuid", "p_empresa_id" "uuid", "p_conta_id" "uuid") IS 'Relatório financeiro completo com filtros avançados por período, tipo, status, categoria, empresa e conta financeira';



CREATE OR REPLACE FUNCTION "public"."fn_cashflow_daily"("p_org" "uuid" DEFAULT NULL::"uuid", "p_d1" "date" DEFAULT ((CURRENT_DATE - '30 days'::interval))::"date", "p_d2" "date" DEFAULT ((CURRENT_DATE + '30 days'::interval))::"date") RETURNS TABLE("dia" "date", "entradas" numeric, "saidas" numeric, "saldo_dia" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_saldo_anterior numeric := 0;
    v_dia date;
BEGIN
    RAISE NOTICE 'fn_cashflow_daily - Período: % a %', p_d1, p_d2;

    -- Calcular saldo anterior (títulos pagos antes do período)
    SELECT
        COALESCE(SUM(
            CASE
                WHEN tipo = 'Receber' THEN valor
                WHEN tipo = 'Pagar' THEN -valor
                ELSE 0
            END
        ), 0)
    INTO v_saldo_anterior
    FROM titulos_financeiros
    WHERE status = 'Pago'
        AND data_vencimento < p_d1
        AND (p_org IS NULL OR empresa_id = p_org);

    RAISE NOTICE 'Saldo anterior: %', v_saldo_anterior;

    -- Gerar série de dias e calcular fluxo
    FOR v_dia IN
        SELECT generate_series(p_d1, p_d2, '1 day'::interval)::date
    LOOP
        RETURN QUERY
        SELECT
            v_dia AS dia,
            COALESCE(SUM(
                CASE WHEN tipo = 'Receber' THEN valor ELSE 0 END
            ), 0) AS entradas,
            COALESCE(SUM(
                CASE WHEN tipo = 'Pagar' THEN valor ELSE 0 END
            ), 0) AS saidas,
            v_saldo_anterior + COALESCE(SUM(
                CASE
                    WHEN tipo = 'Receber' THEN valor
                    WHEN tipo = 'Pagar' THEN -valor
                    ELSE 0
                END
            ), 0) AS saldo_dia
        FROM titulos_financeiros
        WHERE data_vencimento = v_dia
            AND status IN ('Previsto', 'Aprovado', 'Pago')
            AND (p_org IS NULL OR empresa_id = p_org);

        -- Atualizar saldo acumulado para próximo dia
        SELECT
            v_saldo_anterior + COALESCE(SUM(
                CASE
                    WHEN tipo = 'Receber' THEN valor
                    WHEN tipo = 'Pagar' THEN -valor
                    ELSE 0
                END
            ), 0)
        INTO v_saldo_anterior
        FROM titulos_financeiros
        WHERE data_vencimento = v_dia
            AND status IN ('Previsto', 'Aprovado', 'Pago')
            AND (p_org IS NULL OR empresa_id = p_org);
    END LOOP;

END;
$$;


ALTER FUNCTION "public"."fn_cashflow_daily"("p_org" "uuid", "p_d1" "date", "p_d2" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fn_cashflow_daily"("p_org" "uuid", "p_d1" "date", "p_d2" "date") IS 'Retorna o fluxo de caixa diário com entradas, saídas e saldo acumulado por dia';



CREATE OR REPLACE FUNCTION "public"."fn_dre"("p_org" "uuid" DEFAULT NULL::"uuid", "p_d1" "date" DEFAULT ("date_trunc"('month'::"text", (CURRENT_DATE)::timestamp with time zone))::"date", "p_d2" "date" DEFAULT ((("date_trunc"('month'::"text", (CURRENT_DATE)::timestamp with time zone) + '1 mon'::interval) - '1 day'::interval))::"date") RETURNS TABLE("total_receitas" numeric, "total_despesas" numeric, "resultado" numeric, "margem_lucro" numeric, "qtd_receitas" integer, "qtd_despesas" integer, "ticket_medio_receitas" numeric, "ticket_medio_despesas" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_receitas numeric;
    v_despesas numeric;
    v_qtd_receitas integer;
    v_qtd_despesas integer;
BEGIN
    RAISE NOTICE 'fn_dre - Período: % a %', p_d1, p_d2;

    -- Calcular receitas
    SELECT
        COALESCE(SUM(valor), 0),
        COUNT(*)
    INTO v_receitas, v_qtd_receitas
    FROM titulos_financeiros
    WHERE tipo = 'Receber'
        AND status = 'Pago'
        AND data_vencimento BETWEEN p_d1 AND p_d2
        AND (p_org IS NULL OR empresa_id = p_org);

    -- Calcular despesas
    SELECT
        COALESCE(SUM(valor), 0),
        COUNT(*)
    INTO v_despesas, v_qtd_despesas
    FROM titulos_financeiros
    WHERE tipo = 'Pagar'
        AND status = 'Pago'
        AND data_vencimento BETWEEN p_d1 AND p_d2
        AND (p_org IS NULL OR empresa_id = p_org);

    RETURN QUERY
    SELECT
        v_receitas AS total_receitas,
        v_despesas AS total_despesas,
        (v_receitas - v_despesas) AS resultado,
        CASE
            WHEN v_receitas > 0
            THEN ROUND(((v_receitas - v_despesas) / v_receitas * 100)::numeric, 2)
            ELSE 0
        END AS margem_lucro,
        v_qtd_receitas AS qtd_receitas,
        v_qtd_despesas AS qtd_despesas,
        CASE
            WHEN v_qtd_receitas > 0
            THEN ROUND((v_receitas / v_qtd_receitas)::numeric, 2)
            ELSE 0
        END AS ticket_medio_receitas,
        CASE
            WHEN v_qtd_despesas > 0
            THEN ROUND((v_despesas / v_qtd_despesas)::numeric, 2)
            ELSE 0
        END AS ticket_medio_despesas;

END;
$$;


ALTER FUNCTION "public"."fn_dre"("p_org" "uuid", "p_d1" "date", "p_d2" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fn_dre"("p_org" "uuid", "p_d1" "date", "p_d2" "date") IS 'Demonstrativo de Resultado do Exercício com métricas de receitas, despesas e margens';



CREATE OR REPLACE FUNCTION "public"."format_cep_br"("digits" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 8 THEN
        -- CEP: 12345-678
        RETURN substr(s,1,5) || '-' || substr(s,6,3);
    ELSE
        RETURN digits; -- Retorna original se não for formato conhecido
    END IF;
END;
$$;


ALTER FUNCTION "public"."format_cep_br"("digits" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."format_cep_br"("digits" "text") IS 'Formata CEP brasileiro: 12345-678';



CREATE OR REPLACE FUNCTION "public"."format_cnpj"("digits" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 14 THEN
        -- CNPJ: 12.345.678/0001-90
        RETURN substr(s,1,2) || '.' || substr(s,3,3) || '.' || substr(s,6,3) ||
               '/' || substr(s,9,4) || '-' || substr(s,13,2);
    ELSE
        RETURN digits;
    END IF;
END;
$$;


ALTER FUNCTION "public"."format_cnpj"("digits" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."format_cnpj"("digits" "text") IS 'Formata CNPJ brasileiro: 12.345.678/0001-90';



CREATE OR REPLACE FUNCTION "public"."format_cpf"("digits" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 11 THEN
        -- CPF: 123.456.789-00
        RETURN substr(s,1,3) || '.' || substr(s,4,3) || '.' || substr(s,7,3) || '-' || substr(s,10,2);
    ELSE
        RETURN digits;
    END IF;
END;
$$;


ALTER FUNCTION "public"."format_cpf"("digits" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."format_cpf"("digits" "text") IS 'Formata CPF brasileiro: 123.456.789-00';



CREATE OR REPLACE FUNCTION "public"."format_phone_br"("digits" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 11 THEN
        -- Celular: (11) 98765-4321
        RETURN '(' || substr(s,1,2) || ') ' || substr(s,3,5) || '-' || substr(s,8,4);
    ELSIF length(s) = 10 THEN
        -- Fixo: (11) 3456-7890
        RETURN '(' || substr(s,1,2) || ') ' || substr(s,3,4) || '-' || substr(s,7,4);
    ELSE
        RETURN digits; -- Retorna original se não for formato conhecido
    END IF;
END;
$$;


ALTER FUNCTION "public"."format_phone_br"("digits" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."format_phone_br"("digits" "text") IS 'Formata telefone brasileiro: (11) 98765-4321';



CREATE OR REPLACE FUNCTION "public"."generate_item_code"("p_category" "text" DEFAULT 'GERAL'::"text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_prefix text;
    v_sequence integer;
    v_code text;
BEGIN
    -- Definir prefixo baseado na categoria
    v_prefix := CASE UPPER(p_category)
        WHEN 'PRODUTO' THEN 'PRD'
        WHEN 'SERVICO' THEN 'SRV'
        WHEN 'MATERIAL' THEN 'MAT'
        WHEN 'EQUIPAMENTO' THEN 'EQP'
        WHEN 'SOFTWARE' THEN 'SFW'
        WHEN 'LICENCA' THEN 'LIC'
        ELSE 'ITM'
    END;

    -- Buscar próximo número da sequência
    -- Como não temos tabela específica de sequências, vamos usar uma estratégia alternativa
    SELECT COUNT(*) + 1
    INTO v_sequence
    FROM (
        SELECT 1 FROM propostas WHERE dados->>'item_code' LIKE v_prefix || '%'
        UNION ALL
        SELECT 1 FROM kanban_cards WHERE dados->>'item_code' LIKE v_prefix || '%'
    ) t;

    -- Montar código: PREFIX-YYYYMMDD-NNNN
    v_code := v_prefix || '-' ||
        TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
        LPAD(v_sequence::text, 4, '0');

    RAISE NOTICE 'Código gerado: %', v_code;
    RETURN v_code;

END;
$$;


ALTER FUNCTION "public"."generate_item_code"("p_category" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_item_code"("p_category" "text") IS 'Gera código único para itens baseado na categoria (PRD-20251103-0001)';



CREATE OR REPLACE FUNCTION "public"."get_account_org_id"("p_account_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_org_id uuid;
BEGIN
    SELECT empresa_id INTO v_org_id
    FROM contas_financeiras
    WHERE id = p_account_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Conta financeira não encontrada: %', p_account_id;
        -- Retornar org padrão
        RETURN current_org();
    END IF;

    RETURN v_org_id;
END;
$$;


ALTER FUNCTION "public"."get_account_org_id"("p_account_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_account_org_id"("p_account_id" "uuid") IS 'Retorna o ID da empresa/organização de uma conta financeira';



CREATE OR REPLACE FUNCTION "public"."get_api_url"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  v_url TEXT;
BEGIN
  SELECT value INTO v_url
  FROM app_config
  WHERE key = 'api_url';

  RETURN COALESCE(v_url, 'https://vyxscnevgeubfgfstmtf.supabase.co');
END;
$$;


ALTER FUNCTION "public"."get_api_url"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_api_url"() IS 'Retorna URL da API Supabase baseado no ambiente (local ou live). Usada em Edge Functions para deploy sem preocupação.';



CREATE OR REPLACE FUNCTION "public"."get_category_org_id"("p_category_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_org_id uuid;
BEGIN
    SELECT empresa_id INTO v_org_id
    FROM categorias
    WHERE id = p_category_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Categoria não encontrada: %', p_category_id;
        -- Retornar org padrão
        RETURN current_org();
    END IF;

    RETURN v_org_id;
END;
$$;


ALTER FUNCTION "public"."get_category_org_id"("p_category_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_category_org_id"("p_category_id" "uuid") IS 'Retorna o ID da empresa/organização de uma categoria';



CREATE OR REPLACE FUNCTION "public"."get_environment"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  v_env TEXT;
BEGIN
  SELECT value INTO v_env
  FROM app_config
  WHERE key = 'environment';

  RETURN COALESCE(v_env, 'live');
END;
$$;


ALTER FUNCTION "public"."get_environment"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_environment"() IS 'Retorna ambiente atual: local ou live';



CREATE OR REPLACE FUNCTION "public"."get_finance_dashboard_data"("p_empresa_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_result json;
    v_receitas_mes numeric;
    v_despesas_mes numeric;
    v_receitas_previstas numeric;
    v_despesas_previstas numeric;
    v_saldo_contas numeric;
    v_titulos_vencidos integer;
    v_titulos_vencer_7d integer;
BEGIN
    RAISE NOTICE 'get_finance_dashboard_data - empresa_id: %', p_empresa_id;

    -- Receitas do mês atual (pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_receitas_mes
    FROM titulos_financeiros
    WHERE tipo = 'Receber'
        AND status = 'Pago'
        AND date_trunc('month', data_vencimento) = date_trunc('month', CURRENT_DATE)
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Despesas do mês atual (pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_despesas_mes
    FROM titulos_financeiros
    WHERE tipo = 'Pagar'
        AND status = 'Pago'
        AND date_trunc('month', data_vencimento) = date_trunc('month', CURRENT_DATE)
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Receitas previstas (não pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_receitas_previstas
    FROM titulos_financeiros
    WHERE tipo = 'Receber'
        AND status IN ('Previsto', 'Aprovado')
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Despesas previstas (não pagas)
    SELECT COALESCE(SUM(valor), 0)
    INTO v_despesas_previstas
    FROM titulos_financeiros
    WHERE tipo = 'Pagar'
        AND status IN ('Previsto', 'Aprovado')
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Saldo das contas financeiras
    SELECT COALESCE(SUM(saldo_atual), 0)
    INTO v_saldo_contas
    FROM contas_financeiras
    WHERE ativo = true
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Títulos vencidos
    SELECT COUNT(*)
    INTO v_titulos_vencidos
    FROM titulos_financeiros
    WHERE status IN ('Previsto', 'Aprovado')
        AND data_vencimento < CURRENT_DATE
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Títulos a vencer nos próximos 7 dias
    SELECT COUNT(*)
    INTO v_titulos_vencer_7d
    FROM titulos_financeiros
    WHERE status IN ('Previsto', 'Aprovado')
        AND data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);

    -- Montar JSON de resultado
    v_result := json_build_object(
        'mes_atual', json_build_object(
            'receitas_pagas', v_receitas_mes,
            'despesas_pagas', v_despesas_mes,
            'saldo_mes', v_receitas_mes - v_despesas_mes,
            'lucratividade', CASE
                WHEN v_receitas_mes > 0
                THEN ROUND(((v_receitas_mes - v_despesas_mes) / v_receitas_mes * 100)::numeric, 2)
                ELSE 0
            END
        ),
        'previstos', json_build_object(
            'receitas', v_receitas_previstas,
            'despesas', v_despesas_previstas,
            'saldo_previsto', v_receitas_previstas - v_despesas_previstas
        ),
        'contas', json_build_object(
            'saldo_total', v_saldo_contas
        ),
        'alertas', json_build_object(
            'titulos_vencidos', v_titulos_vencidos,
            'titulos_vencer_7d', v_titulos_vencer_7d
        ),
        'timestamp', NOW()
    );

    RETURN v_result;

END;
$$;


ALTER FUNCTION "public"."get_finance_dashboard_data"("p_empresa_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_finance_dashboard_data"("p_empresa_id" "uuid") IS 'Retorna dados agregados para dashboard financeiro incluindo receitas, despesas, saldos e alertas';



CREATE OR REPLACE FUNCTION "public"."get_jwt_claim"("claim_name" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT auth.jwt()->>claim_name;
$$;


ALTER FUNCTION "public"."get_jwt_claim"("claim_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_jwt_claim"("claim_name" "text") IS 'Extrai valor de um claim específico do JWT';



CREATE OR REPLACE FUNCTION "public"."get_party_org_id"("p_party_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_org_id uuid;
BEGIN
    SELECT empresa_id INTO v_org_id
    FROM entities
    WHERE id = p_party_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Entity/Party não encontrada: %', p_party_id;
        -- Retornar org padrão
        RETURN current_org();
    END IF;

    RETURN v_org_id;
END;
$$;


ALTER FUNCTION "public"."get_party_org_id"("p_party_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_party_org_id"("p_party_id" "uuid") IS 'Retorna o ID da empresa/organização de uma entidade (cliente, fornecedor, etc)';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email, cargo, ativo)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'cargo', 'usuário'),
        TRUE
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Cria profile automaticamente quando usuário se cadastra';



CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_updated_at"() IS 'Atualiza automaticamente o campo updated_at antes de UPDATE';



CREATE OR REPLACE FUNCTION "public"."has_role"("p_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_user_cargo text;
BEGIN
    -- Buscar cargo do profile
    SELECT cargo INTO v_user_cargo
    FROM profiles
    WHERE id = auth.uid();

    -- Verificar se cargo corresponde
    RETURN v_user_cargo = p_role OR v_user_cargo = 'admin';
END;
$$;


ALTER FUNCTION "public"."has_role"("p_role" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_role"("p_role" "text") IS 'Verifica se usuário tem determinado cargo ou é admin';



CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
    SELECT has_role('admin');
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Verifica se usuário é admin';



CREATE OR REPLACE FUNCTION "public"."is_cnpj_valid"("doc" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $_$
DECLARE
    s TEXT := only_digits(doc);
    weights1 INT[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
    weights2 INT[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
    sum INT;
    rest INT;
    dv1 INT;
    dv2 INT;
    i INT;
BEGIN
    -- CNPJ deve ter 14 dígitos
    IF length(s) <> 14 THEN RETURN FALSE; END IF;

    -- Rejeita CNPJs com todos dígitos iguais
    IF s ~ '^(\d)\1{13}$' THEN RETURN FALSE; END IF;

    -- Calcula primeiro dígito verificador
    sum := 0;
    FOR i IN 1..12 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * weights1[i];
    END LOOP;
    rest := sum % 11;
    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Calcula segundo dígito verificador
    sum := 0;
    FOR i IN 1..13 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * weights2[i];
    END LOOP;
    rest := sum % 11;
    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Verifica se os dígitos calculados correspondem aos informados
    RETURN (dv1 = CAST(substr(s,13,1) AS INT) AND dv2 = CAST(substr(s,14,1) AS INT));
END;
$_$;


ALTER FUNCTION "public"."is_cnpj_valid"("doc" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_cnpj_valid"("doc" "text") IS 'Valida CNPJ brasileiro (14 dígitos)';



CREATE OR REPLACE FUNCTION "public"."is_cpf_cnpj_valid"("doc" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    s TEXT := only_digits(doc);
BEGIN
    RETURN CASE
        WHEN length(s) = 11 THEN is_cpf_valid(doc)
        WHEN length(s) = 14 THEN is_cnpj_valid(doc)
        ELSE FALSE
    END;
END;
$$;


ALTER FUNCTION "public"."is_cpf_cnpj_valid"("doc" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_cpf_cnpj_valid"("doc" "text") IS 'Valida CPF ou CNPJ automaticamente baseado no tamanho';



CREATE OR REPLACE FUNCTION "public"."is_cpf_valid"("doc" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $_$
DECLARE
    s TEXT := only_digits(doc);
    sum INT;
    rest INT;
    dv1 INT;
    dv2 INT;
    i INT;
BEGIN
    -- CPF deve ter 11 dígitos
    IF length(s) <> 11 THEN RETURN FALSE; END IF;

    -- Rejeita CPFs com todos dígitos iguais (111.111.111-11)
    IF s ~ '^(\d)\1{10}$' THEN RETURN FALSE; END IF;

    -- Calcula primeiro dígito verificador
    sum := 0;
    FOR i IN 1..9 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * (11 - i);
    END LOOP;
    rest := sum % 11;
    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Calcula segundo dígito verificador
    sum := 0;
    FOR i IN 1..10 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * (12 - i);
    END LOOP;
    rest := sum % 11;
    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Verifica se os dígitos calculados correspondem aos informados
    RETURN (dv1 = CAST(substr(s,10,1) AS INT) AND dv2 = CAST(substr(s,11,1) AS INT));
END;
$_$;


ALTER FUNCTION "public"."is_cpf_valid"("doc" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_cpf_valid"("doc" "text") IS 'Valida CPF brasileiro (11 dígitos)';



CREATE OR REPLACE FUNCTION "public"."is_local_environment"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN get_environment() = 'local';
END;
$$;


ALTER FUNCTION "public"."is_local_environment"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_local_environment"() IS 'Retorna true se ambiente é local, false se live';



CREATE OR REPLACE FUNCTION "public"."kanban_ensure_board"("p_modulo" "text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_board_id uuid;
    v_board_id_bigint bigint;
BEGIN
    RAISE NOTICE 'kanban_ensure_board - Garantindo board para módulo: %', p_modulo;

    -- Verificar se o board já existe
    SELECT id INTO v_board_id
    FROM kanban_boards
    WHERE ambiente = p_modulo;

    IF NOT FOUND THEN
        -- Criar novo board
        INSERT INTO kanban_boards (ambiente, titulo, descricao)
        VALUES (
            p_modulo,
            'Kanban ' || p_modulo,
            'Board do módulo ' || p_modulo
        )
        RETURNING id INTO v_board_id;

        RAISE NOTICE 'Board criado: %', v_board_id;

        -- Criar colunas padrão
        PERFORM _ensure_coluna(
            v_board_id,
            'A Fazer',
            1,
            '#94a3b8' -- Cinza
        );

        PERFORM _ensure_coluna(
            v_board_id,
            'Em Progresso',
            2,
            '#60a5fa' -- Azul
        );

        PERFORM _ensure_coluna(
            v_board_id,
            'Em Revisão',
            3,
            '#fbbf24' -- Amarelo
        );

        PERFORM _ensure_coluna(
            v_board_id,
            'Concluído',
            4,
            '#34d399' -- Verde
        );

        RAISE NOTICE 'Colunas padrão criadas para o board';
    ELSE
        RAISE NOTICE 'Board já existe: %', v_board_id;
    END IF;

    -- Converter UUID para bigint (hash simples do primeiro segment)
    -- Nota: Esta conversão é simplificada, em produção usar outra estratégia
    v_board_id_bigint := ('x' || substr(v_board_id::text, 1, 8))::bit(32)::bigint;

    RETURN v_board_id_bigint;

END;
$$;


ALTER FUNCTION "public"."kanban_ensure_board"("p_modulo" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."kanban_ensure_board"("p_modulo" "text") IS 'Garante que um board existe para o módulo especificado, cria se necessário com colunas padrão';



CREATE OR REPLACE FUNCTION "public"."kanban_get_board_status"("p_modulo" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_result json;
    v_board_id uuid;
BEGIN
    -- Obter board_id
    SELECT id INTO v_board_id
    FROM kanban_boards
    WHERE ambiente = p_modulo;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'error', 'Board não encontrado',
            'modulo', p_modulo
        );
    END IF;

    -- Montar estatísticas
    SELECT json_build_object(
        'board_id', v_board_id,
        'modulo', p_modulo,
        'colunas', (
            SELECT json_agg(
                json_build_object(
                    'id', c.id,
                    'titulo', c.titulo,
                    'cor', c.cor,
                    'posicao', c.posicao,
                    'total_cards', COUNT(kc.id),
                    'valor_total', COALESCE(SUM(kc.valor), 0)
                ) ORDER BY c.posicao
            )
            FROM kanban_colunas c
            LEFT JOIN kanban_cards kc ON kc.coluna_id = c.id
            WHERE c.board_id = v_board_id
            GROUP BY c.id, c.titulo, c.cor, c.posicao
        ),
        'totais', (
            SELECT json_build_object(
                'total_cards', COUNT(kc.id),
                'valor_total', COALESCE(SUM(kc.valor), 0),
                'cards_sem_responsavel', COUNT(*) FILTER (WHERE kc.responsavel_id IS NULL)
            )
            FROM kanban_cards kc
            INNER JOIN kanban_colunas c ON c.id = kc.coluna_id
            WHERE c.board_id = v_board_id
        ),
        'timestamp', NOW()
    ) INTO v_result;

    RETURN v_result;

END;
$$;


ALTER FUNCTION "public"."kanban_get_board_status"("p_modulo" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."kanban_get_board_status"("p_modulo" "text") IS 'Retorna estatísticas e status completo de um board kanban';



CREATE OR REPLACE FUNCTION "public"."kanban_move_card"("p_card_id" "uuid", "p_new_coluna_id" "uuid", "p_new_posicao" integer DEFAULT NULL::integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_old_coluna_id uuid;
    v_old_posicao integer;
BEGIN
    RAISE NOTICE 'kanban_move_card - Card: %, Nova coluna: %, Nova posição: %',
        p_card_id, p_new_coluna_id, p_new_posicao;

    -- Obter posição atual
    SELECT coluna_id, posicao
    INTO v_old_coluna_id, v_old_posicao
    FROM kanban_cards
    WHERE id = p_card_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Card não encontrado: %', p_card_id;
    END IF;

    -- Se não especificou posição, colocar no final
    IF p_new_posicao IS NULL THEN
        SELECT COALESCE(MAX(posicao), 0) + 10
        INTO p_new_posicao
        FROM kanban_cards
        WHERE coluna_id = p_new_coluna_id;
    END IF;

    -- Atualizar card (triggers farão o reordenamento)
    UPDATE kanban_cards
    SET
        coluna_id = p_new_coluna_id,
        posicao = p_new_posicao,
        updated_at = NOW()
    WHERE id = p_card_id;

    RAISE NOTICE 'Card movido com sucesso de coluna % pos % para coluna % pos %',
        v_old_coluna_id, v_old_posicao, p_new_coluna_id, p_new_posicao;

    RETURN TRUE;

END;
$$;


ALTER FUNCTION "public"."kanban_move_card"("p_card_id" "uuid", "p_new_coluna_id" "uuid", "p_new_posicao" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."kanban_move_card"("p_card_id" "uuid", "p_new_coluna_id" "uuid", "p_new_posicao" integer) IS 'Move um card entre colunas do kanban, reordenando automaticamente as posições';



CREATE OR REPLACE FUNCTION "public"."only_digits"("text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $_$
BEGIN
    RETURN regexp_replace($1, '[^0-9]', '', 'g');
END;
$_$;


ALTER FUNCTION "public"."only_digits"("text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."only_digits"("text") IS 'Remove caracteres não numéricos de uma string';



CREATE OR REPLACE FUNCTION "public"."reorder_cards"("p_modulo" "text", "p_stage_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_board_id uuid;
    v_card RECORD;
    v_posicao integer := 0;
BEGIN
    RAISE NOTICE 'reorder_cards - Módulo: %, Stage: %', p_modulo, p_stage_id;

    -- Obter board_id do módulo
    SELECT id INTO v_board_id
    FROM kanban_boards
    WHERE ambiente = p_modulo;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Board não encontrado para módulo: %', p_modulo;
    END IF;

    -- Se stage_id especificado, reordenar apenas cards dessa coluna
    IF p_stage_id IS NOT NULL THEN
        FOR v_card IN
            SELECT id
            FROM kanban_cards
            WHERE coluna_id = p_stage_id
            ORDER BY posicao, created_at
        LOOP
            v_posicao := v_posicao + 10;
            UPDATE kanban_cards
            SET posicao = v_posicao
            WHERE id = v_card.id;
        END LOOP;

        RAISE NOTICE 'Reordenados % cards na coluna %', v_posicao / 10, p_stage_id;
    ELSE
        -- Reordenar todas as colunas do board
        FOR v_card IN
            SELECT kc.id, kc.coluna_id
            FROM kanban_cards kc
            INNER JOIN kanban_colunas col ON col.id = kc.coluna_id
            WHERE col.board_id = v_board_id
            ORDER BY col.posicao, kc.posicao, kc.created_at
        LOOP
            -- Reset posição quando mudar de coluna
            IF v_card.coluna_id IS DISTINCT FROM lag(v_card.coluna_id) OVER () THEN
                v_posicao := 0;
            END IF;

            v_posicao := v_posicao + 10;
            UPDATE kanban_cards
            SET posicao = v_posicao
            WHERE id = v_card.id;
        END LOOP;

        RAISE NOTICE 'Reordenados todos os cards do board %', p_modulo;
    END IF;

END;
$$;


ALTER FUNCTION "public"."reorder_cards"("p_modulo" "text", "p_stage_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reorder_cards"("p_modulo" "text", "p_stage_id" "uuid") IS 'Reordena cards do kanban por posição, opcionalmente filtrando por coluna';



CREATE OR REPLACE FUNCTION "public"."sync_cliente_nome"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.entity_id IS NOT NULL THEN
    SELECT nome INTO NEW.cliente_nome
    FROM entities
    WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_cliente_nome"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."system_health_check"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_result json;
BEGIN
    SELECT json_build_object(
        'timestamp', NOW(),
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'tables', (
            SELECT json_object_agg(
                tablename,
                pg_size_pretty(pg_total_relation_size(quote_ident(tablename)::regclass))
            )
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename IN (
                'titulos_financeiros',
                'lancamentos_financeiros',
                'kanban_cards',
                'propostas',
                'entities',
                'empresas'
            )
        ),
        'counts', json_build_object(
            'titulos_vencidos', (
                SELECT COUNT(*)
                FROM titulos_financeiros
                WHERE status IN ('Previsto', 'Aprovado')
                AND data_vencimento < CURRENT_DATE
            ),
            'propostas_pendentes', (
                SELECT COUNT(*)
                FROM propostas
                WHERE status = 'pendente'
            ),
            'cards_sem_responsavel', (
                SELECT COUNT(*)
                FROM kanban_cards
                WHERE responsavel_id IS NULL
            )
        ),
        'alerts', CASE
            WHEN EXISTS (
                SELECT 1
                FROM titulos_financeiros
                WHERE status IN ('Previsto', 'Aprovado')
                AND data_vencimento < CURRENT_DATE - INTERVAL '30 days'
            ) THEN 'Existem títulos vencidos há mais de 30 dias!'
            ELSE 'Sistema operando normalmente'
        END
    ) INTO v_result;

    RETURN v_result;

END;
$$;


ALTER FUNCTION "public"."system_health_check"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."system_health_check"() IS 'Retorna métricas de saúde do sistema incluindo tamanhos, contadores e alertas';



CREATE OR REPLACE FUNCTION "public"."trigger_calc_quantidade_diaria"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_dias_uteis integer;
    v_quantidade_diaria numeric;
BEGIN
    -- Se tem data inicial e final, calcular quantidade diária
    IF NEW.dados ? 'data_inicial' AND NEW.dados ? 'data_final' AND NEW.dados ? 'quantidade_total' THEN
        -- Calcular dias úteis entre as datas
        SELECT COUNT(*)
        INTO v_dias_uteis
        FROM generate_series(
            (NEW.dados->>'data_inicial')::date,
            (NEW.dados->>'data_final')::date,
            '1 day'::interval
        ) AS dia
        WHERE EXTRACT(DOW FROM dia) NOT IN (0, 6); -- Excluir sábado e domingo

        IF v_dias_uteis > 0 THEN
            v_quantidade_diaria := (NEW.dados->>'quantidade_total')::numeric / v_dias_uteis;

            NEW.dados := NEW.dados || jsonb_build_object(
                'dias_uteis', v_dias_uteis,
                'quantidade_diaria', ROUND(v_quantidade_diaria, 2)
            );

            RAISE NOTICE 'Quantidade diária calculada: % (% dias úteis)',
                v_quantidade_diaria, v_dias_uteis;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_calc_quantidade_diaria"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_conta_set_empresa_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Se não tem empresa_id, usar empresa padrão
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := current_org();
        RAISE NOTICE 'Empresa definida automaticamente: %', NEW.empresa_id;
    END IF;

    -- Timestamps
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := NOW();
    END IF;
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_conta_set_empresa_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_entities_normalize"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Normalizar nome (trim e capitalizar)
    IF NEW.nome IS NOT NULL THEN
        NEW.nome := TRIM(NEW.nome);
        -- Capitalizar primeira letra de cada palavra
        NEW.nome := INITCAP(NEW.nome);
    END IF;

    -- Normalizar email (lowercase)
    IF NEW.email IS NOT NULL THEN
        NEW.email := LOWER(TRIM(NEW.email));
    END IF;

    -- Normalizar telefone (remover caracteres não numéricos)
    IF NEW.telefone IS NOT NULL THEN
        NEW.telefone := REGEXP_REPLACE(NEW.telefone, '[^0-9]', '', 'g');
    END IF;

    -- Normalizar CPF/CNPJ (remover caracteres não numéricos)
    IF NEW.cpf_cnpj IS NOT NULL THEN
        NEW.cpf_cnpj := REGEXP_REPLACE(NEW.cpf_cnpj, '[^0-9]', '', 'g');
    END IF;

    -- ⚠️ COMENTADO: Campos tipo_pessoa e empresa_id não existem na tabela entities
    -- -- Definir tipo baseado no tamanho do documento
    -- IF NEW.cpf_cnpj IS NOT NULL AND NEW.tipo_pessoa IS NULL THEN
    --     IF LENGTH(NEW.cpf_cnpj) = 11 THEN
    --         NEW.tipo_pessoa := 'fisica';
    --     ELSIF LENGTH(NEW.cpf_cnpj) = 14 THEN
    --         NEW.tipo_pessoa := 'juridica';
    --     END IF;
    -- END IF;

    -- -- Garantir empresa_id
    -- IF NEW.empresa_id IS NULL THEN
    --     NEW.empresa_id := current_org();
    -- END IF;

    -- Timestamps
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := NOW();
    END IF;
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_entities_normalize"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_fin_txn_compute_amount"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Calcular valor se necessário (exemplo: desconto ou juros)
    -- Por enquanto, apenas validar valor positivo
    IF NEW.valor IS NOT NULL AND NEW.valor < 0 THEN
        RAISE EXCEPTION 'Valor não pode ser negativo';
    END IF;

    -- Se não houver data de emissão, usar data atual
    IF NEW.data_emissao IS NULL THEN
        NEW.data_emissao := CURRENT_DATE;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_fin_txn_compute_amount"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_fin_txn_defaults"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Status padrão
    IF NEW.status IS NULL THEN
        NEW.status := 'Previsto';
    END IF;

    -- Data de emissão padrão
    IF NEW.data_emissao IS NULL THEN
        NEW.data_emissao := CURRENT_DATE;
    END IF;

    -- Se data de vencimento for passada e status for Previsto/Aprovado, marcar como Vencido
    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status IN ('Previsto', 'Aprovado') THEN
        NEW.status := 'Vencido';
    END IF;

    -- Timestamps
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := NOW();
    END IF;
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_fin_txn_defaults"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_kanban_colunas_set_pos"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_max_posicao integer;
BEGIN
    -- Ao inserir nova coluna
    IF TG_OP = 'INSERT' THEN
        -- Se não foi especificada posição, colocar no final
        IF NEW.posicao IS NULL OR NEW.posicao = 0 THEN
            SELECT COALESCE(MAX(posicao), 0) + 1
            INTO v_max_posicao
            FROM kanban_colunas
            WHERE board_id = NEW.board_id;

            NEW.posicao := v_max_posicao;
            RAISE NOTICE 'Coluna inserida na posição % do board %', NEW.posicao, NEW.board_id;
        ELSE
            -- Abrir espaço se necessário
            UPDATE kanban_colunas
            SET posicao = posicao + 1
            WHERE board_id = NEW.board_id
                AND posicao >= NEW.posicao
                AND id != NEW.id;
        END IF;

        NEW.created_at := NOW();
    END IF;

    -- Ao atualizar posição
    IF TG_OP = 'UPDATE' AND OLD.posicao != NEW.posicao THEN
        IF NEW.posicao > OLD.posicao THEN
            -- Movendo para direita
            UPDATE kanban_colunas
            SET posicao = posicao - 1
            WHERE board_id = NEW.board_id
                AND posicao > OLD.posicao
                AND posicao <= NEW.posicao
                AND id != NEW.id;
        ELSE
            -- Movendo para esquerda
            UPDATE kanban_colunas
            SET posicao = posicao + 1
            WHERE board_id = NEW.board_id
                AND posicao >= NEW.posicao
                AND posicao < OLD.posicao
                AND id != NEW.id;
        END IF;

        RAISE NOTICE 'Coluna reposicionada de % para %', OLD.posicao, NEW.posicao;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_kanban_colunas_set_pos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_lanc_total"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    v_total numeric;
BEGIN
    -- Se tem dados com itens, calcular total
    IF NEW.dados IS NOT NULL AND NEW.dados ? 'itens' THEN
        SELECT SUM(
            COALESCE((item->>'quantidade')::numeric, 1) *
            COALESCE((item->>'valor_unitario')::numeric, 0)
        )
        INTO v_total
        FROM jsonb_array_elements(NEW.dados->'itens') AS item;

        IF v_total IS NOT NULL AND v_total != NEW.valor THEN
            NEW.valor := v_total;
            RAISE NOTICE 'Total recalculado: R$ %', v_total;
        END IF;
    END IF;

    -- Garantir empresa_id
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := current_org();
    END IF;

    -- Status padrão
    IF NEW.status IS NULL THEN
        NEW.status := 'previsto';
    END IF;

    -- Tipo padrão baseado no valor
    IF NEW.tipo IS NULL THEN
        IF NEW.valor >= 0 THEN
            NEW.tipo := 'receita';
        ELSE
            NEW.tipo := 'despesa';
            NEW.valor := ABS(NEW.valor); -- Sempre positivo
        END IF;
    END IF;

    RETURN NEW;
END;
$_$;


ALTER FUNCTION "public"."trigger_lanc_total"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_on_oportunidade_concluida"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_titulo_id uuid;
BEGIN
    -- Se mudou para estágio final (100% probabilidade) ou status 'ganho'
    IF NEW.probabilidade = 100 AND OLD.probabilidade < 100 THEN
        RAISE NOTICE 'Oportunidade concluída: %', NEW.nome;

        -- Criar título a receber se tem valor
        IF NEW.valor IS NOT NULL AND NEW.valor > 0 THEN
            INSERT INTO titulos_financeiros (
                empresa_id,
                tipo,
                descricao,
                valor,
                data_emissao,
                data_vencimento,
                status,
                fornecedor_cliente
            ) VALUES (
                current_org(),
                'Receber',
                'Oportunidade Ganha: ' || NEW.nome,
                NEW.valor,
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '30 days',
                'Previsto',
                (SELECT nome FROM entities WHERE id = NEW.entity_id)
            )
            RETURNING id INTO v_titulo_id;

            -- Atualizar dados da oportunidade
            NEW.dados := COALESCE(NEW.dados, '{}'::jsonb) || jsonb_build_object(
                'status', 'ganho',
                'data_fechamento', NOW(),
                'titulo_gerado', v_titulo_id
            );

            RAISE NOTICE 'Título financeiro criado: %', v_titulo_id;
        END IF;

        -- Registrar vitória nos dados
        NEW.dados := COALESCE(NEW.dados, '{}'::jsonb) || jsonb_build_object(
            'ganho_em', NOW(),
            'ganho_por', auth.uid()
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_on_oportunidade_concluida"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_propagate_won_opportunity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_card_id uuid;
    v_coluna_concluido uuid;
BEGIN
    -- Se oportunidade foi ganha, criar card no kanban de projetos
    IF NEW.probabilidade = 100 AND OLD.probabilidade < 100 AND NEW.dados->>'modulo' = 'vendas' THEN
        -- Buscar coluna "Concluído" ou última coluna do board de projetos
        SELECT id INTO v_coluna_concluido
        FROM kanban_colunas
        WHERE board_id = (
            SELECT id FROM kanban_boards WHERE ambiente = 'projetos' LIMIT 1
        )
        ORDER BY
            CASE WHEN LOWER(titulo) LIKE '%conclu%' THEN 0 ELSE 1 END,
            posicao DESC
        LIMIT 1;

        IF v_coluna_concluido IS NOT NULL THEN
            -- Criar card no kanban
            INSERT INTO kanban_cards (
                coluna_id,
                titulo,
                descricao,
                valor,
                entity_id,
                responsavel_id,
                dados
            ) VALUES (
                v_coluna_concluido,
                'Projeto: ' || NEW.nome,
                'Projeto originado de oportunidade ganha',
                NEW.valor,
                NEW.entity_id,
                auth.uid(),
                jsonb_build_object(
                    'origem', 'oportunidade_ganha',
                    'oportunidade_id', NEW.id,
                    'data_origem', NOW()
                )
            )
            RETURNING id INTO v_card_id;

            RAISE NOTICE 'Card de projeto criado: %', v_card_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_propagate_won_opportunity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_config" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."app_config" OWNER TO "postgres";


COMMENT ON TABLE "public"."app_config" IS 'Configurações gerais do aplicativo (ambiente, URLs, features flags, etc)';



CREATE TABLE IF NOT EXISTS "public"."assistencias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "codigo" "text" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "cliente_nome" "text",
    "descricao" "text" NOT NULL,
    "status" "text" DEFAULT 'aberta'::"text" NOT NULL,
    "data_solicitacao" timestamp with time zone DEFAULT "now"(),
    "responsavel_id" "uuid",
    "prioridade" "text",
    "observacoes" "text",
    "data_agendamento" timestamp with time zone,
    "data_conclusao" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "assistencias_prioridade_check" CHECK (("prioridade" = ANY (ARRAY['baixa'::"text", 'media'::"text", 'alta'::"text", 'urgente'::"text"]))),
    CONSTRAINT "assistencias_status_check" CHECK (("status" = ANY (ARRAY['aberta'::"text", 'agendado'::"text", 'em_atendimento'::"text", 'atendido'::"text", 'em_atraso'::"text"])))
);


ALTER TABLE "public"."assistencias" OWNER TO "postgres";


COMMENT ON TABLE "public"."assistencias" IS 'Ordens de Serviço / Assistências técnicas';



CREATE TABLE IF NOT EXISTS "public"."bancos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "codigo" "text",
    "nome" "text" NOT NULL,
    "ispb" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bancos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bank_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "banco" "text",
    "agencia" "text",
    "conta" "text",
    "titular" "text",
    "cpf_cnpj_titular" "text",
    "pix_chave" "text",
    "pix_tipo" "text",
    "is_principal" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bank_accounts_pix_tipo_check" CHECK (("pix_tipo" = ANY (ARRAY['cpf'::"text", 'cnpj'::"text", 'email'::"text", 'telefone'::"text", 'aleatoria'::"text"])))
);


ALTER TABLE "public"."bank_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categorias_financeiras" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "tipo" character varying(20),
    "plano_conta_id" "uuid",
    "ativa" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "categorias_financeiras_tipo_check" CHECK ((("tipo")::"text" = ANY ((ARRAY['receita'::character varying, 'despesa'::character varying])::"text"[])))
);


ALTER TABLE "public"."categorias_financeiras" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."centros_custo" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "codigo" "text",
    "descricao" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "empresa_id" "uuid"
);


ALTER TABLE "public"."centros_custo" OWNER TO "postgres";


COMMENT ON TABLE "public"."centros_custo" IS 'Centros de custo para controle gerencial';



COMMENT ON COLUMN "public"."centros_custo"."empresa_id" IS 'Empresa dona do centro de custo (NULL = compartilhado entre todas)';



CREATE TABLE IF NOT EXISTS "public"."compras" (
    "id" "text" NOT NULL,
    "numero" "text" NOT NULL,
    "fornecedor" "text" NOT NULL,
    "itens" "text" NOT NULL,
    "valor_total" numeric NOT NULL,
    "link" "text",
    "imagem_url" "text",
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "data_entrega" "date" NOT NULL,
    "cliente_id" "uuid",
    "cliente_nome" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "critico" boolean DEFAULT false
);


ALTER TABLE "public"."compras" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contas_bancarias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "banco" character varying(100),
    "agencia" character varying(20),
    "conta" character varying(30),
    "tipo" character varying(50),
    "saldo_inicial" numeric(15,2) DEFAULT 0,
    "ativa" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contas_bancarias_tipo_check" CHECK ((("tipo")::"text" = ANY ((ARRAY['corrente'::character varying, 'poupanca'::character varying, 'aplicacao'::character varying])::"text"[])))
);


ALTER TABLE "public"."contas_bancarias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contas_financeiras" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid",
    "banco" "text" NOT NULL,
    "agencia" "text",
    "conta" "text",
    "tipo" "text",
    "saldo_inicial" numeric(15,2) DEFAULT 0,
    "saldo_atual" numeric(15,2) DEFAULT 0,
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "apelido" "text",
    CONSTRAINT "contas_financeiras_tipo_check" CHECK (("tipo" = ANY (ARRAY['corrente'::"text", 'poupanca'::"text", 'investimento'::"text"])))
);


ALTER TABLE "public"."contas_financeiras" OWNER TO "postgres";


COMMENT ON TABLE "public"."contas_financeiras" IS 'Contas bancárias das empresas';



COMMENT ON COLUMN "public"."contas_financeiras"."apelido" IS 'Nome amigável para identificação rápida da conta (ex: "Conta Principal Santander")';



CREATE TABLE IF NOT EXISTS "public"."contratos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "numero" "text" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "proposta_id" "uuid",
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "valor_total" numeric(15,2) DEFAULT 0 NOT NULL,
    "data_inicio" "date",
    "data_fim" "date",
    "data_assinatura" "date",
    "status" "text" DEFAULT 'rascunho'::"text",
    "tipo" "text",
    "responsavel_id" "uuid",
    "observacoes" "text",
    "anexos" "jsonb" DEFAULT '[]'::"jsonb",
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contratos_status_check" CHECK (("status" = ANY (ARRAY['rascunho'::"text", 'ativo'::"text", 'concluido'::"text", 'cancelado'::"text"]))),
    CONSTRAINT "contratos_tipo_check" CHECK (("tipo" = ANY (ARRAY['arquitetura'::"text", 'marcenaria'::"text", 'engenharia'::"text", 'consultoria'::"text", 'outros'::"text"])))
);


ALTER TABLE "public"."contratos" OWNER TO "postgres";


COMMENT ON TABLE "public"."contratos" IS 'Contratos firmados com clientes';



CREATE TABLE IF NOT EXISTS "public"."empresas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "razao_social" "text" NOT NULL,
    "nome_fantasia" "text",
    "cnpj" "text",
    "inscricao_estadual" "text",
    "tipo" "text",
    "endereco" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "telefone" "text",
    "email" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "empresas_tipo_check" CHECK (("tipo" = ANY (ARRAY['matriz'::"text", 'filial'::"text", 'parceiro'::"text"])))
);


ALTER TABLE "public"."empresas" OWNER TO "postgres";


COMMENT ON TABLE "public"."empresas" IS 'Empresas do grupo WG Almeida';



CREATE TABLE IF NOT EXISTS "public"."entities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tipo" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text",
    "telefone" "text",
    "cpf_cnpj" "text",
    "endereco" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "nome_fantasia" "text",
    "rg_ie" "text",
    "logradouro" "text",
    "numero" "text",
    "complemento" "text",
    "bairro" "text",
    "observacoes" "text",
    "tipo_pessoa" character varying(2) DEFAULT 'PF'::character varying,
    CONSTRAINT "entities_tipo_check" CHECK (("tipo" = ANY (ARRAY['cliente'::"text", 'lead'::"text", 'fornecedor'::"text", 'colaborador'::"text", 'especificador'::"text"]))),
    CONSTRAINT "entities_tipo_pessoa_check" CHECK ((("tipo_pessoa")::"text" = ANY ((ARRAY['PF'::character varying, 'PJ'::character varying])::"text"[])))
);


ALTER TABLE "public"."entities" OWNER TO "postgres";


COMMENT ON TABLE "public"."entities" IS 'Entidades genéricas: clientes, leads, fornecedores';



COMMENT ON COLUMN "public"."entities"."tipo" IS 'Tipo da entidade: cliente, lead, fornecedor, colaborador, especificador';



COMMENT ON COLUMN "public"."entities"."dados" IS 'Dados adicionais em formato JSONB (flexível para cada tipo)';



COMMENT ON COLUMN "public"."entities"."nome_fantasia" IS 'Nome fantasia (apenas para PJ)';



COMMENT ON COLUMN "public"."entities"."rg_ie" IS 'RG para PF ou Inscrição Estadual para PJ';



COMMENT ON COLUMN "public"."entities"."tipo_pessoa" IS 'PF = Pessoa Física, PJ = Pessoa Jurídica';



CREATE TABLE IF NOT EXISTS "public"."especificador_comissao_niveis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "especificador_id" "uuid",
    "nivel" integer NOT NULL,
    "percentual" numeric(5,2) NOT NULL,
    "valor_minimo" numeric(10,2),
    "valor_maximo" numeric(10,2),
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."especificador_comissao_niveis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."especificadores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "cpf_cnpj" "text",
    "email" "text",
    "telefone" "text",
    "endereco" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "ativo" boolean DEFAULT true,
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."especificadores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feriados" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "data" "date" NOT NULL,
    "nome" "text" NOT NULL,
    "tipo" "text",
    "uf" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "feriados_tipo_check" CHECK (("tipo" = ANY (ARRAY['nacional'::"text", 'estadual'::"text", 'municipal'::"text"])))
);


ALTER TABLE "public"."feriados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kanban_boards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ambiente" "text" NOT NULL,
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "modulo" character varying(50)
);


ALTER TABLE "public"."kanban_boards" OWNER TO "postgres";


COMMENT ON TABLE "public"."kanban_boards" IS 'Quadros Kanban para diferentes contextos';



CREATE TABLE IF NOT EXISTS "public"."kanban_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "coluna_id" "uuid",
    "nome" "text" NOT NULL,
    "descricao" "text",
    "valor_previsto" numeric(15,2),
    "responsavel_id" "uuid",
    "entity_id" "uuid",
    "posicao" integer DEFAULT 0 NOT NULL,
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "servicos_contratados" "text"[] DEFAULT '{}'::"text"[],
    "vendedor" "text",
    "indicador" "text",
    "responsavel_avatar" "text",
    "fase" "text" DEFAULT 'ativa'::"text",
    "cliente_nome" "text",
    "ordem" integer DEFAULT 0,
    "deleted_at" timestamp with time zone,
    "payload" "jsonb"
);


ALTER TABLE "public"."kanban_cards" OWNER TO "postgres";


COMMENT ON TABLE "public"."kanban_cards" IS 'Cards do Kanban (oportunidades, leads, etc)';



COMMENT ON COLUMN "public"."kanban_cards"."responsavel_id" IS 'Responsável pela oportunidade/card (referência a auth.users ou profiles)';



COMMENT ON COLUMN "public"."kanban_cards"."payload" IS 'Dados flexíveis: unidades[], comentários[], checklist[], deadline, etc';



CREATE TABLE IF NOT EXISTS "public"."kanban_colunas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "board_id" "uuid",
    "nome" "text" NOT NULL,
    "cor" "text" DEFAULT '#94a3b8'::"text",
    "pos" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."kanban_colunas" OWNER TO "postgres";


COMMENT ON TABLE "public"."kanban_colunas" IS 'Colunas dos quadros Kanban';



CREATE TABLE IF NOT EXISTS "public"."lancamentos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "titulo_id" "uuid",
    "valor" numeric(15,2) NOT NULL,
    "data" "date" NOT NULL,
    "tipo_pagamento" "text",
    "centro_custo_cliente_id" "uuid",
    "categoria_id" "uuid",
    "observacao" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lancamentos" OWNER TO "postgres";


COMMENT ON TABLE "public"."lancamentos" IS 'Lançamentos financeiros (parcelas, pagamentos)';



CREATE TABLE IF NOT EXISTS "public"."lancamentos_financeiros" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid",
    "cliente_id" "uuid",
    "tipo" "text" NOT NULL,
    "categoria" "text",
    "categoria_id" "uuid",
    "descricao" "text" NOT NULL,
    "valor" numeric(15,2) NOT NULL,
    "data_emissao" "date" DEFAULT CURRENT_DATE,
    "data_vencimento" "date" NOT NULL,
    "data_pagamento" "date",
    "status" "text" DEFAULT 'previsto'::"text",
    "forma_pagamento" "text",
    "conta_financeira_id" "uuid",
    "centro_custo_id" "uuid",
    "titulo_id" "uuid",
    "contrato_id" "uuid",
    "obra_id" "uuid",
    "observacoes" "text",
    "documento" "text",
    "anexos" "jsonb" DEFAULT '[]'::"jsonb",
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "lancamentos_financeiros_status_check" CHECK (("status" = ANY (ARRAY['previsto'::"text", 'aprovado'::"text", 'recebido'::"text", 'pago'::"text", 'cancelado'::"text", 'vencido'::"text"]))),
    CONSTRAINT "lancamentos_financeiros_tipo_check" CHECK (("tipo" = ANY (ARRAY['receber'::"text", 'pagar'::"text"])))
);


ALTER TABLE "public"."lancamentos_financeiros" OWNER TO "postgres";


COMMENT ON TABLE "public"."lancamentos_financeiros" IS 'Lançamentos financeiros detalhados (contas a pagar e receber)';



CREATE TABLE IF NOT EXISTS "public"."obras" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "codigo" "text" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "contrato_id" "uuid",
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "endereco" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "status" "text" DEFAULT 'planejamento'::"text",
    "data_inicio" "date",
    "data_fim_prevista" "date",
    "data_fim_real" "date",
    "responsavel_id" "uuid",
    "valor_orcado" numeric(15,2) DEFAULT 0,
    "valor_realizado" numeric(15,2) DEFAULT 0,
    "progresso" integer DEFAULT 0,
    "ativo" boolean DEFAULT true,
    "observacoes" "text",
    "anexos" "jsonb" DEFAULT '[]'::"jsonb",
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "obras_progresso_check" CHECK ((("progresso" >= 0) AND ("progresso" <= 100))),
    CONSTRAINT "obras_status_check" CHECK (("status" = ANY (ARRAY['planejamento'::"text", 'em_execucao'::"text", 'finalizada'::"text", 'atrasada'::"text"])))
);


ALTER TABLE "public"."obras" OWNER TO "postgres";


COMMENT ON TABLE "public"."obras" IS 'Gestão de obras e projetos em execução';



CREATE TABLE IF NOT EXISTS "public"."pipelines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "estagio" "text",
    "probabilidade" integer,
    "entity_id" "uuid",
    "valor" numeric(15,2),
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "pipelines_probabilidade_check" CHECK ((("probabilidade" >= 0) AND ("probabilidade" <= 100)))
);


ALTER TABLE "public"."pipelines" OWNER TO "postgres";


COMMENT ON TABLE "public"."pipelines" IS 'Histórico de pipelines de vendas';



CREATE TABLE IF NOT EXISTS "public"."plano_contas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "grupo" "text" NOT NULL,
    "conta" "text" NOT NULL,
    "codigo" "text",
    "tipo" "text",
    "descricao" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "empresa_id" "uuid",
    CONSTRAINT "plano_contas_grupo_check" CHECK (("grupo" = ANY (ARRAY['Receitas'::"text", 'Despesas'::"text"])))
);


ALTER TABLE "public"."plano_contas" OWNER TO "postgres";


COMMENT ON TABLE "public"."plano_contas" IS 'Plano de contas contábil';



COMMENT ON COLUMN "public"."plano_contas"."empresa_id" IS 'Empresa dona do plano de contas (NULL = compartilhado entre todas)';



CREATE TABLE IF NOT EXISTS "public"."pricelist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "produto_servico_id" "uuid",
    "nome" "text" NOT NULL,
    "descricao" "text",
    "preco" numeric(10,2) NOT NULL,
    "validade_inicio" "date",
    "validade_fim" "date",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pricelist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."produtos_servicos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text",
    "categoria" "text",
    "tipo" "text",
    "preco" numeric(15,2) DEFAULT 0,
    "unidade" "text" DEFAULT 'un'::"text",
    "codigo_interno" "text",
    "ativo" boolean DEFAULT true,
    "estoque_minimo" integer DEFAULT 0,
    "estoque_atual" integer DEFAULT 0,
    "imagem_url" "text",
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "produtos_servicos_tipo_check" CHECK (("tipo" = ANY (ARRAY['produto'::"text", 'servico'::"text", 'ambos'::"text"])))
);


ALTER TABLE "public"."produtos_servicos" OWNER TO "postgres";


COMMENT ON TABLE "public"."produtos_servicos" IS 'Catálogo de produtos e serviços oferecidos pela empresa';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text" NOT NULL,
    "avatar_url" "text",
    "telefone" "text",
    "cargo" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Perfis de usuários do sistema, estende auth.users do Supabase';



CREATE TABLE IF NOT EXISTS "public"."project_contracts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "empresa_id" "uuid" NOT NULL,
    "numero_contrato" character varying(100),
    "cliente_id" "uuid",
    "valor_total" numeric(15,2) NOT NULL,
    "valor_medido" numeric(15,2) DEFAULT 0,
    "valor_recebido" numeric(15,2) DEFAULT 0,
    "percentual_retencao" numeric(5,2) DEFAULT 0,
    "valor_retido" numeric(15,2) DEFAULT 0,
    "data_assinatura" "date",
    "data_inicio" "date",
    "data_termino_previsto" "date",
    "status" character varying(50) DEFAULT 'em_negociacao'::character varying,
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_contracts_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['em_negociacao'::character varying, 'assinado'::character varying, 'em_andamento'::character varying, 'concluido'::character varying, 'cancelado'::character varying])::"text"[])))
);


ALTER TABLE "public"."project_contracts" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_contracts" IS 'Contratos vinculados a projetos de cronograma';



CREATE TABLE IF NOT EXISTS "public"."project_measurements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contract_id" "uuid",
    "empresa_id" "uuid" NOT NULL,
    "numero_medicao" integer NOT NULL,
    "periodo_referencia" character varying(50),
    "valor_medido" numeric(15,2) NOT NULL,
    "percentual_execucao" numeric(5,2),
    "valor_retencao" numeric(15,2) DEFAULT 0,
    "valor_liquido" numeric(15,2) GENERATED ALWAYS AS (("valor_medido" - COALESCE("valor_retencao", (0)::numeric))) STORED,
    "status" character varying(50) DEFAULT 'em_elaboracao'::character varying,
    "data_medicao" "date" NOT NULL,
    "data_aprovacao" "date",
    "data_prevista_pagamento" "date",
    "data_pagamento_real" "date",
    "titulo_id" "uuid",
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "project_measurements_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['em_elaboracao'::character varying, 'enviada'::character varying, 'aprovada'::character varying, 'rejeitada'::character varying, 'paga'::character varying])::"text"[])))
);


ALTER TABLE "public"."project_measurements" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_measurements" IS 'Medições de avanço físico-financeiro de contratos';



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid",
    "empresa_id" "uuid" NOT NULL,
    "codigo" character varying(50) NOT NULL,
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "data_inicio" "date" NOT NULL,
    "data_fim_prevista" "date" NOT NULL,
    "data_fim_real" "date",
    "status" character varying(50) DEFAULT 'planejamento'::character varying,
    "progresso_percentual" numeric(5,2) DEFAULT 0,
    "orcamento_total" numeric(15,2),
    "custo_realizado" numeric(15,2) DEFAULT 0,
    "responsavel_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "projects_progresso_percentual_check" CHECK ((("progresso_percentual" >= (0)::numeric) AND ("progresso_percentual" <= (100)::numeric))),
    CONSTRAINT "projects_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planejamento'::character varying, 'em_andamento'::character varying, 'pausado'::character varying, 'concluido'::character varying, 'cancelado'::character varying])::"text"[])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


COMMENT ON TABLE "public"."projects" IS 'Projetos de cronograma vinculados a obras';



CREATE TABLE IF NOT EXISTS "public"."propostas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "numero" "text" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "valor_total" numeric(15,2) DEFAULT 0 NOT NULL,
    "validade_dias" integer DEFAULT 30,
    "data_emissao" "date" DEFAULT CURRENT_DATE,
    "data_validade" "date",
    "status" "text" DEFAULT 'pendente'::"text",
    "tipo" "text",
    "responsavel_id" "uuid",
    "observacoes" "text",
    "itens" "jsonb" DEFAULT '[]'::"jsonb",
    "anexos" "jsonb" DEFAULT '[]'::"jsonb",
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "propostas_status_check" CHECK (("status" = ANY (ARRAY['rascunho'::"text", 'pendente'::"text", 'enviada'::"text", 'aprovada'::"text", 'rejeitada'::"text", 'cancelada'::"text"]))),
    CONSTRAINT "propostas_tipo_check" CHECK (("tipo" = ANY (ARRAY['arquitetura'::"text", 'marcenaria'::"text", 'engenharia'::"text", 'consultoria'::"text", 'outros'::"text"])))
);


ALTER TABLE "public"."propostas" OWNER TO "postgres";


COMMENT ON TABLE "public"."propostas" IS 'Propostas comerciais enviadas para clientes';



CREATE TABLE IF NOT EXISTS "public"."registro_categorias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text",
    "cor" "text" DEFAULT '#3b82f6'::"text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."registro_categorias" OWNER TO "postgres";


COMMENT ON TABLE "public"."registro_categorias" IS 'Categorias para classificação de registros de trabalho';



CREATE TABLE IF NOT EXISTS "public"."registros_trabalho" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profissional_id" "uuid" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "proposta_id" "uuid",
    "obra_id" "uuid",
    "contrato_id" "uuid",
    "data" "date" DEFAULT CURRENT_DATE NOT NULL,
    "categoria_id" "uuid" NOT NULL,
    "descricao" "text" NOT NULL,
    "quantidade" numeric(10,2) DEFAULT 1,
    "unidade" "text" DEFAULT 'un'::"text",
    "valor_unitario" numeric(15,2) DEFAULT 0,
    "valor_total" numeric(15,2) GENERATED ALWAYS AS (("quantidade" * "valor_unitario")) STORED,
    "anexos" "jsonb" DEFAULT '[]'::"jsonb",
    "aprovado" boolean DEFAULT false,
    "aprovado_por" "uuid",
    "aprovado_em" timestamp with time zone,
    "gerar_lancamento" boolean DEFAULT false,
    "lancamento_id" "uuid",
    "observacoes" "text",
    "dados" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."registros_trabalho" OWNER TO "postgres";


COMMENT ON TABLE "public"."registros_trabalho" IS 'Registros diários de trabalho dos profissionais (horas, serviços, materiais)';



CREATE TABLE IF NOT EXISTS "public"."task_dependencies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "predecessor_id" "uuid",
    "successor_id" "uuid",
    "tipo" character varying(50) DEFAULT 'FS'::character varying,
    "lag_dias" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "no_self_dependency" CHECK (("predecessor_id" <> "successor_id")),
    CONSTRAINT "task_dependencies_tipo_check" CHECK ((("tipo")::"text" = ANY ((ARRAY['FS'::character varying, 'SS'::character varying, 'FF'::character varying, 'SF'::character varying])::"text"[])))
);


ALTER TABLE "public"."task_dependencies" OWNER TO "postgres";


COMMENT ON TABLE "public"."task_dependencies" IS 'Dependências entre tarefas (FS, SS, FF, SF)';



CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "empresa_id" "uuid" NOT NULL,
    "codigo" character varying(50),
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "parent_task_id" "uuid",
    "ordem" integer DEFAULT 0,
    "nivel" integer DEFAULT 1,
    "data_inicio_prevista" "date" NOT NULL,
    "data_fim_prevista" "date" NOT NULL,
    "data_inicio_real" "date",
    "data_fim_real" "date",
    "duracao_dias" integer NOT NULL,
    "duracao_real_dias" integer,
    "status" character varying(50) DEFAULT 'nao_iniciada'::character varying,
    "progresso_percentual" numeric(5,2) DEFAULT 0,
    "tipo" character varying(50) DEFAULT 'tarefa'::character varying,
    "eh_caminho_critico" boolean DEFAULT false,
    "folga_dias" integer DEFAULT 0,
    "responsavel_id" "uuid",
    "equipe_id" "uuid",
    "custo_previsto" numeric(15,2),
    "custo_realizado" numeric(15,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "tasks_progresso_percentual_check" CHECK ((("progresso_percentual" >= (0)::numeric) AND ("progresso_percentual" <= (100)::numeric))),
    CONSTRAINT "tasks_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['nao_iniciada'::character varying, 'em_andamento'::character varying, 'pausada'::character varying, 'concluida'::character varying, 'cancelada'::character varying])::"text"[]))),
    CONSTRAINT "tasks_tipo_check" CHECK ((("tipo")::"text" = ANY ((ARRAY['tarefa'::character varying, 'marco'::character varying, 'fase'::character varying])::"text"[])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


COMMENT ON TABLE "public"."tasks" IS 'Tarefas do cronograma com suporte a WBS e dependências';



CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "user_id" "uuid",
    "papel" character varying(100),
    "ativo" boolean DEFAULT true,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text",
    "lider_id" "uuid",
    "ativa" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."titulos_financeiros" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid",
    "tipo" "text" NOT NULL,
    "descricao" "text" NOT NULL,
    "valor" numeric(15,2) NOT NULL,
    "data_emissao" "date" NOT NULL,
    "data_vencimento" "date" NOT NULL,
    "status" "text",
    "categoria_id" "uuid",
    "centro_custo_id" "uuid",
    "conta_financeira_id" "uuid",
    "observacao" "text",
    "documento" "text",
    "fornecedor_cliente" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "titulos_financeiros_status_check" CHECK (("status" = ANY (ARRAY['Previsto'::"text", 'Aprovado'::"text", 'Pago'::"text", 'Cancelado'::"text", 'Vencido'::"text"]))),
    CONSTRAINT "titulos_financeiros_tipo_check" CHECK (("tipo" = ANY (ARRAY['Pagar'::"text", 'Receber'::"text"])))
);


ALTER TABLE "public"."titulos_financeiros" OWNER TO "postgres";


COMMENT ON TABLE "public"."titulos_financeiros" IS 'Títulos a pagar e a receber';



CREATE TABLE IF NOT EXISTS "public"."usuarios_perfis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "perfil" "text" NOT NULL,
    "permissoes" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "usuarios_perfis_perfil_check" CHECK (("perfil" = ANY (ARRAY['admin'::"text", 'gestor'::"text", 'vendedor'::"text", 'arquiteto'::"text", 'financeiro'::"text", 'readonly'::"text"])))
);


ALTER TABLE "public"."usuarios_perfis" OWNER TO "postgres";


COMMENT ON TABLE "public"."usuarios_perfis" IS 'Perfis e permissões dos usuários';



CREATE OR REPLACE VIEW "public"."v_clientes_ativos_contratos" WITH ("security_invoker"='on') AS
 SELECT "e"."id" AS "cliente_id",
    "e"."nome" AS "nome_razao_social",
    "e"."email",
    "e"."telefone",
    "e"."cidade",
    "e"."estado",
    "count"(DISTINCT "c"."id") AS "total_contratos",
    "count"(DISTINCT
        CASE
            WHEN ("c"."status" = 'ativo'::"text") THEN "c"."id"
            ELSE NULL::"uuid"
        END) AS "contratos_ativos",
    COALESCE("sum"("c"."valor_total"), (0)::numeric) AS "valor_total_contratos",
    COALESCE("sum"(
        CASE
            WHEN ("c"."status" = 'ativo'::"text") THEN "c"."valor_total"
            ELSE (0)::numeric
        END), (0)::numeric) AS "valor_contratos_ativos",
    "max"("c"."created_at") AS "ultimo_contrato_data"
   FROM ("public"."entities" "e"
     LEFT JOIN "public"."contratos" "c" ON (("c"."cliente_id" = "e"."id")))
  WHERE (("e"."tipo" = 'cliente'::"text") AND ("e"."ativo" = true))
  GROUP BY "e"."id", "e"."nome", "e"."email", "e"."telefone", "e"."cidade", "e"."estado"
  ORDER BY COALESCE("sum"("c"."valor_total"), (0)::numeric) DESC;


ALTER VIEW "public"."v_clientes_ativos_contratos" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_clientes_ativos_contratos" IS 'Clientes ativos com estatísticas de contratos';



CREATE OR REPLACE VIEW "public"."v_despesas_mes_categoria" WITH ("security_invoker"='on') AS
 SELECT "date_trunc"('month'::"text", ("data_vencimento")::timestamp with time zone) AS "mes",
    COALESCE("categoria", 'Sem Categoria'::"text") AS "categoria",
    "count"(*) AS "quantidade",
    "sum"("valor") AS "total",
    "avg"("valor") AS "media",
    "status"
   FROM "public"."lancamentos_financeiros"
  WHERE ("tipo" = 'pagar'::"text")
  GROUP BY ("date_trunc"('month'::"text", ("data_vencimento")::timestamp with time zone)), "categoria", "status"
  ORDER BY ("date_trunc"('month'::"text", ("data_vencimento")::timestamp with time zone)) DESC, ("sum"("valor")) DESC;


ALTER VIEW "public"."v_despesas_mes_categoria" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_despesas_mes_categoria" IS 'Despesas agrupadas por mês e categoria';



CREATE OR REPLACE VIEW "public"."v_fluxo_caixa" WITH ("security_invoker"='on') AS
 SELECT "data_vencimento" AS "data",
    "sum"(
        CASE
            WHEN ("tipo" = 'receber'::"text") THEN "valor"
            ELSE (0)::numeric
        END) AS "total_receber",
    "sum"(
        CASE
            WHEN ("tipo" = 'pagar'::"text") THEN "valor"
            ELSE (0)::numeric
        END) AS "total_pagar",
    "sum"(
        CASE
            WHEN ("tipo" = 'receber'::"text") THEN "valor"
            ELSE (- "valor")
        END) AS "saldo_dia",
    "status",
    "count"(*) AS "quantidade_lancamentos"
   FROM "public"."lancamentos_financeiros"
  WHERE ("status" <> 'cancelado'::"text")
  GROUP BY "data_vencimento", "status"
  ORDER BY "data_vencimento";


ALTER VIEW "public"."v_fluxo_caixa" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_fluxo_caixa" IS 'Fluxo de caixa diário (entradas vs saídas)';



CREATE OR REPLACE VIEW "public"."v_kanban_cards" AS
 SELECT "kc"."id",
    "kc"."coluna_id",
    "kc"."nome" AS "titulo",
    "kc"."descricao",
    "kc"."valor_previsto" AS "valor",
    "kc"."ordem",
    "kc"."posicao",
    "kc"."responsavel_id",
    "kc"."entity_id",
    "kc"."payload",
    "kc"."servicos_contratados",
    "kc"."vendedor",
    "kc"."indicador",
    "kc"."responsavel_avatar",
    "kc"."fase",
    "kc"."created_at",
    "kc"."updated_at",
    "kc"."deleted_at",
    "kc"."cliente_nome",
    "kcol"."nome" AS "coluna_nome",
    "kcol"."pos" AS "coluna_pos",
    "kcol"."cor" AS "coluna_cor",
    "kcol"."board_id",
    "kb"."titulo" AS "board_titulo",
    "kb"."ambiente" AS "board_ambiente",
    "kb"."modulo" AS "board_modulo",
    "e"."id" AS "entity_id_full",
    "e"."nome" AS "entity_nome",
    "e"."tipo" AS "entity_tipo",
    "e"."email" AS "entity_email",
    "e"."telefone" AS "entity_telefone",
    "e"."cpf_cnpj" AS "entity_cpf_cnpj",
    "e"."cidade" AS "entity_cidade",
    "e"."estado" AS "entity_estado",
    "u"."email" AS "responsavel_email",
    ("u"."raw_user_meta_data" ->> 'name'::"text") AS "responsavel_nome"
   FROM (((("public"."kanban_cards" "kc"
     LEFT JOIN "public"."kanban_colunas" "kcol" ON (("kc"."coluna_id" = "kcol"."id")))
     LEFT JOIN "public"."kanban_boards" "kb" ON (("kcol"."board_id" = "kb"."id")))
     LEFT JOIN "public"."entities" "e" ON (("kc"."entity_id" = "e"."id")))
     LEFT JOIN "auth"."users" "u" ON (("kc"."responsavel_id" = "u"."id")))
  WHERE ("kc"."deleted_at" IS NULL);


ALTER VIEW "public"."v_kanban_cards" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_kanban_cards" IS 'View consolidada de cards do kanban com joins de colunas, boards, entities e responsáveis. Filtra apenas cards não deletados.';



CREATE OR REPLACE VIEW "public"."v_kanban_cards_board" WITH ("security_invoker"='on') AS
 SELECT "k"."id",
    "k"."nome" AS "titulo",
    "k"."descricao",
    "k"."valor_previsto" AS "valor",
    "k"."posicao",
    "k"."dados" AS "payload",
    "k"."created_at",
    "k"."updated_at",
    "kb"."ambiente" AS "modulo",
    "kb"."titulo" AS "board_titulo",
    "k"."coluna_id",
    "kc"."nome" AS "status",
    "kc"."cor" AS "status_cor",
    "kc"."pos" AS "status_posicao",
    "p"."id" AS "responsavel_id",
    "p"."nome" AS "responsavel_nome",
    "e"."id" AS "entity_id",
    "e"."tipo" AS "entity_tipo",
    "e"."nome" AS "entity_nome"
   FROM (((("public"."kanban_cards" "k"
     JOIN "public"."kanban_colunas" "kc" ON (("k"."coluna_id" = "kc"."id")))
     JOIN "public"."kanban_boards" "kb" ON (("kb"."id" = "kc"."board_id")))
     LEFT JOIN "public"."profiles" "p" ON (("k"."responsavel_id" = "p"."id")))
     LEFT JOIN "public"."entities" "e" ON (("k"."entity_id" = "e"."id")))
  ORDER BY "kb"."ambiente", "kc"."pos", "k"."posicao";


ALTER VIEW "public"."v_kanban_cards_board" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_kanban_cards_board" IS 'Cards do kanban com informações completas do board';



CREATE OR REPLACE VIEW "public"."v_obras_status" WITH ("security_invoker"='on') AS
 SELECT "status",
    "count"(*) AS "total"
   FROM "public"."obras"
  WHERE ("ativo" = true)
  GROUP BY "status";


ALTER VIEW "public"."v_obras_status" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_registros_trabalho" WITH ("security_invoker"='on') AS
 SELECT "rt"."id",
    "rt"."data",
    "rt"."descricao",
    "rt"."quantidade",
    "rt"."unidade",
    "rt"."valor_unitario",
    "rt"."valor_total",
    "rt"."aprovado",
    "rt"."aprovado_em",
    "rt"."gerar_lancamento",
    "rt"."observacoes",
    "rt"."created_at",
    "ep"."id" AS "profissional_id",
    "ep"."nome" AS "profissional_nome",
    "ep"."email" AS "profissional_email",
    "ec"."id" AS "cliente_id",
    "ec"."nome" AS "cliente_nome",
    "ec"."email" AS "cliente_email",
    "rc"."id" AS "categoria_id",
    "rc"."nome" AS "categoria_nome",
    "rc"."cor" AS "categoria_cor",
    "ap"."id" AS "aprovador_id",
    "ap"."nome" AS "aprovador_nome",
    "o"."id" AS "obra_id",
    "o"."titulo" AS "obra_titulo",
    "o"."codigo" AS "obra_codigo",
    "pr"."id" AS "proposta_id",
    "pr"."numero" AS "proposta_numero",
    "ct"."id" AS "contrato_id",
    "ct"."numero" AS "contrato_numero",
    "lf"."id" AS "lancamento_id",
    "lf"."status" AS "lancamento_status"
   FROM (((((((("public"."registros_trabalho" "rt"
     JOIN "public"."profiles" "ep" ON (("ep"."id" = "rt"."profissional_id")))
     JOIN "public"."entities" "ec" ON (("ec"."id" = "rt"."cliente_id")))
     JOIN "public"."registro_categorias" "rc" ON (("rc"."id" = "rt"."categoria_id")))
     LEFT JOIN "public"."profiles" "ap" ON (("ap"."id" = "rt"."aprovado_por")))
     LEFT JOIN "public"."obras" "o" ON (("o"."id" = "rt"."obra_id")))
     LEFT JOIN "public"."propostas" "pr" ON (("pr"."id" = "rt"."proposta_id")))
     LEFT JOIN "public"."contratos" "ct" ON (("ct"."id" = "rt"."contrato_id")))
     LEFT JOIN "public"."lancamentos_financeiros" "lf" ON (("lf"."id" = "rt"."lancamento_id")))
  ORDER BY "rt"."data" DESC, "rt"."created_at" DESC;


ALTER VIEW "public"."v_registros_trabalho" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_top10_clientes_receita" WITH ("security_invoker"='on') AS
 SELECT "e"."id" AS "cliente_id",
    "e"."nome" AS "nome_razao_social",
    "e"."email",
    "e"."telefone",
    "e"."cidade",
    "count"(DISTINCT "lf"."id") AS "total_lancamentos",
    "sum"(
        CASE
            WHEN ("lf"."status" = ANY (ARRAY['recebido'::"text", 'pago'::"text"])) THEN "lf"."valor"
            ELSE (0)::numeric
        END) AS "receita_realizada",
    "sum"(
        CASE
            WHEN ("lf"."status" = ANY (ARRAY['previsto'::"text", 'aprovado'::"text"])) THEN "lf"."valor"
            ELSE (0)::numeric
        END) AS "receita_prevista",
    "sum"("lf"."valor") AS "receita_total",
    "max"("lf"."data_pagamento") AS "ultima_receita_data"
   FROM ("public"."entities" "e"
     JOIN "public"."lancamentos_financeiros" "lf" ON (("lf"."cliente_id" = "e"."id")))
  WHERE (("e"."tipo" = 'cliente'::"text") AND ("lf"."tipo" = 'receber'::"text"))
  GROUP BY "e"."id", "e"."nome", "e"."email", "e"."telefone", "e"."cidade"
  ORDER BY ("sum"(
        CASE
            WHEN ("lf"."status" = ANY (ARRAY['recebido'::"text", 'pago'::"text"])) THEN "lf"."valor"
            ELSE (0)::numeric
        END)) DESC
 LIMIT 10;


ALTER VIEW "public"."v_top10_clientes_receita" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_top10_clientes_receita" IS 'Top 10 clientes por receita realizada';



CREATE OR REPLACE VIEW "public"."vw_oportunidades_completas" WITH ("security_invoker"='on') AS
 SELECT "kc"."id",
    "kc"."nome" AS "titulo",
    "kc"."descricao",
    "kc"."valor_previsto" AS "valor",
    "kc"."posicao",
    "kc"."dados",
    "kc"."created_at",
    "kc"."updated_at",
    "col"."id" AS "coluna_id",
    "col"."nome" AS "coluna_titulo",
    "col"."cor" AS "coluna_cor",
    "col"."pos" AS "coluna_posicao",
    "kb"."id" AS "board_id",
    "kb"."ambiente" AS "board_ambiente",
    "kb"."titulo" AS "board_titulo",
    "p"."id" AS "responsavel_id",
    "p"."nome" AS "responsavel_nome",
    "p"."email" AS "responsavel_email",
    "e"."id" AS "entity_id",
    "e"."tipo" AS "entity_tipo",
    "e"."nome" AS "entity_nome",
    "e"."email" AS "entity_email",
    "e"."telefone" AS "entity_telefone",
    "e"."dados" AS "entity_dados"
   FROM (((("public"."kanban_cards" "kc"
     JOIN "public"."kanban_colunas" "col" ON (("kc"."coluna_id" = "col"."id")))
     JOIN "public"."kanban_boards" "kb" ON (("col"."board_id" = "kb"."id")))
     LEFT JOIN "public"."profiles" "p" ON (("kc"."responsavel_id" = "p"."id")))
     LEFT JOIN "public"."entities" "e" ON (("kc"."entity_id" = "e"."id")))
  WHERE ("kb"."ambiente" = 'oportunidades'::"text")
  ORDER BY "col"."pos", "kc"."posicao";


ALTER VIEW "public"."vw_oportunidades_completas" OWNER TO "postgres";


COMMENT ON VIEW "public"."vw_oportunidades_completas" IS 'Oportunidades com todos os dados relacionados (joins)';



CREATE OR REPLACE VIEW "public"."vw_pipeline_oportunidades" WITH ("security_invoker"='on') AS
 SELECT "kc"."id" AS "coluna_id",
    "kc"."nome" AS "etapa",
    "kc"."cor" AS "cor_etapa",
    "kc"."pos" AS "posicao",
    "kb"."ambiente" AS "modulo",
    "count"("k"."id") AS "qtde_cards",
    COALESCE("sum"("k"."valor_previsto"), (0)::numeric) AS "valor_total",
    COALESCE("avg"("k"."valor_previsto"), (0)::numeric) AS "valor_medio",
    "count"(
        CASE
            WHEN ("k"."created_at" >= (CURRENT_DATE - '7 days'::interval)) THEN 1
            ELSE NULL::integer
        END) AS "novos_ultimos_7_dias"
   FROM (("public"."kanban_colunas" "kc"
     JOIN "public"."kanban_boards" "kb" ON (("kb"."id" = "kc"."board_id")))
     LEFT JOIN "public"."kanban_cards" "k" ON (("k"."coluna_id" = "kc"."id")))
  WHERE ("kb"."ambiente" = 'oportunidades'::"text")
  GROUP BY "kc"."id", "kc"."nome", "kc"."cor", "kc"."pos", "kb"."ambiente"
  ORDER BY "kc"."pos";


ALTER VIEW "public"."vw_pipeline_oportunidades" OWNER TO "postgres";


COMMENT ON VIEW "public"."vw_pipeline_oportunidades" IS 'Pipeline de oportunidades com estatísticas por etapa';



CREATE OR REPLACE VIEW "public"."vw_titulos_resumo" WITH ("security_invoker"='on') AS
 SELECT "e"."id" AS "empresa_id",
    "e"."razao_social" AS "empresa",
    COALESCE("sum"(
        CASE
            WHEN (("t"."tipo" = 'Receber'::"text") AND ("t"."status" = 'Pago'::"text")) THEN "t"."valor"
            ELSE (0)::numeric
        END), (0)::numeric) AS "total_receitas",
    COALESCE("sum"(
        CASE
            WHEN (("t"."tipo" = 'Pagar'::"text") AND ("t"."status" = 'Pago'::"text")) THEN "t"."valor"
            ELSE (0)::numeric
        END), (0)::numeric) AS "total_despesas",
    COALESCE("sum"(
        CASE
            WHEN (("t"."tipo" = 'Receber'::"text") AND ("t"."status" = ANY (ARRAY['Previsto'::"text", 'Aprovado'::"text"]))) THEN "t"."valor"
            ELSE (0)::numeric
        END), (0)::numeric) AS "a_receber",
    COALESCE("sum"(
        CASE
            WHEN (("t"."tipo" = 'Pagar'::"text") AND ("t"."status" = ANY (ARRAY['Previsto'::"text", 'Aprovado'::"text"]))) THEN "t"."valor"
            ELSE (0)::numeric
        END), (0)::numeric) AS "a_pagar",
    COALESCE("sum"(
        CASE
            WHEN (("t"."tipo" = 'Receber'::"text") AND ("t"."status" = 'Pago'::"text")) THEN "t"."valor"
            WHEN (("t"."tipo" = 'Pagar'::"text") AND ("t"."status" = 'Pago'::"text")) THEN (- "t"."valor")
            ELSE (0)::numeric
        END), (0)::numeric) AS "saldo",
    "count"(
        CASE
            WHEN (("t"."status" = ANY (ARRAY['Previsto'::"text", 'Aprovado'::"text"])) AND ("t"."data_vencimento" < CURRENT_DATE)) THEN 1
            ELSE NULL::integer
        END) AS "titulos_vencidos"
   FROM ("public"."empresas" "e"
     LEFT JOIN "public"."titulos_financeiros" "t" ON (("t"."empresa_id" = "e"."id")))
  WHERE ("e"."ativo" = true)
  GROUP BY "e"."id", "e"."razao_social";


ALTER VIEW "public"."vw_titulos_resumo" OWNER TO "postgres";


COMMENT ON VIEW "public"."vw_titulos_resumo" IS 'Resumo financeiro consolidado por empresa';



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."assistencias"
    ADD CONSTRAINT "assistencias_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."assistencias"
    ADD CONSTRAINT "assistencias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bancos"
    ADD CONSTRAINT "bancos_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."bancos"
    ADD CONSTRAINT "bancos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categorias_financeiras"
    ADD CONSTRAINT "categorias_financeiras_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."centros_custo"
    ADD CONSTRAINT "centros_custo_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."centros_custo"
    ADD CONSTRAINT "centros_custo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compras"
    ADD CONSTRAINT "compras_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contas_bancarias"
    ADD CONSTRAINT "contas_bancarias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contas_financeiras"
    ADD CONSTRAINT "contas_financeiras_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_numero_key" UNIQUE ("numero");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_cnpj_key" UNIQUE ("cnpj");



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."especificador_comissao_niveis"
    ADD CONSTRAINT "especificador_comissao_niveis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."especificadores"
    ADD CONSTRAINT "especificadores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feriados"
    ADD CONSTRAINT "feriados_data_key" UNIQUE ("data");



ALTER TABLE ONLY "public"."feriados"
    ADD CONSTRAINT "feriados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kanban_boards"
    ADD CONSTRAINT "kanban_boards_ambiente_key" UNIQUE ("ambiente");



ALTER TABLE ONLY "public"."kanban_boards"
    ADD CONSTRAINT "kanban_boards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kanban_cards"
    ADD CONSTRAINT "kanban_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kanban_colunas"
    ADD CONSTRAINT "kanban_colunas_board_id_posicao_key" UNIQUE ("board_id", "pos");



ALTER TABLE ONLY "public"."kanban_colunas"
    ADD CONSTRAINT "kanban_colunas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lancamentos"
    ADD CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pipelines"
    ADD CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plano_contas"
    ADD CONSTRAINT "plano_contas_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."plano_contas"
    ADD CONSTRAINT "plano_contas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricelist"
    ADD CONSTRAINT "pricelist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."produtos_servicos"
    ADD CONSTRAINT "produtos_servicos_codigo_interno_key" UNIQUE ("codigo_interno");



ALTER TABLE ONLY "public"."produtos_servicos"
    ADD CONSTRAINT "produtos_servicos_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."produtos_servicos"
    ADD CONSTRAINT "produtos_servicos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_contracts"
    ADD CONSTRAINT "project_contracts_numero_contrato_key" UNIQUE ("numero_contrato");



ALTER TABLE ONLY "public"."project_contracts"
    ADD CONSTRAINT "project_contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_measurements"
    ADD CONSTRAINT "project_measurements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."propostas"
    ADD CONSTRAINT "propostas_numero_key" UNIQUE ("numero");



ALTER TABLE ONLY "public"."propostas"
    ADD CONSTRAINT "propostas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."registro_categorias"
    ADD CONSTRAINT "registro_categorias_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."registro_categorias"
    ADD CONSTRAINT "registro_categorias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_predecessor_id_successor_id_key" UNIQUE ("predecessor_id", "successor_id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."titulos_financeiros"
    ADD CONSTRAINT "titulos_financeiros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios_perfis"
    ADD CONSTRAINT "usuarios_perfis_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_assistencias_cliente" ON "public"."assistencias" USING "btree" ("cliente_id");



CREATE INDEX "idx_assistencias_codigo" ON "public"."assistencias" USING "btree" ("codigo");



CREATE INDEX "idx_assistencias_data" ON "public"."assistencias" USING "btree" ("data_solicitacao");



CREATE INDEX "idx_assistencias_responsavel" ON "public"."assistencias" USING "btree" ("responsavel_id");



CREATE INDEX "idx_assistencias_status" ON "public"."assistencias" USING "btree" ("status");



CREATE INDEX "idx_categorias_financeiras_empresa" ON "public"."categorias_financeiras" USING "btree" ("empresa_id");



CREATE INDEX "idx_centros_custo_ativo" ON "public"."centros_custo" USING "btree" ("ativo");



CREATE INDEX "idx_centros_custo_empresa" ON "public"."centros_custo" USING "btree" ("empresa_id");



CREATE INDEX "idx_contas_bancarias_empresa" ON "public"."contas_bancarias" USING "btree" ("empresa_id");



CREATE INDEX "idx_contas_financeiras_empresa" ON "public"."contas_financeiras" USING "btree" ("empresa_id");



CREATE INDEX "idx_contratos_cliente" ON "public"."contratos" USING "btree" ("cliente_id");



CREATE INDEX "idx_contratos_dados" ON "public"."contratos" USING "gin" ("dados");



CREATE INDEX "idx_contratos_numero" ON "public"."contratos" USING "btree" ("numero");



CREATE INDEX "idx_contratos_proposta" ON "public"."contratos" USING "btree" ("proposta_id");



CREATE INDEX "idx_contratos_responsavel" ON "public"."contratos" USING "btree" ("responsavel_id");



CREATE INDEX "idx_contratos_status" ON "public"."contratos" USING "btree" ("status");



CREATE INDEX "idx_empresas_ativo" ON "public"."empresas" USING "btree" ("ativo");



CREATE INDEX "idx_empresas_cnpj" ON "public"."empresas" USING "btree" ("cnpj");



CREATE INDEX "idx_entities_ativo" ON "public"."entities" USING "btree" ("ativo");



CREATE INDEX "idx_entities_cpf_cnpj" ON "public"."entities" USING "btree" ("cpf_cnpj");



CREATE INDEX "idx_entities_dados" ON "public"."entities" USING "gin" ("dados");



CREATE INDEX "idx_entities_email" ON "public"."entities" USING "btree" ("email");



CREATE INDEX "idx_entities_nome_fantasia" ON "public"."entities" USING "btree" ("nome_fantasia") WHERE ("nome_fantasia" IS NOT NULL);



CREATE INDEX "idx_entities_tipo" ON "public"."entities" USING "btree" ("tipo");



CREATE INDEX "idx_entities_tipo_pessoa" ON "public"."entities" USING "btree" ("tipo_pessoa");



CREATE INDEX "idx_kanban_boards_ambiente" ON "public"."kanban_boards" USING "btree" ("ambiente");



CREATE INDEX "idx_kanban_cards_coluna" ON "public"."kanban_cards" USING "btree" ("coluna_id");



CREATE INDEX "idx_kanban_cards_coluna_ordem" ON "public"."kanban_cards" USING "btree" ("coluna_id", "ordem") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_kanban_cards_dados" ON "public"."kanban_cards" USING "gin" ("dados");



CREATE INDEX "idx_kanban_cards_deleted" ON "public"."kanban_cards" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_kanban_cards_deleted_at" ON "public"."kanban_cards" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_kanban_cards_entity" ON "public"."kanban_cards" USING "btree" ("entity_id");



CREATE INDEX "idx_kanban_cards_payload" ON "public"."kanban_cards" USING "gin" ("payload");



CREATE INDEX "idx_kanban_cards_responsavel" ON "public"."kanban_cards" USING "btree" ("responsavel_id");



CREATE INDEX "idx_kanban_colunas_board" ON "public"."kanban_colunas" USING "btree" ("board_id");



CREATE INDEX "idx_kanban_colunas_posicao" ON "public"."kanban_colunas" USING "btree" ("pos");



CREATE INDEX "idx_lancamentos_data" ON "public"."lancamentos" USING "btree" ("data");



CREATE INDEX "idx_lancamentos_financeiros_categoria" ON "public"."lancamentos_financeiros" USING "btree" ("categoria");



CREATE INDEX "idx_lancamentos_financeiros_cliente" ON "public"."lancamentos_financeiros" USING "btree" ("cliente_id");



CREATE INDEX "idx_lancamentos_financeiros_contrato" ON "public"."lancamentos_financeiros" USING "btree" ("contrato_id");



CREATE INDEX "idx_lancamentos_financeiros_emissao" ON "public"."lancamentos_financeiros" USING "btree" ("data_emissao");



CREATE INDEX "idx_lancamentos_financeiros_empresa" ON "public"."lancamentos_financeiros" USING "btree" ("empresa_id");



CREATE INDEX "idx_lancamentos_financeiros_obra" ON "public"."lancamentos_financeiros" USING "btree" ("obra_id");



CREATE INDEX "idx_lancamentos_financeiros_status" ON "public"."lancamentos_financeiros" USING "btree" ("status");



CREATE INDEX "idx_lancamentos_financeiros_tipo" ON "public"."lancamentos_financeiros" USING "btree" ("tipo");



CREATE INDEX "idx_lancamentos_financeiros_vencimento" ON "public"."lancamentos_financeiros" USING "btree" ("data_vencimento");



CREATE INDEX "idx_lancamentos_titulo" ON "public"."lancamentos" USING "btree" ("titulo_id");



CREATE INDEX "idx_obras_ativo" ON "public"."obras" USING "btree" ("ativo");



CREATE INDEX "idx_obras_cliente" ON "public"."obras" USING "btree" ("cliente_id");



CREATE INDEX "idx_obras_codigo" ON "public"."obras" USING "btree" ("codigo");



CREATE INDEX "idx_obras_contrato" ON "public"."obras" USING "btree" ("contrato_id");



CREATE INDEX "idx_obras_dados" ON "public"."obras" USING "gin" ("dados");



CREATE INDEX "idx_obras_responsavel" ON "public"."obras" USING "btree" ("responsavel_id");



CREATE INDEX "idx_obras_status" ON "public"."obras" USING "btree" ("status");



CREATE INDEX "idx_pipelines_entity" ON "public"."pipelines" USING "btree" ("entity_id");



CREATE INDEX "idx_pipelines_estagio" ON "public"."pipelines" USING "btree" ("estagio");



CREATE INDEX "idx_plano_contas_ativo" ON "public"."plano_contas" USING "btree" ("ativo");



CREATE INDEX "idx_plano_contas_empresa" ON "public"."plano_contas" USING "btree" ("empresa_id");



CREATE INDEX "idx_plano_contas_grupo" ON "public"."plano_contas" USING "btree" ("grupo");



CREATE INDEX "idx_produtos_servicos_ativo" ON "public"."produtos_servicos" USING "btree" ("ativo");



CREATE INDEX "idx_produtos_servicos_categoria" ON "public"."produtos_servicos" USING "btree" ("categoria");



CREATE INDEX "idx_produtos_servicos_codigo" ON "public"."produtos_servicos" USING "btree" ("codigo_interno");



CREATE INDEX "idx_produtos_servicos_nome" ON "public"."produtos_servicos" USING "btree" ("nome");



CREATE INDEX "idx_produtos_servicos_tipo" ON "public"."produtos_servicos" USING "btree" ("tipo");



CREATE INDEX "idx_profiles_ativo" ON "public"."profiles" USING "btree" ("ativo");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_project_contracts_cliente" ON "public"."project_contracts" USING "btree" ("cliente_id");



CREATE INDEX "idx_project_contracts_empresa" ON "public"."project_contracts" USING "btree" ("empresa_id");



CREATE INDEX "idx_project_contracts_project" ON "public"."project_contracts" USING "btree" ("project_id");



CREATE INDEX "idx_project_contracts_status" ON "public"."project_contracts" USING "btree" ("status");



CREATE INDEX "idx_project_measurements_contract" ON "public"."project_measurements" USING "btree" ("contract_id");



CREATE INDEX "idx_project_measurements_empresa" ON "public"."project_measurements" USING "btree" ("empresa_id");



CREATE INDEX "idx_project_measurements_status" ON "public"."project_measurements" USING "btree" ("status");



CREATE INDEX "idx_projects_empresa_id" ON "public"."projects" USING "btree" ("empresa_id");



CREATE INDEX "idx_projects_obra_id" ON "public"."projects" USING "btree" ("obra_id");



CREATE INDEX "idx_projects_responsavel" ON "public"."projects" USING "btree" ("responsavel_id");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_propostas_cliente" ON "public"."propostas" USING "btree" ("cliente_id");



CREATE INDEX "idx_propostas_dados" ON "public"."propostas" USING "gin" ("dados");



CREATE INDEX "idx_propostas_data_emissao" ON "public"."propostas" USING "btree" ("data_emissao");



CREATE INDEX "idx_propostas_itens" ON "public"."propostas" USING "gin" ("itens");



CREATE INDEX "idx_propostas_numero" ON "public"."propostas" USING "btree" ("numero");



CREATE INDEX "idx_propostas_responsavel" ON "public"."propostas" USING "btree" ("responsavel_id");



CREATE INDEX "idx_propostas_status" ON "public"."propostas" USING "btree" ("status");



CREATE INDEX "idx_registro_categorias_ativo" ON "public"."registro_categorias" USING "btree" ("ativo");



CREATE INDEX "idx_registro_categorias_nome" ON "public"."registro_categorias" USING "btree" ("nome");



CREATE INDEX "idx_registros_trabalho_aprovado" ON "public"."registros_trabalho" USING "btree" ("aprovado");



CREATE INDEX "idx_registros_trabalho_categoria" ON "public"."registros_trabalho" USING "btree" ("categoria_id");



CREATE INDEX "idx_registros_trabalho_cliente" ON "public"."registros_trabalho" USING "btree" ("cliente_id");



CREATE INDEX "idx_registros_trabalho_contrato" ON "public"."registros_trabalho" USING "btree" ("contrato_id");



CREATE INDEX "idx_registros_trabalho_dados" ON "public"."registros_trabalho" USING "gin" ("dados");



CREATE INDEX "idx_registros_trabalho_data" ON "public"."registros_trabalho" USING "btree" ("data");



CREATE INDEX "idx_registros_trabalho_lancamento" ON "public"."registros_trabalho" USING "btree" ("lancamento_id");



CREATE INDEX "idx_registros_trabalho_obra" ON "public"."registros_trabalho" USING "btree" ("obra_id");



CREATE INDEX "idx_registros_trabalho_profissional" ON "public"."registros_trabalho" USING "btree" ("profissional_id");



CREATE INDEX "idx_registros_trabalho_proposta" ON "public"."registros_trabalho" USING "btree" ("proposta_id");



CREATE INDEX "idx_task_dependencies_predecessor" ON "public"."task_dependencies" USING "btree" ("predecessor_id");



CREATE INDEX "idx_task_dependencies_successor" ON "public"."task_dependencies" USING "btree" ("successor_id");



CREATE INDEX "idx_tasks_datas" ON "public"."tasks" USING "btree" ("data_inicio_prevista", "data_fim_prevista");



CREATE INDEX "idx_tasks_empresa_id" ON "public"."tasks" USING "btree" ("empresa_id");



CREATE INDEX "idx_tasks_equipe" ON "public"."tasks" USING "btree" ("equipe_id");



CREATE INDEX "idx_tasks_parent" ON "public"."tasks" USING "btree" ("parent_task_id");



CREATE INDEX "idx_tasks_project_id" ON "public"."tasks" USING "btree" ("project_id");



CREATE INDEX "idx_tasks_responsavel" ON "public"."tasks" USING "btree" ("responsavel_id");



CREATE INDEX "idx_tasks_status" ON "public"."tasks" USING "btree" ("status");



CREATE INDEX "idx_team_members_team" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_user" ON "public"."team_members" USING "btree" ("user_id");



CREATE INDEX "idx_teams_empresa_id" ON "public"."teams" USING "btree" ("empresa_id");



CREATE INDEX "idx_teams_lider" ON "public"."teams" USING "btree" ("lider_id");



CREATE INDEX "idx_titulos_categoria" ON "public"."titulos_financeiros" USING "btree" ("categoria_id");



CREATE INDEX "idx_titulos_empresa" ON "public"."titulos_financeiros" USING "btree" ("empresa_id");



CREATE INDEX "idx_titulos_status" ON "public"."titulos_financeiros" USING "btree" ("status");



CREATE INDEX "idx_titulos_tipo" ON "public"."titulos_financeiros" USING "btree" ("tipo");



CREATE INDEX "idx_titulos_vencimento" ON "public"."titulos_financeiros" USING "btree" ("data_vencimento");



CREATE INDEX "idx_usuarios_perfis_perfil" ON "public"."usuarios_perfis" USING "btree" ("perfil");



CREATE INDEX "idx_usuarios_perfis_user" ON "public"."usuarios_perfis" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "assistencias_updated_at" BEFORE UPDATE ON "public"."assistencias" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "calc_quantidade_diaria" BEFORE INSERT OR UPDATE ON "public"."lancamentos_financeiros" FOR EACH ROW WHEN ((("new"."dados" ? 'data_inicial'::"text") AND ("new"."dados" ? 'data_final'::"text"))) EXECUTE FUNCTION "public"."trigger_calc_quantidade_diaria"();



COMMENT ON TRIGGER "calc_quantidade_diaria" ON "public"."lancamentos_financeiros" IS 'Calcula quantidade diária quando há período definido (usado para rateios e distribuições)';



CREATE OR REPLACE TRIGGER "contas_financeiras_updated_at" BEFORE UPDATE ON "public"."contas_financeiras" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "contratos_updated_at" BEFORE UPDATE ON "public"."contratos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "empresas_updated_at" BEFORE UPDATE ON "public"."empresas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "entities_updated_at" BEFORE UPDATE ON "public"."entities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "fin_txn_compute_amount" BEFORE INSERT OR UPDATE ON "public"."titulos_financeiros" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_fin_txn_compute_amount"();



COMMENT ON TRIGGER "fin_txn_compute_amount" ON "public"."titulos_financeiros" IS 'Valida e calcula valores antes de inserir ou atualizar títulos';



CREATE OR REPLACE TRIGGER "fin_txn_defaults" BEFORE INSERT OR UPDATE ON "public"."titulos_financeiros" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_fin_txn_defaults"();



COMMENT ON TRIGGER "fin_txn_defaults" ON "public"."titulos_financeiros" IS 'Preenche valores padrão e atualiza status automaticamente';



CREATE OR REPLACE TRIGGER "kanban_cards_updated_at" BEFORE UPDATE ON "public"."kanban_cards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "kanban_colunas_set_pos" BEFORE INSERT OR UPDATE ON "public"."kanban_colunas" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_kanban_colunas_set_pos"();



COMMENT ON TRIGGER "kanban_colunas_set_pos" ON "public"."kanban_colunas" IS 'Gerencia automaticamente a posição das colunas do kanban';



CREATE OR REPLACE TRIGGER "lancamentos_financeiros_updated_at" BEFORE UPDATE ON "public"."lancamentos_financeiros" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "obras_updated_at" BEFORE UPDATE ON "public"."obras" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "on_oportunidade_concluida" BEFORE UPDATE ON "public"."pipelines" FOR EACH ROW WHEN ((("new"."probabilidade" = 100) AND ("old"."probabilidade" < 100))) EXECUTE FUNCTION "public"."trigger_on_oportunidade_concluida"();



COMMENT ON TRIGGER "on_oportunidade_concluida" ON "public"."pipelines" IS 'Executa ações quando uma oportunidade é marcada como ganha (100% probabilidade)';



CREATE OR REPLACE TRIGGER "produtos_servicos_updated_at" BEFORE UPDATE ON "public"."produtos_servicos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "propagate_won_opportunity" AFTER UPDATE ON "public"."pipelines" FOR EACH ROW WHEN ((("new"."probabilidade" = 100) AND ("old"."probabilidade" < 100))) EXECUTE FUNCTION "public"."trigger_propagate_won_opportunity"();



COMMENT ON TRIGGER "propagate_won_opportunity" ON "public"."pipelines" IS 'Propaga oportunidades ganhas criando cards em outros módulos (projetos, etc)';



CREATE OR REPLACE TRIGGER "propostas_updated_at" BEFORE UPDATE ON "public"."propostas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "registro_categorias_updated_at" BEFORE UPDATE ON "public"."registro_categorias" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "registros_trabalho_updated_at" BEFORE UPDATE ON "public"."registros_trabalho" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."assistencias" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."contas_financeiras" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."empresas" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."entities" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."especificadores" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."produtos_servicos" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_kanban_cards" BEFORE UPDATE ON "public"."kanban_cards" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "tg_lanc_total" BEFORE INSERT OR UPDATE ON "public"."lancamentos_financeiros" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_lanc_total"();



COMMENT ON TRIGGER "tg_lanc_total" ON "public"."lancamentos_financeiros" IS 'Calcula automaticamente o total do lançamento baseado nos itens e define valores padrão';



CREATE OR REPLACE TRIGGER "titulos_financeiros_updated_at" BEFORE UPDATE ON "public"."titulos_financeiros" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_conta_set_empresa_id" BEFORE INSERT ON "public"."contas_financeiras" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_conta_set_empresa_id"();



COMMENT ON TRIGGER "trg_conta_set_empresa_id" ON "public"."contas_financeiras" IS 'Define automaticamente empresa_id para contas financeiras';



CREATE OR REPLACE TRIGGER "trg_entities_normalize" BEFORE INSERT OR UPDATE ON "public"."entities" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_entities_normalize"();



COMMENT ON TRIGGER "trg_entities_normalize" ON "public"."entities" IS 'Normaliza dados de entities (capitalização, formatação, validações)';



CREATE OR REPLACE TRIGGER "trigger_atualizar_progresso_projeto" AFTER INSERT OR UPDATE OF "progresso_percentual" ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."atualizar_progresso_projeto"();



CREATE OR REPLACE TRIGGER "trigger_sync_cliente_nome" BEFORE INSERT OR UPDATE ON "public"."kanban_cards" FOR EACH ROW EXECUTE FUNCTION "public"."sync_cliente_nome"();



CREATE OR REPLACE TRIGGER "update_app_config_updated_at" BEFORE UPDATE ON "public"."app_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."assistencias"
    ADD CONSTRAINT "assistencias_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assistencias"
    ADD CONSTRAINT "assistencias_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categorias_financeiras"
    ADD CONSTRAINT "categorias_financeiras_plano_conta_id_fkey" FOREIGN KEY ("plano_conta_id") REFERENCES "public"."plano_contas"("id");



ALTER TABLE ONLY "public"."centros_custo"
    ADD CONSTRAINT "centros_custo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compras"
    ADD CONSTRAINT "compras_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id");



ALTER TABLE ONLY "public"."contas_financeiras"
    ADD CONSTRAINT "contas_financeiras_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_proposta_id_fkey" FOREIGN KEY ("proposta_id") REFERENCES "public"."propostas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."especificador_comissao_niveis"
    ADD CONSTRAINT "especificador_comissao_niveis_especificador_id_fkey" FOREIGN KEY ("especificador_id") REFERENCES "public"."especificadores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kanban_cards"
    ADD CONSTRAINT "kanban_cards_coluna_id_fkey" FOREIGN KEY ("coluna_id") REFERENCES "public"."kanban_colunas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kanban_cards"
    ADD CONSTRAINT "kanban_cards_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."kanban_cards"
    ADD CONSTRAINT "kanban_cards_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."kanban_colunas"
    ADD CONSTRAINT "kanban_colunas_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."kanban_boards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lancamentos"
    ADD CONSTRAINT "lancamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."plano_contas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos"
    ADD CONSTRAINT "lancamentos_centro_custo_cliente_id_fkey" FOREIGN KEY ("centro_custo_cliente_id") REFERENCES "public"."centros_custo"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."plano_contas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_centro_custo_id_fkey" FOREIGN KEY ("centro_custo_id") REFERENCES "public"."centros_custo"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_conta_financeira_id_fkey" FOREIGN KEY ("conta_financeira_id") REFERENCES "public"."contas_financeiras"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos_financeiros"
    ADD CONSTRAINT "lancamentos_financeiros_titulo_id_fkey" FOREIGN KEY ("titulo_id") REFERENCES "public"."titulos_financeiros"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lancamentos"
    ADD CONSTRAINT "lancamentos_titulo_id_fkey" FOREIGN KEY ("titulo_id") REFERENCES "public"."titulos_financeiros"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pipelines"
    ADD CONSTRAINT "pipelines_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plano_contas"
    ADD CONSTRAINT "plano_contas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricelist"
    ADD CONSTRAINT "pricelist_produto_servico_id_fkey" FOREIGN KEY ("produto_servico_id") REFERENCES "public"."produtos_servicos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_contracts"
    ADD CONSTRAINT "project_contracts_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id");



ALTER TABLE ONLY "public"."project_contracts"
    ADD CONSTRAINT "project_contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_measurements"
    ADD CONSTRAINT "project_measurements_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."project_contracts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_measurements"
    ADD CONSTRAINT "project_measurements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."propostas"
    ADD CONSTRAINT "propostas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."propostas"
    ADD CONSTRAINT "propostas_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_aprovado_por_fkey" FOREIGN KEY ("aprovado_por") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."registro_categorias"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_lancamento_id_fkey" FOREIGN KEY ("lancamento_id") REFERENCES "public"."lancamentos_financeiros"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registros_trabalho"
    ADD CONSTRAINT "registros_trabalho_proposta_id_fkey" FOREIGN KEY ("proposta_id") REFERENCES "public"."propostas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_predecessor_id_fkey" FOREIGN KEY ("predecessor_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_successor_id_fkey" FOREIGN KEY ("successor_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_lider_id_fkey" FOREIGN KEY ("lider_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."titulos_financeiros"
    ADD CONSTRAINT "titulos_financeiros_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."plano_contas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."titulos_financeiros"
    ADD CONSTRAINT "titulos_financeiros_centro_custo_id_fkey" FOREIGN KEY ("centro_custo_id") REFERENCES "public"."centros_custo"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."titulos_financeiros"
    ADD CONSTRAINT "titulos_financeiros_conta_financeira_id_fkey" FOREIGN KEY ("conta_financeira_id") REFERENCES "public"."contas_financeiras"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."titulos_financeiros"
    ADD CONSTRAINT "titulos_financeiros_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."usuarios_perfis"
    ADD CONSTRAINT "usuarios_perfis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage boards" ON "public"."kanban_boards" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = 'admin'::"text")))));



CREATE POLICY "Admins can manage columns" ON "public"."kanban_colunas" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = 'admin'::"text")))));



CREATE POLICY "Admins can manage companies" ON "public"."empresas" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = 'admin'::"text")))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = 'admin'::"text")))));



CREATE POLICY "Allow all authenticated users to view lancamentos" ON "public"."lancamentos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow all authenticated users to view titles" ON "public"."titulos_financeiros" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view centros_custo" ON "public"."centros_custo" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view plano_contas" ON "public"."plano_contas" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can create entities" ON "public"."entities" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update entities" ON "public"."entities" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view boards" ON "public"."kanban_boards" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view columns" ON "public"."kanban_colunas" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view companies" ON "public"."empresas" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view entities" ON "public"."entities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users" ON "public"."profiles" FOR INSERT WITH CHECK (true);



COMMENT ON POLICY "Enable insert for authenticated users" ON "public"."profiles" IS 'Permite inserção de novos perfis durante o signup via trigger SECURITY DEFINER';



CREATE POLICY "Financial users can manage lancamentos" ON "public"."lancamentos" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = ANY (ARRAY['admin'::"text", 'financeiro'::"text", 'gestor'::"text"]))))));



CREATE POLICY "Financial users can manage titles" ON "public"."titulos_financeiros" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = ANY (ARRAY['admin'::"text", 'financeiro'::"text", 'gestor'::"text"]))))));



CREATE POLICY "Managers can edit any card" ON "public"."kanban_cards" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = ANY (ARRAY['admin'::"text", 'gestor'::"text"]))))));



CREATE POLICY "Permitir leitura" ON "public"."bancos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Permitir leitura" ON "public"."feriados" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Permitir leitura" ON "public"."pricelist" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Permitir tudo" ON "public"."bank_accounts" TO "authenticated" USING (true);



CREATE POLICY "Permitir tudo" ON "public"."especificador_comissao_niveis" TO "authenticated" USING (true);



CREATE POLICY "Permitir tudo" ON "public"."especificadores" TO "authenticated" USING (true);



CREATE POLICY "Profissionais podem criar seus registros" ON "public"."registros_trabalho" FOR INSERT WITH CHECK (("profissional_id" = "auth"."uid"()));



CREATE POLICY "Responsible user can edit own cards" ON "public"."kanban_cards" FOR UPDATE TO "authenticated" USING (("responsavel_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuários autenticados podem atualizar cards" ON "public"."kanban_cards" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem atualizar contratos" ON "public"."contratos" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem atualizar entities" ON "public"."entities" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem atualizar lançamentos" ON "public"."lancamentos_financeiros" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem atualizar obras" ON "public"."obras" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem atualizar propostas" ON "public"."propostas" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem atualizar títulos" ON "public"."titulos_financeiros" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar assistências" ON "public"."assistencias" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar cards" ON "public"."kanban_cards" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar contratos" ON "public"."contratos" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar entities" ON "public"."entities" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar lançamentos" ON "public"."lancamentos_financeiros" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar obras" ON "public"."obras" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar propostas" ON "public"."propostas" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem criar títulos" ON "public"."titulos_financeiros" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem deletar cards" ON "public"."kanban_cards" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver assistências" ON "public"."assistencias" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver cards" ON "public"."kanban_cards" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND ("deleted_at" IS NULL)));



CREATE POLICY "Usuários autenticados podem ver centros de custo" ON "public"."centros_custo" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver contas" ON "public"."contas_financeiras" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver contratos" ON "public"."contratos" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver empresas" ON "public"."empresas" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver entities" ON "public"."entities" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver lançamentos" ON "public"."lancamentos_financeiros" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver obras" ON "public"."obras" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver plano de contas" ON "public"."plano_contas" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver propostas" ON "public"."propostas" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver registros" ON "public"."registros_trabalho" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados podem ver títulos" ON "public"."titulos_financeiros" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários criam categorias na própria empresa" ON "public"."categorias_financeiras" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "categorias_financeiras"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários criam contas na própria empresa" ON "public"."contas_bancarias" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "contas_bancarias"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários criam contratos na própria empresa" ON "public"."project_contracts" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "project_contracts"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários criam dependências de tarefas da própria empresa" ON "public"."task_dependencies" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tasks"
  WHERE (("tasks"."id" = "task_dependencies"."predecessor_id") AND ("tasks"."empresa_id" IN ( SELECT "tasks"."empresa_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários criam equipes na própria empresa" ON "public"."teams" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "teams"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários criam medições na própria empresa" ON "public"."project_measurements" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "project_measurements"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários criam membros de equipes da própria empresa" ON "public"."team_members" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."teams"
  WHERE (("teams"."id" = "team_members"."team_id") AND ("teams"."empresa_id" IN ( SELECT "teams"."empresa_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários criam projetos na própria empresa" ON "public"."projects" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "projects"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários criam tarefas na própria empresa" ON "public"."tasks" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "tasks"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários editam contratos da própria empresa" ON "public"."project_contracts" FOR UPDATE USING (("empresa_id" IN ( SELECT "project_contracts"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários editam equipes da própria empresa" ON "public"."teams" FOR UPDATE USING (("empresa_id" IN ( SELECT "teams"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários editam medições da própria empresa" ON "public"."project_measurements" FOR UPDATE USING (("empresa_id" IN ( SELECT "project_measurements"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários editam projetos da própria empresa" ON "public"."projects" FOR UPDATE USING (("empresa_id" IN ( SELECT "projects"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários editam tarefas da própria empresa" ON "public"."tasks" FOR UPDATE USING (("empresa_id" IN ( SELECT "tasks"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"()));



CREATE POLICY "Usuários veem apenas seu próprio perfil" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Usuários veem apenas seu próprio perfil" ON "public"."usuarios_perfis" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Usuários veem categorias da própria empresa" ON "public"."categorias_financeiras" FOR SELECT USING (("empresa_id" IN ( SELECT "categorias_financeiras"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários veem contas da própria empresa" ON "public"."contas_bancarias" FOR SELECT USING (("empresa_id" IN ( SELECT "contas_bancarias"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários veem contratos da própria empresa" ON "public"."project_contracts" FOR SELECT USING (("empresa_id" IN ( SELECT "project_contracts"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários veem dependências de tarefas da própria empresa" ON "public"."task_dependencies" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."tasks"
  WHERE (("tasks"."id" = "task_dependencies"."predecessor_id") AND ("tasks"."empresa_id" IN ( SELECT "tasks"."empresa_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários veem equipes da própria empresa" ON "public"."teams" FOR SELECT USING (("empresa_id" IN ( SELECT "teams"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários veem medições da própria empresa" ON "public"."project_measurements" FOR SELECT USING (("empresa_id" IN ( SELECT "project_measurements"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários veem membros de equipes da própria empresa" ON "public"."team_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."teams"
  WHERE (("teams"."id" = "team_members"."team_id") AND ("teams"."empresa_id" IN ( SELECT "teams"."empresa_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários veem projetos da própria empresa" ON "public"."projects" FOR SELECT USING (("empresa_id" IN ( SELECT "projects"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários veem tarefas da própria empresa" ON "public"."tasks" FOR SELECT USING (("empresa_id" IN ( SELECT "tasks"."empresa_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "admin_manage_app_config" ON "public"."app_config" USING ((("auth"."role"() = 'service_role'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = 'admin'::"text"))))));



ALTER TABLE "public"."app_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assistencias" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authenticated_insert_bancos" ON "public"."bancos" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_bank_accounts" ON "public"."bank_accounts" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_comissao_niveis" ON "public"."especificador_comissao_niveis" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_especificadores" ON "public"."especificadores" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_feriados" ON "public"."feriados" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_pipelines" ON "public"."pipelines" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_pricelist" ON "public"."pricelist" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_produtos_servicos" ON "public"."produtos_servicos" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_insert_registro_categorias" ON "public"."registro_categorias" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_app_config" ON "public"."app_config" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_bancos" ON "public"."bancos" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_bank_accounts" ON "public"."bank_accounts" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_comissao_niveis" ON "public"."especificador_comissao_niveis" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_especificadores" ON "public"."especificadores" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_feriados" ON "public"."feriados" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_pipelines" ON "public"."pipelines" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_pricelist" ON "public"."pricelist" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_produtos_servicos" ON "public"."produtos_servicos" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_select_registro_categorias" ON "public"."registro_categorias" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_update_bank_accounts" ON "public"."bank_accounts" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_update_especificadores" ON "public"."especificadores" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_update_pipelines" ON "public"."pipelines" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_update_pricelist" ON "public"."pricelist" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_update_produtos_servicos" ON "public"."produtos_servicos" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "authenticated_users_can_create_cards" ON "public"."kanban_cards" FOR INSERT TO "authenticated" WITH CHECK (true);



COMMENT ON POLICY "authenticated_users_can_create_cards" ON "public"."kanban_cards" IS 'Permite que qualquer usuário autenticado crie novos cards no kanban. Facilita workflow colaborativo.';



CREATE POLICY "authenticated_users_can_update_cards" ON "public"."kanban_cards" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



COMMENT ON POLICY "authenticated_users_can_update_cards" ON "public"."kanban_cards" IS 'Permite que qualquer usuário autenticado atualize cards (mover entre colunas, editar campos, etc). Essencial para kanban colaborativo.';



CREATE POLICY "authenticated_users_can_view_cards" ON "public"."kanban_cards" FOR SELECT TO "authenticated" USING (true);



COMMENT ON POLICY "authenticated_users_can_view_cards" ON "public"."kanban_cards" IS 'Permite que qualquer usuário autenticado visualize cards do kanban. Política permissiva para colaboração.';



ALTER TABLE "public"."bancos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bank_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categorias_financeiras" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."centros_custo" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contas_bancarias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contas_financeiras" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contratos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."empresas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."especificador_comissao_niveis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."especificadores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feriados" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kanban_boards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kanban_cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "kanban_cards_delete" ON "public"."kanban_cards" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "kanban_cards_insert" ON "public"."kanban_cards" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "kanban_cards_select" ON "public"."kanban_cards" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "kanban_cards_update" ON "public"."kanban_cards" FOR UPDATE USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."kanban_colunas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lancamentos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lancamentos_financeiros" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "managers_can_delete_cards" ON "public"."kanban_cards" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios_perfis"
  WHERE (("usuarios_perfis"."user_id" = "auth"."uid"()) AND ("usuarios_perfis"."perfil" = ANY (ARRAY['admin'::"text", 'gestor'::"text"]))))));



COMMENT ON POLICY "managers_can_delete_cards" ON "public"."kanban_cards" IS 'Restringe deleção de cards apenas para usuários com perfil admin ou gestor. Protege contra deleções acidentais.';



ALTER TABLE "public"."obras" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pipelines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plano_contas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricelist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."produtos_servicos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_contracts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_measurements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."propostas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."registro_categorias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."registros_trabalho" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_dependencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."titulos_financeiros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usuarios_perfis" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."_ensure_coluna"("p_board_id" "uuid", "p_titulo" "text", "p_posicao" integer, "p_cor" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_ensure_coluna"("p_board_id" "uuid", "p_titulo" "text", "p_posicao" integer, "p_cor" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ensure_coluna"("p_board_id" "uuid", "p_titulo" "text", "p_posicao" integer, "p_cor" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."api_atualizar_card_kanban"("p_card_id" "uuid", "p_dados" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."api_atualizar_card_kanban"("p_card_id" "uuid", "p_dados" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."api_atualizar_card_kanban"("p_card_id" "uuid", "p_dados" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."api_criar_card_kanban"("p_coluna_id" "uuid", "p_titulo" "text", "p_descricao" "text", "p_entity_id" "uuid", "p_responsavel_id" "uuid", "p_payload" "jsonb", "p_servicos_contratados" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."api_criar_card_kanban"("p_coluna_id" "uuid", "p_titulo" "text", "p_descricao" "text", "p_entity_id" "uuid", "p_responsavel_id" "uuid", "p_payload" "jsonb", "p_servicos_contratados" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."api_criar_card_kanban"("p_coluna_id" "uuid", "p_titulo" "text", "p_descricao" "text", "p_entity_id" "uuid", "p_responsavel_id" "uuid", "p_payload" "jsonb", "p_servicos_contratados" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."api_criar_coluna_kanban"("p_board_id" "uuid", "p_nome" "text", "p_cor" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."api_criar_coluna_kanban"("p_board_id" "uuid", "p_nome" "text", "p_cor" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."api_criar_coluna_kanban"("p_board_id" "uuid", "p_nome" "text", "p_cor" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."api_deletar_card_kanban"("p_card_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."api_deletar_card_kanban"("p_card_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."api_deletar_card_kanban"("p_card_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."api_mover_card_kanban"("p_card_id" "uuid", "p_nova_coluna_id" "uuid", "p_nova_ordem" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."api_mover_card_kanban"("p_card_id" "uuid", "p_nova_coluna_id" "uuid", "p_nova_ordem" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."api_mover_card_kanban"("p_card_id" "uuid", "p_nova_coluna_id" "uuid", "p_nova_ordem" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."atualizar_progresso_projeto"() TO "anon";
GRANT ALL ON FUNCTION "public"."atualizar_progresso_projeto"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."atualizar_progresso_projeto"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calcular_progresso_projeto"("p_project_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calcular_progresso_projeto"("p_project_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calcular_progresso_projeto"("p_project_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_data"("p_days_to_keep" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_data"("p_days_to_keep" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_data"("p_days_to_keep" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."current_empresa_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_empresa_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_empresa_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_org"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_org"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_org"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_default_pipelines"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_default_pipelines"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_default_pipelines"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_pipeline"("p_modulo" "text", "p_nome" "text", "p_stages" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_pipeline"("p_modulo" "text", "p_nome" "text", "p_stages" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_pipeline"("p_modulo" "text", "p_nome" "text", "p_stages" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."fin_card_soft_delete"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fin_card_soft_delete"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fin_card_soft_delete"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fin_txn_duplicate"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fin_txn_duplicate"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fin_txn_duplicate"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fin_txn_soft_delete"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fin_txn_soft_delete"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fin_txn_soft_delete"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."finance_report"("p_data_ini" "date", "p_data_fim" "date", "p_tipo" "text", "p_status" "text", "p_categoria_id" "uuid", "p_empresa_id" "uuid", "p_conta_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."finance_report"("p_data_ini" "date", "p_data_fim" "date", "p_tipo" "text", "p_status" "text", "p_categoria_id" "uuid", "p_empresa_id" "uuid", "p_conta_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."finance_report"("p_data_ini" "date", "p_data_fim" "date", "p_tipo" "text", "p_status" "text", "p_categoria_id" "uuid", "p_empresa_id" "uuid", "p_conta_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_cashflow_daily"("p_org" "uuid", "p_d1" "date", "p_d2" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_cashflow_daily"("p_org" "uuid", "p_d1" "date", "p_d2" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_cashflow_daily"("p_org" "uuid", "p_d1" "date", "p_d2" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_dre"("p_org" "uuid", "p_d1" "date", "p_d2" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_dre"("p_org" "uuid", "p_d1" "date", "p_d2" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_dre"("p_org" "uuid", "p_d1" "date", "p_d2" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_cep_br"("digits" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_cep_br"("digits" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_cep_br"("digits" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_cnpj"("digits" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_cnpj"("digits" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_cnpj"("digits" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_cpf"("digits" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_cpf"("digits" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_cpf"("digits" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_phone_br"("digits" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_phone_br"("digits" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_phone_br"("digits" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_item_code"("p_category" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_item_code"("p_category" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_item_code"("p_category" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_account_org_id"("p_account_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_account_org_id"("p_account_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_account_org_id"("p_account_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_api_url"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_api_url"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_api_url"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_org_id"("p_category_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_org_id"("p_category_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_org_id"("p_category_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_environment"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_environment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_environment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_finance_dashboard_data"("p_empresa_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_finance_dashboard_data"("p_empresa_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_finance_dashboard_data"("p_empresa_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_jwt_claim"("claim_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_jwt_claim"("claim_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_jwt_claim"("claim_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_party_org_id"("p_party_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_party_org_id"("p_party_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_party_org_id"("p_party_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("p_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_cnpj_valid"("doc" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_cnpj_valid"("doc" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_cnpj_valid"("doc" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_cpf_cnpj_valid"("doc" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_cpf_cnpj_valid"("doc" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_cpf_cnpj_valid"("doc" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_cpf_valid"("doc" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_cpf_valid"("doc" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_cpf_valid"("doc" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_local_environment"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_local_environment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_local_environment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."kanban_ensure_board"("p_modulo" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."kanban_ensure_board"("p_modulo" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."kanban_ensure_board"("p_modulo" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."kanban_get_board_status"("p_modulo" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."kanban_get_board_status"("p_modulo" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."kanban_get_board_status"("p_modulo" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."kanban_move_card"("p_card_id" "uuid", "p_new_coluna_id" "uuid", "p_new_posicao" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."kanban_move_card"("p_card_id" "uuid", "p_new_coluna_id" "uuid", "p_new_posicao" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."kanban_move_card"("p_card_id" "uuid", "p_new_coluna_id" "uuid", "p_new_posicao" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."only_digits"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."only_digits"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."only_digits"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reorder_cards"("p_modulo" "text", "p_stage_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_cards"("p_modulo" "text", "p_stage_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_cards"("p_modulo" "text", "p_stage_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_cliente_nome"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_cliente_nome"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_cliente_nome"() TO "service_role";



GRANT ALL ON FUNCTION "public"."system_health_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."system_health_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."system_health_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_calc_quantidade_diaria"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_calc_quantidade_diaria"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_calc_quantidade_diaria"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_conta_set_empresa_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_conta_set_empresa_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_conta_set_empresa_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_entities_normalize"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_entities_normalize"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_entities_normalize"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_fin_txn_compute_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_fin_txn_compute_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_fin_txn_compute_amount"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_fin_txn_defaults"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_fin_txn_defaults"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_fin_txn_defaults"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_kanban_colunas_set_pos"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_kanban_colunas_set_pos"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_kanban_colunas_set_pos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_lanc_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_lanc_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_lanc_total"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_on_oportunidade_concluida"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_on_oportunidade_concluida"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_on_oportunidade_concluida"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_propagate_won_opportunity"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_propagate_won_opportunity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_propagate_won_opportunity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."app_config" TO "anon";
GRANT ALL ON TABLE "public"."app_config" TO "authenticated";
GRANT ALL ON TABLE "public"."app_config" TO "service_role";



GRANT ALL ON TABLE "public"."assistencias" TO "anon";
GRANT ALL ON TABLE "public"."assistencias" TO "authenticated";
GRANT ALL ON TABLE "public"."assistencias" TO "service_role";



GRANT ALL ON TABLE "public"."bancos" TO "anon";
GRANT ALL ON TABLE "public"."bancos" TO "authenticated";
GRANT ALL ON TABLE "public"."bancos" TO "service_role";



GRANT ALL ON TABLE "public"."bank_accounts" TO "anon";
GRANT ALL ON TABLE "public"."bank_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."categorias_financeiras" TO "authenticated";
GRANT ALL ON TABLE "public"."categorias_financeiras" TO "service_role";



GRANT ALL ON TABLE "public"."centros_custo" TO "anon";
GRANT ALL ON TABLE "public"."centros_custo" TO "authenticated";
GRANT ALL ON TABLE "public"."centros_custo" TO "service_role";



GRANT ALL ON TABLE "public"."compras" TO "authenticated";
GRANT ALL ON TABLE "public"."compras" TO "service_role";



GRANT ALL ON TABLE "public"."contas_bancarias" TO "authenticated";
GRANT ALL ON TABLE "public"."contas_bancarias" TO "service_role";



GRANT ALL ON TABLE "public"."contas_financeiras" TO "anon";
GRANT ALL ON TABLE "public"."contas_financeiras" TO "authenticated";
GRANT ALL ON TABLE "public"."contas_financeiras" TO "service_role";



GRANT ALL ON TABLE "public"."contratos" TO "anon";
GRANT ALL ON TABLE "public"."contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."contratos" TO "service_role";



GRANT ALL ON TABLE "public"."empresas" TO "anon";
GRANT ALL ON TABLE "public"."empresas" TO "authenticated";
GRANT ALL ON TABLE "public"."empresas" TO "service_role";



GRANT ALL ON TABLE "public"."entities" TO "anon";
GRANT ALL ON TABLE "public"."entities" TO "authenticated";
GRANT ALL ON TABLE "public"."entities" TO "service_role";



GRANT ALL ON TABLE "public"."especificador_comissao_niveis" TO "anon";
GRANT ALL ON TABLE "public"."especificador_comissao_niveis" TO "authenticated";
GRANT ALL ON TABLE "public"."especificador_comissao_niveis" TO "service_role";



GRANT ALL ON TABLE "public"."especificadores" TO "anon";
GRANT ALL ON TABLE "public"."especificadores" TO "authenticated";
GRANT ALL ON TABLE "public"."especificadores" TO "service_role";



GRANT ALL ON TABLE "public"."feriados" TO "anon";
GRANT ALL ON TABLE "public"."feriados" TO "authenticated";
GRANT ALL ON TABLE "public"."feriados" TO "service_role";



GRANT ALL ON TABLE "public"."kanban_boards" TO "anon";
GRANT ALL ON TABLE "public"."kanban_boards" TO "authenticated";
GRANT ALL ON TABLE "public"."kanban_boards" TO "service_role";



GRANT ALL ON TABLE "public"."kanban_cards" TO "anon";
GRANT ALL ON TABLE "public"."kanban_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."kanban_cards" TO "service_role";



GRANT ALL ON TABLE "public"."kanban_colunas" TO "anon";
GRANT ALL ON TABLE "public"."kanban_colunas" TO "authenticated";
GRANT ALL ON TABLE "public"."kanban_colunas" TO "service_role";



GRANT ALL ON TABLE "public"."lancamentos" TO "anon";
GRANT ALL ON TABLE "public"."lancamentos" TO "authenticated";
GRANT ALL ON TABLE "public"."lancamentos" TO "service_role";



GRANT ALL ON TABLE "public"."lancamentos_financeiros" TO "anon";
GRANT ALL ON TABLE "public"."lancamentos_financeiros" TO "authenticated";
GRANT ALL ON TABLE "public"."lancamentos_financeiros" TO "service_role";



GRANT ALL ON TABLE "public"."obras" TO "anon";
GRANT ALL ON TABLE "public"."obras" TO "authenticated";
GRANT ALL ON TABLE "public"."obras" TO "service_role";



GRANT ALL ON TABLE "public"."pipelines" TO "anon";
GRANT ALL ON TABLE "public"."pipelines" TO "authenticated";
GRANT ALL ON TABLE "public"."pipelines" TO "service_role";



GRANT ALL ON TABLE "public"."plano_contas" TO "anon";
GRANT ALL ON TABLE "public"."plano_contas" TO "authenticated";
GRANT ALL ON TABLE "public"."plano_contas" TO "service_role";



GRANT ALL ON TABLE "public"."pricelist" TO "anon";
GRANT ALL ON TABLE "public"."pricelist" TO "authenticated";
GRANT ALL ON TABLE "public"."pricelist" TO "service_role";



GRANT ALL ON TABLE "public"."produtos_servicos" TO "anon";
GRANT ALL ON TABLE "public"."produtos_servicos" TO "authenticated";
GRANT ALL ON TABLE "public"."produtos_servicos" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."project_contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."project_contracts" TO "service_role";



GRANT ALL ON TABLE "public"."project_measurements" TO "authenticated";
GRANT ALL ON TABLE "public"."project_measurements" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."propostas" TO "anon";
GRANT ALL ON TABLE "public"."propostas" TO "authenticated";
GRANT ALL ON TABLE "public"."propostas" TO "service_role";



GRANT ALL ON TABLE "public"."registro_categorias" TO "anon";
GRANT ALL ON TABLE "public"."registro_categorias" TO "authenticated";
GRANT ALL ON TABLE "public"."registro_categorias" TO "service_role";



GRANT ALL ON TABLE "public"."registros_trabalho" TO "anon";
GRANT ALL ON TABLE "public"."registros_trabalho" TO "authenticated";
GRANT ALL ON TABLE "public"."registros_trabalho" TO "service_role";



GRANT ALL ON TABLE "public"."task_dependencies" TO "authenticated";
GRANT ALL ON TABLE "public"."task_dependencies" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."titulos_financeiros" TO "anon";
GRANT ALL ON TABLE "public"."titulos_financeiros" TO "authenticated";
GRANT ALL ON TABLE "public"."titulos_financeiros" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_perfis" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_perfis" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_perfis" TO "service_role";



GRANT ALL ON TABLE "public"."v_clientes_ativos_contratos" TO "service_role";
GRANT SELECT ON TABLE "public"."v_clientes_ativos_contratos" TO "authenticated";



GRANT ALL ON TABLE "public"."v_despesas_mes_categoria" TO "service_role";
GRANT SELECT ON TABLE "public"."v_despesas_mes_categoria" TO "authenticated";



GRANT ALL ON TABLE "public"."v_fluxo_caixa" TO "service_role";
GRANT SELECT ON TABLE "public"."v_fluxo_caixa" TO "authenticated";



GRANT ALL ON TABLE "public"."v_kanban_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."v_kanban_cards" TO "service_role";



GRANT ALL ON TABLE "public"."v_kanban_cards_board" TO "service_role";
GRANT SELECT ON TABLE "public"."v_kanban_cards_board" TO "authenticated";



GRANT ALL ON TABLE "public"."v_obras_status" TO "service_role";
GRANT SELECT ON TABLE "public"."v_obras_status" TO "authenticated";



GRANT ALL ON TABLE "public"."v_registros_trabalho" TO "service_role";
GRANT SELECT ON TABLE "public"."v_registros_trabalho" TO "authenticated";



GRANT ALL ON TABLE "public"."v_top10_clientes_receita" TO "service_role";
GRANT SELECT ON TABLE "public"."v_top10_clientes_receita" TO "authenticated";



GRANT ALL ON TABLE "public"."vw_oportunidades_completas" TO "service_role";
GRANT SELECT ON TABLE "public"."vw_oportunidades_completas" TO "authenticated";



GRANT ALL ON TABLE "public"."vw_pipeline_oportunidades" TO "service_role";
GRANT SELECT ON TABLE "public"."vw_pipeline_oportunidades" TO "authenticated";



GRANT ALL ON TABLE "public"."vw_titulos_resumo" TO "service_role";
GRANT SELECT ON TABLE "public"."vw_titulos_resumo" TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,USAGE ON SEQUENCES TO "supabase_auth_admin";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







A new version of Supabase CLI is available: v2.62.10 (currently installed v2.62.5)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
