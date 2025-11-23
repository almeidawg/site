-- =============================================
-- MIGRATION: 024
-- Descrição: Helpers e Triggers Diversos (funções auxiliares e triggers de sistema)
-- Data: 2025-11-03
-- =============================================

-- =================================================================
-- FUNÇÃO: current_org
-- Descrição: Retorna UUID da organização/empresa atual
-- =================================================================

DROP FUNCTION IF EXISTS current_org();

CREATE OR REPLACE FUNCTION current_org()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION current_org IS
'Retorna o UUID da empresa/organização atual do contexto, criando uma padrão se necessário';

-- =================================================================
-- FUNÇÃO: get_account_org_id
-- Descrição: Retorna org_id de uma conta financeira
-- =================================================================

DROP FUNCTION IF EXISTS get_account_org_id(uuid);

CREATE OR REPLACE FUNCTION get_account_org_id(
    p_account_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION get_account_org_id IS
'Retorna o ID da empresa/organização de uma conta financeira';

-- =================================================================
-- FUNÇÃO: get_category_org_id
-- Descrição: Retorna org_id de uma categoria
-- =================================================================

DROP FUNCTION IF EXISTS get_category_org_id(uuid);

CREATE OR REPLACE FUNCTION get_category_org_id(
    p_category_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION get_category_org_id IS
'Retorna o ID da empresa/organização de uma categoria';

-- =================================================================
-- FUNÇÃO: get_party_org_id
-- Descrição: Retorna org_id de uma entity/party
-- =================================================================

DROP FUNCTION IF EXISTS get_party_org_id(uuid);

CREATE OR REPLACE FUNCTION get_party_org_id(
    p_party_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION get_party_org_id IS
'Retorna o ID da empresa/organização de uma entidade (cliente, fornecedor, etc)';

-- =================================================================
-- FUNÇÃO: ensure_pipeline
-- Descrição: Garantir que pipeline existe
-- =================================================================

DROP FUNCTION IF EXISTS ensure_pipeline(text, text, text[]);

CREATE OR REPLACE FUNCTION ensure_pipeline(
    p_modulo text,
    p_nome text,
    p_stages text[] DEFAULT ARRAY['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento']
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION ensure_pipeline IS
'Garante que um pipeline existe com os estágios especificados, criando se necessário';

-- =================================================================
-- FUNÇÃO: ensure_default_pipelines
-- Descrição: Criar pipelines padrão do sistema
-- =================================================================

DROP FUNCTION IF EXISTS ensure_default_pipelines();

CREATE OR REPLACE FUNCTION ensure_default_pipelines()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION ensure_default_pipelines IS
'Cria os pipelines padrão do sistema (vendas, projetos, suporte, marketing)';

-- =================================================================
-- FUNÇÃO: generate_item_code
-- Descrição: Gerar código único para itens
-- =================================================================

DROP FUNCTION IF EXISTS generate_item_code(text);

CREATE OR REPLACE FUNCTION generate_item_code(
    p_category text DEFAULT 'GERAL'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION generate_item_code IS
'Gera código único para itens baseado na categoria (PRD-20251103-0001)';

-- =================================================================
-- TRIGGER: trg_entities_normalize
-- Descrição: Normalizar dados de entities
-- =================================================================

DROP TRIGGER IF EXISTS trg_entities_normalize ON entities;
DROP FUNCTION IF EXISTS trigger_entities_normalize();

CREATE OR REPLACE FUNCTION trigger_entities_normalize()
RETURNS trigger
LANGUAGE plpgsql
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

CREATE TRIGGER trg_entities_normalize
    BEFORE INSERT OR UPDATE ON entities
    FOR EACH ROW
    EXECUTE FUNCTION trigger_entities_normalize();

COMMENT ON TRIGGER trg_entities_normalize ON entities IS
'Normaliza dados de entities (capitalização, formatação, validações)';

-- =================================================================
-- TRIGGER: trg_conta_set_empresa_id
-- Descrição: Setar empresa_id automaticamente
-- =================================================================

DROP TRIGGER IF EXISTS trg_conta_set_empresa_id ON contas_financeiras;
DROP FUNCTION IF EXISTS trigger_conta_set_empresa_id();

CREATE OR REPLACE FUNCTION trigger_conta_set_empresa_id()
RETURNS trigger
LANGUAGE plpgsql
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

CREATE TRIGGER trg_conta_set_empresa_id
    BEFORE INSERT ON contas_financeiras
    FOR EACH ROW
    EXECUTE FUNCTION trigger_conta_set_empresa_id();

COMMENT ON TRIGGER trg_conta_set_empresa_id ON contas_financeiras IS
'Define automaticamente empresa_id para contas financeiras';

-- =================================================================
-- TRIGGER: tg_lanc_total
-- Descrição: Calcular total de lançamento
-- =================================================================

DROP TRIGGER IF EXISTS tg_lanc_total ON lancamentos_financeiros;
DROP FUNCTION IF EXISTS trigger_lanc_total();

CREATE OR REPLACE FUNCTION trigger_lanc_total()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
$$;

CREATE TRIGGER tg_lanc_total
    BEFORE INSERT OR UPDATE ON lancamentos_financeiros
    FOR EACH ROW
    EXECUTE FUNCTION trigger_lanc_total();

COMMENT ON TRIGGER tg_lanc_total ON lancamentos_financeiros IS
'Calcula automaticamente o total do lançamento baseado nos itens e define valores padrão';

-- =================================================================
-- TRIGGER: on_oportunidade_concluida
-- Descrição: Ações ao concluir oportunidade (pipelines)
-- =================================================================

DROP TRIGGER IF EXISTS on_oportunidade_concluida ON pipelines;
DROP FUNCTION IF EXISTS trigger_on_oportunidade_concluida();

CREATE OR REPLACE FUNCTION trigger_on_oportunidade_concluida()
RETURNS trigger
LANGUAGE plpgsql
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

CREATE TRIGGER on_oportunidade_concluida
    BEFORE UPDATE ON pipelines
    FOR EACH ROW
    WHEN (NEW.probabilidade = 100 AND OLD.probabilidade < 100)
    EXECUTE FUNCTION trigger_on_oportunidade_concluida();

COMMENT ON TRIGGER on_oportunidade_concluida ON pipelines IS
'Executa ações quando uma oportunidade é marcada como ganha (100% probabilidade)';

-- =================================================================
-- TRIGGER: propagate_won_opportunity
-- Descrição: Propagar oportunidade ganha para outros módulos
-- =================================================================

DROP TRIGGER IF EXISTS propagate_won_opportunity ON pipelines;
DROP FUNCTION IF EXISTS trigger_propagate_won_opportunity();

CREATE OR REPLACE FUNCTION trigger_propagate_won_opportunity()
RETURNS trigger
LANGUAGE plpgsql
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

CREATE TRIGGER propagate_won_opportunity
    AFTER UPDATE ON pipelines
    FOR EACH ROW
    WHEN (NEW.probabilidade = 100 AND OLD.probabilidade < 100)
    EXECUTE FUNCTION trigger_propagate_won_opportunity();

COMMENT ON TRIGGER propagate_won_opportunity ON pipelines IS
'Propaga oportunidades ganhas criando cards em outros módulos (projetos, etc)';

-- =================================================================
-- TRIGGER: bank_accounts_uni_principal
-- Descrição: Garantir apenas uma conta principal por empresa
-- ⚠️ COMENTADO: Tabela contas_financeiras não tem coluna 'dados'
-- =================================================================

-- DROP TRIGGER IF EXISTS bank_accounts_uni_principal ON contas_financeiras;
-- DROP FUNCTION IF EXISTS trigger_bank_accounts_uni_principal();

-- CREATE OR REPLACE FUNCTION trigger_bank_accounts_uni_principal()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--     -- Se está marcando como principal (adicionando campo principal aos dados)
--     IF NEW.dados->>'principal' = 'true' THEN
--         -- Desmarcar outras contas da mesma empresa
--         UPDATE contas_financeiras
--         SET dados = dados - 'principal'
--         WHERE empresa_id = NEW.empresa_id
--             AND id != NEW.id
--             AND dados->>'principal' = 'true';

--         RAISE NOTICE 'Conta % definida como principal', NEW.apelido;
--     END IF;

--     RETURN NEW;
-- END;
-- $$;

-- CREATE TRIGGER bank_accounts_uni_principal
--     BEFORE INSERT OR UPDATE ON contas_financeiras
--     FOR EACH ROW
--     WHEN (NEW.dados->>'principal' = 'true')
--     EXECUTE FUNCTION trigger_bank_accounts_uni_principal();

-- COMMENT ON TRIGGER bank_accounts_uni_principal ON contas_financeiras IS
-- 'Garante que apenas uma conta financeira seja marcada como principal por empresa';

-- ⚠️ NOTA: Adicionar coluna 'dados JSONB' na tabela contas_financeiras se necessário

-- =================================================================
-- TRIGGER: calc_quantidade_diaria
-- Descrição: Calcular quantidade diária (para controle de estoque/produção)
-- =================================================================

-- Esta trigger seria para tabela de estoque/produção que não existe
-- Vamos criar para lancamentos_financeiros como exemplo

DROP TRIGGER IF EXISTS calc_quantidade_diaria ON lancamentos_financeiros;
DROP FUNCTION IF EXISTS trigger_calc_quantidade_diaria();

CREATE OR REPLACE FUNCTION trigger_calc_quantidade_diaria()
RETURNS trigger
LANGUAGE plpgsql
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

CREATE TRIGGER calc_quantidade_diaria
    BEFORE INSERT OR UPDATE ON lancamentos_financeiros
    FOR EACH ROW
    WHEN (NEW.dados ? 'data_inicial' AND NEW.dados ? 'data_final')
    EXECUTE FUNCTION trigger_calc_quantidade_diaria();

COMMENT ON TRIGGER calc_quantidade_diaria ON lancamentos_financeiros IS
'Calcula quantidade diária quando há período definido (usado para rateios e distribuições)';

-- =================================================================
-- FUNÇÃO AUXILIAR: cleanup_old_data
-- Descrição: Limpar dados antigos (manutenção)
-- =================================================================

DROP FUNCTION IF EXISTS cleanup_old_data(integer);

CREATE OR REPLACE FUNCTION cleanup_old_data(
    p_days_to_keep integer DEFAULT 90
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION cleanup_old_data IS
'Remove dados antigos cancelados/arquivados para manutenção do banco (usar com cuidado)';

-- =================================================================
-- FUNÇÃO AUXILIAR: system_health_check
-- Descrição: Verificar saúde do sistema
-- =================================================================

DROP FUNCTION IF EXISTS system_health_check();

CREATE OR REPLACE FUNCTION system_health_check()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION system_health_check IS
'Retorna métricas de saúde do sistema incluindo tamanhos, contadores e alertas';

-- =================================================================
-- FIM DA MIGRATION 024
-- =================================================================

DO $$ BEGIN RAISE NOTICE 'Migration 024 - Helpers e Triggers criados com sucesso!'; END $$ ;