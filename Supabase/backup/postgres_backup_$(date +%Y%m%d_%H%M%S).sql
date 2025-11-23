--
-- PostgreSQL database dump
--

\restrict qHkApMFWDrWZPhjlxiImNiudgKq9y2WdYwFGg4FMfsmRfjGvGtkd9CChJlBaTL4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP POLICY IF EXISTS managers_can_delete_cards ON public.kanban_cards;
DROP POLICY IF EXISTS authenticated_users_can_view_cards ON public.kanban_cards;
DROP POLICY IF EXISTS authenticated_users_can_update_cards ON public.kanban_cards;
DROP POLICY IF EXISTS authenticated_users_can_create_cards ON public.kanban_cards;
DROP POLICY IF EXISTS "Usuários podem ver seus registros de trabalho" ON public.registros_trabalho;
DROP POLICY IF EXISTS "Usuários podem ver propostas" ON public.propostas;
DROP POLICY IF EXISTS "Usuários podem ver obras" ON public.obras;
DROP POLICY IF EXISTS "Usuários podem ver lançamentos financeiros" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Usuários podem ver contratos" ON public.contratos;
DROP POLICY IF EXISTS "Usuários podem ver categorias de registro" ON public.registro_categorias;
DROP POLICY IF EXISTS "Usuários podem deletar seus registros não aprovados" ON public.registros_trabalho;
DROP POLICY IF EXISTS "Usuários podem criar seus registros de trabalho" ON public.registros_trabalho;
DROP POLICY IF EXISTS "Usuários podem atualizar seus registros de trabalho" ON public.registros_trabalho;
DROP POLICY IF EXISTS "Users can view titles of accessible companies" ON public.titulos_financeiros;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view lancamentos" ON public.lancamentos;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Responsible user can edit own cards" ON public.kanban_cards;
DROP POLICY IF EXISTS "Managers can edit any card" ON public.kanban_cards;
DROP POLICY IF EXISTS "Financial users can manage titles" ON public.titulos_financeiros;
DROP POLICY IF EXISTS "Financial users can manage lancamentos" ON public.lancamentos;
DROP POLICY IF EXISTS "Authenticated users can view entities" ON public.entities;
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can view columns" ON public.kanban_colunas;
DROP POLICY IF EXISTS "Authenticated users can view boards" ON public.kanban_boards;
DROP POLICY IF EXISTS "Authenticated users can update entities" ON public.entities;
DROP POLICY IF EXISTS "Authenticated users can create entities" ON public.entities;
DROP POLICY IF EXISTS "Apenas admins podem deletar propostas" ON public.propostas;
DROP POLICY IF EXISTS "Apenas admins podem deletar obras" ON public.obras;
DROP POLICY IF EXISTS "Apenas admins podem deletar lançamentos financeiros" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Apenas admins podem deletar contratos" ON public.contratos;
DROP POLICY IF EXISTS "Apenas admins podem deletar categorias" ON public.registro_categorias;
DROP POLICY IF EXISTS "Admins, gestores, vendedores e responsáveis podem atualizar pr" ON public.propostas;
DROP POLICY IF EXISTS "Admins, gestores, arquitetos e responsáveis podem atualizar ob" ON public.obras;
DROP POLICY IF EXISTS "Admins, gestores e vendedores podem criar propostas" ON public.propostas;
DROP POLICY IF EXISTS "Admins, gestores e responsáveis podem atualizar contratos" ON public.contratos;
DROP POLICY IF EXISTS "Admins, gestores e financeiro podem criar lançamentos" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Admins, gestores e financeiro podem atualizar lançamentos" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Admins, gestores e arquitetos podem criar obras" ON public.obras;
DROP POLICY IF EXISTS "Admins e gestores podem criar contratos" ON public.contratos;
DROP POLICY IF EXISTS "Admins e gestores podem criar categorias" ON public.registro_categorias;
DROP POLICY IF EXISTS "Admins e gestores podem atualizar categorias" ON public.registro_categorias;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.empresas;
DROP POLICY IF EXISTS "Admins can manage columns" ON public.kanban_colunas;
DROP POLICY IF EXISTS "Admins can manage boards" ON public.kanban_boards;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS "prefixes_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.iceberg_tables DROP CONSTRAINT IF EXISTS iceberg_tables_namespace_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.iceberg_tables DROP CONSTRAINT IF EXISTS iceberg_tables_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.iceberg_namespaces DROP CONSTRAINT IF EXISTS iceberg_namespaces_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_perfis DROP CONSTRAINT IF EXISTS usuarios_perfis_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.titulos_financeiros DROP CONSTRAINT IF EXISTS titulos_financeiros_empresa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.titulos_financeiros DROP CONSTRAINT IF EXISTS titulos_financeiros_conta_financeira_id_fkey;
ALTER TABLE IF EXISTS ONLY public.titulos_financeiros DROP CONSTRAINT IF EXISTS titulos_financeiros_centro_custo_id_fkey;
ALTER TABLE IF EXISTS ONLY public.titulos_financeiros DROP CONSTRAINT IF EXISTS titulos_financeiros_categoria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_proposta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_profissional_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_obra_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_lancamento_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_contrato_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_categoria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_aprovado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.propostas DROP CONSTRAINT IF EXISTS propostas_responsavel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.propostas DROP CONSTRAINT IF EXISTS propostas_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_empresa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pipelines DROP CONSTRAINT IF EXISTS pipelines_entity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obras DROP CONSTRAINT IF EXISTS obras_responsavel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obras DROP CONSTRAINT IF EXISTS obras_contrato_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obras DROP CONSTRAINT IF EXISTS obras_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos DROP CONSTRAINT IF EXISTS lancamentos_titulo_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_titulo_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_obra_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_empresa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_contrato_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_conta_financeira_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_centro_custo_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_categoria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos DROP CONSTRAINT IF EXISTS lancamentos_centro_custo_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos DROP CONSTRAINT IF EXISTS lancamentos_categoria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kanban_colunas DROP CONSTRAINT IF EXISTS kanban_colunas_board_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kanban_cards DROP CONSTRAINT IF EXISTS kanban_cards_responsavel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kanban_cards DROP CONSTRAINT IF EXISTS kanban_cards_entity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kanban_cards DROP CONSTRAINT IF EXISTS kanban_cards_coluna_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contratos DROP CONSTRAINT IF EXISTS contratos_responsavel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contratos DROP CONSTRAINT IF EXISTS contratos_proposta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contratos DROP CONSTRAINT IF EXISTS contratos_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contas_financeiras DROP CONSTRAINT IF EXISTS contas_financeiras_empresa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.centros_custo DROP CONSTRAINT IF EXISTS centros_custo_empresa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assistencias DROP CONSTRAINT IF EXISTS assistencias_responsavel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assistencias DROP CONSTRAINT IF EXISTS assistencias_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
ALTER TABLE IF EXISTS ONLY _realtime.extensions DROP CONSTRAINT IF EXISTS extensions_tenant_external_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS objects_update_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_insert_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP TRIGGER IF EXISTS update_app_config_updated_at ON public.app_config;
DROP TRIGGER IF EXISTS trg_propostas_itens_before_change ON public.propostas;
DROP TRIGGER IF EXISTS trg_propostas_before_insert ON public.propostas;
DROP TRIGGER IF EXISTS trg_proposta_itens_after_change ON public.propostas;
DROP TRIGGER IF EXISTS trg_entities_normalize ON public.entities;
DROP TRIGGER IF EXISTS trg_conta_set_empresa_id ON public.contas_financeiras;
DROP TRIGGER IF EXISTS titulos_financeiros_updated_at ON public.titulos_financeiros;
DROP TRIGGER IF EXISTS tg_lanc_total ON public.lancamentos_financeiros;
DROP TRIGGER IF EXISTS registros_trabalho_updated_at ON public.registros_trabalho;
DROP TRIGGER IF EXISTS registro_categorias_updated_at ON public.registro_categorias;
DROP TRIGGER IF EXISTS propostas_updated_at ON public.propostas;
DROP TRIGGER IF EXISTS propagate_won_opportunity ON public.pipelines;
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS produtos_servicos_updated_at ON public.produtos_servicos;
DROP TRIGGER IF EXISTS on_oportunidade_concluida ON public.pipelines;
DROP TRIGGER IF EXISTS obras_updated_at ON public.obras;
DROP TRIGGER IF EXISTS lancamentos_financeiros_updated_at ON public.lancamentos_financeiros;
DROP TRIGGER IF EXISTS kanban_colunas_set_pos ON public.kanban_colunas;
DROP TRIGGER IF EXISTS kanban_cards_updated_at ON public.kanban_cards;
DROP TRIGGER IF EXISTS fin_txn_defaults ON public.titulos_financeiros;
DROP TRIGGER IF EXISTS fin_txn_compute_amount ON public.titulos_financeiros;
DROP TRIGGER IF EXISTS entities_updated_at ON public.entities;
DROP TRIGGER IF EXISTS empresas_updated_at ON public.empresas;
DROP TRIGGER IF EXISTS contratos_updated_at ON public.contratos;
DROP TRIGGER IF EXISTS contas_financeiras_updated_at ON public.contas_financeiras;
DROP TRIGGER IF EXISTS calculate_valor_venda ON public.propostas;
DROP TRIGGER IF EXISTS calc_quantidade_diaria ON public.lancamentos_financeiros;
DROP TRIGGER IF EXISTS assistencias_updated_at ON public.assistencias;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_request_id_idx;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_h_table_id_h_name_idx;
DROP INDEX IF EXISTS storage.objects_bucket_id_level_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_prefixes_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_name_bucket_level_unique;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.idx_iceberg_tables_namespace_id;
DROP INDEX IF EXISTS storage.idx_iceberg_namespaces_bucket_id;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX IF EXISTS realtime.messages_inserted_at_topic_index;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.idx_usuarios_perfis_user;
DROP INDEX IF EXISTS public.idx_usuarios_perfis_perfil;
DROP INDEX IF EXISTS public.idx_titulos_vencimento;
DROP INDEX IF EXISTS public.idx_titulos_tipo;
DROP INDEX IF EXISTS public.idx_titulos_status;
DROP INDEX IF EXISTS public.idx_titulos_empresa;
DROP INDEX IF EXISTS public.idx_titulos_categoria;
DROP INDEX IF EXISTS public.idx_registros_trabalho_proposta;
DROP INDEX IF EXISTS public.idx_registros_trabalho_profissional;
DROP INDEX IF EXISTS public.idx_registros_trabalho_obra;
DROP INDEX IF EXISTS public.idx_registros_trabalho_lancamento;
DROP INDEX IF EXISTS public.idx_registros_trabalho_data;
DROP INDEX IF EXISTS public.idx_registros_trabalho_dados;
DROP INDEX IF EXISTS public.idx_registros_trabalho_contrato;
DROP INDEX IF EXISTS public.idx_registros_trabalho_cliente;
DROP INDEX IF EXISTS public.idx_registros_trabalho_categoria;
DROP INDEX IF EXISTS public.idx_registros_trabalho_aprovado;
DROP INDEX IF EXISTS public.idx_registro_categorias_nome;
DROP INDEX IF EXISTS public.idx_registro_categorias_ativo;
DROP INDEX IF EXISTS public.idx_propostas_status;
DROP INDEX IF EXISTS public.idx_propostas_responsavel;
DROP INDEX IF EXISTS public.idx_propostas_numero;
DROP INDEX IF EXISTS public.idx_propostas_itens;
DROP INDEX IF EXISTS public.idx_propostas_data_emissao;
DROP INDEX IF EXISTS public.idx_propostas_dados;
DROP INDEX IF EXISTS public.idx_propostas_cliente;
DROP INDEX IF EXISTS public.idx_profiles_email;
DROP INDEX IF EXISTS public.idx_profiles_ativo;
DROP INDEX IF EXISTS public.idx_produtos_servicos_tipo;
DROP INDEX IF EXISTS public.idx_produtos_servicos_nome;
DROP INDEX IF EXISTS public.idx_produtos_servicos_codigo;
DROP INDEX IF EXISTS public.idx_produtos_servicos_categoria;
DROP INDEX IF EXISTS public.idx_produtos_servicos_ativo;
DROP INDEX IF EXISTS public.idx_plano_contas_grupo;
DROP INDEX IF EXISTS public.idx_plano_contas_empresa;
DROP INDEX IF EXISTS public.idx_plano_contas_ativo;
DROP INDEX IF EXISTS public.idx_pipelines_estagio;
DROP INDEX IF EXISTS public.idx_pipelines_entity;
DROP INDEX IF EXISTS public.idx_obras_status;
DROP INDEX IF EXISTS public.idx_obras_responsavel;
DROP INDEX IF EXISTS public.idx_obras_dados;
DROP INDEX IF EXISTS public.idx_obras_contrato;
DROP INDEX IF EXISTS public.idx_obras_codigo;
DROP INDEX IF EXISTS public.idx_obras_cliente;
DROP INDEX IF EXISTS public.idx_lancamentos_titulo;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_vencimento;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_tipo;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_status;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_obra;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_empresa;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_emissao;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_contrato;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_cliente;
DROP INDEX IF EXISTS public.idx_lancamentos_financeiros_categoria;
DROP INDEX IF EXISTS public.idx_lancamentos_data;
DROP INDEX IF EXISTS public.idx_kanban_colunas_posicao;
DROP INDEX IF EXISTS public.idx_kanban_colunas_board;
DROP INDEX IF EXISTS public.idx_kanban_cards_responsavel;
DROP INDEX IF EXISTS public.idx_kanban_cards_entity;
DROP INDEX IF EXISTS public.idx_kanban_cards_dados;
DROP INDEX IF EXISTS public.idx_kanban_cards_coluna;
DROP INDEX IF EXISTS public.idx_kanban_boards_ambiente;
DROP INDEX IF EXISTS public.idx_entities_tipo;
DROP INDEX IF EXISTS public.idx_entities_email;
DROP INDEX IF EXISTS public.idx_entities_dados;
DROP INDEX IF EXISTS public.idx_entities_cpf_cnpj;
DROP INDEX IF EXISTS public.idx_entities_ativo;
DROP INDEX IF EXISTS public.idx_empresas_cnpj;
DROP INDEX IF EXISTS public.idx_empresas_ativo;
DROP INDEX IF EXISTS public.idx_contratos_status;
DROP INDEX IF EXISTS public.idx_contratos_responsavel;
DROP INDEX IF EXISTS public.idx_contratos_proposta;
DROP INDEX IF EXISTS public.idx_contratos_numero;
DROP INDEX IF EXISTS public.idx_contratos_dados;
DROP INDEX IF EXISTS public.idx_contratos_cliente;
DROP INDEX IF EXISTS public.idx_contas_financeiras_empresa;
DROP INDEX IF EXISTS public.idx_centros_custo_empresa;
DROP INDEX IF EXISTS public.idx_centros_custo_ativo;
DROP INDEX IF EXISTS public.idx_assistencias_status;
DROP INDEX IF EXISTS public.idx_assistencias_responsavel;
DROP INDEX IF EXISTS public.idx_assistencias_data;
DROP INDEX IF EXISTS public.idx_assistencias_codigo;
DROP INDEX IF EXISTS public.idx_assistencias_cliente;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
DROP INDEX IF EXISTS _realtime.tenants_external_id_index;
DROP INDEX IF EXISTS _realtime.extensions_tenant_external_id_type_index;
DROP INDEX IF EXISTS _realtime.extensions_tenant_external_id_index;
ALTER TABLE IF EXISTS ONLY supabase_migrations.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY supabase_functions.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY supabase_functions.hooks DROP CONSTRAINT IF EXISTS hooks_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS prefixes_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.iceberg_tables DROP CONSTRAINT IF EXISTS iceberg_tables_pkey;
ALTER TABLE IF EXISTS ONLY storage.iceberg_namespaces DROP CONSTRAINT IF EXISTS iceberg_namespaces_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_11_07 DROP CONSTRAINT IF EXISTS messages_2025_11_07_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_11_06 DROP CONSTRAINT IF EXISTS messages_2025_11_06_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_11_05 DROP CONSTRAINT IF EXISTS messages_2025_11_05_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_11_04 DROP CONSTRAINT IF EXISTS messages_2025_11_04_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_11_03 DROP CONSTRAINT IF EXISTS messages_2025_11_03_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_perfis DROP CONSTRAINT IF EXISTS usuarios_perfis_pkey;
ALTER TABLE IF EXISTS ONLY public.titulos_financeiros DROP CONSTRAINT IF EXISTS titulos_financeiros_pkey;
ALTER TABLE IF EXISTS ONLY public.registros_trabalho DROP CONSTRAINT IF EXISTS registros_trabalho_pkey;
ALTER TABLE IF EXISTS ONLY public.registro_categorias DROP CONSTRAINT IF EXISTS registro_categorias_pkey;
ALTER TABLE IF EXISTS ONLY public.registro_categorias DROP CONSTRAINT IF EXISTS registro_categorias_nome_key;
ALTER TABLE IF EXISTS ONLY public.propostas DROP CONSTRAINT IF EXISTS propostas_pkey;
ALTER TABLE IF EXISTS ONLY public.propostas DROP CONSTRAINT IF EXISTS propostas_numero_key;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE IF EXISTS ONLY public.produtos_servicos DROP CONSTRAINT IF EXISTS produtos_servicos_pkey;
ALTER TABLE IF EXISTS ONLY public.produtos_servicos DROP CONSTRAINT IF EXISTS produtos_servicos_nome_key;
ALTER TABLE IF EXISTS ONLY public.produtos_servicos DROP CONSTRAINT IF EXISTS produtos_servicos_codigo_interno_key;
ALTER TABLE IF EXISTS ONLY public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_pkey;
ALTER TABLE IF EXISTS ONLY public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_codigo_key;
ALTER TABLE IF EXISTS ONLY public.pipelines DROP CONSTRAINT IF EXISTS pipelines_pkey;
ALTER TABLE IF EXISTS ONLY public.obras DROP CONSTRAINT IF EXISTS obras_pkey;
ALTER TABLE IF EXISTS ONLY public.obras DROP CONSTRAINT IF EXISTS obras_codigo_key;
ALTER TABLE IF EXISTS ONLY public.lancamentos DROP CONSTRAINT IF EXISTS lancamentos_pkey;
ALTER TABLE IF EXISTS ONLY public.lancamentos_financeiros DROP CONSTRAINT IF EXISTS lancamentos_financeiros_pkey;
ALTER TABLE IF EXISTS ONLY public.kanban_colunas DROP CONSTRAINT IF EXISTS kanban_colunas_pkey;
ALTER TABLE IF EXISTS ONLY public.kanban_colunas DROP CONSTRAINT IF EXISTS kanban_colunas_board_id_posicao_key;
ALTER TABLE IF EXISTS ONLY public.kanban_cards DROP CONSTRAINT IF EXISTS kanban_cards_pkey;
ALTER TABLE IF EXISTS ONLY public.kanban_boards DROP CONSTRAINT IF EXISTS kanban_boards_pkey;
ALTER TABLE IF EXISTS ONLY public.kanban_boards DROP CONSTRAINT IF EXISTS kanban_boards_ambiente_key;
ALTER TABLE IF EXISTS ONLY public.entities DROP CONSTRAINT IF EXISTS entities_pkey;
ALTER TABLE IF EXISTS ONLY public.empresas DROP CONSTRAINT IF EXISTS empresas_pkey;
ALTER TABLE IF EXISTS ONLY public.empresas DROP CONSTRAINT IF EXISTS empresas_cnpj_key;
ALTER TABLE IF EXISTS ONLY public.contratos DROP CONSTRAINT IF EXISTS contratos_pkey;
ALTER TABLE IF EXISTS ONLY public.contratos DROP CONSTRAINT IF EXISTS contratos_numero_key;
ALTER TABLE IF EXISTS ONLY public.contas_financeiras DROP CONSTRAINT IF EXISTS contas_financeiras_pkey;
ALTER TABLE IF EXISTS ONLY public.centros_custo DROP CONSTRAINT IF EXISTS centros_custo_pkey;
ALTER TABLE IF EXISTS ONLY public.centros_custo DROP CONSTRAINT IF EXISTS centros_custo_codigo_key;
ALTER TABLE IF EXISTS ONLY public.assistencias DROP CONSTRAINT IF EXISTS assistencias_pkey;
ALTER TABLE IF EXISTS ONLY public.assistencias DROP CONSTRAINT IF EXISTS assistencias_codigo_key;
ALTER TABLE IF EXISTS ONLY public.app_config DROP CONSTRAINT IF EXISTS app_config_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS ONLY _realtime.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY _realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY _realtime.extensions DROP CONSTRAINT IF EXISTS extensions_pkey;
ALTER TABLE IF EXISTS supabase_functions.hooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS supabase_migrations.schema_migrations;
DROP TABLE IF EXISTS supabase_functions.migrations;
DROP SEQUENCE IF EXISTS supabase_functions.hooks_id_seq;
DROP TABLE IF EXISTS supabase_functions.hooks;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.prefixes;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.iceberg_tables;
DROP TABLE IF EXISTS storage.iceberg_namespaces;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages_2025_11_07;
DROP TABLE IF EXISTS realtime.messages_2025_11_06;
DROP TABLE IF EXISTS realtime.messages_2025_11_05;
DROP TABLE IF EXISTS realtime.messages_2025_11_04;
DROP TABLE IF EXISTS realtime.messages_2025_11_03;
DROP TABLE IF EXISTS realtime.messages;
DROP VIEW IF EXISTS public.vw_titulos_resumo;
DROP VIEW IF EXISTS public.vw_pipeline_oportunidades;
DROP VIEW IF EXISTS public.vw_oportunidades_completas;
DROP VIEW IF EXISTS public.v_top10_clientes_receita;
DROP VIEW IF EXISTS public.v_registros_trabalho;
DROP VIEW IF EXISTS public.v_obras_status;
DROP VIEW IF EXISTS public.v_kanban_cards_board;
DROP VIEW IF EXISTS public.v_fluxo_caixa;
DROP VIEW IF EXISTS public.v_despesas_mes_categoria;
DROP VIEW IF EXISTS public.v_clientes_ativos_contratos;
DROP TABLE IF EXISTS public.usuarios_perfis;
DROP TABLE IF EXISTS public.titulos_financeiros;
DROP TABLE IF EXISTS public.registros_trabalho;
DROP TABLE IF EXISTS public.registro_categorias;
DROP TABLE IF EXISTS public.propostas;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.produtos_servicos;
DROP TABLE IF EXISTS public.plano_contas;
DROP TABLE IF EXISTS public.pipelines;
DROP TABLE IF EXISTS public.obras;
DROP TABLE IF EXISTS public.lancamentos_financeiros;
DROP TABLE IF EXISTS public.lancamentos;
DROP TABLE IF EXISTS public.kanban_colunas;
DROP TABLE IF EXISTS public.kanban_cards;
DROP TABLE IF EXISTS public.kanban_boards;
DROP TABLE IF EXISTS public.entities;
DROP TABLE IF EXISTS public.empresas;
DROP TABLE IF EXISTS public.contratos;
DROP TABLE IF EXISTS public.contas_financeiras;
DROP TABLE IF EXISTS public.centros_custo;
DROP TABLE IF EXISTS public.assistencias;
DROP TABLE IF EXISTS public.app_config;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP TABLE IF EXISTS _realtime.tenants;
DROP TABLE IF EXISTS _realtime.schema_migrations;
DROP TABLE IF EXISTS _realtime.extensions;
DROP FUNCTION IF EXISTS supabase_functions.http_request();
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION IF EXISTS storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.prefixes_insert_trigger();
DROP FUNCTION IF EXISTS storage.prefixes_delete_cleanup();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.objects_update_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_level_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_cleanup();
DROP FUNCTION IF EXISTS storage.objects_insert_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_delete_cleanup();
DROP FUNCTION IF EXISTS storage.lock_top_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_prefixes(name text);
DROP FUNCTION IF EXISTS storage.get_prefix(name text);
DROP FUNCTION IF EXISTS storage.get_level(name text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION IF EXISTS storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS storage.delete_leaf_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.trigger_propostas_itens_before_change();
DROP FUNCTION IF EXISTS public.trigger_propostas_before_insert();
DROP FUNCTION IF EXISTS public.trigger_proposta_itens_after_change();
DROP FUNCTION IF EXISTS public.trigger_propagate_won_opportunity();
DROP FUNCTION IF EXISTS public.trigger_on_oportunidade_concluida();
DROP FUNCTION IF EXISTS public.trigger_lanc_total();
DROP FUNCTION IF EXISTS public.trigger_kanban_colunas_set_pos();
DROP FUNCTION IF EXISTS public.trigger_fin_txn_defaults();
DROP FUNCTION IF EXISTS public.trigger_fin_txn_compute_amount();
DROP FUNCTION IF EXISTS public.trigger_entities_normalize();
DROP FUNCTION IF EXISTS public.trigger_conta_set_empresa_id();
DROP FUNCTION IF EXISTS public.trigger_calculate_valor_venda();
DROP FUNCTION IF EXISTS public.trigger_calc_quantidade_diaria();
DROP FUNCTION IF EXISTS public.system_health_check();
DROP FUNCTION IF EXISTS public.reorder_cards(p_modulo text, p_stage_id uuid);
DROP FUNCTION IF EXISTS public.recompute_invoice_status(p_invoice_id uuid);
DROP FUNCTION IF EXISTS public.recalc_proposta_total(p_proposta_id uuid);
DROP FUNCTION IF EXISTS public.purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb);
DROP FUNCTION IF EXISTS public.proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer);
DROP FUNCTION IF EXISTS public.only_digits(text);
DROP FUNCTION IF EXISTS public.kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer);
DROP FUNCTION IF EXISTS public.kanban_get_board_status(p_modulo text);
DROP FUNCTION IF EXISTS public.kanban_ensure_board(p_modulo text);
DROP FUNCTION IF EXISTS public.is_local_environment();
DROP FUNCTION IF EXISTS public.is_cpf_valid(doc text);
DROP FUNCTION IF EXISTS public.is_cpf_cnpj_valid(doc text);
DROP FUNCTION IF EXISTS public.is_cnpj_valid(doc text);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.has_role(p_role text);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_party_org_id(p_party_id uuid);
DROP FUNCTION IF EXISTS public.get_jwt_claim(claim_name text);
DROP FUNCTION IF EXISTS public.get_finance_dashboard_data(p_empresa_id uuid);
DROP FUNCTION IF EXISTS public.get_environment();
DROP FUNCTION IF EXISTS public.get_category_org_id(p_category_id uuid);
DROP FUNCTION IF EXISTS public.get_api_url();
DROP FUNCTION IF EXISTS public.get_account_org_id(p_account_id uuid);
DROP FUNCTION IF EXISTS public.generate_item_code(p_category text);
DROP FUNCTION IF EXISTS public.format_phone_br(digits text);
DROP FUNCTION IF EXISTS public.format_cpf(digits text);
DROP FUNCTION IF EXISTS public.format_cnpj(digits text);
DROP FUNCTION IF EXISTS public.format_cep_br(digits text);
DROP FUNCTION IF EXISTS public.fn_dre(p_org uuid, p_d1 date, p_d2 date);
DROP FUNCTION IF EXISTS public.fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date);
DROP FUNCTION IF EXISTS public.finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid);
DROP FUNCTION IF EXISTS public.fin_txn_soft_delete(p_id uuid);
DROP FUNCTION IF EXISTS public.fin_txn_duplicate(p_id uuid);
DROP FUNCTION IF EXISTS public.fin_card_soft_delete(p_id uuid);
DROP FUNCTION IF EXISTS public.ensure_pipeline(p_modulo text, p_nome text, p_stages text[]);
DROP FUNCTION IF EXISTS public.ensure_default_pipelines();
DROP FUNCTION IF EXISTS public.current_user_role();
DROP FUNCTION IF EXISTS public.current_user_id();
DROP FUNCTION IF EXISTS public.current_user_email();
DROP FUNCTION IF EXISTS public.current_org();
DROP FUNCTION IF EXISTS public.current_empresa_id();
DROP FUNCTION IF EXISTS public.cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid);
DROP FUNCTION IF EXISTS public.cronograma_reordenar_tarefas(p_board_id uuid);
DROP FUNCTION IF EXISTS public.cleanup_old_data(p_days_to_keep integer);
DROP FUNCTION IF EXISTS public._ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text);
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS unaccent;
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_trgm;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS supabase_migrations;
DROP SCHEMA IF EXISTS supabase_functions;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
DROP SCHEMA IF EXISTS pgbouncer;
DROP EXTENSION IF EXISTS pg_net;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
DROP SCHEMA IF EXISTS _realtime;
--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'Módulo de trigrama para busca por similaridade de texto';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'Dicionário de remoção de acentos para busca de texto';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: _ensure_coluna(uuid, text, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text DEFAULT '#94a3b8'::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public._ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text) OWNER TO postgres;

--
-- Name: FUNCTION _ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public._ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text) IS 'Cria ou atualiza uma coluna no board especificado (função auxiliar interna)';


--
-- Name: cleanup_old_data(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_old_data(p_days_to_keep integer DEFAULT 90) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.cleanup_old_data(p_days_to_keep integer) OWNER TO postgres;

--
-- Name: FUNCTION cleanup_old_data(p_days_to_keep integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.cleanup_old_data(p_days_to_keep integer) IS 'Remove dados antigos cancelados/arquivados para manutenção do banco (usar com cuidado)';


--
-- Name: cronograma_reordenar_tarefas(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cronograma_reordenar_tarefas(p_board_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_card RECORD;
    v_posicao integer;
    v_coluna_atual uuid;
BEGIN
    RAISE NOTICE 'cronograma_reordenar_tarefas - Board: %', p_board_id;

    v_coluna_atual := NULL;
    v_posicao := 0;

    -- Reordenar cards por coluna e posição
    FOR v_card IN
        SELECT kc.id, kc.coluna_id
        FROM kanban_cards kc
        INNER JOIN kanban_colunas col ON col.id = kc.coluna_id
        WHERE col.board_id = p_board_id
            AND kc.dados->>'tipo' = 'cronograma_tarefa'
        ORDER BY col.posicao, kc.posicao, kc.created_at
    LOOP
        -- Reset contador ao mudar de coluna
        IF v_coluna_atual IS DISTINCT FROM v_card.coluna_id THEN
            v_coluna_atual := v_card.coluna_id;
            v_posicao := 0;
        END IF;

        v_posicao := v_posicao + 10;

        UPDATE kanban_cards
        SET posicao = v_posicao
        WHERE id = v_card.id;
    END LOOP;

    RAISE NOTICE 'Tarefas do cronograma reordenadas';

END;
$$;


ALTER FUNCTION public.cronograma_reordenar_tarefas(p_board_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION cronograma_reordenar_tarefas(p_board_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.cronograma_reordenar_tarefas(p_board_id uuid) IS 'Reordena tarefas do cronograma (cards marcados como tipo cronograma_tarefa no kanban)';


--
-- Name: cronograma_seed_from_proposta(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
    v_proposta RECORD;
    v_itens jsonb;
    v_item jsonb;
    v_cards_criados integer := 0;
    v_coluna_id uuid;
BEGIN
    RAISE NOTICE 'cronograma_seed_from_proposta - Proposta: %', p_proposta_id;

    -- Buscar proposta
    SELECT * INTO v_proposta
    FROM propostas
    WHERE id = p_proposta_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;
    END IF;

    -- Buscar primeira coluna do board (A Fazer)
    SELECT id INTO v_coluna_id
    FROM kanban_colunas
    WHERE board_id = p_cronograma_id
    ORDER BY posicao
    LIMIT 1;

    IF NOT FOUND THEN
        -- Criar coluna padrão se não existir
        INSERT INTO kanban_colunas (board_id, titulo, posicao, cor)
        VALUES (p_cronograma_id, 'A Executar', 1, '#94a3b8')
        RETURNING id INTO v_coluna_id;
    END IF;

    -- Processar itens da proposta
    v_itens := v_proposta.itens;

    IF v_itens IS NOT NULL AND jsonb_array_length(v_itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_itens)
        LOOP
            -- Criar card para cada item
            INSERT INTO kanban_cards (
                coluna_id,
                titulo,
                descricao,
                valor,
                entity_id,
                posicao,
                dados
            ) VALUES (
                v_coluna_id,
                COALESCE(v_item->>'descricao', 'Item da proposta'),
                'Quantidade: ' || COALESCE(v_item->>'quantidade', '1') ||
                ' - Valor Unit.: R$ ' || COALESCE(v_item->>'valor_unitario', '0'),
                COALESCE(
                    (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                    0
                ),
                v_proposta.cliente_id,
                (v_cards_criados + 1) * 10,
                jsonb_build_object(
                    'proposta_id', p_proposta_id,
                    'proposta_numero', v_proposta.numero,
                    'item_original', v_item,
                    'tipo', 'cronograma_tarefa'
                )
            );

            v_cards_criados := v_cards_criados + 1;
        END LOOP;
    END IF;

    RAISE NOTICE 'Cronograma criado com % tarefas/cards', v_cards_criados;
    RETURN v_cards_criados;

END;
$_$;


ALTER FUNCTION public.cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid) IS 'Cria cards no kanban (cronograma) baseado nos itens de uma proposta. Adaptado para usar kanban_cards em vez de tabela cronograma';


--
-- Name: current_empresa_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_empresa_id() RETURNS uuid
    LANGUAGE plpgsql STABLE
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


ALTER FUNCTION public.current_empresa_id() OWNER TO postgres;

--
-- Name: FUNCTION current_empresa_id(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.current_empresa_id() IS 'Retorna o UUID da empresa do usuário autenticado';


--
-- Name: current_org(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_org() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.current_org() OWNER TO postgres;

--
-- Name: FUNCTION current_org(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.current_org() IS 'Retorna o UUID da empresa/organização atual do contexto, criando uma padrão se necessário';


--
-- Name: current_user_email(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_user_email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
    SELECT auth.jwt()->>'email';
$$;


ALTER FUNCTION public.current_user_email() OWNER TO postgres;

--
-- Name: FUNCTION current_user_email(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.current_user_email() IS 'Retorna o email do usuário autenticado';


--
-- Name: current_user_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_user_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
    SELECT auth.uid();
$$;


ALTER FUNCTION public.current_user_id() OWNER TO postgres;

--
-- Name: FUNCTION current_user_id(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.current_user_id() IS 'Retorna o UUID do usuário autenticado';


--
-- Name: current_user_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_user_role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
    SELECT auth.role();
$$;


ALTER FUNCTION public.current_user_role() OWNER TO postgres;

--
-- Name: FUNCTION current_user_role(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.current_user_role() IS 'Retorna o role do usuário autenticado';


--
-- Name: ensure_default_pipelines(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ensure_default_pipelines() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.ensure_default_pipelines() OWNER TO postgres;

--
-- Name: FUNCTION ensure_default_pipelines(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.ensure_default_pipelines() IS 'Cria os pipelines padrão do sistema (vendas, projetos, suporte, marketing)';


--
-- Name: ensure_pipeline(text, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ensure_pipeline(p_modulo text, p_nome text, p_stages text[] DEFAULT ARRAY['Prospecção'::text, 'Qualificação'::text, 'Proposta'::text, 'Negociação'::text, 'Fechamento'::text]) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.ensure_pipeline(p_modulo text, p_nome text, p_stages text[]) OWNER TO postgres;

--
-- Name: FUNCTION ensure_pipeline(p_modulo text, p_nome text, p_stages text[]); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.ensure_pipeline(p_modulo text, p_nome text, p_stages text[]) IS 'Garante que um pipeline existe com os estágios especificados, criando se necessário';


--
-- Name: fin_card_soft_delete(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fin_card_soft_delete(p_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.fin_card_soft_delete(p_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION fin_card_soft_delete(p_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fin_card_soft_delete(p_id uuid) IS 'Desativa uma conta financeira (soft delete), alerta se houver saldo';


--
-- Name: fin_txn_duplicate(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fin_txn_duplicate(p_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.fin_txn_duplicate(p_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION fin_txn_duplicate(p_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fin_txn_duplicate(p_id uuid) IS 'Duplica uma transação financeira, útil para títulos recorrentes';


--
-- Name: fin_txn_soft_delete(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fin_txn_soft_delete(p_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.fin_txn_soft_delete(p_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION fin_txn_soft_delete(p_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fin_txn_soft_delete(p_id uuid) IS 'Cancela uma transação financeira (soft delete), não permite cancelar títulos já pagos';


--
-- Name: finance_report(date, date, text, text, uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finance_report(p_data_ini date DEFAULT NULL::date, p_data_fim date DEFAULT NULL::date, p_tipo text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_categoria_id uuid DEFAULT NULL::uuid, p_empresa_id uuid DEFAULT NULL::uuid, p_conta_id uuid DEFAULT NULL::uuid) RETURNS TABLE(titulo text, tipo text, categoria text, valor numeric, data_vencimento date, data_pagamento date, status text, fornecedor_cliente text, conta_financeira text, dias_atraso integer, observacao text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid) IS 'Relatório financeiro completo com filtros avançados por período, tipo, status, categoria, empresa e conta financeira';


--
-- Name: fn_cashflow_daily(uuid, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_cashflow_daily(p_org uuid DEFAULT NULL::uuid, p_d1 date DEFAULT ((CURRENT_DATE - '30 days'::interval))::date, p_d2 date DEFAULT ((CURRENT_DATE + '30 days'::interval))::date) RETURNS TABLE(dia date, entradas numeric, saidas numeric, saldo_dia numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date) OWNER TO postgres;

--
-- Name: FUNCTION fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date) IS 'Retorna o fluxo de caixa diário com entradas, saídas e saldo acumulado por dia';


--
-- Name: fn_dre(uuid, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_dre(p_org uuid DEFAULT NULL::uuid, p_d1 date DEFAULT (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))::date, p_d2 date DEFAULT (((date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) + '1 mon'::interval) - '1 day'::interval))::date) RETURNS TABLE(total_receitas numeric, total_despesas numeric, resultado numeric, margem_lucro numeric, qtd_receitas integer, qtd_despesas integer, ticket_medio_receitas numeric, ticket_medio_despesas numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.fn_dre(p_org uuid, p_d1 date, p_d2 date) OWNER TO postgres;

--
-- Name: FUNCTION fn_dre(p_org uuid, p_d1 date, p_d2 date); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fn_dre(p_org uuid, p_d1 date, p_d2 date) IS 'Demonstrativo de Resultado do Exercício com métricas de receitas, despesas e margens';


--
-- Name: format_cep_br(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.format_cep_br(digits text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
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


ALTER FUNCTION public.format_cep_br(digits text) OWNER TO postgres;

--
-- Name: FUNCTION format_cep_br(digits text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.format_cep_br(digits text) IS 'Formata CEP brasileiro: 12345-678';


--
-- Name: format_cnpj(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.format_cnpj(digits text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
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


ALTER FUNCTION public.format_cnpj(digits text) OWNER TO postgres;

--
-- Name: FUNCTION format_cnpj(digits text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.format_cnpj(digits text) IS 'Formata CNPJ brasileiro: 12.345.678/0001-90';


--
-- Name: format_cpf(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.format_cpf(digits text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
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


ALTER FUNCTION public.format_cpf(digits text) OWNER TO postgres;

--
-- Name: FUNCTION format_cpf(digits text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.format_cpf(digits text) IS 'Formata CPF brasileiro: 123.456.789-00';


--
-- Name: format_phone_br(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.format_phone_br(digits text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
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


ALTER FUNCTION public.format_phone_br(digits text) OWNER TO postgres;

--
-- Name: FUNCTION format_phone_br(digits text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.format_phone_br(digits text) IS 'Formata telefone brasileiro: (11) 98765-4321';


--
-- Name: generate_item_code(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_item_code(p_category text DEFAULT 'GERAL'::text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.generate_item_code(p_category text) OWNER TO postgres;

--
-- Name: FUNCTION generate_item_code(p_category text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.generate_item_code(p_category text) IS 'Gera código único para itens baseado na categoria (PRD-20251103-0001)';


--
-- Name: get_account_org_id(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_account_org_id(p_account_id uuid) RETURNS uuid
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.get_account_org_id(p_account_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION get_account_org_id(p_account_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_account_org_id(p_account_id uuid) IS 'Retorna o ID da empresa/organização de uma conta financeira';


--
-- Name: get_api_url(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_api_url() RETURNS text
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_api_url text;
BEGIN
    -- Buscar URL da tabela de configuração
    SELECT value INTO v_api_url
    FROM app_config
    WHERE key = 'api_url';

    -- Se não encontrou, retornar LIVE como fallback
    IF v_api_url IS NULL THEN
        v_api_url := 'https://vyxscnevgeubfgfstmtf.supabase.co';
    END IF;

    RETURN v_api_url;

EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar LIVE como fallback seguro
        RAISE LOG 'Erro em get_api_url: %', SQLERRM;
        RETURN 'https://vyxscnevgeubfgfstmtf.supabase.co';
END;
$$;


ALTER FUNCTION public.get_api_url() OWNER TO postgres;

--
-- Name: FUNCTION get_api_url(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_api_url() IS 'Retorna URL da API Supabase baseado no ambiente (local ou live). Usada em Edge Functions para deploy sem preocupação.';


--
-- Name: get_category_org_id(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_category_org_id(p_category_id uuid) RETURNS uuid
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.get_category_org_id(p_category_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION get_category_org_id(p_category_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_category_org_id(p_category_id uuid) IS 'Retorna o ID da empresa/organização de uma categoria';


--
-- Name: get_environment(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_environment() RETURNS text
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_environment text;
BEGIN
    SELECT value INTO v_environment
    FROM app_config
    WHERE key = 'environment';

    -- Default: live
    IF v_environment IS NULL THEN
        v_environment := 'live';
    END IF;

    RETURN v_environment;

EXCEPTION
    WHEN OTHERS THEN
        RETURN 'live';
END;
$$;


ALTER FUNCTION public.get_environment() OWNER TO postgres;

--
-- Name: FUNCTION get_environment(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_environment() IS 'Retorna ambiente atual: local ou live';


--
-- Name: get_finance_dashboard_data(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_finance_dashboard_data(p_empresa_id uuid DEFAULT NULL::uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.get_finance_dashboard_data(p_empresa_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION get_finance_dashboard_data(p_empresa_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_finance_dashboard_data(p_empresa_id uuid) IS 'Retorna dados agregados para dashboard financeiro incluindo receitas, despesas, saldos e alertas';


--
-- Name: get_jwt_claim(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_jwt_claim(claim_name text) RETURNS text
    LANGUAGE sql STABLE
    AS $$
    SELECT auth.jwt()->>claim_name;
$$;


ALTER FUNCTION public.get_jwt_claim(claim_name text) OWNER TO postgres;

--
-- Name: FUNCTION get_jwt_claim(claim_name text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_jwt_claim(claim_name text) IS 'Extrai valor de um claim específico do JWT';


--
-- Name: get_party_org_id(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_party_org_id(p_party_id uuid) RETURNS uuid
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.get_party_org_id(p_party_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION get_party_org_id(p_party_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_party_org_id(p_party_id uuid) IS 'Retorna o ID da empresa/organização de uma entidade (cliente, fornecedor, etc)';


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: FUNCTION handle_new_user(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria profile automaticamente quando usuário se cadastra';


--
-- Name: has_role(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_role(p_role text) RETURNS boolean
    LANGUAGE plpgsql STABLE
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


ALTER FUNCTION public.has_role(p_role text) OWNER TO postgres;

--
-- Name: FUNCTION has_role(p_role text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.has_role(p_role text) IS 'Verifica se usuário tem determinado cargo ou é admin';


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    SELECT has_role('admin');
$$;


ALTER FUNCTION public.is_admin() OWNER TO postgres;

--
-- Name: FUNCTION is_admin(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.is_admin() IS 'Verifica se usuário é admin';


--
-- Name: is_cnpj_valid(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_cnpj_valid(doc text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
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


ALTER FUNCTION public.is_cnpj_valid(doc text) OWNER TO postgres;

--
-- Name: FUNCTION is_cnpj_valid(doc text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.is_cnpj_valid(doc text) IS 'Valida CNPJ brasileiro (14 dígitos)';


--
-- Name: is_cpf_cnpj_valid(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_cpf_cnpj_valid(doc text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
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


ALTER FUNCTION public.is_cpf_cnpj_valid(doc text) OWNER TO postgres;

--
-- Name: FUNCTION is_cpf_cnpj_valid(doc text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.is_cpf_cnpj_valid(doc text) IS 'Valida CPF ou CNPJ automaticamente baseado no tamanho';


--
-- Name: is_cpf_valid(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_cpf_valid(doc text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
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


ALTER FUNCTION public.is_cpf_valid(doc text) OWNER TO postgres;

--
-- Name: FUNCTION is_cpf_valid(doc text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.is_cpf_valid(doc text) IS 'Valida CPF brasileiro (11 dígitos)';


--
-- Name: is_local_environment(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_local_environment() RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN (SELECT get_environment() = 'local');
END;
$$;


ALTER FUNCTION public.is_local_environment() OWNER TO postgres;

--
-- Name: FUNCTION is_local_environment(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.is_local_environment() IS 'Retorna true se ambiente é local, false se live';


--
-- Name: kanban_ensure_board(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kanban_ensure_board(p_modulo text) RETURNS bigint
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.kanban_ensure_board(p_modulo text) OWNER TO postgres;

--
-- Name: FUNCTION kanban_ensure_board(p_modulo text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.kanban_ensure_board(p_modulo text) IS 'Garante que um board existe para o módulo especificado, cria se necessário com colunas padrão';


--
-- Name: kanban_get_board_status(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kanban_get_board_status(p_modulo text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.kanban_get_board_status(p_modulo text) OWNER TO postgres;

--
-- Name: FUNCTION kanban_get_board_status(p_modulo text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.kanban_get_board_status(p_modulo text) IS 'Retorna estatísticas e status completo de um board kanban';


--
-- Name: kanban_move_card(uuid, uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer DEFAULT NULL::integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer) OWNER TO postgres;

--
-- Name: FUNCTION kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer) IS 'Move um card entre colunas do kanban, reordenando automaticamente as posições';


--
-- Name: only_digits(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.only_digits(text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
BEGIN
    RETURN regexp_replace($1, '[^0-9]', '', 'g');
END;
$_$;


ALTER FUNCTION public.only_digits(text) OWNER TO postgres;

--
-- Name: FUNCTION only_digits(text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.only_digits(text) IS 'Remove caracteres não numéricos de uma string';


--
-- Name: proposta_gerar_titulos(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer DEFAULT 1) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_proposta RECORD;
    v_valor_parcela numeric;
    v_data_base date;
    v_titulos_criados integer := 0;
    i integer;
BEGIN
    RAISE NOTICE 'proposta_gerar_titulos - Proposta: %, Parcelas: %', p_proposta_id, p_parcelas;

    -- Buscar proposta
    SELECT * INTO v_proposta
    FROM propostas
    WHERE id = p_proposta_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;
    END IF;

    IF v_proposta.valor_total <= 0 THEN
        RAISE EXCEPTION 'Proposta sem valor total definido';
    END IF;

    -- Calcular valor da parcela
    v_valor_parcela := ROUND(v_proposta.valor_total / p_parcelas, 2);
    v_data_base := COALESCE(v_proposta.data_emissao, CURRENT_DATE);

    -- Criar títulos
    FOR i IN 1..p_parcelas LOOP
        INSERT INTO titulos_financeiros (
            empresa_id,
            tipo,
            descricao,
            valor,
            data_emissao,
            data_vencimento,
            status,
            documento,
            fornecedor_cliente
        ) VALUES (
            (SELECT empresa_id FROM entities WHERE id = v_proposta.cliente_id),
            'Receber',
            v_proposta.titulo || ' - Parcela ' || i || '/' || p_parcelas,
            CASE
                WHEN i = p_parcelas
                THEN v_proposta.valor_total - (v_valor_parcela * (p_parcelas - 1)) -- Ajustar última parcela
                ELSE v_valor_parcela
            END,
            v_data_base,
            v_data_base + (30 * i || ' days')::interval,
            'Previsto',
            v_proposta.numero,
            (SELECT nome FROM entities WHERE id = v_proposta.cliente_id)
        );

        v_titulos_criados := v_titulos_criados + 1;
    END LOOP;

    -- Atualizar status da proposta
    UPDATE propostas
    SET
        status = 'aprovada',
        dados = dados || jsonb_build_object(
            'titulos_gerados', v_titulos_criados,
            'titulos_gerados_em', NOW(),
            'parcelas', p_parcelas
        ),
        updated_at = NOW()
    WHERE id = p_proposta_id;

    RAISE NOTICE '% títulos financeiros criados para a proposta %', v_titulos_criados, v_proposta.numero;
    RETURN v_titulos_criados;

END;
$$;


ALTER FUNCTION public.proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer) OWNER TO postgres;

--
-- Name: FUNCTION proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer) IS 'Gera títulos financeiros (contas a receber) a partir de uma proposta aprovada, com opção de parcelamento';


--
-- Name: purchase_order_create(uuid, uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text DEFAULT 'pendente'::text, p_itens jsonb DEFAULT '[]'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
    v_ordem_id uuid;
    v_numero text;
    v_total numeric := 0;
    v_item jsonb;
BEGIN
    RAISE NOTICE 'purchase_order_create - Entity: %, Fornecedor: %', p_entity_id, p_fornecedor_id;

    -- Gerar número único
    v_numero := 'OC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
        LPAD(NEXTVAL('pg_catalog.pg_dist_node_group_id_seq')::text, 4, '0');

    -- Calcular total dos itens
    IF p_itens IS NOT NULL AND jsonb_array_length(p_itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
        LOOP
            v_total := v_total + COALESCE(
                (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                0
            );
        END LOOP;
    END IF;

    -- Criar nova proposta como ordem de compra
    INSERT INTO propostas (
        numero,
        cliente_id,
        titulo,
        descricao,
        valor_total,
        status,
        tipo,
        itens,
        dados,
        data_emissao
    ) VALUES (
        v_numero,
        p_entity_id,
        'Ordem de Compra - ' || v_numero,
        'Pedido de compra para fornecedor',
        v_total,
        p_status,
        'ordem_compra',
        p_itens,
        jsonb_build_object(
            'fornecedor_id', p_fornecedor_id,
            'tipo_documento', 'ordem_compra',
            'criado_por', auth.uid(),
            'criado_em', NOW()
        ),
        CURRENT_DATE
    )
    RETURNING id INTO v_ordem_id;

    RAISE NOTICE 'Ordem de compra criada: % (Total: R$ %)', v_numero, v_total;
    RETURN v_ordem_id;

END;
$_$;


ALTER FUNCTION public.purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb) OWNER TO postgres;

--
-- Name: FUNCTION purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb) IS 'Cria uma ordem de compra (pedido de compra) com itens e fornecedor';


--
-- Name: recalc_proposta_total(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalc_proposta_total(p_proposta_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
    v_total numeric := 0;
    v_itens jsonb;
    v_item jsonb;
BEGIN
    RAISE NOTICE 'recalc_proposta_total - Recalculando proposta: %', p_proposta_id;

    -- Obter itens da proposta
    SELECT itens INTO v_itens
    FROM propostas
    WHERE id = p_proposta_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;
    END IF;

    -- Calcular total dos itens
    IF v_itens IS NOT NULL AND jsonb_array_length(v_itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_itens)
        LOOP
            -- Somar: quantidade * valor_unitario
            v_total := v_total + COALESCE(
                (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                0
            );
        END LOOP;
    END IF;

    -- Atualizar total na proposta
    UPDATE propostas
    SET
        valor_total = v_total,
        updated_at = NOW()
    WHERE id = p_proposta_id;

    RAISE NOTICE 'Total recalculado: R$ %', v_total;

END;
$_$;


ALTER FUNCTION public.recalc_proposta_total(p_proposta_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION recalc_proposta_total(p_proposta_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.recalc_proposta_total(p_proposta_id uuid) IS 'Recalcula o valor total da proposta baseado nos itens (campo JSONB)';


--
-- Name: recompute_invoice_status(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recompute_invoice_status(p_invoice_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_proposta RECORD;
    v_titulos_pagos integer;
    v_titulos_total integer;
    v_novo_status text;
BEGIN
    RAISE NOTICE 'recompute_invoice_status - Invoice: %', p_invoice_id;

    -- Buscar proposta/invoice
    SELECT * INTO v_proposta
    FROM propostas
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice/Proposta não encontrada: %', p_invoice_id;
    END IF;

    -- Contar títulos relacionados (buscar no campo dados->invoice_id ou documento)
    SELECT
        COUNT(*) FILTER (WHERE status = 'Pago'),
        COUNT(*)
    INTO v_titulos_pagos, v_titulos_total
    FROM titulos_financeiros
    WHERE documento = v_proposta.numero
        OR (dados->>'invoice_id')::uuid = p_invoice_id;

    -- Determinar novo status
    IF v_titulos_total = 0 THEN
        v_novo_status := 'pendente';
    ELSIF v_titulos_pagos = 0 THEN
        v_novo_status := 'em_aberto';
    ELSIF v_titulos_pagos < v_titulos_total THEN
        v_novo_status := 'parcialmente_pago';
    ELSE
        v_novo_status := 'pago';
    END IF;

    -- Atualizar status se mudou
    IF v_proposta.status IS DISTINCT FROM v_novo_status THEN
        UPDATE propostas
        SET
            status = v_novo_status,
            updated_at = NOW(),
            dados = dados || jsonb_build_object(
                'status_atualizado_em', NOW(),
                'titulos_pagos', v_titulos_pagos,
                'titulos_total', v_titulos_total
            )
        WHERE id = p_invoice_id;

        RAISE NOTICE 'Status atualizado de % para % (Pagos: %/%)',
            v_proposta.status, v_novo_status, v_titulos_pagos, v_titulos_total;
    ELSE
        RAISE NOTICE 'Status mantido: % (Pagos: %/%)',
            v_novo_status, v_titulos_pagos, v_titulos_total;
    END IF;

END;
$$;


ALTER FUNCTION public.recompute_invoice_status(p_invoice_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION recompute_invoice_status(p_invoice_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.recompute_invoice_status(p_invoice_id uuid) IS 'Recalcula o status de uma nota fiscal/proposta baseado nos títulos financeiros relacionados';


--
-- Name: reorder_cards(text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reorder_cards(p_modulo text, p_stage_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.reorder_cards(p_modulo text, p_stage_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION reorder_cards(p_modulo text, p_stage_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.reorder_cards(p_modulo text, p_stage_id uuid) IS 'Reordena cards do kanban por posição, opcionalmente filtrando por coluna';


--
-- Name: system_health_check(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.system_health_check() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.system_health_check() OWNER TO postgres;

--
-- Name: FUNCTION system_health_check(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.system_health_check() IS 'Retorna métricas de saúde do sistema incluindo tamanhos, contadores e alertas';


--
-- Name: trigger_calc_quantidade_diaria(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_calc_quantidade_diaria() RETURNS trigger
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


ALTER FUNCTION public.trigger_calc_quantidade_diaria() OWNER TO postgres;

--
-- Name: trigger_calculate_valor_venda(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_calculate_valor_venda() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_margem_padrao numeric := 1.3; -- 30% de margem padrão
    v_custo_total numeric := 0;
    v_item jsonb;
BEGIN
    -- Se tipo = 'venda' e há itens com custo, calcular preço de venda
    IF NEW.tipo = 'venda' AND NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)
        LOOP
            -- Se tem custo mas não tem valor de venda, calcular
            IF (v_item ? 'custo') AND NOT (v_item ? 'valor_venda') THEN
                v_custo_total := v_custo_total + COALESCE(
                    (v_item->>'quantidade')::numeric * (v_item->>'custo')::numeric,
                    0
                );
            END IF;
        END LOOP;

        -- Aplicar margem se calculou custo
        IF v_custo_total > 0 AND NEW.valor_total = 0 THEN
            NEW.valor_total := ROUND(v_custo_total * v_margem_padrao, 2);
            NEW.dados := NEW.dados || jsonb_build_object(
                'custo_total', v_custo_total,
                'margem_aplicada', v_margem_padrao,
                'calculo_automatico', true
            );
            RAISE NOTICE 'Valor de venda calculado: R$ % (Custo: R$ %, Margem: %)',
                NEW.valor_total, v_custo_total, ((v_margem_padrao - 1) * 100)::text || '%';
        END IF;
    END IF;

    RETURN NEW;
END;
$_$;


ALTER FUNCTION public.trigger_calculate_valor_venda() OWNER TO postgres;

--
-- Name: trigger_conta_set_empresa_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_conta_set_empresa_id() RETURNS trigger
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


ALTER FUNCTION public.trigger_conta_set_empresa_id() OWNER TO postgres;

--
-- Name: trigger_entities_normalize(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_entities_normalize() RETURNS trigger
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


ALTER FUNCTION public.trigger_entities_normalize() OWNER TO postgres;

--
-- Name: trigger_fin_txn_compute_amount(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_fin_txn_compute_amount() RETURNS trigger
    LANGUAGE plpgsql
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


ALTER FUNCTION public.trigger_fin_txn_compute_amount() OWNER TO postgres;

--
-- Name: trigger_fin_txn_defaults(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_fin_txn_defaults() RETURNS trigger
    LANGUAGE plpgsql
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


ALTER FUNCTION public.trigger_fin_txn_defaults() OWNER TO postgres;

--
-- Name: trigger_kanban_colunas_set_pos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_kanban_colunas_set_pos() RETURNS trigger
    LANGUAGE plpgsql
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


ALTER FUNCTION public.trigger_kanban_colunas_set_pos() OWNER TO postgres;

--
-- Name: trigger_lanc_total(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_lanc_total() RETURNS trigger
    LANGUAGE plpgsql
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


ALTER FUNCTION public.trigger_lanc_total() OWNER TO postgres;

--
-- Name: trigger_on_oportunidade_concluida(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_on_oportunidade_concluida() RETURNS trigger
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


ALTER FUNCTION public.trigger_on_oportunidade_concluida() OWNER TO postgres;

--
-- Name: trigger_propagate_won_opportunity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_propagate_won_opportunity() RETURNS trigger
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


ALTER FUNCTION public.trigger_propagate_won_opportunity() OWNER TO postgres;

--
-- Name: trigger_proposta_itens_after_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_proposta_itens_after_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_total numeric := 0;
    v_item jsonb;
BEGIN
    -- Só recalcular se itens mudaram
    IF OLD.itens IS DISTINCT FROM NEW.itens THEN
        -- Calcular novo total
        IF NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN
            FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)
            LOOP
                v_total := v_total + COALESCE(
                    (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,
                    0
                );
            END LOOP;
        END IF;

        NEW.valor_total := v_total;
        RAISE NOTICE 'Total da proposta recalculado: R$ %', v_total;
    END IF;

    -- Atualizar timestamp
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$_$;


ALTER FUNCTION public.trigger_proposta_itens_after_change() OWNER TO postgres;

--
-- Name: trigger_propostas_before_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_propostas_before_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_seq_numero integer;
BEGIN
    -- Gerar número automático se não informado
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        -- Buscar próximo número sequencial
        SELECT COALESCE(MAX(
            CASE
                WHEN numero ~ '^PROP-[0-9]+$'
                THEN SUBSTRING(numero FROM 'PROP-([0-9]+)')::integer
                ELSE 0
            END
        ), 0) + 1
        INTO v_seq_numero
        FROM propostas;

        NEW.numero := 'PROP-' || LPAD(v_seq_numero::text, 6, '0');
        RAISE NOTICE 'Número da proposta gerado: %', NEW.numero;
    END IF;

    -- Status padrão
    IF NEW.status IS NULL THEN
        NEW.status := 'pendente';
    END IF;

    -- Data de emissão padrão
    IF NEW.data_emissao IS NULL THEN
        NEW.data_emissao := CURRENT_DATE;
    END IF;

    -- Data de validade padrão (30 dias)
    IF NEW.data_validade IS NULL AND NEW.validade_dias IS NOT NULL THEN
        NEW.data_validade := NEW.data_emissao + (NEW.validade_dias || ' days')::interval;
    END IF;

    -- Responsável padrão (usuário atual)
    IF NEW.responsavel_id IS NULL THEN
        NEW.responsavel_id := auth.uid();
    END IF;

    -- Inicializar arrays JSONB
    IF NEW.itens IS NULL THEN
        NEW.itens := '[]'::jsonb;
    END IF;

    IF NEW.anexos IS NULL THEN
        NEW.anexos := '[]'::jsonb;
    END IF;

    IF NEW.dados IS NULL THEN
        NEW.dados := '{}'::jsonb;
    END IF;

    -- Timestamps
    NEW.created_at := NOW();
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$_$;


ALTER FUNCTION public.trigger_propostas_before_insert() OWNER TO postgres;

--
-- Name: trigger_propostas_itens_before_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_propostas_itens_before_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_item jsonb;
    v_item_validado jsonb;
    v_itens_validados jsonb := '[]'::jsonb;
BEGIN
    -- Validar estrutura dos itens
    IF NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)
        LOOP
            -- Garantir campos obrigatórios
            v_item_validado := jsonb_build_object(
                'descricao', COALESCE(v_item->>'descricao', 'Item sem descrição'),
                'quantidade', COALESCE((v_item->>'quantidade')::numeric, 1),
                'valor_unitario', COALESCE((v_item->>'valor_unitario')::numeric, 0),
                'unidade', COALESCE(v_item->>'unidade', 'UN'),
                'observacao', v_item->>'observacao'
            );

            -- Adicionar campos extras se existirem
            IF v_item ? 'codigo' THEN
                v_item_validado := v_item_validado || jsonb_build_object('codigo', v_item->>'codigo');
            END IF;

            IF v_item ? 'categoria' THEN
                v_item_validado := v_item_validado || jsonb_build_object('categoria', v_item->>'categoria');
            END IF;

            v_itens_validados := v_itens_validados || v_item_validado;
        END LOOP;

        NEW.itens := v_itens_validados;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_propostas_itens_before_change() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


ALTER FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_update_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_level_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.prefixes_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying,
    max_presence_events_per_second integer DEFAULT 1000,
    max_payload_size_in_kb integer DEFAULT 3000
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: app_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_config (
    key text NOT NULL,
    value text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.app_config OWNER TO postgres;

--
-- Name: TABLE app_config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.app_config IS 'Configurações gerais do aplicativo (ambiente, URLs, features flags, etc)';


--
-- Name: assistencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assistencias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    codigo text NOT NULL,
    cliente_id uuid NOT NULL,
    cliente_nome text,
    descricao text NOT NULL,
    status text DEFAULT 'aberta'::text NOT NULL,
    data_solicitacao timestamp with time zone DEFAULT now(),
    responsavel_id uuid,
    prioridade text,
    observacoes text,
    data_agendamento timestamp with time zone,
    data_conclusao timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT assistencias_prioridade_check CHECK ((prioridade = ANY (ARRAY['baixa'::text, 'media'::text, 'alta'::text, 'urgente'::text]))),
    CONSTRAINT assistencias_status_check CHECK ((status = ANY (ARRAY['aberta'::text, 'agendado'::text, 'em_atendimento'::text, 'atendido'::text, 'em_atraso'::text])))
);


ALTER TABLE public.assistencias OWNER TO postgres;

--
-- Name: TABLE assistencias; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.assistencias IS 'Ordens de Serviço / Assistências técnicas';


--
-- Name: centros_custo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.centros_custo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    codigo text,
    descricao text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    empresa_id uuid
);


ALTER TABLE public.centros_custo OWNER TO postgres;

--
-- Name: TABLE centros_custo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.centros_custo IS 'Centros de custo para controle gerencial';


--
-- Name: COLUMN centros_custo.empresa_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.centros_custo.empresa_id IS 'Empresa dona do centro de custo (NULL = compartilhado entre todas)';


--
-- Name: contas_financeiras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contas_financeiras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid,
    banco text NOT NULL,
    agencia text,
    conta text,
    tipo text,
    saldo_inicial numeric(15,2) DEFAULT 0,
    saldo_atual numeric(15,2) DEFAULT 0,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    apelido text,
    CONSTRAINT contas_financeiras_tipo_check CHECK ((tipo = ANY (ARRAY['corrente'::text, 'poupanca'::text, 'investimento'::text])))
);


ALTER TABLE public.contas_financeiras OWNER TO postgres;

--
-- Name: TABLE contas_financeiras; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.contas_financeiras IS 'Contas bancárias das empresas';


--
-- Name: COLUMN contas_financeiras.apelido; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.contas_financeiras.apelido IS 'Nome amigável para identificação rápida da conta (ex: "Conta Principal Santander")';


--
-- Name: contratos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contratos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero text NOT NULL,
    cliente_id uuid NOT NULL,
    proposta_id uuid,
    titulo text NOT NULL,
    descricao text,
    valor_total numeric(15,2) DEFAULT 0 NOT NULL,
    data_inicio date,
    data_fim date,
    data_assinatura date,
    status text DEFAULT 'rascunho'::text,
    tipo text,
    responsavel_id uuid,
    observacoes text,
    anexos jsonb DEFAULT '[]'::jsonb,
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT contratos_status_check CHECK ((status = ANY (ARRAY['rascunho'::text, 'ativo'::text, 'concluido'::text, 'cancelado'::text]))),
    CONSTRAINT contratos_tipo_check CHECK ((tipo = ANY (ARRAY['arquitetura'::text, 'marcenaria'::text, 'engenharia'::text, 'consultoria'::text, 'outros'::text])))
);


ALTER TABLE public.contratos OWNER TO postgres;

--
-- Name: TABLE contratos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.contratos IS 'Contratos firmados com clientes';


--
-- Name: empresas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    razao_social text NOT NULL,
    nome_fantasia text,
    cnpj text,
    inscricao_estadual text,
    tipo text,
    endereco text,
    cidade text,
    estado text,
    cep text,
    telefone text,
    email text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT empresas_tipo_check CHECK ((tipo = ANY (ARRAY['matriz'::text, 'filial'::text, 'parceiro'::text])))
);


ALTER TABLE public.empresas OWNER TO postgres;

--
-- Name: TABLE empresas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.empresas IS 'Empresas do grupo WG Almeida';


--
-- Name: entities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo text NOT NULL,
    nome text NOT NULL,
    email text,
    telefone text,
    cpf_cnpj text,
    endereco text,
    cidade text,
    estado text,
    cep text,
    dados jsonb DEFAULT '{}'::jsonb,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT entities_tipo_check CHECK ((tipo = ANY (ARRAY['cliente'::text, 'lead'::text, 'fornecedor'::text])))
);


ALTER TABLE public.entities OWNER TO postgres;

--
-- Name: TABLE entities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.entities IS 'Entidades genéricas: clientes, leads, fornecedores';


--
-- Name: kanban_boards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban_boards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ambiente text NOT NULL,
    titulo text NOT NULL,
    descricao text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.kanban_boards OWNER TO postgres;

--
-- Name: TABLE kanban_boards; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.kanban_boards IS 'Boards do sistema Kanban incluindo arquitetura, engenharia e marcenaria';


--
-- Name: kanban_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coluna_id uuid,
    titulo text NOT NULL,
    descricao text,
    valor numeric(15,2),
    responsavel_id uuid,
    entity_id uuid,
    posicao integer DEFAULT 0 NOT NULL,
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.kanban_cards OWNER TO postgres;

--
-- Name: TABLE kanban_cards; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.kanban_cards IS 'Cards do Kanban (oportunidades, leads, etc)';


--
-- Name: kanban_colunas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban_colunas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    board_id uuid,
    titulo text NOT NULL,
    cor text DEFAULT '#94a3b8'::text,
    posicao integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.kanban_colunas OWNER TO postgres;

--
-- Name: TABLE kanban_colunas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.kanban_colunas IS 'Colunas dos quadros Kanban';


--
-- Name: lancamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lancamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo_id uuid,
    valor numeric(15,2) NOT NULL,
    data date NOT NULL,
    tipo_pagamento text,
    centro_custo_cliente_id uuid,
    categoria_id uuid,
    observacao text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lancamentos OWNER TO postgres;

--
-- Name: TABLE lancamentos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.lancamentos IS 'Lançamentos financeiros (parcelas, pagamentos)';


--
-- Name: lancamentos_financeiros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lancamentos_financeiros (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid,
    cliente_id uuid,
    tipo text NOT NULL,
    categoria text,
    categoria_id uuid,
    descricao text NOT NULL,
    valor numeric(15,2) NOT NULL,
    data_emissao date DEFAULT CURRENT_DATE,
    data_vencimento date NOT NULL,
    data_pagamento date,
    status text DEFAULT 'previsto'::text,
    forma_pagamento text,
    conta_financeira_id uuid,
    centro_custo_id uuid,
    titulo_id uuid,
    contrato_id uuid,
    obra_id uuid,
    observacoes text,
    documento text,
    anexos jsonb DEFAULT '[]'::jsonb,
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT lancamentos_financeiros_status_check CHECK ((status = ANY (ARRAY['previsto'::text, 'aprovado'::text, 'recebido'::text, 'pago'::text, 'cancelado'::text, 'vencido'::text]))),
    CONSTRAINT lancamentos_financeiros_tipo_check CHECK ((tipo = ANY (ARRAY['receber'::text, 'pagar'::text])))
);


ALTER TABLE public.lancamentos_financeiros OWNER TO postgres;

--
-- Name: TABLE lancamentos_financeiros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.lancamentos_financeiros IS 'Lançamentos financeiros detalhados (contas a pagar e receber)';


--
-- Name: obras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.obras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    codigo text NOT NULL,
    cliente_id uuid NOT NULL,
    contrato_id uuid,
    titulo text NOT NULL,
    descricao text,
    endereco text,
    cidade text,
    estado text,
    cep text,
    status text DEFAULT 'planejamento'::text,
    data_inicio date,
    data_fim_prevista date,
    data_fim_real date,
    responsavel_id uuid,
    valor_orcado numeric(15,2) DEFAULT 0,
    valor_realizado numeric(15,2) DEFAULT 0,
    progresso integer DEFAULT 0,
    observacoes text,
    anexos jsonb DEFAULT '[]'::jsonb,
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT obras_progresso_check CHECK (((progresso >= 0) AND (progresso <= 100))),
    CONSTRAINT obras_status_check CHECK ((status = ANY (ARRAY['planejamento'::text, 'em_execucao'::text, 'finalizada'::text, 'atrasada'::text])))
);


ALTER TABLE public.obras OWNER TO postgres;

--
-- Name: TABLE obras; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.obras IS 'Gestão de obras e projetos em execução';


--
-- Name: pipelines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipelines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    estagio text,
    probabilidade integer,
    entity_id uuid,
    valor numeric(15,2),
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pipelines_probabilidade_check CHECK (((probabilidade >= 0) AND (probabilidade <= 100)))
);


ALTER TABLE public.pipelines OWNER TO postgres;

--
-- Name: TABLE pipelines; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pipelines IS 'Histórico de pipelines de vendas';


--
-- Name: plano_contas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plano_contas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grupo text NOT NULL,
    conta text NOT NULL,
    codigo text,
    tipo text,
    descricao text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    empresa_id uuid,
    CONSTRAINT plano_contas_grupo_check CHECK ((grupo = ANY (ARRAY['Receitas'::text, 'Despesas'::text])))
);


ALTER TABLE public.plano_contas OWNER TO postgres;

--
-- Name: TABLE plano_contas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.plano_contas IS 'Plano de contas contábil';


--
-- Name: COLUMN plano_contas.empresa_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.plano_contas.empresa_id IS 'Empresa dona do plano de contas (NULL = compartilhado entre todas)';


--
-- Name: produtos_servicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produtos_servicos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    descricao text,
    categoria text,
    tipo text,
    preco numeric(15,2) DEFAULT 0,
    unidade text DEFAULT 'un'::text,
    codigo_interno text,
    ativo boolean DEFAULT true,
    estoque_minimo integer DEFAULT 0,
    estoque_atual integer DEFAULT 0,
    imagem_url text,
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT produtos_servicos_tipo_check CHECK ((tipo = ANY (ARRAY['produto'::text, 'servico'::text, 'ambos'::text])))
);


ALTER TABLE public.produtos_servicos OWNER TO postgres;

--
-- Name: TABLE produtos_servicos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.produtos_servicos IS 'Catálogo de produtos e serviços oferecidos pela empresa';


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    avatar_url text,
    telefone text,
    cargo text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: TABLE profiles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema, estende auth.users do Supabase';


--
-- Name: propostas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.propostas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero text NOT NULL,
    cliente_id uuid NOT NULL,
    titulo text NOT NULL,
    descricao text,
    valor_total numeric(15,2) DEFAULT 0 NOT NULL,
    validade_dias integer DEFAULT 30,
    data_emissao date DEFAULT CURRENT_DATE,
    data_validade date,
    status text DEFAULT 'pendente'::text,
    tipo text,
    responsavel_id uuid,
    observacoes text,
    itens jsonb DEFAULT '[]'::jsonb,
    anexos jsonb DEFAULT '[]'::jsonb,
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT propostas_status_check CHECK ((status = ANY (ARRAY['rascunho'::text, 'pendente'::text, 'enviada'::text, 'aprovada'::text, 'rejeitada'::text, 'cancelada'::text]))),
    CONSTRAINT propostas_tipo_check CHECK ((tipo = ANY (ARRAY['arquitetura'::text, 'marcenaria'::text, 'engenharia'::text, 'consultoria'::text, 'outros'::text])))
);


ALTER TABLE public.propostas OWNER TO postgres;

--
-- Name: TABLE propostas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.propostas IS 'Propostas comerciais enviadas para clientes';


--
-- Name: registro_categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_categorias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    descricao text,
    cor text DEFAULT '#3b82f6'::text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.registro_categorias OWNER TO postgres;

--
-- Name: TABLE registro_categorias; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.registro_categorias IS 'Categorias para classificação de registros de trabalho';


--
-- Name: registros_trabalho; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registros_trabalho (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profissional_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    proposta_id uuid,
    obra_id uuid,
    contrato_id uuid,
    data date DEFAULT CURRENT_DATE NOT NULL,
    categoria_id uuid NOT NULL,
    descricao text NOT NULL,
    quantidade numeric(10,2) DEFAULT 1,
    unidade text DEFAULT 'un'::text,
    valor_unitario numeric(15,2) DEFAULT 0,
    valor_total numeric(15,2) GENERATED ALWAYS AS ((quantidade * valor_unitario)) STORED,
    anexos jsonb DEFAULT '[]'::jsonb,
    aprovado boolean DEFAULT false,
    aprovado_por uuid,
    aprovado_em timestamp with time zone,
    gerar_lancamento boolean DEFAULT false,
    lancamento_id uuid,
    observacoes text,
    dados jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.registros_trabalho OWNER TO postgres;

--
-- Name: TABLE registros_trabalho; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.registros_trabalho IS 'Registros diários de trabalho dos profissionais (horas, serviços, materiais)';


--
-- Name: titulos_financeiros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.titulos_financeiros (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid,
    tipo text NOT NULL,
    descricao text NOT NULL,
    valor numeric(15,2) NOT NULL,
    data_emissao date NOT NULL,
    data_vencimento date NOT NULL,
    status text,
    categoria_id uuid,
    centro_custo_id uuid,
    conta_financeira_id uuid,
    observacao text,
    documento text,
    fornecedor_cliente text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT titulos_financeiros_status_check CHECK ((status = ANY (ARRAY['Previsto'::text, 'Aprovado'::text, 'Pago'::text, 'Cancelado'::text, 'Vencido'::text]))),
    CONSTRAINT titulos_financeiros_tipo_check CHECK ((tipo = ANY (ARRAY['Pagar'::text, 'Receber'::text])))
);


ALTER TABLE public.titulos_financeiros OWNER TO postgres;

--
-- Name: TABLE titulos_financeiros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.titulos_financeiros IS 'Títulos a pagar e a receber';


--
-- Name: usuarios_perfis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_perfis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    perfil text NOT NULL,
    permissoes jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT usuarios_perfis_perfil_check CHECK ((perfil = ANY (ARRAY['admin'::text, 'gestor'::text, 'vendedor'::text, 'arquiteto'::text, 'financeiro'::text, 'readonly'::text])))
);


ALTER TABLE public.usuarios_perfis OWNER TO postgres;

--
-- Name: TABLE usuarios_perfis; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.usuarios_perfis IS 'Perfis e permissões dos usuários';


--
-- Name: v_clientes_ativos_contratos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_clientes_ativos_contratos AS
 SELECT e.id AS cliente_id,
    e.nome AS nome_razao_social,
    e.email,
    e.telefone,
    e.cidade,
    e.estado,
    count(DISTINCT c.id) AS total_contratos,
    count(DISTINCT
        CASE
            WHEN (c.status = 'ativo'::text) THEN c.id
            ELSE NULL::uuid
        END) AS contratos_ativos,
    COALESCE(sum(c.valor_total), (0)::numeric) AS valor_total_contratos,
    COALESCE(sum(
        CASE
            WHEN (c.status = 'ativo'::text) THEN c.valor_total
            ELSE (0)::numeric
        END), (0)::numeric) AS valor_contratos_ativos,
    max(c.created_at) AS ultimo_contrato_data
   FROM (public.entities e
     LEFT JOIN public.contratos c ON ((c.cliente_id = e.id)))
  WHERE ((e.tipo = 'cliente'::text) AND (e.ativo = true))
  GROUP BY e.id, e.nome, e.email, e.telefone, e.cidade, e.estado
  ORDER BY COALESCE(sum(c.valor_total), (0)::numeric) DESC;


ALTER VIEW public.v_clientes_ativos_contratos OWNER TO postgres;

--
-- Name: VIEW v_clientes_ativos_contratos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.v_clientes_ativos_contratos IS 'Clientes ativos com estatísticas de contratos';


--
-- Name: v_despesas_mes_categoria; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_despesas_mes_categoria AS
 SELECT date_trunc('month'::text, (data_vencimento)::timestamp with time zone) AS mes,
    COALESCE(categoria, 'Sem Categoria'::text) AS categoria,
    count(*) AS quantidade,
    sum(valor) AS total,
    avg(valor) AS media,
    status
   FROM public.lancamentos_financeiros
  WHERE (tipo = 'pagar'::text)
  GROUP BY (date_trunc('month'::text, (data_vencimento)::timestamp with time zone)), categoria, status
  ORDER BY (date_trunc('month'::text, (data_vencimento)::timestamp with time zone)) DESC, (sum(valor)) DESC;


ALTER VIEW public.v_despesas_mes_categoria OWNER TO postgres;

--
-- Name: VIEW v_despesas_mes_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.v_despesas_mes_categoria IS 'Despesas agrupadas por mês e categoria';


--
-- Name: v_fluxo_caixa; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_fluxo_caixa AS
 SELECT data_vencimento AS data,
    sum(
        CASE
            WHEN (tipo = 'receber'::text) THEN valor
            ELSE (0)::numeric
        END) AS total_receber,
    sum(
        CASE
            WHEN (tipo = 'pagar'::text) THEN valor
            ELSE (0)::numeric
        END) AS total_pagar,
    sum(
        CASE
            WHEN (tipo = 'receber'::text) THEN valor
            ELSE (- valor)
        END) AS saldo_dia,
    status,
    count(*) AS quantidade_lancamentos
   FROM public.lancamentos_financeiros
  WHERE (status <> 'cancelado'::text)
  GROUP BY data_vencimento, status
  ORDER BY data_vencimento;


ALTER VIEW public.v_fluxo_caixa OWNER TO postgres;

--
-- Name: VIEW v_fluxo_caixa; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.v_fluxo_caixa IS 'Fluxo de caixa diário (entradas vs saídas)';


--
-- Name: v_kanban_cards_board; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_kanban_cards_board AS
 SELECT k.id,
    k.titulo,
    k.descricao,
    k.valor,
    k.posicao,
    k.dados AS payload,
    k.created_at,
    k.updated_at,
    kb.ambiente AS modulo,
    kb.titulo AS board_titulo,
    k.coluna_id,
    kc.titulo AS status,
    kc.cor AS status_cor,
    kc.posicao AS status_posicao,
    p.id AS responsavel_id,
    p.nome AS responsavel_nome,
    e.id AS entity_id,
    e.tipo AS entity_tipo,
    e.nome AS entity_nome
   FROM ((((public.kanban_cards k
     JOIN public.kanban_colunas kc ON ((k.coluna_id = kc.id)))
     JOIN public.kanban_boards kb ON ((kb.id = kc.board_id)))
     LEFT JOIN public.profiles p ON ((k.responsavel_id = p.id)))
     LEFT JOIN public.entities e ON ((k.entity_id = e.id)))
  ORDER BY kb.ambiente, kc.posicao, k.posicao;


ALTER VIEW public.v_kanban_cards_board OWNER TO postgres;

--
-- Name: VIEW v_kanban_cards_board; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.v_kanban_cards_board IS 'Cards do kanban com informações completas do board';


--
-- Name: v_obras_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_obras_status AS
 SELECT status,
    count(*) AS total
   FROM public.obras
  GROUP BY status;


ALTER VIEW public.v_obras_status OWNER TO postgres;

--
-- Name: VIEW v_obras_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.v_obras_status IS 'Agregação de obras por status (planejamento, em_execucao, finalizada, atrasada)';


--
-- Name: v_registros_trabalho; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_registros_trabalho AS
 SELECT rt.id,
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
    ep.id AS profissional_id,
    ep.nome AS profissional_nome,
    ep.email AS profissional_email,
    ec.id AS cliente_id,
    ec.nome AS cliente_nome,
    ec.email AS cliente_email,
    rc.id AS categoria_id,
    rc.nome AS categoria_nome,
    rc.cor AS categoria_cor,
    ap.id AS aprovador_id,
    ap.nome AS aprovador_nome,
    o.id AS obra_id,
    o.titulo AS obra_titulo,
    o.codigo AS obra_codigo,
    pr.id AS proposta_id,
    pr.numero AS proposta_numero,
    ct.id AS contrato_id,
    ct.numero AS contrato_numero,
    lf.id AS lancamento_id,
    lf.status AS lancamento_status
   FROM ((((((((public.registros_trabalho rt
     JOIN public.profiles ep ON ((ep.id = rt.profissional_id)))
     JOIN public.entities ec ON ((ec.id = rt.cliente_id)))
     JOIN public.registro_categorias rc ON ((rc.id = rt.categoria_id)))
     LEFT JOIN public.profiles ap ON ((ap.id = rt.aprovado_por)))
     LEFT JOIN public.obras o ON ((o.id = rt.obra_id)))
     LEFT JOIN public.propostas pr ON ((pr.id = rt.proposta_id)))
     LEFT JOIN public.contratos ct ON ((ct.id = rt.contrato_id)))
     LEFT JOIN public.lancamentos_financeiros lf ON ((lf.id = rt.lancamento_id)))
  ORDER BY rt.data DESC, rt.created_at DESC;


ALTER VIEW public.v_registros_trabalho OWNER TO postgres;

--
-- Name: VIEW v_registros_trabalho; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.v_registros_trabalho IS 'Registros de trabalho com informações completas (profissional, cliente, categoria, etc)';


--
-- Name: v_top10_clientes_receita; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_top10_clientes_receita AS
 SELECT e.id AS cliente_id,
    e.nome AS nome_razao_social,
    e.email,
    e.telefone,
    e.cidade,
    count(DISTINCT lf.id) AS total_lancamentos,
    sum(
        CASE
            WHEN (lf.status = ANY (ARRAY['recebido'::text, 'pago'::text])) THEN lf.valor
            ELSE (0)::numeric
        END) AS receita_realizada,
    sum(
        CASE
            WHEN (lf.status = ANY (ARRAY['previsto'::text, 'aprovado'::text])) THEN lf.valor
            ELSE (0)::numeric
        END) AS receita_prevista,
    sum(lf.valor) AS receita_total,
    max(lf.data_pagamento) AS ultima_receita_data
   FROM (public.entities e
     JOIN public.lancamentos_financeiros lf ON ((lf.cliente_id = e.id)))
  WHERE ((e.tipo = 'cliente'::text) AND (lf.tipo = 'receber'::text))
  GROUP BY e.id, e.nome, e.email, e.telefone, e.cidade
  ORDER BY (sum(
        CASE
            WHEN (lf.status = ANY (ARRAY['recebido'::text, 'pago'::text])) THEN lf.valor
            ELSE (0)::numeric
        END)) DESC
 LIMIT 10;


ALTER VIEW public.v_top10_clientes_receita OWNER TO postgres;

--
-- Name: VIEW v_top10_clientes_receita; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.v_top10_clientes_receita IS 'Top 10 clientes por receita realizada';


--
-- Name: vw_oportunidades_completas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_oportunidades_completas AS
 SELECT kc.id,
    kc.titulo,
    kc.descricao,
    kc.valor,
    kc.posicao,
    kc.dados,
    kc.created_at,
    kc.updated_at,
    col.id AS coluna_id,
    col.titulo AS coluna_titulo,
    col.cor AS coluna_cor,
    col.posicao AS coluna_posicao,
    kb.id AS board_id,
    kb.ambiente AS board_ambiente,
    kb.titulo AS board_titulo,
    p.id AS responsavel_id,
    p.nome AS responsavel_nome,
    p.email AS responsavel_email,
    e.id AS entity_id,
    e.tipo AS entity_tipo,
    e.nome AS entity_nome,
    e.email AS entity_email,
    e.telefone AS entity_telefone,
    e.dados AS entity_dados
   FROM ((((public.kanban_cards kc
     JOIN public.kanban_colunas col ON ((kc.coluna_id = col.id)))
     JOIN public.kanban_boards kb ON ((col.board_id = kb.id)))
     LEFT JOIN public.profiles p ON ((kc.responsavel_id = p.id)))
     LEFT JOIN public.entities e ON ((kc.entity_id = e.id)))
  WHERE (kb.ambiente = 'oportunidades'::text)
  ORDER BY col.posicao, kc.posicao;


ALTER VIEW public.vw_oportunidades_completas OWNER TO postgres;

--
-- Name: VIEW vw_oportunidades_completas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vw_oportunidades_completas IS 'Oportunidades com todos os dados relacionados (joins)';


--
-- Name: vw_pipeline_oportunidades; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_pipeline_oportunidades AS
 SELECT kc.id AS coluna_id,
    kc.titulo AS etapa,
    kc.cor AS cor_etapa,
    kc.posicao,
    kb.ambiente AS modulo,
    count(k.id) AS qtde_cards,
    COALESCE(sum(k.valor), (0)::numeric) AS valor_total,
    COALESCE(avg(k.valor), (0)::numeric) AS valor_medio,
    count(
        CASE
            WHEN (k.created_at >= (CURRENT_DATE - '7 days'::interval)) THEN 1
            ELSE NULL::integer
        END) AS novos_ultimos_7_dias
   FROM ((public.kanban_colunas kc
     JOIN public.kanban_boards kb ON ((kb.id = kc.board_id)))
     LEFT JOIN public.kanban_cards k ON ((k.coluna_id = kc.id)))
  WHERE (kb.ambiente = 'oportunidades'::text)
  GROUP BY kc.id, kc.titulo, kc.cor, kc.posicao, kb.ambiente
  ORDER BY kc.posicao;


ALTER VIEW public.vw_pipeline_oportunidades OWNER TO postgres;

--
-- Name: VIEW vw_pipeline_oportunidades; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vw_pipeline_oportunidades IS 'Pipeline de oportunidades com estatísticas por etapa';


--
-- Name: vw_titulos_resumo; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_titulos_resumo AS
 SELECT e.id AS empresa_id,
    e.razao_social AS empresa,
    COALESCE(sum(
        CASE
            WHEN ((t.tipo = 'Receber'::text) AND (t.status = 'Pago'::text)) THEN t.valor
            ELSE (0)::numeric
        END), (0)::numeric) AS total_receitas,
    COALESCE(sum(
        CASE
            WHEN ((t.tipo = 'Pagar'::text) AND (t.status = 'Pago'::text)) THEN t.valor
            ELSE (0)::numeric
        END), (0)::numeric) AS total_despesas,
    COALESCE(sum(
        CASE
            WHEN ((t.tipo = 'Receber'::text) AND (t.status = ANY (ARRAY['Previsto'::text, 'Aprovado'::text]))) THEN t.valor
            ELSE (0)::numeric
        END), (0)::numeric) AS a_receber,
    COALESCE(sum(
        CASE
            WHEN ((t.tipo = 'Pagar'::text) AND (t.status = ANY (ARRAY['Previsto'::text, 'Aprovado'::text]))) THEN t.valor
            ELSE (0)::numeric
        END), (0)::numeric) AS a_pagar,
    COALESCE(sum(
        CASE
            WHEN ((t.tipo = 'Receber'::text) AND (t.status = 'Pago'::text)) THEN t.valor
            WHEN ((t.tipo = 'Pagar'::text) AND (t.status = 'Pago'::text)) THEN (- t.valor)
            ELSE (0)::numeric
        END), (0)::numeric) AS saldo,
    count(
        CASE
            WHEN ((t.status = ANY (ARRAY['Previsto'::text, 'Aprovado'::text])) AND (t.data_vencimento < CURRENT_DATE)) THEN 1
            ELSE NULL::integer
        END) AS titulos_vencidos
   FROM (public.empresas e
     LEFT JOIN public.titulos_financeiros t ON ((t.empresa_id = e.id)))
  WHERE (e.ativo = true)
  GROUP BY e.id, e.razao_social;


ALTER VIEW public.vw_titulos_resumo OWNER TO postgres;

--
-- Name: VIEW vw_titulos_resumo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vw_titulos_resumo IS 'Resumo financeiro consolidado por empresa';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_11_03; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_03 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_04; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_04 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_05; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_05 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_06; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_06 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_07; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_07 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_namespaces OWNER TO supabase_storage_admin;

--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_tables OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: messages_2025_11_03; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_03 FOR VALUES FROM ('2025-11-03 00:00:00') TO ('2025-11-04 00:00:00');


--
-- Name: messages_2025_11_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_04 FOR VALUES FROM ('2025-11-04 00:00:00') TO ('2025-11-05 00:00:00');


--
-- Name: messages_2025_11_05; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_05 FOR VALUES FROM ('2025-11-05 00:00:00') TO ('2025-11-06 00:00:00');


--
-- Name: messages_2025_11_06; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_06 FOR VALUES FROM ('2025-11-06 00:00:00') TO ('2025-11-07 00:00:00');


--
-- Name: messages_2025_11_07; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_07 FOR VALUES FROM ('2025-11-07 00:00:00') TO ('2025-11-08 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
d1c4c252-9790-463a-a24b-c31e9ea75d3f	postgres_cdc_rls	{"region": "us-east-1", "db_host": "NKclZ8wTNxDUHUPqb1j47w==", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-11-04 23:25:12	2025-11-04 23:25:12
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-11-04 11:19:46
20220329161857	2025-11-04 11:19:46
20220410212326	2025-11-04 11:19:46
20220506102948	2025-11-04 11:19:46
20220527210857	2025-11-04 11:19:46
20220815211129	2025-11-04 11:19:46
20220815215024	2025-11-04 11:19:46
20220818141501	2025-11-04 11:19:46
20221018173709	2025-11-04 11:19:46
20221102172703	2025-11-04 11:19:46
20221223010058	2025-11-04 11:19:46
20230110180046	2025-11-04 11:19:46
20230810220907	2025-11-04 11:19:46
20230810220924	2025-11-04 11:19:46
20231024094642	2025-11-04 11:19:46
20240306114423	2025-11-04 11:19:46
20240418082835	2025-11-04 11:19:46
20240625211759	2025-11-04 11:19:46
20240704172020	2025-11-04 11:19:46
20240902173232	2025-11-04 11:19:46
20241106103258	2025-11-04 11:19:46
20250424203323	2025-11-04 11:19:46
20250613072131	2025-11-04 11:19:46
20250711044927	2025-11-04 11:19:46
20250811121559	2025-11-04 11:19:46
20250926223044	2025-11-04 11:19:46
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter, max_presence_events_per_second, max_payload_size_in_kb) FROM stdin;
abea9f02-c172-4fba-969a-383b0a68b80b	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2025-11-04 23:25:12	2025-11-04 23:25:12	100	postgres_cdc_rls	100000	100	100	f	{"keys": [{"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}	f	f	64	gen_rpc	1000	3000
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: app_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_config (key, value, description, created_at, updated_at) FROM stdin;
environment	local	Ambiente atual: local ou live	2025-11-04 11:20:00.454264+00	2025-11-04 11:20:00.454264+00
api_url	http://127.0.0.1:54321	URL base da API Supabase	2025-11-04 11:20:00.454264+00	2025-11-04 11:20:00.454264+00
project_id	WG	Project ID do Supabase	2025-11-04 11:20:00.454264+00	2025-11-04 11:20:00.454264+00
version	1.0.0	Versão do sistema	2025-11-04 11:20:00.454264+00	2025-11-04 11:20:00.454264+00
\.


--
-- Data for Name: assistencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assistencias (id, codigo, cliente_id, cliente_nome, descricao, status, data_solicitacao, responsavel_id, prioridade, observacoes, data_agendamento, data_conclusao, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: centros_custo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.centros_custo (id, nome, codigo, descricao, ativo, created_at, empresa_id) FROM stdin;
aed9103b-4659-4424-8723-ce3b08f1c3aa	Arquitetura	CC001	\N	t	2025-11-04 11:19:59.847857+00	\N
d638d49e-c83f-4267-8ebc-b2a8c2e4776b	Marcenaria	CC002	\N	t	2025-11-04 11:19:59.847857+00	\N
fa7f4135-f16e-4493-aad3-07732c5004e7	Engenharia	CC003	\N	t	2025-11-04 11:19:59.847857+00	\N
97c1fd7a-99b3-47f6-be3b-bf186f2e424c	Marketing	CC004	\N	t	2025-11-04 11:19:59.847857+00	\N
cabb6ffd-80b1-463c-b0dd-9c1ee96b21aa	Administrativo	CC005	\N	t	2025-11-04 11:19:59.847857+00	\N
\.


--
-- Data for Name: contas_financeiras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contas_financeiras (id, empresa_id, banco, agencia, conta, tipo, saldo_inicial, saldo_atual, ativo, created_at, updated_at, apelido) FROM stdin;
\.


--
-- Data for Name: contratos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contratos (id, numero, cliente_id, proposta_id, titulo, descricao, valor_total, data_inicio, data_fim, data_assinatura, status, tipo, responsavel_id, observacoes, anexos, dados, created_at, updated_at) FROM stdin;
1c0c1db8-b0d8-449c-8f6c-b0e7c1742ee2	ARQ-2025-001	22675179-ff6b-4b01-9746-67c1cf2901e0	\N	Projeto Residencial Alto Padrão	Projeto arquitetônico completo para residência de 350m²	85000.00	2025-11-04	\N	\N	ativo	arquitetura	\N	\N	[]	{}	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
e4ba93ed-790c-4399-931d-df382710882f	ENG-2025-001	8d865c8d-1867-4c54-a1be-8c448fd4152d	\N	Projeto Estrutural Edifício Comercial	Cálculo estrutural e acompanhamento de obra	125000.00	2025-11-04	\N	\N	ativo	engenharia	\N	\N	[]	{}	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
7a8f169c-58d5-41cc-81d7-a9bd30b50cfb	MAR-2025-001	43526c76-a214-45a8-a296-5e269034b876	\N	Móveis Planejados Sala e Cozinha	Produção e instalação de móveis planejados	45000.00	2025-11-04	\N	\N	ativo	marcenaria	\N	\N	[]	{}	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
\.


--
-- Data for Name: empresas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresas (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, tipo, endereco, cidade, estado, cep, telefone, email, ativo, created_at, updated_at) FROM stdin;
ed087181-8945-4ad3-94cc-a6db8dce9a7f	WG Almeida Arquitetura LTDA	WG Arquitetura	00.000.000/0001-00	\N	matriz	\N	\N	\N	\N	\N	\N	t	2025-11-04 11:19:59.816358+00	2025-11-04 11:19:59.816358+00
\.


--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entities (id, tipo, nome, email, telefone, cpf_cnpj, endereco, cidade, estado, cep, dados, ativo, created_at, updated_at) FROM stdin;
989c6c4d-82d3-4a35-a3c6-13b0a8e22e19	cliente	João Silva Construções	joao@example.com	11987654321	12345678901	\N	São Paulo	SP	\N	{}	t	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
c8c1cf55-a114-47f0-ad4f-1233331c3eb4	cliente	Maria Santos Arquitetura	maria@example.com	11976543210	98765432109	\N	Rio de Janeiro	RJ	\N	{}	t	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
1a1a49f6-9c82-4535-a78f-c4b15c693e40	cliente	Construtora Abc Ltda	contato@abc.com	11965432109	12345678000190	\N	Belo Horizonte	MG	\N	{}	t	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
22675179-ff6b-4b01-9746-67c1cf2901e0	cliente	João Silva Arquitetura	joao@email.com	11987654321	\N	\N	\N	\N	\N	{}	t	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
8d865c8d-1867-4c54-a1be-8c448fd4152d	cliente	Maria Santos Construtora	maria@email.com	11976543210	\N	\N	\N	\N	\N	{}	t	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
43526c76-a214-45a8-a296-5e269034b876	cliente	Pedro Oliveira Móveis	pedro@email.com	11965432109	\N	\N	\N	\N	\N	{}	t	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
\.


--
-- Data for Name: kanban_boards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kanban_boards (id, ambiente, titulo, descricao, created_at) FROM stdin;
6877ef69-13e6-4c52-87a0-5b0604b3f1a7	oportunidades	Pipeline de Vendas	Funil de vendas com oportunidades	2025-11-04 11:19:59.893924+00
6dc0185b-af62-4c4a-b676-c8a2cd1190ed	leads	Captação de Leads	Gestão de leads capturados	2025-11-04 11:19:59.893924+00
b4620761-d36b-4976-bb78-aa874d83adae	obras	Gestão de Obras	Acompanhamento de projetos em execução	2025-11-04 11:19:59.893924+00
845350b4-d608-4fe6-add1-41883c28f564	arquitetura	Projetos de Arquitetura	Gestão de projetos arquitetônicos	2025-11-04 11:20:00.482889+00
7ee321dd-6c1b-4424-a00c-a92133a8b17c	engenharia	Projetos de Engenharia	Gestão de projetos de engenharia	2025-11-04 11:20:00.482889+00
cdba8c8b-e547-4834-a137-eaa988224b76	marcenaria	Projetos de Marcenaria	Gestão de projetos de marcenaria	2025-11-04 11:20:00.482889+00
\.


--
-- Data for Name: kanban_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kanban_cards (id, coluna_id, titulo, descricao, valor, responsavel_id, entity_id, posicao, dados, created_at, updated_at) FROM stdin;
95a01aa2-4a42-4a9c-90b1-9bc2697a2a0c	165c3d87-9629-44cc-a295-cc9b5918d484	Projeto Residencial Alto Padrão	Cliente: João Silva - Fase de estudo conceitual	85000.00	\N	22675179-ff6b-4b01-9746-67c1cf2901e0	0	{"tipo": "arquitetura", "contrato_id": "1c0c1db8-b0d8-449c-8f6c-b0e7c1742ee2"}	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
203561d8-5e5a-45e3-81d0-304578c8167d	95d0988f-cc9b-45ca-a3a7-f7883bf0c065	Projeto Estrutural Edifício Comercial	Cliente: Maria Santos - Obra em execução	125000.00	\N	8d865c8d-1867-4c54-a1be-8c448fd4152d	0	{"tipo": "engenharia", "contrato_id": "e4ba93ed-790c-4399-931d-df382710882f"}	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
d32ff472-0aa4-4d36-87c1-85529b96feaa	b0650504-f515-4f62-aa4f-a9b97754dc5c	Móveis Planejados Sala e Cozinha	Cliente: Pedro Oliveira - Em produção na marcenaria	45000.00	\N	43526c76-a214-45a8-a296-5e269034b876	0	{"tipo": "marcenaria", "contrato_id": "7a8f169c-58d5-41cc-81d7-a9bd30b50cfb"}	2025-11-04 11:20:00.482889+00	2025-11-04 11:20:00.482889+00
\.


--
-- Data for Name: kanban_colunas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kanban_colunas (id, board_id, titulo, cor, posicao, created_at) FROM stdin;
52b55a0c-0258-498d-bbd2-dba820bda999	6877ef69-13e6-4c52-87a0-5b0604b3f1a7	Lead	#ef4444	0	2025-11-04 11:19:59.893924+00
0e3acb9f-caac-4015-a186-41ad006f856d	6877ef69-13e6-4c52-87a0-5b0604b3f1a7	Qualificação	#f59e0b	1	2025-11-04 11:19:59.893924+00
efe6095e-3be2-4067-a138-e09dba0022aa	6877ef69-13e6-4c52-87a0-5b0604b3f1a7	Proposta	#3b82f6	2	2025-11-04 11:19:59.893924+00
5bb2cb20-29c6-40e8-be43-2aa6e64e9358	6877ef69-13e6-4c52-87a0-5b0604b3f1a7	Negociação	#8b5cf6	3	2025-11-04 11:19:59.893924+00
0f5c5c57-2f19-41bb-bf8e-2c769db970a3	6877ef69-13e6-4c52-87a0-5b0604b3f1a7	Fechamento	#10b981	4	2025-11-04 11:19:59.893924+00
165c3d87-9629-44cc-a295-cc9b5918d484	845350b4-d608-4fe6-add1-41883c28f564	Conceitual	#8B5CF6	1	2025-11-04 11:20:00.482889+00
a75c6d72-ed3e-4c24-8a1c-9faa4518dd1d	845350b4-d608-4fe6-add1-41883c28f564	Executivo	#F59E0B	2	2025-11-04 11:20:00.482889+00
fff9aae5-45b3-4485-959a-a27e5cda7c9f	845350b4-d608-4fe6-add1-41883c28f564	Aprovação	#10B981	3	2025-11-04 11:20:00.482889+00
895a03b4-235a-4e55-9eb3-dc1a890f7856	845350b4-d608-4fe6-add1-41883c28f564	Briefing	#3B82F6	5	2025-11-04 11:20:00.482889+00
c52aad7e-ef5c-4d49-95df-81304e26f226	845350b4-d608-4fe6-add1-41883c28f564	Concluído	#6B7280	4	2025-11-04 11:20:00.482889+00
95d0988f-cc9b-45ca-a3a7-f7883bf0c065	7ee321dd-6c1b-4424-a00c-a92133a8b17c	Em Execução	#F59E0B	1	2025-11-04 11:20:00.482889+00
4e1b0fdd-f307-4ecb-8c91-a54b60b2e343	7ee321dd-6c1b-4424-a00c-a92133a8b17c	Vistoria	#8B5CF6	2	2025-11-04 11:20:00.482889+00
14589952-ef88-4293-9072-e5baac2bd79c	7ee321dd-6c1b-4424-a00c-a92133a8b17c	Planejamento	#3B82F6	4	2025-11-04 11:20:00.482889+00
052ca50a-3e41-4dc8-85e4-f7a39d908133	7ee321dd-6c1b-4424-a00c-a92133a8b17c	Concluída	#10B981	3	2025-11-04 11:20:00.482889+00
b0650504-f515-4f62-aa4f-a9b97754dc5c	cdba8c8b-e547-4834-a137-eaa988224b76	Produção	#F59E0B	1	2025-11-04 11:20:00.482889+00
2ca84a6c-0157-4a8b-9b1d-126616684898	cdba8c8b-e547-4834-a137-eaa988224b76	Acabamento	#8B5CF6	2	2025-11-04 11:20:00.482889+00
18d56444-642f-473e-ab97-d026af87dffa	cdba8c8b-e547-4834-a137-eaa988224b76	Instalação	#10B981	3	2025-11-04 11:20:00.482889+00
f08c9826-8335-407e-8e08-8337034aef30	cdba8c8b-e547-4834-a137-eaa988224b76	Projeto	#3B82F6	5	2025-11-04 11:20:00.482889+00
e61d7456-4ae2-4cd3-92cf-685c34d501bb	cdba8c8b-e547-4834-a137-eaa988224b76	Finalizado	#6B7280	4	2025-11-04 11:20:00.482889+00
\.


--
-- Data for Name: lancamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lancamentos (id, titulo_id, valor, data, tipo_pagamento, centro_custo_cliente_id, categoria_id, observacao, created_at) FROM stdin;
\.


--
-- Data for Name: lancamentos_financeiros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lancamentos_financeiros (id, empresa_id, cliente_id, tipo, categoria, categoria_id, descricao, valor, data_emissao, data_vencimento, data_pagamento, status, forma_pagamento, conta_financeira_id, centro_custo_id, titulo_id, contrato_id, obra_id, observacoes, documento, anexos, dados, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: obras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.obras (id, codigo, cliente_id, contrato_id, titulo, descricao, endereco, cidade, estado, cep, status, data_inicio, data_fim_prevista, data_fim_real, responsavel_id, valor_orcado, valor_realizado, progresso, observacoes, anexos, dados, created_at, updated_at) FROM stdin;
6913ea60-8b8d-440e-8bea-c70b9651440f	OBR-2025-001	989c6c4d-82d3-4a35-a3c6-13b0a8e22e19	\N	Reforma Apartamento Centro	\N	\N	\N	\N	\N	planejamento	\N	\N	\N	\N	150000.00	0.00	5	\N	[]	{}	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
1c81476a-82fb-44ab-a0d9-7a0ddf31290b	OBR-2025-002	c8c1cf55-a114-47f0-ad4f-1233331c3eb4	\N	Projeto Residencial Jardins	\N	\N	\N	\N	\N	planejamento	\N	\N	\N	\N	320000.00	0.00	10	\N	[]	{}	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
eb645a59-9f3d-4297-86f2-8771c00cf4a0	OBR-2025-004	989c6c4d-82d3-4a35-a3c6-13b0a8e22e19	\N	Reforma Escritório	\N	\N	\N	\N	\N	em_execucao	\N	\N	\N	\N	95000.00	0.00	60	\N	[]	{}	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
ec4c34b6-0b7d-4f22-81d4-0080e31f26c4	OBR-2025-005	c8c1cf55-a114-47f0-ad4f-1233331c3eb4	\N	Ampliação Galpão Industrial	\N	\N	\N	\N	\N	em_execucao	\N	\N	\N	\N	420000.00	0.00	30	\N	[]	{}	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
6a115b13-cdc3-4cee-af0e-a2ea6db845f5	OBR-2024-015	989c6c4d-82d3-4a35-a3c6-13b0a8e22e19	\N	Restaurante Boulevard	\N	\N	\N	\N	\N	finalizada	\N	\N	\N	\N	160000.00	0.00	100	\N	[]	{}	2025-11-04 11:20:00.442548+00	2025-11-04 11:20:00.442548+00
\.


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipelines (id, nome, estagio, probabilidade, entity_id, valor, dados, created_at) FROM stdin;
\.


--
-- Data for Name: plano_contas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plano_contas (id, grupo, conta, codigo, tipo, descricao, ativo, created_at, empresa_id) FROM stdin;
13c55c2f-18f6-4b5c-ace1-c5a028aa4a74	Receitas	Honorários de Projeto	R001	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
0a9f5482-7510-42fb-beb5-0f0f9343d2b0	Receitas	Vendas de Produtos	R002	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
57f5b7b5-6870-46cb-874b-db9a34f02520	Receitas	Prestação de Serviços	R003	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
b982346f-9ea2-4628-a78f-e83167a1f864	Despesas	Fornecedores	D001	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
febbc496-7e95-4a79-995d-feb05bd2f8f4	Despesas	Salários e Encargos	D002	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
c95c5008-fc85-4307-b712-bbbb42a90625	Despesas	Marketing e Publicidade	D003	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
9953e028-2cac-4a49-90ce-fd2722980f32	Despesas	Aluguel e Condomínio	D004	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
8d8352e1-f882-4a5b-9afa-89c123970716	Despesas	Impostos e Taxas	D005	\N	\N	t	2025-11-04 11:19:59.847857+00	\N
\.


--
-- Data for Name: produtos_servicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produtos_servicos (id, nome, descricao, categoria, tipo, preco, unidade, codigo_interno, ativo, estoque_minimo, estoque_atual, imagem_url, dados, created_at, updated_at) FROM stdin;
72dec78f-11bb-422f-bb92-d26fe4b368c9	Projeto Arquitetônico	Projeto arquitetônico completo	Arquitetura	servico	5000.00	m²	\N	t	0	0	\N	{}	2025-11-04 11:19:59.995284+00	2025-11-04 11:19:59.995284+00
53b6d81c-facd-474d-b591-7a02fa0b4c48	Projeto de Interiores	Projeto de design de interiores	Arquitetura	servico	3000.00	m²	\N	t	0	0	\N	{}	2025-11-04 11:19:59.995284+00	2025-11-04 11:19:59.995284+00
4e72ca71-2884-49b7-8d69-315192b77e3c	Acompanhamento de Obra	Acompanhamento técnico de obra	Obras	servico	2000.00	mês	\N	t	0	0	\N	{}	2025-11-04 11:19:59.995284+00	2025-11-04 11:19:59.995284+00
01d006e8-52c1-4369-98e6-62b7e2bc6ec1	Móvel Planejado	Móveis planejados sob medida	Marcenaria	produto	1500.00	m²	\N	t	0	0	\N	{}	2025-11-04 11:19:59.995284+00	2025-11-04 11:19:59.995284+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, nome, email, avatar_url, telefone, cargo, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: propostas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.propostas (id, numero, cliente_id, titulo, descricao, valor_total, validade_dias, data_emissao, data_validade, status, tipo, responsavel_id, observacoes, itens, anexos, dados, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: registro_categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_categorias (id, nome, descricao, cor, ativo, created_at, updated_at) FROM stdin;
2c1ef983-be4c-418a-8d2b-352f212c6313	Horas Trabalhadas	Registro de horas de trabalho	#3b82f6	t	2025-11-04 11:20:00.064275+00	2025-11-04 11:20:00.064275+00
b89dc724-1793-4ab6-8b4a-0ece91ae2083	Materiais	Materiais utilizados na obra	#10b981	t	2025-11-04 11:20:00.064275+00	2025-11-04 11:20:00.064275+00
bcc019ce-d546-4cd8-9911-a765c9cdcf08	Equipamentos	Uso de equipamentos	#f59e0b	t	2025-11-04 11:20:00.064275+00	2025-11-04 11:20:00.064275+00
c49f97a5-7fe8-4155-9947-9f8268856abd	Deslocamento	Deslocamento até obra	#8b5cf6	t	2025-11-04 11:20:00.064275+00	2025-11-04 11:20:00.064275+00
a4b0f3b3-b7ef-46cf-9329-600341a1fbcc	Consultoria	Horas de consultoria	#06b6d4	t	2025-11-04 11:20:00.064275+00	2025-11-04 11:20:00.064275+00
18670361-72fd-4835-8e4a-f20f573d198f	Projeto	Horas de projeto	#ec4899	t	2025-11-04 11:20:00.064275+00	2025-11-04 11:20:00.064275+00
\.


--
-- Data for Name: registros_trabalho; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registros_trabalho (id, profissional_id, cliente_id, proposta_id, obra_id, contrato_id, data, categoria_id, descricao, quantidade, unidade, valor_unitario, anexos, aprovado, aprovado_por, aprovado_em, gerar_lancamento, lancamento_id, observacoes, dados, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: titulos_financeiros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.titulos_financeiros (id, empresa_id, tipo, descricao, valor, data_emissao, data_vencimento, status, categoria_id, centro_custo_id, conta_financeira_id, observacao, documento, fornecedor_cliente, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: usuarios_perfis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios_perfis (id, user_id, perfil, permissoes, created_at) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_03; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_04; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_05; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_06; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_06 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_07; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_07 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-11-04 11:19:48
20211116045059	2025-11-04 11:19:48
20211116050929	2025-11-04 11:19:48
20211116051442	2025-11-04 11:19:48
20211116212300	2025-11-04 11:19:48
20211116213355	2025-11-04 11:19:48
20211116213934	2025-11-04 11:19:48
20211116214523	2025-11-04 11:19:48
20211122062447	2025-11-04 11:19:48
20211124070109	2025-11-04 11:19:48
20211202204204	2025-11-04 11:19:48
20211202204605	2025-11-04 11:19:48
20211210212804	2025-11-04 11:19:48
20211228014915	2025-11-04 11:19:48
20220107221237	2025-11-04 11:19:48
20220228202821	2025-11-04 11:19:48
20220312004840	2025-11-04 11:19:48
20220603231003	2025-11-04 11:19:48
20220603232444	2025-11-04 11:19:48
20220615214548	2025-11-04 11:19:48
20220712093339	2025-11-04 11:19:48
20220908172859	2025-11-04 11:19:48
20220916233421	2025-11-04 11:19:48
20230119133233	2025-11-04 11:19:48
20230128025114	2025-11-04 11:19:48
20230128025212	2025-11-04 11:19:48
20230227211149	2025-11-04 11:19:48
20230228184745	2025-11-04 11:19:48
20230308225145	2025-11-04 11:19:48
20230328144023	2025-11-04 11:19:48
20231018144023	2025-11-04 11:19:48
20231204144023	2025-11-04 11:19:48
20231204144024	2025-11-04 11:19:48
20231204144025	2025-11-04 11:19:48
20240108234812	2025-11-04 11:19:48
20240109165339	2025-11-04 11:19:48
20240227174441	2025-11-04 11:19:48
20240311171622	2025-11-04 11:19:48
20240321100241	2025-11-04 11:19:48
20240401105812	2025-11-04 11:19:48
20240418121054	2025-11-04 11:19:48
20240523004032	2025-11-04 11:19:48
20240618124746	2025-11-04 11:19:48
20240801235015	2025-11-04 11:19:48
20240805133720	2025-11-04 11:19:48
20240827160934	2025-11-04 11:19:48
20240919163303	2025-11-04 11:19:48
20240919163305	2025-11-04 11:19:48
20241019105805	2025-11-04 11:19:48
20241030150047	2025-11-04 11:19:48
20241108114728	2025-11-04 11:19:48
20241121104152	2025-11-04 11:19:48
20241130184212	2025-11-04 11:19:48
20241220035512	2025-11-04 11:19:48
20241220123912	2025-11-04 11:19:48
20241224161212	2025-11-04 11:19:48
20250107150512	2025-11-04 11:19:48
20250110162412	2025-11-04 11:19:48
20250123174212	2025-11-04 11:19:48
20250128220012	2025-11-04 11:19:48
20250506224012	2025-11-04 11:19:48
20250523164012	2025-11-04 11:19:48
20250714121412	2025-11-04 11:19:48
20250905041441	2025-11-04 11:19:48
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_namespaces (id, bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_tables (id, namespace_id, bucket_id, name, location, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-11-04 11:19:57.827057
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-11-04 11:19:57.83643
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-11-04 11:19:57.837634
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-11-04 11:19:57.851801
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-11-04 11:19:57.870297
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-11-04 11:19:57.874871
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-11-04 11:19:57.879
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-11-04 11:19:57.883901
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-11-04 11:19:57.885652
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-11-04 11:19:57.887231
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-11-04 11:19:57.889676
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-11-04 11:19:57.892171
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-11-04 11:19:57.895012
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-11-04 11:19:57.8967
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-11-04 11:19:57.899755
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-11-04 11:19:57.913686
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-11-04 11:19:57.915629
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-11-04 11:19:57.91666
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-11-04 11:19:57.919257
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-11-04 11:19:57.925548
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-11-04 11:19:57.927966
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-11-04 11:19:57.930437
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-11-04 11:19:57.93828
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-11-04 11:19:57.942559
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-11-04 11:19:57.945188
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-11-04 11:19:57.947617
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-11-04 11:19:57.951201
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-11-04 11:19:57.965821
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-11-04 11:19:58.034676
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-11-04 11:19:58.040375
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-11-04 11:19:58.042762
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-11-04 11:19:58.04463
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-11-04 11:19:58.046329
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-11-04 11:19:58.047427
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-11-04 11:19:58.047684
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-11-04 11:19:58.050883
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-11-04 11:19:58.05192
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-11-04 11:19:58.054629
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-11-04 11:19:58.055706
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-11-04 11:19:58.062011
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-11-04 11:19:58.0642
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-11-04 11:19:58.067567
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-11-04 11:19:58.069661
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-11-04 11:19:58.071905
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-11-04 11:19:43.964423+00
20210809183423_update_grants	2025-11-04 11:19:43.964423+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
001	{"-- =============================================\n-- MIGRATION: 001\n-- Descrição: Criar tabelas base do sistema\n-- Data: 2025-10-30\n-- Autor: Equipe WG\n-- =============================================\n-- Tabelas criadas:\n--   - profiles (usuários do sistema)\n--   - usuarios_perfis (permissões)\n--   - empresas (empresas do grupo)\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. TABELA: profiles (estende auth.users)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.profiles (\n  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,\n  nome TEXT NOT NULL,\n  email TEXT UNIQUE NOT NULL,\n  avatar_url TEXT,\n  telefone TEXT,\n  cargo TEXT,\n  ativo BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_profiles_email ON profiles(email)","CREATE INDEX idx_profiles_ativo ON profiles(ativo)","-- Comentário\nCOMMENT ON TABLE profiles IS 'Perfis de usuários do sistema, estende auth.users do Supabase'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. TABELA: usuarios_perfis (permissões)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.usuarios_perfis (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,\n  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'gestor', 'vendedor', 'arquiteto', 'financeiro', 'readonly')),\n  permissoes JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_usuarios_perfis_user ON usuarios_perfis(user_id)","CREATE INDEX idx_usuarios_perfis_perfil ON usuarios_perfis(perfil)","-- Comentário\nCOMMENT ON TABLE usuarios_perfis IS 'Perfis e permissões dos usuários'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3. TABELA: empresas (empresas do grupo)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.empresas (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  razao_social TEXT NOT NULL,\n  nome_fantasia TEXT,\n  cnpj TEXT UNIQUE,\n  inscricao_estadual TEXT,\n  tipo TEXT CHECK (tipo IN ('matriz', 'filial', 'parceiro')),\n  endereco TEXT,\n  cidade TEXT,\n  estado TEXT,\n  cep TEXT,\n  telefone TEXT,\n  email TEXT,\n  ativo BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_empresas_cnpj ON empresas(cnpj)","CREATE INDEX idx_empresas_ativo ON empresas(ativo)","-- Comentário\nCOMMENT ON TABLE empresas IS 'Empresas do grupo WG Almeida'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- TRIGGER: Atualizar updated_at automaticamente\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE OR REPLACE FUNCTION public.update_updated_at_column()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.updated_at = NOW();\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql","CREATE TRIGGER profiles_updated_at\n  BEFORE UPDATE ON profiles\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER empresas_updated_at\n  BEFORE UPDATE ON empresas\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- DADOS INICIAIS (seed)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Inserir empresa padrão\nINSERT INTO empresas (razao_social, nome_fantasia, cnpj, tipo)\nVALUES\n  ('WG Almeida Arquitetura LTDA', 'WG Arquitetura', '00.000.000/0001-00', 'matriz')\nON CONFLICT (cnpj) DO NOTHING"}	criar_tabelas_base
002	{"-- =============================================\n-- MIGRATION: 002\n-- Descrição: Criar tabelas do módulo financeiro\n-- Data: 2025-10-30\n-- Autor: Equipe WG\n-- =============================================\n-- Tabelas criadas:\n--   - plano_contas (plano de contas contábil)\n--   - centros_custo (centros de custo)\n--   - contas_financeiras (contas bancárias)\n--   - titulos_financeiros (títulos a pagar/receber)\n--   - lancamentos (lançamentos financeiros)\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. TABELA: plano_contas\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.plano_contas (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  grupo TEXT NOT NULL CHECK (grupo IN ('Receitas', 'Despesas')),\n  conta TEXT NOT NULL,\n  codigo TEXT UNIQUE,\n  tipo TEXT,\n  descricao TEXT,\n  ativo BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_plano_contas_grupo ON plano_contas(grupo)","CREATE INDEX idx_plano_contas_ativo ON plano_contas(ativo)","-- Comentário\nCOMMENT ON TABLE plano_contas IS 'Plano de contas contábil'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. TABELA: centros_custo\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.centros_custo (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  nome TEXT NOT NULL,\n  codigo TEXT UNIQUE,\n  descricao TEXT,\n  ativo BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_centros_custo_ativo ON centros_custo(ativo)","-- Comentário\nCOMMENT ON TABLE centros_custo IS 'Centros de custo para controle gerencial'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3. TABELA: contas_financeiras\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.contas_financeiras (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,\n  banco TEXT NOT NULL,\n  agencia TEXT,\n  conta TEXT,\n  tipo TEXT CHECK (tipo IN ('corrente', 'poupanca', 'investimento')),\n  saldo_inicial NUMERIC(15, 2) DEFAULT 0,\n  saldo_atual NUMERIC(15, 2) DEFAULT 0,\n  ativo BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_contas_financeiras_empresa ON contas_financeiras(empresa_id)","-- Trigger\nCREATE TRIGGER contas_financeiras_updated_at\n  BEFORE UPDATE ON contas_financeiras\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE contas_financeiras IS 'Contas bancárias das empresas'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 4. TABELA: titulos_financeiros\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.titulos_financeiros (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,\n  tipo TEXT NOT NULL CHECK (tipo IN ('Pagar', 'Receber')),\n  descricao TEXT NOT NULL,\n  valor NUMERIC(15, 2) NOT NULL,\n  data_emissao DATE NOT NULL,\n  data_vencimento DATE NOT NULL,\n  status TEXT CHECK (status IN ('Previsto', 'Aprovado', 'Pago', 'Cancelado', 'Vencido')),\n  categoria_id UUID REFERENCES plano_contas(id) ON DELETE SET NULL,\n  centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,\n  conta_financeira_id UUID REFERENCES contas_financeiras(id) ON DELETE SET NULL,\n  observacao TEXT,\n  documento TEXT,\n  fornecedor_cliente TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_titulos_empresa ON titulos_financeiros(empresa_id)","CREATE INDEX idx_titulos_tipo ON titulos_financeiros(tipo)","CREATE INDEX idx_titulos_status ON titulos_financeiros(status)","CREATE INDEX idx_titulos_vencimento ON titulos_financeiros(data_vencimento)","CREATE INDEX idx_titulos_categoria ON titulos_financeiros(categoria_id)","-- Trigger\nCREATE TRIGGER titulos_financeiros_updated_at\n  BEFORE UPDATE ON titulos_financeiros\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE titulos_financeiros IS 'Títulos a pagar e a receber'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 5. TABELA: lancamentos\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.lancamentos (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  titulo_id UUID REFERENCES titulos_financeiros(id) ON DELETE CASCADE,\n  valor NUMERIC(15, 2) NOT NULL,\n  data DATE NOT NULL,\n  tipo_pagamento TEXT,\n  centro_custo_cliente_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,\n  categoria_id UUID REFERENCES plano_contas(id) ON DELETE SET NULL,\n  observacao TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_lancamentos_titulo ON lancamentos(titulo_id)","CREATE INDEX idx_lancamentos_data ON lancamentos(data)","-- Comentário\nCOMMENT ON TABLE lancamentos IS 'Lançamentos financeiros (parcelas, pagamentos)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- DADOS INICIAIS (seed)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Plano de Contas padrão\nINSERT INTO plano_contas (grupo, conta, codigo) VALUES\n  ('Receitas', 'Honorários de Projeto', 'R001'),\n  ('Receitas', 'Vendas de Produtos', 'R002'),\n  ('Receitas', 'Prestação de Serviços', 'R003'),\n  ('Despesas', 'Fornecedores', 'D001'),\n  ('Despesas', 'Salários e Encargos', 'D002'),\n  ('Despesas', 'Marketing e Publicidade', 'D003'),\n  ('Despesas', 'Aluguel e Condomínio', 'D004'),\n  ('Despesas', 'Impostos e Taxas', 'D005')\nON CONFLICT (codigo) DO NOTHING","-- Centros de Custo padrão\nINSERT INTO centros_custo (nome, codigo) VALUES\n  ('Arquitetura', 'CC001'),\n  ('Marcenaria', 'CC002'),\n  ('Engenharia', 'CC003'),\n  ('Marketing', 'CC004'),\n  ('Administrativo', 'CC005')\nON CONFLICT (codigo) DO NOTHING"}	criar_tabelas_financeiro
003	{"-- =============================================\n-- MIGRATION: 003\n-- Descrição: Criar tabelas do sistema Kanban/Pipeline\n-- Data: 2025-10-30\n-- Autor: Equipe WG\n-- =============================================\n-- Tabelas criadas:\n--   - entities (entidades genéricas: clientes, leads, fornecedores)\n--   - kanban_boards (quadros kanban)\n--   - kanban_colunas (colunas dos quadros)\n--   - kanban_cards (cards/oportunidades)\n--   - pipelines (histórico de pipeline)\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. TABELA: entities (entidades genéricas)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.entities (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'lead', 'fornecedor')),\n  nome TEXT NOT NULL,\n  email TEXT,\n  telefone TEXT,\n  cpf_cnpj TEXT,\n  endereco TEXT,\n  cidade TEXT,\n  estado TEXT,\n  cep TEXT,\n  dados JSONB DEFAULT '{}'::jsonb,\n  ativo BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_entities_tipo ON entities(tipo)","CREATE INDEX idx_entities_ativo ON entities(ativo)","CREATE INDEX idx_entities_email ON entities(email)","CREATE INDEX idx_entities_cpf_cnpj ON entities(cpf_cnpj)","CREATE INDEX idx_entities_dados ON entities USING gin (dados)","-- Trigger\nCREATE TRIGGER entities_updated_at\n  BEFORE UPDATE ON entities\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE entities IS 'Entidades genéricas: clientes, leads, fornecedores'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. TABELA: kanban_boards (quadros kanban)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.kanban_boards (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  ambiente TEXT NOT NULL UNIQUE,\n  titulo TEXT NOT NULL,\n  descricao TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_kanban_boards_ambiente ON kanban_boards(ambiente)","-- Comentário\nCOMMENT ON TABLE kanban_boards IS 'Quadros Kanban para diferentes contextos'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3. TABELA: kanban_colunas (colunas dos quadros)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.kanban_colunas (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  board_id UUID REFERENCES kanban_boards(id) ON DELETE CASCADE,\n  titulo TEXT NOT NULL,\n  cor TEXT DEFAULT '#94a3b8',\n  posicao INTEGER NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  UNIQUE(board_id, posicao)\n)","-- Índices\nCREATE INDEX idx_kanban_colunas_board ON kanban_colunas(board_id)","CREATE INDEX idx_kanban_colunas_posicao ON kanban_colunas(posicao)","-- Comentário\nCOMMENT ON TABLE kanban_colunas IS 'Colunas dos quadros Kanban'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 4. TABELA: kanban_cards (cards/oportunidades)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.kanban_cards (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  coluna_id UUID REFERENCES kanban_colunas(id) ON DELETE CASCADE,\n  titulo TEXT NOT NULL,\n  descricao TEXT,\n  valor NUMERIC(15, 2),\n  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,\n  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,\n  posicao INTEGER NOT NULL DEFAULT 0,\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_kanban_cards_coluna ON kanban_cards(coluna_id)","CREATE INDEX idx_kanban_cards_responsavel ON kanban_cards(responsavel_id)","CREATE INDEX idx_kanban_cards_entity ON kanban_cards(entity_id)","CREATE INDEX idx_kanban_cards_dados ON kanban_cards USING gin (dados)","-- Trigger\nCREATE TRIGGER kanban_cards_updated_at\n  BEFORE UPDATE ON kanban_cards\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE kanban_cards IS 'Cards do Kanban (oportunidades, leads, etc)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 5. TABELA: pipelines (histórico de pipeline)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.pipelines (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  nome TEXT NOT NULL,\n  estagio TEXT,\n  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100),\n  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,\n  valor NUMERIC(15, 2),\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_pipelines_entity ON pipelines(entity_id)","CREATE INDEX idx_pipelines_estagio ON pipelines(estagio)","-- Comentário\nCOMMENT ON TABLE pipelines IS 'Histórico de pipelines de vendas'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- DADOS INICIAIS (seed)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Criar board de oportunidades\nINSERT INTO kanban_boards (ambiente, titulo, descricao) VALUES\n  ('oportunidades', 'Pipeline de Vendas', 'Funil de vendas com oportunidades')\nON CONFLICT (ambiente) DO NOTHING","-- Criar colunas padrão para oportunidades\nDO $$\nDECLARE\n  v_board_id UUID;\nBEGIN\n  SELECT id INTO v_board_id FROM kanban_boards WHERE ambiente = 'oportunidades';\n\n  IF v_board_id IS NOT NULL THEN\n    INSERT INTO kanban_colunas (board_id, titulo, cor, posicao) VALUES\n      (v_board_id, 'Lead', '#ef4444', 0),\n      (v_board_id, 'Qualificação', '#f59e0b', 1),\n      (v_board_id, 'Proposta', '#3b82f6', 2),\n      (v_board_id, 'Negociação', '#8b5cf6', 3),\n      (v_board_id, 'Fechamento', '#10b981', 4)\n    ON CONFLICT (board_id, posicao) DO NOTHING;\n  END IF;\nEND;\n$$","-- Criar board de leads\nINSERT INTO kanban_boards (ambiente, titulo, descricao) VALUES\n  ('leads', 'Captação de Leads', 'Gestão de leads capturados')\nON CONFLICT (ambiente) DO NOTHING","-- Criar board de obras\nINSERT INTO kanban_boards (ambiente, titulo, descricao) VALUES\n  ('obras', 'Gestão de Obras', 'Acompanhamento de projetos em execução')\nON CONFLICT (ambiente) DO NOTHING"}	criar_tabelas_kanban_pipeline
004	{"-- =============================================\n-- MIGRATION: 004\n-- Descrição: Criar views para consultas otimizadas\n-- Data: 2025-10-30\n-- Autor: Equipe WG\n-- =============================================\n-- Views criadas:\n--   - vw_pipeline_oportunidades (dados agregados do pipeline)\n--   - vw_titulos_resumo (resumo financeiro)\n--   - vw_oportunidades_completas (oportunidades com todos os dados)\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. VIEW: vw_pipeline_oportunidades\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE OR REPLACE VIEW vw_pipeline_oportunidades AS\nSELECT\n  col.titulo as estagio,\n  col.cor as cor_estagio,\n  col.posicao,\n  COUNT(kc.id) as quantidade,\n  COALESCE(SUM(kc.valor), 0) as valor_total\nFROM kanban_colunas col\nLEFT JOIN kanban_cards kc ON kc.coluna_id = col.id\nJOIN kanban_boards kb ON col.board_id = kb.id\nWHERE kb.ambiente = 'oportunidades'\nGROUP BY col.id, col.titulo, col.cor, col.posicao\nORDER BY col.posicao","COMMENT ON VIEW vw_pipeline_oportunidades IS 'Dados agregados do pipeline de vendas por estágio'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. VIEW: vw_titulos_resumo\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE OR REPLACE VIEW vw_titulos_resumo AS\nSELECT\n  e.id as empresa_id,\n  e.razao_social as empresa,\n\n  -- Receitas\n  COALESCE(SUM(CASE\n    WHEN t.tipo = 'Receber' AND t.status = 'Pago'\n    THEN t.valor ELSE 0\n  END), 0) as total_receitas,\n\n  -- Despesas\n  COALESCE(SUM(CASE\n    WHEN t.tipo = 'Pagar' AND t.status = 'Pago'\n    THEN t.valor ELSE 0\n  END), 0) as total_despesas,\n\n  -- A Receber\n  COALESCE(SUM(CASE\n    WHEN t.tipo = 'Receber' AND t.status IN ('Previsto', 'Aprovado')\n    THEN t.valor ELSE 0\n  END), 0) as a_receber,\n\n  -- A Pagar\n  COALESCE(SUM(CASE\n    WHEN t.tipo = 'Pagar' AND t.status IN ('Previsto', 'Aprovado')\n    THEN t.valor ELSE 0\n  END), 0) as a_pagar,\n\n  -- Saldo\n  COALESCE(SUM(CASE\n    WHEN t.tipo = 'Receber' AND t.status = 'Pago'\n    THEN t.valor\n    WHEN t.tipo = 'Pagar' AND t.status = 'Pago'\n    THEN -t.valor\n    ELSE 0\n  END), 0) as saldo,\n\n  -- Vencidos\n  COUNT(CASE\n    WHEN t.status IN ('Previsto', 'Aprovado')\n    AND t.data_vencimento < CURRENT_DATE\n    THEN 1\n  END) as titulos_vencidos\n\nFROM empresas e\nLEFT JOIN titulos_financeiros t ON t.empresa_id = e.id\nWHERE e.ativo = TRUE\nGROUP BY e.id, e.razao_social","COMMENT ON VIEW vw_titulos_resumo IS 'Resumo financeiro consolidado por empresa'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3. VIEW: vw_oportunidades_completas\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE OR REPLACE VIEW vw_oportunidades_completas AS\nSELECT\n  kc.id,\n  kc.titulo,\n  kc.descricao,\n  kc.valor,\n  kc.posicao,\n  kc.dados,\n  kc.created_at,\n  kc.updated_at,\n\n  -- Coluna\n  col.id as coluna_id,\n  col.titulo as coluna_titulo,\n  col.cor as coluna_cor,\n  col.posicao as coluna_posicao,\n\n  -- Board\n  kb.id as board_id,\n  kb.ambiente as board_ambiente,\n  kb.titulo as board_titulo,\n\n  -- Responsável\n  p.id as responsavel_id,\n  p.nome as responsavel_nome,\n  p.email as responsavel_email,\n\n  -- Cliente/Lead\n  e.id as entity_id,\n  e.tipo as entity_tipo,\n  e.nome as entity_nome,\n  e.email as entity_email,\n  e.telefone as entity_telefone,\n  e.dados as entity_dados\n\nFROM kanban_cards kc\nJOIN kanban_colunas col ON kc.coluna_id = col.id\nJOIN kanban_boards kb ON col.board_id = kb.id\nLEFT JOIN profiles p ON kc.responsavel_id = p.id\nLEFT JOIN entities e ON kc.entity_id = e.id\nWHERE kb.ambiente = 'oportunidades'\nORDER BY col.posicao, kc.posicao","COMMENT ON VIEW vw_oportunidades_completas IS 'Oportunidades com todos os dados relacionados (joins)'"}	criar_views
005	{"-- =============================================\n-- MIGRATION: 005\n-- Descrição: Habilitar Row Level Security (RLS)\n-- Data: 2025-10-30\n-- Autor: Equipe WG\n-- =============================================\n-- RLS habilitado em:\n--   - profiles\n--   - empresas\n--   - titulos_financeiros\n--   - lancamentos\n--   - entities\n--   - kanban_cards\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. HABILITAR RLS NAS TABELAS\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY","ALTER TABLE usuarios_perfis ENABLE ROW LEVEL SECURITY","ALTER TABLE empresas ENABLE ROW LEVEL SECURITY","ALTER TABLE titulos_financeiros ENABLE ROW LEVEL SECURITY","ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY","ALTER TABLE entities ENABLE ROW LEVEL SECURITY","ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY","ALTER TABLE kanban_colunas ENABLE ROW LEVEL SECURITY","ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY","ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. POLICIES: profiles\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Usuários podem ver seu próprio perfil\nCREATE POLICY \\"Users can view own profile\\"\n  ON profiles FOR SELECT\n  USING (auth.uid() = id)","-- Usuários podem atualizar seu próprio perfil\nCREATE POLICY \\"Users can update own profile\\"\n  ON profiles FOR UPDATE\n  USING (auth.uid() = id)","-- Admins podem ver todos os perfis\nCREATE POLICY \\"Admins can view all profiles\\"\n  ON profiles FOR SELECT\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil = 'admin'\n    )\n  )","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3. POLICIES: empresas\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Todos os usuários autenticados podem ver empresas\nCREATE POLICY \\"Authenticated users can view companies\\"\n  ON empresas FOR SELECT\n  TO authenticated\n  USING (TRUE)","-- Apenas admins podem criar/editar empresas\nCREATE POLICY \\"Admins can manage companies\\"\n  ON empresas FOR ALL\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil = 'admin'\n    )\n  )","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 4. POLICIES: titulos_financeiros\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Usuários veem títulos de empresas que têm acesso\nCREATE POLICY \\"Users can view titles of accessible companies\\"\n  ON titulos_financeiros FOR SELECT\n  TO authenticated\n  USING (\n    -- Admin vê tudo\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil = 'admin'\n    )\n    OR\n    -- Ou usuário tem acesso à empresa do título\n    TRUE  -- TODO: implementar lógica de acesso por empresa\n  )","-- Usuários com perfil 'financeiro' ou 'admin' podem criar/editar\nCREATE POLICY \\"Financial users can manage titles\\"\n  ON titulos_financeiros FOR ALL\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil IN ('admin', 'financeiro', 'gestor')\n    )\n  )","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 5. POLICIES: lancamentos\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Mesmas regras dos títulos\nCREATE POLICY \\"Users can view lancamentos\\"\n  ON lancamentos FOR SELECT\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil IN ('admin', 'financeiro', 'gestor')\n    )\n  )","CREATE POLICY \\"Financial users can manage lancamentos\\"\n  ON lancamentos FOR ALL\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil IN ('admin', 'financeiro', 'gestor')\n    )\n  )","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 6. POLICIES: entities\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Todos os usuários autenticados podem ver entities\nCREATE POLICY \\"Authenticated users can view entities\\"\n  ON entities FOR SELECT\n  TO authenticated\n  USING (TRUE)","-- Usuários autenticados podem criar entities\nCREATE POLICY \\"Authenticated users can create entities\\"\n  ON entities FOR INSERT\n  TO authenticated\n  WITH CHECK (TRUE)","-- Usuários autenticados podem atualizar entities\nCREATE POLICY \\"Authenticated users can update entities\\"\n  ON entities FOR UPDATE\n  TO authenticated\n  USING (TRUE)","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 7. POLICIES: kanban_cards\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Todos os usuários autenticados podem ver cards\nCREATE POLICY \\"Authenticated users can view cards\\"\n  ON kanban_cards FOR SELECT\n  TO authenticated\n  USING (TRUE)","-- Responsável pode editar seus cards\nCREATE POLICY \\"Responsible user can edit own cards\\"\n  ON kanban_cards FOR UPDATE\n  TO authenticated\n  USING (responsavel_id = auth.uid())","-- Gestores e admins podem editar qualquer card\nCREATE POLICY \\"Managers can edit any card\\"\n  ON kanban_cards FOR ALL\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil IN ('admin', 'gestor')\n    )\n  )","-- Vendedores podem criar cards\nCREATE POLICY \\"Sellers can create cards\\"\n  ON kanban_cards FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil IN ('admin', 'gestor', 'vendedor', 'arquiteto')\n    )\n  )","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 8. POLICIES: Boards e Colunas (leitura pública)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Todos podem ver boards\nCREATE POLICY \\"Authenticated users can view boards\\"\n  ON kanban_boards FOR SELECT\n  TO authenticated\n  USING (TRUE)","-- Todos podem ver colunas\nCREATE POLICY \\"Authenticated users can view columns\\"\n  ON kanban_colunas FOR SELECT\n  TO authenticated\n  USING (TRUE)","-- Apenas admins podem gerenciar boards/colunas\nCREATE POLICY \\"Admins can manage boards\\"\n  ON kanban_boards FOR ALL\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil = 'admin'\n    )\n  )","CREATE POLICY \\"Admins can manage columns\\"\n  ON kanban_colunas FOR ALL\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM usuarios_perfis\n      WHERE user_id = auth.uid()\n      AND perfil = 'admin'\n    )\n  )"}	habilitar_rls
006	{"-- =============================================\n-- MIGRATION: 006\n-- Descrição: Criar tabelas faltando (CRÍTICAS!)\n-- Data: 2025-10-30\n-- Autor: Equipe WG\n-- =============================================\n-- Tabelas criadas:\n--   - assistencias (ordens de serviço / assistência técnica)\n--   - produtos_servicos (catálogo de produtos e serviços)\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. TABELA: assistencias (CRÍTICA - Estava faltando!)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.assistencias (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  codigo TEXT NOT NULL UNIQUE,\n  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,\n  cliente_nome TEXT,\n  descricao TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'agendado', 'em_atendimento', 'atendido', 'em_atraso')),\n  data_solicitacao TIMESTAMPTZ DEFAULT NOW(),\n  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,\n  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),\n  observacoes TEXT,\n  data_agendamento TIMESTAMPTZ,\n  data_conclusao TIMESTAMPTZ,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_assistencias_cliente ON assistencias(cliente_id)","CREATE INDEX idx_assistencias_status ON assistencias(status)","CREATE INDEX idx_assistencias_codigo ON assistencias(codigo)","CREATE INDEX idx_assistencias_data ON assistencias(data_solicitacao)","CREATE INDEX idx_assistencias_responsavel ON assistencias(responsavel_id)","-- Trigger\nCREATE TRIGGER assistencias_updated_at\n  BEFORE UPDATE ON assistencias\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE assistencias IS 'Ordens de Serviço / Assistências técnicas'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. TABELA: produtos_servicos (CRÍTICA - Estava faltando!)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.produtos_servicos (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  nome TEXT NOT NULL UNIQUE,\n  descricao TEXT,\n  categoria TEXT,\n  tipo TEXT CHECK (tipo IN ('produto', 'servico', 'ambos')),\n  preco NUMERIC(15, 2) DEFAULT 0,\n  unidade TEXT DEFAULT 'un',\n  codigo_interno TEXT UNIQUE,\n  ativo BOOLEAN DEFAULT TRUE,\n  estoque_minimo INTEGER DEFAULT 0,\n  estoque_atual INTEGER DEFAULT 0,\n  imagem_url TEXT,\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_produtos_servicos_ativo ON produtos_servicos(ativo)","CREATE INDEX idx_produtos_servicos_nome ON produtos_servicos(nome)","CREATE INDEX idx_produtos_servicos_categoria ON produtos_servicos(categoria)","CREATE INDEX idx_produtos_servicos_tipo ON produtos_servicos(tipo)","CREATE INDEX idx_produtos_servicos_codigo ON produtos_servicos(codigo_interno)","-- Trigger\nCREATE TRIGGER produtos_servicos_updated_at\n  BEFORE UPDATE ON produtos_servicos\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE produtos_servicos IS 'Catálogo de produtos e serviços oferecidos pela empresa'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- DADOS INICIAIS (seed)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Produtos/Serviços padrão\nINSERT INTO produtos_servicos (nome, descricao, categoria, tipo, preco, unidade) VALUES\n  ('Projeto Arquitetônico', 'Projeto arquitetônico completo', 'Arquitetura', 'servico', 5000.00, 'm²'),\n  ('Projeto de Interiores', 'Projeto de design de interiores', 'Arquitetura', 'servico', 3000.00, 'm²'),\n  ('Acompanhamento de Obra', 'Acompanhamento técnico de obra', 'Obras', 'servico', 2000.00, 'mês'),\n  ('Móvel Planejado', 'Móveis planejados sob medida', 'Marcenaria', 'produto', 1500.00, 'm²')\nON CONFLICT (nome) DO NOTHING"}	criar_tabelas_faltando
007	{"-- =============================================\n-- MIGRATION: 007\n-- Descrição: Corrigir campos faltando em tabelas existentes\n-- Data: 2025-10-30\n-- Autor: Equipe WG\n-- =============================================\n-- Alterações:\n--   - Adicionar campo 'apelido' em contas_financeiras\n--   - Adicionar campo 'empresa_id' em plano_contas\n--   - Adicionar campo 'empresa_id' em centros_custo\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. ADICIONAR CAMPOS em contas_financeiras\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nALTER TABLE contas_financeiras\nADD COLUMN IF NOT EXISTS apelido TEXT","COMMENT ON COLUMN contas_financeiras.apelido IS 'Nome amigável para identificação rápida da conta (ex: \\"Conta Principal Santander\\")'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. ADICIONAR CAMPOS em plano_contas\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nALTER TABLE plano_contas\nADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE","-- Índice\nCREATE INDEX IF NOT EXISTS idx_plano_contas_empresa ON plano_contas(empresa_id)","COMMENT ON COLUMN plano_contas.empresa_id IS 'Empresa dona do plano de contas (NULL = compartilhado entre todas)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3. ADICIONAR CAMPOS em centros_custo\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nALTER TABLE centros_custo\nADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE","-- Índice\nCREATE INDEX IF NOT EXISTS idx_centros_custo_empresa ON centros_custo(empresa_id)","COMMENT ON COLUMN centros_custo.empresa_id IS 'Empresa dona do centro de custo (NULL = compartilhado entre todas)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 4. ATUALIZAR DADOS EXISTENTES (opcional)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Gerar apelidos para contas existentes (se houver)\nUPDATE contas_financeiras\nSET apelido = banco || ' - ' || COALESCE(agencia, 'S/A') || '/' || conta\nWHERE apelido IS NULL","-- Se quiser vincular plano de contas/centros custo à primeira empresa:\n-- UPDATE plano_contas SET empresa_id = (SELECT id FROM empresas LIMIT 1) WHERE empresa_id IS NULL;\n-- UPDATE centros_custo SET empresa_id = (SELECT id FROM empresas LIMIT 1) WHERE empresa_id IS NULL;"}	corrigir_campos_faltando
012	{"-- =============================================\n-- MIGRATION: 012\n-- Descrição: Sistema completo - Tabelas faltantes, Registros de Trabalho e Views Críticas\n-- Data: 2025-11-02\n-- Autor: Supabase MCP Expert\n-- =============================================\n-- O que será criado:\n--   PARTE 1: Tabelas Base Faltantes (4 tabelas)\n--     - contratos (contratos com clientes)\n--     - propostas (propostas comerciais)\n--     - obras (gestão de obras/projetos)\n--     - lancamentos_financeiros (lançamentos financeiros detalhados)\n--\n--   PARTE 2: Sistema de Registros de Trabalho (2 tabelas)\n--     - registro_categorias (categorias de registros)\n--     - registros_trabalho (registros diários de trabalho)\n--\n--   PARTE 3: Views SQL Críticas (7 views)\n--     - v_clientes_ativos_contratos\n--     - v_fluxo_caixa\n--     - v_despesas_mes_categoria\n--     - v_top10_clientes_receita\n--     - vw_pipeline_oportunidades (atualizada)\n--     - v_kanban_cards_board\n--     - v_registros_trabalho\n-- =============================================\n\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- PARTE 1: TABELAS BASE FALTANTES\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1.1 TABELA: contratos\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.contratos (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  numero TEXT UNIQUE NOT NULL,\n  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,\n  proposta_id UUID, -- FK será adicionada depois que propostas for criada\n  titulo TEXT NOT NULL,\n  descricao TEXT,\n  valor_total NUMERIC(15, 2) NOT NULL DEFAULT 0,\n  data_inicio DATE,\n  data_fim DATE,\n  data_assinatura DATE,\n  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'concluido', 'cancelado')),\n  tipo TEXT CHECK (tipo IN ('arquitetura', 'marcenaria', 'engenharia', 'consultoria', 'outros')),\n  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,\n  observacoes TEXT,\n  anexos JSONB DEFAULT '[]'::jsonb,\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_contratos_cliente ON contratos(cliente_id)","CREATE INDEX idx_contratos_proposta ON contratos(proposta_id)","CREATE INDEX idx_contratos_status ON contratos(status)","CREATE INDEX idx_contratos_numero ON contratos(numero)","CREATE INDEX idx_contratos_responsavel ON contratos(responsavel_id)","CREATE INDEX idx_contratos_dados ON contratos USING gin (dados)","-- Trigger\nCREATE TRIGGER contratos_updated_at\n  BEFORE UPDATE ON contratos\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE contratos IS 'Contratos firmados com clientes'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1.2 TABELA: propostas\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.propostas (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  numero TEXT UNIQUE NOT NULL,\n  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,\n  titulo TEXT NOT NULL,\n  descricao TEXT,\n  valor_total NUMERIC(15, 2) NOT NULL DEFAULT 0,\n  validade_dias INTEGER DEFAULT 30,\n  data_emissao DATE DEFAULT CURRENT_DATE,\n  data_validade DATE,\n  status TEXT DEFAULT 'pendente' CHECK (status IN ('rascunho', 'pendente', 'enviada', 'aprovada', 'rejeitada', 'cancelada')),\n  tipo TEXT CHECK (tipo IN ('arquitetura', 'marcenaria', 'engenharia', 'consultoria', 'outros')),\n  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,\n  observacoes TEXT,\n  itens JSONB DEFAULT '[]'::jsonb,\n  anexos JSONB DEFAULT '[]'::jsonb,\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_propostas_cliente ON propostas(cliente_id)","CREATE INDEX idx_propostas_status ON propostas(status)","CREATE INDEX idx_propostas_numero ON propostas(numero)","CREATE INDEX idx_propostas_responsavel ON propostas(responsavel_id)","CREATE INDEX idx_propostas_data_emissao ON propostas(data_emissao)","CREATE INDEX idx_propostas_dados ON propostas USING gin (dados)","CREATE INDEX idx_propostas_itens ON propostas USING gin (itens)","-- Trigger\nCREATE TRIGGER propostas_updated_at\n  BEFORE UPDATE ON propostas\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE propostas IS 'Propostas comerciais enviadas para clientes'","-- Adicionar foreign key para contratos agora que propostas existe\nALTER TABLE contratos ADD CONSTRAINT contratos_proposta_id_fkey\n  FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE SET NULL","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1.3 TABELA: obras\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.obras (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  codigo TEXT UNIQUE NOT NULL,\n  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,\n  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,\n  titulo TEXT NOT NULL,\n  descricao TEXT,\n  endereco TEXT,\n  cidade TEXT,\n  estado TEXT,\n  cep TEXT,\n  status TEXT DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'em_execucao', 'finalizada', 'atrasada')),\n  data_inicio DATE,\n  data_fim_prevista DATE,\n  data_fim_real DATE,\n  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,\n  valor_orcado NUMERIC(15, 2) DEFAULT 0,\n  valor_realizado NUMERIC(15, 2) DEFAULT 0,\n  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),\n  observacoes TEXT,\n  anexos JSONB DEFAULT '[]'::jsonb,\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_obras_cliente ON obras(cliente_id)","CREATE INDEX idx_obras_contrato ON obras(contrato_id)","CREATE INDEX idx_obras_status ON obras(status)","CREATE INDEX idx_obras_codigo ON obras(codigo)","CREATE INDEX idx_obras_responsavel ON obras(responsavel_id)","CREATE INDEX idx_obras_dados ON obras USING gin (dados)","-- Trigger\nCREATE TRIGGER obras_updated_at\n  BEFORE UPDATE ON obras\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE obras IS 'Gestão de obras e projetos em execução'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1.4 TABELA: lancamentos_financeiros\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,\n  cliente_id UUID REFERENCES entities(id) ON DELETE SET NULL,\n  tipo TEXT NOT NULL CHECK (tipo IN ('receber', 'pagar')),\n  categoria TEXT,\n  categoria_id UUID REFERENCES plano_contas(id) ON DELETE SET NULL,\n  descricao TEXT NOT NULL,\n  valor NUMERIC(15, 2) NOT NULL,\n  data_emissao DATE DEFAULT CURRENT_DATE,\n  data_vencimento DATE NOT NULL,\n  data_pagamento DATE,\n  status TEXT DEFAULT 'previsto' CHECK (status IN ('previsto', 'aprovado', 'recebido', 'pago', 'cancelado', 'vencido')),\n  forma_pagamento TEXT,\n  conta_financeira_id UUID REFERENCES contas_financeiras(id) ON DELETE SET NULL,\n  centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,\n  titulo_id UUID REFERENCES titulos_financeiros(id) ON DELETE SET NULL,\n  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,\n  obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,\n  observacoes TEXT,\n  documento TEXT,\n  anexos JSONB DEFAULT '[]'::jsonb,\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_lancamentos_financeiros_empresa ON lancamentos_financeiros(empresa_id)","CREATE INDEX idx_lancamentos_financeiros_cliente ON lancamentos_financeiros(cliente_id)","CREATE INDEX idx_lancamentos_financeiros_tipo ON lancamentos_financeiros(tipo)","CREATE INDEX idx_lancamentos_financeiros_status ON lancamentos_financeiros(status)","CREATE INDEX idx_lancamentos_financeiros_categoria ON lancamentos_financeiros(categoria)","CREATE INDEX idx_lancamentos_financeiros_vencimento ON lancamentos_financeiros(data_vencimento)","CREATE INDEX idx_lancamentos_financeiros_emissao ON lancamentos_financeiros(data_emissao)","CREATE INDEX idx_lancamentos_financeiros_contrato ON lancamentos_financeiros(contrato_id)","CREATE INDEX idx_lancamentos_financeiros_obra ON lancamentos_financeiros(obra_id)","-- Trigger\nCREATE TRIGGER lancamentos_financeiros_updated_at\n  BEFORE UPDATE ON lancamentos_financeiros\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE lancamentos_financeiros IS 'Lançamentos financeiros detalhados (contas a pagar e receber)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- PARTE 2: SISTEMA DE REGISTROS DE TRABALHO\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2.1 TABELA: registro_categorias\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.registro_categorias (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  nome TEXT NOT NULL UNIQUE,\n  descricao TEXT,\n  cor TEXT DEFAULT '#3b82f6',\n  ativo BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_registro_categorias_ativo ON registro_categorias(ativo)","CREATE INDEX idx_registro_categorias_nome ON registro_categorias(nome)","-- Trigger\nCREATE TRIGGER registro_categorias_updated_at\n  BEFORE UPDATE ON registro_categorias\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE registro_categorias IS 'Categorias para classificação de registros de trabalho'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2.2 TABELA: registros_trabalho\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCREATE TABLE IF NOT EXISTS public.registros_trabalho (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  profissional_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,\n  cliente_id UUID REFERENCES entities(id) ON DELETE CASCADE NOT NULL,\n  proposta_id UUID REFERENCES propostas(id) ON DELETE SET NULL,\n  obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,\n  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,\n  data DATE NOT NULL DEFAULT CURRENT_DATE,\n  categoria_id UUID REFERENCES registro_categorias(id) ON DELETE SET NULL NOT NULL,\n  descricao TEXT NOT NULL,\n  quantidade NUMERIC(10, 2) DEFAULT 1,\n  unidade TEXT DEFAULT 'un',\n  valor_unitario NUMERIC(15, 2) DEFAULT 0,\n  valor_total NUMERIC(15, 2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,\n  anexos JSONB DEFAULT '[]'::jsonb,\n  aprovado BOOLEAN DEFAULT FALSE,\n  aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,\n  aprovado_em TIMESTAMPTZ,\n  gerar_lancamento BOOLEAN DEFAULT FALSE,\n  lancamento_id UUID REFERENCES lancamentos_financeiros(id) ON DELETE SET NULL,\n  observacoes TEXT,\n  dados JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Índices\nCREATE INDEX idx_registros_trabalho_profissional ON registros_trabalho(profissional_id)","CREATE INDEX idx_registros_trabalho_cliente ON registros_trabalho(cliente_id)","CREATE INDEX idx_registros_trabalho_proposta ON registros_trabalho(proposta_id)","CREATE INDEX idx_registros_trabalho_obra ON registros_trabalho(obra_id)","CREATE INDEX idx_registros_trabalho_contrato ON registros_trabalho(contrato_id)","CREATE INDEX idx_registros_trabalho_data ON registros_trabalho(data)","CREATE INDEX idx_registros_trabalho_categoria ON registros_trabalho(categoria_id)","CREATE INDEX idx_registros_trabalho_aprovado ON registros_trabalho(aprovado)","CREATE INDEX idx_registros_trabalho_lancamento ON registros_trabalho(lancamento_id)","CREATE INDEX idx_registros_trabalho_dados ON registros_trabalho USING gin (dados)","-- Trigger\nCREATE TRIGGER registros_trabalho_updated_at\n  BEFORE UPDATE ON registros_trabalho\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column()","-- Comentário\nCOMMENT ON TABLE registros_trabalho IS 'Registros diários de trabalho dos profissionais (horas, serviços, materiais)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- PARTE 3: VIEWS SQL CRÍTICAS\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3.1 VIEW: v_clientes_ativos_contratos\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDROP VIEW IF EXISTS v_clientes_ativos_contratos CASCADE","CREATE OR REPLACE VIEW v_clientes_ativos_contratos AS\nSELECT\n  e.id as cliente_id,\n  e.nome as nome_razao_social,\n  e.email,\n  e.telefone,\n  e.cidade,\n  e.estado,\n  COUNT(DISTINCT c.id) as total_contratos,\n  COUNT(DISTINCT CASE WHEN c.status = 'ativo' THEN c.id END) as contratos_ativos,\n  COALESCE(SUM(c.valor_total), 0) as valor_total_contratos,\n  COALESCE(SUM(CASE WHEN c.status = 'ativo' THEN c.valor_total ELSE 0 END), 0) as valor_contratos_ativos,\n  MAX(c.created_at) as ultimo_contrato_data\nFROM entities e\nLEFT JOIN contratos c ON c.cliente_id = e.id\nWHERE e.tipo = 'cliente' AND e.ativo = TRUE\nGROUP BY e.id, e.nome, e.email, e.telefone, e.cidade, e.estado\nORDER BY valor_total_contratos DESC","COMMENT ON VIEW v_clientes_ativos_contratos IS 'Clientes ativos com estatísticas de contratos'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3.2 VIEW: v_fluxo_caixa\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDROP VIEW IF EXISTS v_fluxo_caixa CASCADE","CREATE OR REPLACE VIEW v_fluxo_caixa AS\nSELECT\n  data_vencimento as data,\n  SUM(CASE WHEN tipo = 'receber' THEN valor ELSE 0 END) as total_receber,\n  SUM(CASE WHEN tipo = 'pagar' THEN valor ELSE 0 END) as total_pagar,\n  SUM(CASE WHEN tipo = 'receber' THEN valor ELSE -valor END) as saldo_dia,\n  status,\n  COUNT(*) as quantidade_lancamentos\nFROM lancamentos_financeiros\nWHERE status NOT IN ('cancelado')\nGROUP BY data_vencimento, status\nORDER BY data_vencimento","COMMENT ON VIEW v_fluxo_caixa IS 'Fluxo de caixa diário (entradas vs saídas)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3.3 VIEW: v_despesas_mes_categoria\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDROP VIEW IF EXISTS v_despesas_mes_categoria CASCADE","CREATE OR REPLACE VIEW v_despesas_mes_categoria AS\nSELECT\n  DATE_TRUNC('month', data_vencimento) as mes,\n  COALESCE(categoria, 'Sem Categoria') as categoria,\n  COUNT(*) as quantidade,\n  SUM(valor) as total,\n  AVG(valor) as media,\n  status\nFROM lancamentos_financeiros\nWHERE tipo = 'pagar'\nGROUP BY DATE_TRUNC('month', data_vencimento), categoria, status\nORDER BY mes DESC, total DESC","COMMENT ON VIEW v_despesas_mes_categoria IS 'Despesas agrupadas por mês e categoria'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3.4 VIEW: v_top10_clientes_receita\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDROP VIEW IF EXISTS v_top10_clientes_receita CASCADE","CREATE OR REPLACE VIEW v_top10_clientes_receita AS\nSELECT\n  e.id as cliente_id,\n  e.nome as nome_razao_social,\n  e.email,\n  e.telefone,\n  e.cidade,\n  COUNT(DISTINCT lf.id) as total_lancamentos,\n  SUM(CASE WHEN lf.status IN ('recebido', 'pago') THEN lf.valor ELSE 0 END) as receita_realizada,\n  SUM(CASE WHEN lf.status IN ('previsto', 'aprovado') THEN lf.valor ELSE 0 END) as receita_prevista,\n  SUM(lf.valor) as receita_total,\n  MAX(lf.data_pagamento) as ultima_receita_data\nFROM entities e\nJOIN lancamentos_financeiros lf ON lf.cliente_id = e.id\nWHERE e.tipo = 'cliente'\n  AND lf.tipo = 'receber'\nGROUP BY e.id, e.nome, e.email, e.telefone, e.cidade\nORDER BY receita_realizada DESC\nLIMIT 10","COMMENT ON VIEW v_top10_clientes_receita IS 'Top 10 clientes por receita realizada'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3.5 VIEW: vw_pipeline_oportunidades (ATUALIZADA)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDROP VIEW IF EXISTS vw_pipeline_oportunidades CASCADE","CREATE OR REPLACE VIEW vw_pipeline_oportunidades AS\nSELECT\n  kc.id as coluna_id,\n  kc.titulo as etapa,\n  kc.cor as cor_etapa,\n  kc.posicao,\n  kb.ambiente as modulo,\n  COUNT(k.id) as qtde_cards,\n  COALESCE(SUM(k.valor), 0) as valor_total,\n  COALESCE(AVG(k.valor), 0) as valor_medio,\n  COUNT(CASE WHEN k.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as novos_ultimos_7_dias\nFROM kanban_colunas kc\nJOIN kanban_boards kb ON kb.id = kc.board_id\nLEFT JOIN kanban_cards k ON k.coluna_id = kc.id\nWHERE kb.ambiente = 'oportunidades'\nGROUP BY kc.id, kc.titulo, kc.cor, kc.posicao, kb.ambiente\nORDER BY kc.posicao","COMMENT ON VIEW vw_pipeline_oportunidades IS 'Pipeline de oportunidades com estatísticas por etapa'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3.6 VIEW: v_kanban_cards_board\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDROP VIEW IF EXISTS v_kanban_cards_board CASCADE","CREATE OR REPLACE VIEW v_kanban_cards_board AS\nSELECT\n  k.id,\n  k.titulo,\n  k.descricao,\n  k.valor,\n  k.posicao,\n  k.dados as payload,\n  k.created_at,\n  k.updated_at,\n  kb.ambiente as modulo,\n  kb.titulo as board_titulo,\n  k.coluna_id,\n  kc.titulo as status,\n  kc.cor as status_cor,\n  kc.posicao as status_posicao,\n  p.id as responsavel_id,\n  p.nome as responsavel_nome,\n  e.id as entity_id,\n  e.tipo as entity_tipo,\n  e.nome as entity_nome\nFROM kanban_cards k\nJOIN kanban_colunas kc ON k.coluna_id = kc.id\nJOIN kanban_boards kb ON kb.id = kc.board_id\nLEFT JOIN profiles p ON k.responsavel_id = p.id\nLEFT JOIN entities e ON k.entity_id = e.id\nORDER BY kb.ambiente, kc.posicao, k.posicao","COMMENT ON VIEW v_kanban_cards_board IS 'Cards do kanban com informações completas do board'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3.7 VIEW: v_registros_trabalho\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDROP VIEW IF EXISTS v_registros_trabalho CASCADE","CREATE OR REPLACE VIEW v_registros_trabalho AS\nSELECT\n  rt.id,\n  rt.data,\n  rt.descricao,\n  rt.quantidade,\n  rt.unidade,\n  rt.valor_unitario,\n  rt.valor_total,\n  rt.aprovado,\n  rt.aprovado_em,\n  rt.gerar_lancamento,\n  rt.observacoes,\n  rt.created_at,\n\n  -- Profissional\n  ep.id as profissional_id,\n  ep.nome as profissional_nome,\n  ep.email as profissional_email,\n\n  -- Cliente\n  ec.id as cliente_id,\n  ec.nome as cliente_nome,\n  ec.email as cliente_email,\n\n  -- Categoria\n  rc.id as categoria_id,\n  rc.nome as categoria_nome,\n  rc.cor as categoria_cor,\n\n  -- Aprovador\n  ap.id as aprovador_id,\n  ap.nome as aprovador_nome,\n\n  -- Obra (se houver)\n  o.id as obra_id,\n  o.titulo as obra_titulo,\n  o.codigo as obra_codigo,\n\n  -- Proposta (se houver)\n  pr.id as proposta_id,\n  pr.numero as proposta_numero,\n\n  -- Contrato (se houver)\n  ct.id as contrato_id,\n  ct.numero as contrato_numero,\n\n  -- Lançamento Financeiro (se gerado)\n  lf.id as lancamento_id,\n  lf.status as lancamento_status\n\nFROM registros_trabalho rt\nJOIN profiles ep ON ep.id = rt.profissional_id\nJOIN entities ec ON ec.id = rt.cliente_id\nJOIN registro_categorias rc ON rc.id = rt.categoria_id\nLEFT JOIN profiles ap ON ap.id = rt.aprovado_por\nLEFT JOIN obras o ON o.id = rt.obra_id\nLEFT JOIN propostas pr ON pr.id = rt.proposta_id\nLEFT JOIN contratos ct ON ct.id = rt.contrato_id\nLEFT JOIN lancamentos_financeiros lf ON lf.id = rt.lancamento_id\nORDER BY rt.data DESC, rt.created_at DESC","COMMENT ON VIEW v_registros_trabalho IS 'Registros de trabalho com informações completas (profissional, cliente, categoria, etc)'","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- DADOS INICIAIS (SEED)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Categorias de registro padrão\nINSERT INTO registro_categorias (nome, descricao, cor) VALUES\n  ('Horas Trabalhadas', 'Registro de horas de trabalho', '#3b82f6'),\n  ('Materiais', 'Materiais utilizados na obra', '#10b981'),\n  ('Equipamentos', 'Uso de equipamentos', '#f59e0b'),\n  ('Deslocamento', 'Deslocamento até obra', '#8b5cf6'),\n  ('Consultoria', 'Horas de consultoria', '#06b6d4'),\n  ('Projeto', 'Horas de projeto', '#ec4899')\nON CONFLICT (nome) DO NOTHING","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- FIM DA MIGRATION 012\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"}	criar_tabelas_views_sistema_completo
015	{"-- =============================================\n-- MIGRATION: 015\n-- Descrição: RLS Policies para novas tabelas\n-- Data: 2025-11-02\n-- Autor: Supabase MCP Expert\n-- =============================================\n-- Políticas criadas para:\n--   - contratos\n--   - propostas\n--   - obras\n--   - lancamentos_financeiros\n--   - registros_trabalho\n--   - registro_categorias\n-- =============================================\n\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- HABILITAR RLS EM TODAS AS TABELAS\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nALTER TABLE contratos ENABLE ROW LEVEL SECURITY","ALTER TABLE propostas ENABLE ROW LEVEL SECURITY","ALTER TABLE obras ENABLE ROW LEVEL SECURITY","ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY","ALTER TABLE registros_trabalho ENABLE ROW LEVEL SECURITY","ALTER TABLE registro_categorias ENABLE ROW LEVEL SECURITY","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- POLICIES: contratos\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- SELECT: Usuários autenticados podem ver contratos\nDROP POLICY IF EXISTS \\"Usuários podem ver contratos\\" ON contratos","CREATE POLICY \\"Usuários podem ver contratos\\"\nON contratos FOR SELECT\nTO authenticated\nUSING (true)","-- INSERT: Admins e gestores podem criar contratos\nDROP POLICY IF EXISTS \\"Admins e gestores podem criar contratos\\" ON contratos","CREATE POLICY \\"Admins e gestores podem criar contratos\\"\nON contratos FOR INSERT\nTO authenticated\nWITH CHECK (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor')\n  )\n)","-- UPDATE: Admins, gestores e responsáveis podem atualizar contratos\nDROP POLICY IF EXISTS \\"Admins, gestores e responsáveis podem atualizar contratos\\" ON contratos","CREATE POLICY \\"Admins, gestores e responsáveis podem atualizar contratos\\"\nON contratos FOR UPDATE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor')\n  )\n  OR responsavel_id = auth.uid()\n)","-- DELETE: Apenas admins podem deletar contratos\nDROP POLICY IF EXISTS \\"Apenas admins podem deletar contratos\\" ON contratos","CREATE POLICY \\"Apenas admins podem deletar contratos\\"\nON contratos FOR DELETE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil = 'admin'\n  )\n)","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- POLICIES: propostas\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- SELECT: Usuários autenticados podem ver propostas\nDROP POLICY IF EXISTS \\"Usuários podem ver propostas\\" ON propostas","CREATE POLICY \\"Usuários podem ver propostas\\"\nON propostas FOR SELECT\nTO authenticated\nUSING (true)","-- INSERT: Admins, gestores e vendedores podem criar propostas\nDROP POLICY IF EXISTS \\"Admins, gestores e vendedores podem criar propostas\\" ON propostas","CREATE POLICY \\"Admins, gestores e vendedores podem criar propostas\\"\nON propostas FOR INSERT\nTO authenticated\nWITH CHECK (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor', 'vendedor')\n  )\n)","-- UPDATE: Admins, gestores, vendedores e responsáveis podem atualizar propostas\nDROP POLICY IF EXISTS \\"Admins, gestores, vendedores e responsáveis podem atualizar propostas\\" ON propostas","CREATE POLICY \\"Admins, gestores, vendedores e responsáveis podem atualizar propostas\\"\nON propostas FOR UPDATE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor', 'vendedor')\n  )\n  OR responsavel_id = auth.uid()\n)","-- DELETE: Apenas admins podem deletar propostas\nDROP POLICY IF EXISTS \\"Apenas admins podem deletar propostas\\" ON propostas","CREATE POLICY \\"Apenas admins podem deletar propostas\\"\nON propostas FOR DELETE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil = 'admin'\n  )\n)","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- POLICIES: obras\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- SELECT: Usuários autenticados podem ver obras\nDROP POLICY IF EXISTS \\"Usuários podem ver obras\\" ON obras","CREATE POLICY \\"Usuários podem ver obras\\"\nON obras FOR SELECT\nTO authenticated\nUSING (true)","-- INSERT: Admins, gestores e arquitetos podem criar obras\nDROP POLICY IF EXISTS \\"Admins, gestores e arquitetos podem criar obras\\" ON obras","CREATE POLICY \\"Admins, gestores e arquitetos podem criar obras\\"\nON obras FOR INSERT\nTO authenticated\nWITH CHECK (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor', 'arquiteto')\n  )\n)","-- UPDATE: Admins, gestores, arquitetos e responsáveis podem atualizar obras\nDROP POLICY IF EXISTS \\"Admins, gestores, arquitetos e responsáveis podem atualizar obras\\" ON obras","CREATE POLICY \\"Admins, gestores, arquitetos e responsáveis podem atualizar obras\\"\nON obras FOR UPDATE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor', 'arquiteto')\n  )\n  OR responsavel_id = auth.uid()\n)","-- DELETE: Apenas admins podem deletar obras\nDROP POLICY IF EXISTS \\"Apenas admins podem deletar obras\\" ON obras","CREATE POLICY \\"Apenas admins podem deletar obras\\"\nON obras FOR DELETE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil = 'admin'\n  )\n)","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- POLICIES: lancamentos_financeiros\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- SELECT: Usuários autenticados podem ver lançamentos\nDROP POLICY IF EXISTS \\"Usuários podem ver lançamentos financeiros\\" ON lancamentos_financeiros","CREATE POLICY \\"Usuários podem ver lançamentos financeiros\\"\nON lancamentos_financeiros FOR SELECT\nTO authenticated\nUSING (true)","-- INSERT: Admins, gestores e financeiro podem criar lançamentos\nDROP POLICY IF EXISTS \\"Admins, gestores e financeiro podem criar lançamentos\\" ON lancamentos_financeiros","CREATE POLICY \\"Admins, gestores e financeiro podem criar lançamentos\\"\nON lancamentos_financeiros FOR INSERT\nTO authenticated\nWITH CHECK (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor', 'financeiro')\n  )\n)","-- UPDATE: Admins, gestores e financeiro podem atualizar lançamentos\nDROP POLICY IF EXISTS \\"Admins, gestores e financeiro podem atualizar lançamentos\\" ON lancamentos_financeiros","CREATE POLICY \\"Admins, gestores e financeiro podem atualizar lançamentos\\"\nON lancamentos_financeiros FOR UPDATE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor', 'financeiro')\n  )\n)","-- DELETE: Apenas admins podem deletar lançamentos\nDROP POLICY IF EXISTS \\"Apenas admins podem deletar lançamentos financeiros\\" ON lancamentos_financeiros","CREATE POLICY \\"Apenas admins podem deletar lançamentos financeiros\\"\nON lancamentos_financeiros FOR DELETE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil = 'admin'\n  )\n)","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- POLICIES: registros_trabalho\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- SELECT: Usuários podem ver seus próprios registros ou todos se admin/gestor\nDROP POLICY IF EXISTS \\"Usuários podem ver seus registros de trabalho\\" ON registros_trabalho","CREATE POLICY \\"Usuários podem ver seus registros de trabalho\\"\nON registros_trabalho FOR SELECT\nTO authenticated\nUSING (\n  profissional_id = auth.uid()\n  OR EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor')\n  )\n)","-- INSERT: Usuários podem criar seus próprios registros\nDROP POLICY IF EXISTS \\"Usuários podem criar seus registros de trabalho\\" ON registros_trabalho","CREATE POLICY \\"Usuários podem criar seus registros de trabalho\\"\nON registros_trabalho FOR INSERT\nTO authenticated\nWITH CHECK (profissional_id = auth.uid())","-- UPDATE: Usuários podem atualizar seus próprios registros não aprovados\nDROP POLICY IF EXISTS \\"Usuários podem atualizar seus registros de trabalho\\" ON registros_trabalho","CREATE POLICY \\"Usuários podem atualizar seus registros de trabalho\\"\nON registros_trabalho FOR UPDATE\nTO authenticated\nUSING (\n  (profissional_id = auth.uid() AND aprovado = false)\n  OR EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor')\n  )\n)","-- DELETE: Apenas usuários podem deletar seus próprios registros não aprovados ou admins\nDROP POLICY IF EXISTS \\"Usuários podem deletar seus registros não aprovados\\" ON registros_trabalho","CREATE POLICY \\"Usuários podem deletar seus registros não aprovados\\"\nON registros_trabalho FOR DELETE\nTO authenticated\nUSING (\n  (profissional_id = auth.uid() AND aprovado = false)\n  OR EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil = 'admin'\n  )\n)","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- POLICIES: registro_categorias\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- SELECT: Todos usuários autenticados podem ver categorias\nDROP POLICY IF EXISTS \\"Usuários podem ver categorias de registro\\" ON registro_categorias","CREATE POLICY \\"Usuários podem ver categorias de registro\\"\nON registro_categorias FOR SELECT\nTO authenticated\nUSING (true)","-- INSERT: Apenas admins e gestores podem criar categorias\nDROP POLICY IF EXISTS \\"Admins e gestores podem criar categorias\\" ON registro_categorias","CREATE POLICY \\"Admins e gestores podem criar categorias\\"\nON registro_categorias FOR INSERT\nTO authenticated\nWITH CHECK (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor')\n  )\n)","-- UPDATE: Apenas admins e gestores podem atualizar categorias\nDROP POLICY IF EXISTS \\"Admins e gestores podem atualizar categorias\\" ON registro_categorias","CREATE POLICY \\"Admins e gestores podem atualizar categorias\\"\nON registro_categorias FOR UPDATE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor')\n  )\n)","-- DELETE: Apenas admins podem deletar categorias\nDROP POLICY IF EXISTS \\"Apenas admins podem deletar categorias\\" ON registro_categorias","CREATE POLICY \\"Apenas admins podem deletar categorias\\"\nON registro_categorias FOR DELETE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil = 'admin'\n  )\n)","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- FIM DA MIGRATION 015\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"}	criar_rls_policies_novas_tabelas
017	{"-- =============================================\n-- Migration 017: View para Status das Obras\n-- =============================================\n-- Criado em: 03/Nov/2025\n-- Descrição: View para agregar status das obras do sistema\n-- =============================================\n\n-- Criar view para status das obras\nCREATE OR REPLACE VIEW public.v_obras_status AS\nSELECT\n  status,\n  COUNT(*) as total\nFROM public.obras\nGROUP BY status","-- Comentário\nCOMMENT ON VIEW public.v_obras_status IS 'Agregação de obras por status (planejamento, em_execucao, finalizada, atrasada)'","-- Permitir SELECT para usuários autenticados\nGRANT SELECT ON public.v_obras_status TO authenticated","GRANT SELECT ON public.v_obras_status TO anon","-- =============================================\n-- Verificação\n-- =============================================\n-- SELECT * FROM public.v_obras_status;"}	criar_view_status_obras
018	{"-- =============================================\n-- Migration: Instalar Extensões Essenciais\n-- Data: 2025-11-03\n-- Descrição: Instala extensões necessárias para o sistema\n-- =============================================\n\n-- =============================================\n-- 1. pg_trgm - Similaridade de Texto\n-- =============================================\n-- Necessária para: busca fuzzy, similaridade, autocomplete\n\nCREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions","COMMENT ON EXTENSION pg_trgm IS 'Módulo de trigrama para busca por similaridade de texto'","-- =============================================\n-- 2. unaccent - Remover Acentos\n-- =============================================\n-- Útil para: normalizar buscas, ignorar acentos\n\nCREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions","COMMENT ON EXTENSION unaccent IS 'Dicionário de remoção de acentos para busca de texto'","-- =============================================\n-- 3. postgres_fdw - Foreign Data Wrapper (opcional)\n-- =============================================\n-- Útil para: conectar a outros bancos PostgreSQL\n-- Descomente se necessário:\n-- CREATE EXTENSION IF NOT EXISTS postgres_fdw WITH SCHEMA extensions;\n\n-- =============================================\n-- Verificar extensões instaladas\n-- =============================================\nDO $$\nBEGIN\n    RAISE NOTICE 'Extensões instaladas com sucesso:';\n    RAISE NOTICE '✅ pg_trgm - Busca por similaridade';\n    RAISE NOTICE '✅ unaccent - Normalização de acentos';\nEND;\n$$"}	instalar_extensoes_essenciais
019	{"-- =============================================\n-- Migration: Funções e Triggers Essenciais do Sistema\n-- Data: 2025-11-03\n-- Descrição: Cria funções helpers e triggers fundamentais\n-- =============================================\n\n-- =============================================\n-- 1. FUNÇÃO: handle_new_user\n-- Cria profile automaticamente ao cadastrar usuário\n-- NOTA: Trigger deve ser criado manualmente no Dashboard\n-- =============================================\n\nDROP FUNCTION IF EXISTS handle_new_user() CASCADE","CREATE OR REPLACE FUNCTION handle_new_user()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n    INSERT INTO public.profiles (id, nome, email, cargo, ativo)\n    VALUES (\n        NEW.id,\n        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),\n        NEW.email,\n        COALESCE(NEW.raw_user_meta_data->>'cargo', 'usuário'),\n        TRUE\n    );\n    RETURN NEW;\nEND;\n$$","COMMENT ON FUNCTION handle_new_user IS 'Cria profile automaticamente quando usuário se cadastra'","-- =============================================\n-- 2. FUNÇÕES HELPER: Auth Context\n-- Funções para acessar contexto do usuário autenticado\n-- =============================================\n\n-- current_user_id: Retorna UUID do usuário autenticado\nDROP FUNCTION IF EXISTS current_user_id() CASCADE","CREATE OR REPLACE FUNCTION current_user_id()\nRETURNS uuid\nLANGUAGE sql\nSTABLE\nAS $$\n    SELECT auth.uid();\n$$","COMMENT ON FUNCTION current_user_id IS 'Retorna o UUID do usuário autenticado'","-- current_user_email: Retorna email do usuário autenticado\nDROP FUNCTION IF EXISTS current_user_email() CASCADE","CREATE OR REPLACE FUNCTION current_user_email()\nRETURNS text\nLANGUAGE sql\nSTABLE\nAS $$\n    SELECT auth.jwt()->>'email';\n$$","COMMENT ON FUNCTION current_user_email IS 'Retorna o email do usuário autenticado'","-- current_user_role: Retorna role do usuário autenticado\nDROP FUNCTION IF EXISTS current_user_role() CASCADE","CREATE OR REPLACE FUNCTION current_user_role()\nRETURNS text\nLANGUAGE sql\nSTABLE\nAS $$\n    SELECT auth.role();\n$$","COMMENT ON FUNCTION current_user_role IS 'Retorna o role do usuário autenticado'","-- =============================================\n-- 3. FUNÇÃO HELPER: current_empresa_id\n-- Retorna empresa do usuário (para multi-tenancy)\n-- =============================================\n\nDROP FUNCTION IF EXISTS current_empresa_id() CASCADE","CREATE OR REPLACE FUNCTION current_empresa_id()\nRETURNS uuid\nLANGUAGE plpgsql\nSTABLE\nAS $$\nDECLARE\n    v_empresa_id uuid;\nBEGIN\n    -- Buscar empresa_id do profile do usuário\n    SELECT empresa_id INTO v_empresa_id\n    FROM profiles\n    WHERE id = auth.uid();\n\n    RETURN v_empresa_id;\nEND;\n$$","COMMENT ON FUNCTION current_empresa_id IS 'Retorna o UUID da empresa do usuário autenticado'","-- =============================================\n-- 4. FUNÇÃO HELPER: has_role\n-- Verifica se usuário tem determinado cargo/role\n-- =============================================\n\nDROP FUNCTION IF EXISTS has_role(text) CASCADE","CREATE OR REPLACE FUNCTION has_role(p_role text)\nRETURNS boolean\nLANGUAGE plpgsql\nSTABLE\nAS $$\nDECLARE\n    v_user_cargo text;\nBEGIN\n    -- Buscar cargo do profile\n    SELECT cargo INTO v_user_cargo\n    FROM profiles\n    WHERE id = auth.uid();\n\n    -- Verificar se cargo corresponde\n    RETURN v_user_cargo = p_role OR v_user_cargo = 'admin';\nEND;\n$$","COMMENT ON FUNCTION has_role IS 'Verifica se usuário tem determinado cargo ou é admin'","-- =============================================\n-- 5. FUNÇÃO HELPER: is_admin\n-- Verifica se usuário é admin\n-- =============================================\n\nDROP FUNCTION IF EXISTS is_admin() CASCADE","CREATE OR REPLACE FUNCTION is_admin()\nRETURNS boolean\nLANGUAGE sql\nSTABLE\nAS $$\n    SELECT has_role('admin');\n$$","COMMENT ON FUNCTION is_admin IS 'Verifica se usuário é admin'","-- =============================================\n-- 6. FUNÇÃO HELPER: get_jwt_claim\n-- Extrai claim específico do JWT\n-- =============================================\n\nDROP FUNCTION IF EXISTS get_jwt_claim(text) CASCADE","CREATE OR REPLACE FUNCTION get_jwt_claim(claim_name text)\nRETURNS text\nLANGUAGE sql\nSTABLE\nAS $$\n    SELECT auth.jwt()->>claim_name;\n$$","COMMENT ON FUNCTION get_jwt_claim IS 'Extrai valor de um claim específico do JWT'","-- =============================================\n-- RESUMO\n-- =============================================\nDO $$\nBEGIN\n    RAISE NOTICE '✅ Funções de triggers e helpers criadas:';\n    RAISE NOTICE '  - handle_new_user() - Criar profile ao cadastrar';\n    RAISE NOTICE '  - current_user_id() - UUID do usuário';\n    RAISE NOTICE '  - current_user_email() - Email do usuário';\n    RAISE NOTICE '  - current_user_role() - Role do usuário';\n    RAISE NOTICE '  - current_empresa_id() - Empresa do usuário';\n    RAISE NOTICE '  - has_role(role) - Verifica cargo';\n    RAISE NOTICE '  - is_admin() - Verifica se é admin';\n    RAISE NOTICE '  - get_jwt_claim(name) - Extrai claim do JWT';\n    RAISE NOTICE '';\n    RAISE NOTICE '⚠️ IMPORTANTE: Criar trigger para handle_new_user via Dashboard:';\n    RAISE NOTICE '   Table: auth.users | Event: INSERT | Function: handle_new_user()';\nEND;\n$$"}	criar_funcoes_triggers_essenciais
020	{"-- =============================================\n-- Migration: Funções de Validação e Formatação Brasil\n-- Data: 2025-11-03\n-- Descrição: Validação de CPF/CNPJ e formatação de telefone/CEP\n-- =============================================\n\n-- =============================================\n-- 1. HELPER: only_digits\n-- Remove todos caracteres não numéricos\n-- =============================================\n\nDROP FUNCTION IF EXISTS only_digits(text) CASCADE","CREATE OR REPLACE FUNCTION only_digits(text)\nRETURNS TEXT\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nBEGIN\n    RETURN regexp_replace($1, '[^0-9]', '', 'g');\nEND;\n$$","COMMENT ON FUNCTION only_digits IS 'Remove caracteres não numéricos de uma string'","-- =============================================\n-- 2. VALIDAÇÃO: is_cpf_valid\n-- Valida CPF brasileiro com algoritmo oficial\n-- =============================================\n\nDROP FUNCTION IF EXISTS is_cpf_valid(text) CASCADE","CREATE OR REPLACE FUNCTION is_cpf_valid(doc TEXT)\nRETURNS BOOLEAN\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nDECLARE\n    s TEXT := only_digits(doc);\n    sum INT;\n    rest INT;\n    dv1 INT;\n    dv2 INT;\n    i INT;\nBEGIN\n    -- CPF deve ter 11 dígitos\n    IF length(s) <> 11 THEN RETURN FALSE; END IF;\n\n    -- Rejeita CPFs com todos dígitos iguais (111.111.111-11)\n    IF s ~ '^(\\\\d)\\\\1{10}$' THEN RETURN FALSE; END IF;\n\n    -- Calcula primeiro dígito verificador\n    sum := 0;\n    FOR i IN 1..9 LOOP\n        sum := sum + CAST(substr(s,i,1) AS INT) * (11 - i);\n    END LOOP;\n    rest := sum % 11;\n    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;\n\n    -- Calcula segundo dígito verificador\n    sum := 0;\n    FOR i IN 1..10 LOOP\n        sum := sum + CAST(substr(s,i,1) AS INT) * (12 - i);\n    END LOOP;\n    rest := sum % 11;\n    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;\n\n    -- Verifica se os dígitos calculados correspondem aos informados\n    RETURN (dv1 = CAST(substr(s,10,1) AS INT) AND dv2 = CAST(substr(s,11,1) AS INT));\nEND;\n$$","COMMENT ON FUNCTION is_cpf_valid IS 'Valida CPF brasileiro (11 dígitos)'","-- =============================================\n-- 3. VALIDAÇÃO: is_cnpj_valid\n-- Valida CNPJ brasileiro com algoritmo oficial\n-- =============================================\n\nDROP FUNCTION IF EXISTS is_cnpj_valid(text) CASCADE","CREATE OR REPLACE FUNCTION is_cnpj_valid(doc TEXT)\nRETURNS BOOLEAN\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nDECLARE\n    s TEXT := only_digits(doc);\n    weights1 INT[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];\n    weights2 INT[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];\n    sum INT;\n    rest INT;\n    dv1 INT;\n    dv2 INT;\n    i INT;\nBEGIN\n    -- CNPJ deve ter 14 dígitos\n    IF length(s) <> 14 THEN RETURN FALSE; END IF;\n\n    -- Rejeita CNPJs com todos dígitos iguais\n    IF s ~ '^(\\\\d)\\\\1{13}$' THEN RETURN FALSE; END IF;\n\n    -- Calcula primeiro dígito verificador\n    sum := 0;\n    FOR i IN 1..12 LOOP\n        sum := sum + CAST(substr(s,i,1) AS INT) * weights1[i];\n    END LOOP;\n    rest := sum % 11;\n    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;\n\n    -- Calcula segundo dígito verificador\n    sum := 0;\n    FOR i IN 1..13 LOOP\n        sum := sum + CAST(substr(s,i,1) AS INT) * weights2[i];\n    END LOOP;\n    rest := sum % 11;\n    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;\n\n    -- Verifica se os dígitos calculados correspondem aos informados\n    RETURN (dv1 = CAST(substr(s,13,1) AS INT) AND dv2 = CAST(substr(s,14,1) AS INT));\nEND;\n$$","COMMENT ON FUNCTION is_cnpj_valid IS 'Valida CNPJ brasileiro (14 dígitos)'","-- =============================================\n-- 4. VALIDAÇÃO: is_cpf_cnpj_valid\n-- Detecta automaticamente e valida CPF ou CNPJ\n-- =============================================\n\nDROP FUNCTION IF EXISTS is_cpf_cnpj_valid(text) CASCADE","CREATE OR REPLACE FUNCTION is_cpf_cnpj_valid(doc TEXT)\nRETURNS BOOLEAN\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nDECLARE\n    s TEXT := only_digits(doc);\nBEGIN\n    RETURN CASE\n        WHEN length(s) = 11 THEN is_cpf_valid(doc)\n        WHEN length(s) = 14 THEN is_cnpj_valid(doc)\n        ELSE FALSE\n    END;\nEND;\n$$","COMMENT ON FUNCTION is_cpf_cnpj_valid IS 'Valida CPF ou CNPJ automaticamente baseado no tamanho'","-- =============================================\n-- 5. FORMATAÇÃO: format_phone_br\n-- Formata telefone brasileiro\n-- =============================================\n\nDROP FUNCTION IF EXISTS format_phone_br(text) CASCADE","CREATE OR REPLACE FUNCTION format_phone_br(digits TEXT)\nRETURNS TEXT\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nDECLARE\n    s TEXT := only_digits(digits);\nBEGIN\n    IF length(s) = 11 THEN\n        -- Celular: (11) 98765-4321\n        RETURN '(' || substr(s,1,2) || ') ' || substr(s,3,5) || '-' || substr(s,8,4);\n    ELSIF length(s) = 10 THEN\n        -- Fixo: (11) 3456-7890\n        RETURN '(' || substr(s,1,2) || ') ' || substr(s,3,4) || '-' || substr(s,7,4);\n    ELSE\n        RETURN digits; -- Retorna original se não for formato conhecido\n    END IF;\nEND;\n$$","COMMENT ON FUNCTION format_phone_br IS 'Formata telefone brasileiro: (11) 98765-4321'","-- =============================================\n-- 6. FORMATAÇÃO: format_cep_br\n-- Formata CEP brasileiro\n-- =============================================\n\nDROP FUNCTION IF EXISTS format_cep_br(text) CASCADE","CREATE OR REPLACE FUNCTION format_cep_br(digits TEXT)\nRETURNS TEXT\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nDECLARE\n    s TEXT := only_digits(digits);\nBEGIN\n    IF length(s) = 8 THEN\n        -- CEP: 12345-678\n        RETURN substr(s,1,5) || '-' || substr(s,6,3);\n    ELSE\n        RETURN digits; -- Retorna original se não for formato conhecido\n    END IF;\nEND;\n$$","COMMENT ON FUNCTION format_cep_br IS 'Formata CEP brasileiro: 12345-678'","-- =============================================\n-- 7. FORMATAÇÃO: format_cpf\n-- Formata CPF brasileiro\n-- =============================================\n\nDROP FUNCTION IF EXISTS format_cpf(text) CASCADE","CREATE OR REPLACE FUNCTION format_cpf(digits TEXT)\nRETURNS TEXT\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nDECLARE\n    s TEXT := only_digits(digits);\nBEGIN\n    IF length(s) = 11 THEN\n        -- CPF: 123.456.789-00\n        RETURN substr(s,1,3) || '.' || substr(s,4,3) || '.' || substr(s,7,3) || '-' || substr(s,10,2);\n    ELSE\n        RETURN digits;\n    END IF;\nEND;\n$$","COMMENT ON FUNCTION format_cpf IS 'Formata CPF brasileiro: 123.456.789-00'","-- =============================================\n-- 8. FORMATAÇÃO: format_cnpj\n-- Formata CNPJ brasileiro\n-- =============================================\n\nDROP FUNCTION IF EXISTS format_cnpj(text) CASCADE","CREATE OR REPLACE FUNCTION format_cnpj(digits TEXT)\nRETURNS TEXT\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nDECLARE\n    s TEXT := only_digits(digits);\nBEGIN\n    IF length(s) = 14 THEN\n        -- CNPJ: 12.345.678/0001-90\n        RETURN substr(s,1,2) || '.' || substr(s,3,3) || '.' || substr(s,6,3) ||\n               '/' || substr(s,9,4) || '-' || substr(s,13,2);\n    ELSE\n        RETURN digits;\n    END IF;\nEND;\n$$","COMMENT ON FUNCTION format_cnpj IS 'Formata CNPJ brasileiro: 12.345.678/0001-90'","-- =============================================\n-- TESTES E EXEMPLOS\n-- =============================================\nDO $$\nBEGIN\n    RAISE NOTICE '✅ Funções de validação BR criadas:';\n    RAISE NOTICE '  - only_digits(text) - Remove não numéricos';\n    RAISE NOTICE '  - is_cpf_valid(text) - Valida CPF';\n    RAISE NOTICE '  - is_cnpj_valid(text) - Valida CNPJ';\n    RAISE NOTICE '  - is_cpf_cnpj_valid(text) - Valida CPF ou CNPJ';\n    RAISE NOTICE '  - format_phone_br(text) - Formata telefone';\n    RAISE NOTICE '  - format_cep_br(text) - Formata CEP';\n    RAISE NOTICE '  - format_cpf(text) - Formata CPF';\n    RAISE NOTICE '  - format_cnpj(text) - Formata CNPJ';\n    RAISE NOTICE '';\n    RAISE NOTICE 'Exemplos de uso:';\n    RAISE NOTICE '  SELECT is_cpf_valid(''111.444.777-35''); -- TRUE';\n    RAISE NOTICE '  SELECT is_cnpj_valid(''11.222.333/0001-81''); -- TRUE';\n    RAISE NOTICE '  SELECT format_phone_br(''11987654321''); -- (11) 98765-4321';\n    RAISE NOTICE '  SELECT format_cep_br(''12345678''); -- 12345-678';\nEND;\n$$"}	criar_funcoes_validacao_br
021	{"-- =============================================\n-- MIGRATION: 021\n-- Descrição: Funções Finance (relatórios, DRE, fluxo caixa)\n-- Data: 2025-11-03\n-- =============================================\n\n-- =================================================================\n-- FUNÇÃO: finance_report\n-- Descrição: Relatório financeiro completo com filtros avançados\n-- =================================================================\n\nDROP FUNCTION IF EXISTS finance_report(date, date, text, text, uuid, uuid, text)","CREATE OR REPLACE FUNCTION finance_report(\n    p_data_ini date DEFAULT NULL,\n    p_data_fim date DEFAULT NULL,\n    p_tipo text DEFAULT NULL,         -- 'Pagar' ou 'Receber'\n    p_status text DEFAULT NULL,       -- 'Previsto', 'Aprovado', 'Pago', 'Cancelado', 'Vencido'\n    p_categoria_id uuid DEFAULT NULL,\n    p_empresa_id uuid DEFAULT NULL,\n    p_conta_id uuid DEFAULT NULL\n)\nRETURNS TABLE(\n    titulo text,\n    tipo text,\n    categoria text,\n    valor numeric,\n    data_vencimento date,\n    data_pagamento date,\n    status text,\n    fornecedor_cliente text,\n    conta_financeira text,\n    dias_atraso integer,\n    observacao text\n)\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n    RAISE NOTICE 'finance_report - Iniciando com filtros: data_ini=%, data_fim=%, tipo=%, status=%',\n        p_data_ini, p_data_fim, p_tipo, p_status;\n\n    RETURN QUERY\n    SELECT\n        t.descricao AS titulo,\n        t.tipo,\n        c.nome AS categoria,\n        t.valor,\n        t.data_vencimento,\n        NULL::date AS data_pagamento, -- TODO: campo data_pagamento não existe, usar campo adequado\n        t.status,\n        t.fornecedor_cliente,\n        cf.apelido AS conta_financeira,\n        CASE\n            WHEN t.status IN ('Previsto', 'Aprovado') AND t.data_vencimento < CURRENT_DATE\n            THEN (CURRENT_DATE - t.data_vencimento)::integer\n            ELSE 0\n        END AS dias_atraso,\n        t.observacao\n    FROM titulos_financeiros t\n    LEFT JOIN categorias c ON c.id = t.categoria_id\n    LEFT JOIN contas_financeiras cf ON cf.id = t.conta_financeira_id\n    WHERE\n        (p_data_ini IS NULL OR t.data_vencimento >= p_data_ini)\n        AND (p_data_fim IS NULL OR t.data_vencimento <= p_data_fim)\n        AND (p_tipo IS NULL OR t.tipo = p_tipo)\n        AND (p_status IS NULL OR t.status = p_status)\n        AND (p_categoria_id IS NULL OR t.categoria_id = p_categoria_id)\n        AND (p_empresa_id IS NULL OR t.empresa_id = p_empresa_id)\n        AND (p_conta_id IS NULL OR t.conta_financeira_id = p_conta_id)\n    ORDER BY t.data_vencimento DESC, t.created_at DESC;\n\nEND;\n$$","COMMENT ON FUNCTION finance_report IS\n'Relatório financeiro completo com filtros avançados por período, tipo, status, categoria, empresa e conta financeira'","-- =================================================================\n-- FUNÇÃO: fn_cashflow_daily\n-- Descrição: Fluxo de caixa diário\n-- =================================================================\n\nDROP FUNCTION IF EXISTS fn_cashflow_daily(uuid, date, date)","CREATE OR REPLACE FUNCTION fn_cashflow_daily(\n    p_org uuid DEFAULT NULL,\n    p_d1 date DEFAULT (CURRENT_DATE - INTERVAL '30 days')::date,\n    p_d2 date DEFAULT (CURRENT_DATE + INTERVAL '30 days')::date\n)\nRETURNS TABLE(\n    dia date,\n    entradas numeric,\n    saidas numeric,\n    saldo_dia numeric\n)\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_saldo_anterior numeric := 0;\n    v_dia date;\nBEGIN\n    RAISE NOTICE 'fn_cashflow_daily - Período: % a %', p_d1, p_d2;\n\n    -- Calcular saldo anterior (títulos pagos antes do período)\n    SELECT\n        COALESCE(SUM(\n            CASE\n                WHEN tipo = 'Receber' THEN valor\n                WHEN tipo = 'Pagar' THEN -valor\n                ELSE 0\n            END\n        ), 0)\n    INTO v_saldo_anterior\n    FROM titulos_financeiros\n    WHERE status = 'Pago'\n        AND data_vencimento < p_d1\n        AND (p_org IS NULL OR empresa_id = p_org);\n\n    RAISE NOTICE 'Saldo anterior: %', v_saldo_anterior;\n\n    -- Gerar série de dias e calcular fluxo\n    FOR v_dia IN\n        SELECT generate_series(p_d1, p_d2, '1 day'::interval)::date\n    LOOP\n        RETURN QUERY\n        SELECT\n            v_dia AS dia,\n            COALESCE(SUM(\n                CASE WHEN tipo = 'Receber' THEN valor ELSE 0 END\n            ), 0) AS entradas,\n            COALESCE(SUM(\n                CASE WHEN tipo = 'Pagar' THEN valor ELSE 0 END\n            ), 0) AS saidas,\n            v_saldo_anterior + COALESCE(SUM(\n                CASE\n                    WHEN tipo = 'Receber' THEN valor\n                    WHEN tipo = 'Pagar' THEN -valor\n                    ELSE 0\n                END\n            ), 0) AS saldo_dia\n        FROM titulos_financeiros\n        WHERE data_vencimento = v_dia\n            AND status IN ('Previsto', 'Aprovado', 'Pago')\n            AND (p_org IS NULL OR empresa_id = p_org);\n\n        -- Atualizar saldo acumulado para próximo dia\n        SELECT\n            v_saldo_anterior + COALESCE(SUM(\n                CASE\n                    WHEN tipo = 'Receber' THEN valor\n                    WHEN tipo = 'Pagar' THEN -valor\n                    ELSE 0\n                END\n            ), 0)\n        INTO v_saldo_anterior\n        FROM titulos_financeiros\n        WHERE data_vencimento = v_dia\n            AND status IN ('Previsto', 'Aprovado', 'Pago')\n            AND (p_org IS NULL OR empresa_id = p_org);\n    END LOOP;\n\nEND;\n$$","COMMENT ON FUNCTION fn_cashflow_daily IS\n'Retorna o fluxo de caixa diário com entradas, saídas e saldo acumulado por dia'","-- =================================================================\n-- FUNÇÃO: fn_dre\n-- Descrição: Demonstrativo de Resultado do Exercício (DRE)\n-- =================================================================\n\nDROP FUNCTION IF EXISTS fn_dre(uuid, date, date)","CREATE OR REPLACE FUNCTION fn_dre(\n    p_org uuid DEFAULT NULL,\n    p_d1 date DEFAULT date_trunc('month', CURRENT_DATE)::date,\n    p_d2 date DEFAULT (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date\n)\nRETURNS TABLE(\n    total_receitas numeric,\n    total_despesas numeric,\n    resultado numeric,\n    margem_lucro numeric,\n    qtd_receitas integer,\n    qtd_despesas integer,\n    ticket_medio_receitas numeric,\n    ticket_medio_despesas numeric\n)\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_receitas numeric;\n    v_despesas numeric;\n    v_qtd_receitas integer;\n    v_qtd_despesas integer;\nBEGIN\n    RAISE NOTICE 'fn_dre - Período: % a %', p_d1, p_d2;\n\n    -- Calcular receitas\n    SELECT\n        COALESCE(SUM(valor), 0),\n        COUNT(*)\n    INTO v_receitas, v_qtd_receitas\n    FROM titulos_financeiros\n    WHERE tipo = 'Receber'\n        AND status = 'Pago'\n        AND data_vencimento BETWEEN p_d1 AND p_d2\n        AND (p_org IS NULL OR empresa_id = p_org);\n\n    -- Calcular despesas\n    SELECT\n        COALESCE(SUM(valor), 0),\n        COUNT(*)\n    INTO v_despesas, v_qtd_despesas\n    FROM titulos_financeiros\n    WHERE tipo = 'Pagar'\n        AND status = 'Pago'\n        AND data_vencimento BETWEEN p_d1 AND p_d2\n        AND (p_org IS NULL OR empresa_id = p_org);\n\n    RETURN QUERY\n    SELECT\n        v_receitas AS total_receitas,\n        v_despesas AS total_despesas,\n        (v_receitas - v_despesas) AS resultado,\n        CASE\n            WHEN v_receitas > 0\n            THEN ROUND(((v_receitas - v_despesas) / v_receitas * 100)::numeric, 2)\n            ELSE 0\n        END AS margem_lucro,\n        v_qtd_receitas AS qtd_receitas,\n        v_qtd_despesas AS qtd_despesas,\n        CASE\n            WHEN v_qtd_receitas > 0\n            THEN ROUND((v_receitas / v_qtd_receitas)::numeric, 2)\n            ELSE 0\n        END AS ticket_medio_receitas,\n        CASE\n            WHEN v_qtd_despesas > 0\n            THEN ROUND((v_despesas / v_qtd_despesas)::numeric, 2)\n            ELSE 0\n        END AS ticket_medio_despesas;\n\nEND;\n$$","COMMENT ON FUNCTION fn_dre IS\n'Demonstrativo de Resultado do Exercício com métricas de receitas, despesas e margens'","-- =================================================================\n-- FUNÇÃO: get_finance_dashboard_data\n-- Descrição: Dados agregados para dashboard financeiro\n-- =================================================================\n\nDROP FUNCTION IF EXISTS get_finance_dashboard_data(uuid)","CREATE OR REPLACE FUNCTION get_finance_dashboard_data(\n    p_empresa_id uuid DEFAULT NULL\n)\nRETURNS json\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_result json;\n    v_receitas_mes numeric;\n    v_despesas_mes numeric;\n    v_receitas_previstas numeric;\n    v_despesas_previstas numeric;\n    v_saldo_contas numeric;\n    v_titulos_vencidos integer;\n    v_titulos_vencer_7d integer;\nBEGIN\n    RAISE NOTICE 'get_finance_dashboard_data - empresa_id: %', p_empresa_id;\n\n    -- Receitas do mês atual (pagas)\n    SELECT COALESCE(SUM(valor), 0)\n    INTO v_receitas_mes\n    FROM titulos_financeiros\n    WHERE tipo = 'Receber'\n        AND status = 'Pago'\n        AND date_trunc('month', data_vencimento) = date_trunc('month', CURRENT_DATE)\n        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);\n\n    -- Despesas do mês atual (pagas)\n    SELECT COALESCE(SUM(valor), 0)\n    INTO v_despesas_mes\n    FROM titulos_financeiros\n    WHERE tipo = 'Pagar'\n        AND status = 'Pago'\n        AND date_trunc('month', data_vencimento) = date_trunc('month', CURRENT_DATE)\n        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);\n\n    -- Receitas previstas (não pagas)\n    SELECT COALESCE(SUM(valor), 0)\n    INTO v_receitas_previstas\n    FROM titulos_financeiros\n    WHERE tipo = 'Receber'\n        AND status IN ('Previsto', 'Aprovado')\n        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);\n\n    -- Despesas previstas (não pagas)\n    SELECT COALESCE(SUM(valor), 0)\n    INTO v_despesas_previstas\n    FROM titulos_financeiros\n    WHERE tipo = 'Pagar'\n        AND status IN ('Previsto', 'Aprovado')\n        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);\n\n    -- Saldo das contas financeiras\n    SELECT COALESCE(SUM(saldo_atual), 0)\n    INTO v_saldo_contas\n    FROM contas_financeiras\n    WHERE ativo = true\n        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);\n\n    -- Títulos vencidos\n    SELECT COUNT(*)\n    INTO v_titulos_vencidos\n    FROM titulos_financeiros\n    WHERE status IN ('Previsto', 'Aprovado')\n        AND data_vencimento < CURRENT_DATE\n        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);\n\n    -- Títulos a vencer nos próximos 7 dias\n    SELECT COUNT(*)\n    INTO v_titulos_vencer_7d\n    FROM titulos_financeiros\n    WHERE status IN ('Previsto', 'Aprovado')\n        AND data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')\n        AND (p_empresa_id IS NULL OR empresa_id = p_empresa_id);\n\n    -- Montar JSON de resultado\n    v_result := json_build_object(\n        'mes_atual', json_build_object(\n            'receitas_pagas', v_receitas_mes,\n            'despesas_pagas', v_despesas_mes,\n            'saldo_mes', v_receitas_mes - v_despesas_mes,\n            'lucratividade', CASE\n                WHEN v_receitas_mes > 0\n                THEN ROUND(((v_receitas_mes - v_despesas_mes) / v_receitas_mes * 100)::numeric, 2)\n                ELSE 0\n            END\n        ),\n        'previstos', json_build_object(\n            'receitas', v_receitas_previstas,\n            'despesas', v_despesas_previstas,\n            'saldo_previsto', v_receitas_previstas - v_despesas_previstas\n        ),\n        'contas', json_build_object(\n            'saldo_total', v_saldo_contas\n        ),\n        'alertas', json_build_object(\n            'titulos_vencidos', v_titulos_vencidos,\n            'titulos_vencer_7d', v_titulos_vencer_7d\n        ),\n        'timestamp', NOW()\n    );\n\n    RETURN v_result;\n\nEND;\n$$","COMMENT ON FUNCTION get_finance_dashboard_data IS\n'Retorna dados agregados para dashboard financeiro incluindo receitas, despesas, saldos e alertas'","-- =================================================================\n-- FUNÇÃO: fin_txn_duplicate\n-- Descrição: Duplicar transação financeira\n-- =================================================================\n\nDROP FUNCTION IF EXISTS fin_txn_duplicate(uuid)","CREATE OR REPLACE FUNCTION fin_txn_duplicate(\n    p_id uuid\n)\nRETURNS uuid\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_new_id uuid;\n    v_record RECORD;\nBEGIN\n    RAISE NOTICE 'fin_txn_duplicate - Duplicando título: %', p_id;\n\n    -- Buscar registro original\n    SELECT * INTO v_record\n    FROM titulos_financeiros\n    WHERE id = p_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Título financeiro não encontrado: %', p_id;\n    END IF;\n\n    -- Criar cópia\n    INSERT INTO titulos_financeiros (\n        empresa_id,\n        tipo,\n        descricao,\n        valor,\n        data_emissao,\n        data_vencimento,\n        status,\n        categoria_id,\n        centro_custo_id,\n        conta_financeira_id,\n        observacao,\n        documento,\n        fornecedor_cliente\n    ) VALUES (\n        v_record.empresa_id,\n        v_record.tipo,\n        v_record.descricao || ' (Cópia)',\n        v_record.valor,\n        CURRENT_DATE,\n        v_record.data_vencimento + INTERVAL '1 month', -- Vencimento próximo mês\n        'Previsto', -- Status inicial\n        v_record.categoria_id,\n        v_record.centro_custo_id,\n        v_record.conta_financeira_id,\n        v_record.observacao,\n        v_record.documento,\n        v_record.fornecedor_cliente\n    )\n    RETURNING id INTO v_new_id;\n\n    RAISE NOTICE 'Título duplicado com sucesso. Novo ID: %', v_new_id;\n    RETURN v_new_id;\n\nEND;\n$$","COMMENT ON FUNCTION fin_txn_duplicate IS\n'Duplica uma transação financeira, útil para títulos recorrentes'","-- =================================================================\n-- FUNÇÃO: fin_txn_soft_delete\n-- Descrição: Soft delete de transação financeira\n-- =================================================================\n\nDROP FUNCTION IF EXISTS fin_txn_soft_delete(uuid)","CREATE OR REPLACE FUNCTION fin_txn_soft_delete(\n    p_id uuid\n)\nRETURNS boolean\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_status text;\nBEGIN\n    RAISE NOTICE 'fin_txn_soft_delete - Cancelando título: %', p_id;\n\n    -- Verificar status atual\n    SELECT status INTO v_status\n    FROM titulos_financeiros\n    WHERE id = p_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Título financeiro não encontrado: %', p_id;\n    END IF;\n\n    IF v_status = 'Pago' THEN\n        RAISE EXCEPTION 'Não é possível cancelar título já pago';\n    END IF;\n\n    IF v_status = 'Cancelado' THEN\n        RAISE WARNING 'Título já está cancelado';\n        RETURN FALSE;\n    END IF;\n\n    -- Marcar como cancelado\n    UPDATE titulos_financeiros\n    SET\n        status = 'Cancelado',\n        updated_at = NOW(),\n        observacao = COALESCE(observacao || E'\\\\n', '') ||\n            'Cancelado em ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || ' por ' || COALESCE(auth.uid()::text, 'sistema')\n    WHERE id = p_id;\n\n    RAISE NOTICE 'Título cancelado com sucesso';\n    RETURN TRUE;\n\nEND;\n$$","COMMENT ON FUNCTION fin_txn_soft_delete IS\n'Cancela uma transação financeira (soft delete), não permite cancelar títulos já pagos'","-- =================================================================\n-- FUNÇÃO: fin_card_soft_delete\n-- Descrição: Soft delete de cartão (contas_financeiras)\n-- =================================================================\n\nDROP FUNCTION IF EXISTS fin_card_soft_delete(uuid)","CREATE OR REPLACE FUNCTION fin_card_soft_delete(\n    p_id uuid\n)\nRETURNS boolean\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_ativo boolean;\n    v_saldo numeric;\nBEGIN\n    RAISE NOTICE 'fin_card_soft_delete - Desativando conta: %', p_id;\n\n    -- Verificar conta\n    SELECT ativo, saldo_atual INTO v_ativo, v_saldo\n    FROM contas_financeiras\n    WHERE id = p_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Conta financeira não encontrada: %', p_id;\n    END IF;\n\n    IF NOT v_ativo THEN\n        RAISE WARNING 'Conta já está desativada';\n        RETURN FALSE;\n    END IF;\n\n    IF v_saldo != 0 THEN\n        RAISE WARNING 'Conta possui saldo: %. Considere zerar antes de desativar', v_saldo;\n    END IF;\n\n    -- Desativar conta\n    UPDATE contas_financeiras\n    SET\n        ativo = FALSE,\n        updated_at = NOW()\n    WHERE id = p_id;\n\n    RAISE NOTICE 'Conta desativada com sucesso';\n    RETURN TRUE;\n\nEND;\n$$","COMMENT ON FUNCTION fin_card_soft_delete IS\n'Desativa uma conta financeira (soft delete), alerta se houver saldo'","-- =================================================================\n-- TRIGGER: fin_txn_compute_amount\n-- Descrição: Calcular valor automaticamente (se houver lógica)\n-- =================================================================\n\nDROP TRIGGER IF EXISTS fin_txn_compute_amount ON titulos_financeiros","DROP FUNCTION IF EXISTS trigger_fin_txn_compute_amount()","CREATE OR REPLACE FUNCTION trigger_fin_txn_compute_amount()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nBEGIN\n    -- Calcular valor se necessário (exemplo: desconto ou juros)\n    -- Por enquanto, apenas validar valor positivo\n    IF NEW.valor IS NOT NULL AND NEW.valor < 0 THEN\n        RAISE EXCEPTION 'Valor não pode ser negativo';\n    END IF;\n\n    -- Se não houver data de emissão, usar data atual\n    IF NEW.data_emissao IS NULL THEN\n        NEW.data_emissao := CURRENT_DATE;\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER fin_txn_compute_amount\n    BEFORE INSERT OR UPDATE ON titulos_financeiros\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_fin_txn_compute_amount()","COMMENT ON TRIGGER fin_txn_compute_amount ON titulos_financeiros IS\n'Valida e calcula valores antes de inserir ou atualizar títulos'","-- =================================================================\n-- TRIGGER: fin_txn_defaults\n-- Descrição: Preencher valores padrão\n-- =================================================================\n\nDROP TRIGGER IF EXISTS fin_txn_defaults ON titulos_financeiros","DROP FUNCTION IF EXISTS trigger_fin_txn_defaults()","CREATE OR REPLACE FUNCTION trigger_fin_txn_defaults()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nBEGIN\n    -- Status padrão\n    IF NEW.status IS NULL THEN\n        NEW.status := 'Previsto';\n    END IF;\n\n    -- Data de emissão padrão\n    IF NEW.data_emissao IS NULL THEN\n        NEW.data_emissao := CURRENT_DATE;\n    END IF;\n\n    -- Se data de vencimento for passada e status for Previsto/Aprovado, marcar como Vencido\n    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status IN ('Previsto', 'Aprovado') THEN\n        NEW.status := 'Vencido';\n    END IF;\n\n    -- Timestamps\n    IF TG_OP = 'INSERT' THEN\n        NEW.created_at := NOW();\n    END IF;\n    NEW.updated_at := NOW();\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER fin_txn_defaults\n    BEFORE INSERT OR UPDATE ON titulos_financeiros\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_fin_txn_defaults()","COMMENT ON TRIGGER fin_txn_defaults ON titulos_financeiros IS\n'Preenche valores padrão e atualiza status automaticamente'","-- =================================================================\n-- FIM DA MIGRATION 021\n-- =================================================================\n\nDO $$\nBEGIN\n    RAISE NOTICE 'Migration 021 - Funções Finance criadas com sucesso!';\nEND $$"}	criar_funcoes_finance
022	{"-- =============================================\n-- MIGRATION: 022\n-- Descrição: Funções Kanban (boards, colunas, cards)\n-- Data: 2025-11-03\n-- =============================================\n\n-- =================================================================\n-- FUNÇÃO: kanban_ensure_board\n-- Descrição: Criar board se não existir, retorna ID\n-- =================================================================\n\nDROP FUNCTION IF EXISTS kanban_ensure_board(text)","CREATE OR REPLACE FUNCTION kanban_ensure_board(\n    p_modulo text\n)\nRETURNS bigint\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_board_id uuid;\n    v_board_id_bigint bigint;\nBEGIN\n    RAISE NOTICE 'kanban_ensure_board - Garantindo board para módulo: %', p_modulo;\n\n    -- Verificar se o board já existe\n    SELECT id INTO v_board_id\n    FROM kanban_boards\n    WHERE ambiente = p_modulo;\n\n    IF NOT FOUND THEN\n        -- Criar novo board\n        INSERT INTO kanban_boards (ambiente, titulo, descricao)\n        VALUES (\n            p_modulo,\n            'Kanban ' || p_modulo,\n            'Board do módulo ' || p_modulo\n        )\n        RETURNING id INTO v_board_id;\n\n        RAISE NOTICE 'Board criado: %', v_board_id;\n\n        -- Criar colunas padrão\n        PERFORM _ensure_coluna(\n            v_board_id,\n            'A Fazer',\n            1,\n            '#94a3b8' -- Cinza\n        );\n\n        PERFORM _ensure_coluna(\n            v_board_id,\n            'Em Progresso',\n            2,\n            '#60a5fa' -- Azul\n        );\n\n        PERFORM _ensure_coluna(\n            v_board_id,\n            'Em Revisão',\n            3,\n            '#fbbf24' -- Amarelo\n        );\n\n        PERFORM _ensure_coluna(\n            v_board_id,\n            'Concluído',\n            4,\n            '#34d399' -- Verde\n        );\n\n        RAISE NOTICE 'Colunas padrão criadas para o board';\n    ELSE\n        RAISE NOTICE 'Board já existe: %', v_board_id;\n    END IF;\n\n    -- Converter UUID para bigint (hash simples do primeiro segment)\n    -- Nota: Esta conversão é simplificada, em produção usar outra estratégia\n    v_board_id_bigint := ('x' || substr(v_board_id::text, 1, 8))::bit(32)::bigint;\n\n    RETURN v_board_id_bigint;\n\nEND;\n$$","COMMENT ON FUNCTION kanban_ensure_board IS\n'Garante que um board existe para o módulo especificado, cria se necessário com colunas padrão'","-- =================================================================\n-- FUNÇÃO: _ensure_coluna\n-- Descrição: Criar coluna em board se não existir\n-- =================================================================\n\nDROP FUNCTION IF EXISTS _ensure_coluna(uuid, text, integer, text)","CREATE OR REPLACE FUNCTION _ensure_coluna(\n    p_board_id uuid,\n    p_titulo text,\n    p_posicao integer,\n    p_cor text DEFAULT '#94a3b8'\n)\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_coluna_id uuid;\nBEGIN\n    RAISE NOTICE '_ensure_coluna - Board: %, Título: %, Posição: %', p_board_id, p_titulo, p_posicao;\n\n    -- Verificar se a coluna já existe\n    SELECT id INTO v_coluna_id\n    FROM kanban_colunas\n    WHERE board_id = p_board_id AND titulo = p_titulo;\n\n    IF NOT FOUND THEN\n        -- Criar nova coluna\n        INSERT INTO kanban_colunas (board_id, titulo, posicao, cor)\n        VALUES (p_board_id, p_titulo, p_posicao, p_cor)\n        ON CONFLICT (board_id, posicao) DO UPDATE\n        SET titulo = EXCLUDED.titulo, cor = EXCLUDED.cor;\n\n        RAISE NOTICE 'Coluna criada: %', p_titulo;\n    ELSE\n        -- Atualizar posição e cor se diferente\n        UPDATE kanban_colunas\n        SET posicao = p_posicao, cor = p_cor\n        WHERE id = v_coluna_id\n            AND (posicao != p_posicao OR cor != p_cor);\n\n        IF FOUND THEN\n            RAISE NOTICE 'Coluna atualizada: %', p_titulo;\n        END IF;\n    END IF;\n\nEND;\n$$","COMMENT ON FUNCTION _ensure_coluna IS\n'Cria ou atualiza uma coluna no board especificado (função auxiliar interna)'","-- =================================================================\n-- FUNÇÃO: reorder_cards\n-- Descrição: Reordenar cards por posição\n-- =================================================================\n\nDROP FUNCTION IF EXISTS reorder_cards(text, uuid)","CREATE OR REPLACE FUNCTION reorder_cards(\n    p_modulo text,\n    p_stage_id uuid DEFAULT NULL\n)\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_board_id uuid;\n    v_card RECORD;\n    v_posicao integer := 0;\nBEGIN\n    RAISE NOTICE 'reorder_cards - Módulo: %, Stage: %', p_modulo, p_stage_id;\n\n    -- Obter board_id do módulo\n    SELECT id INTO v_board_id\n    FROM kanban_boards\n    WHERE ambiente = p_modulo;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Board não encontrado para módulo: %', p_modulo;\n    END IF;\n\n    -- Se stage_id especificado, reordenar apenas cards dessa coluna\n    IF p_stage_id IS NOT NULL THEN\n        FOR v_card IN\n            SELECT id\n            FROM kanban_cards\n            WHERE coluna_id = p_stage_id\n            ORDER BY posicao, created_at\n        LOOP\n            v_posicao := v_posicao + 10;\n            UPDATE kanban_cards\n            SET posicao = v_posicao\n            WHERE id = v_card.id;\n        END LOOP;\n\n        RAISE NOTICE 'Reordenados % cards na coluna %', v_posicao / 10, p_stage_id;\n    ELSE\n        -- Reordenar todas as colunas do board\n        FOR v_card IN\n            SELECT kc.id, kc.coluna_id\n            FROM kanban_cards kc\n            INNER JOIN kanban_colunas col ON col.id = kc.coluna_id\n            WHERE col.board_id = v_board_id\n            ORDER BY col.posicao, kc.posicao, kc.created_at\n        LOOP\n            -- Reset posição quando mudar de coluna\n            IF v_card.coluna_id IS DISTINCT FROM lag(v_card.coluna_id) OVER () THEN\n                v_posicao := 0;\n            END IF;\n\n            v_posicao := v_posicao + 10;\n            UPDATE kanban_cards\n            SET posicao = v_posicao\n            WHERE id = v_card.id;\n        END LOOP;\n\n        RAISE NOTICE 'Reordenados todos os cards do board %', p_modulo;\n    END IF;\n\nEND;\n$$","COMMENT ON FUNCTION reorder_cards IS\n'Reordena cards do kanban por posição, opcionalmente filtrando por coluna'","-- =================================================================\n-- TRIGGER: kanban_cards_autordem_ins\n-- Descrição: Auto-ordenar ao inserir card\n-- =================================================================\n\nDROP TRIGGER IF EXISTS kanban_cards_autordem_ins ON kanban_cards","DROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_ins()","CREATE OR REPLACE FUNCTION trigger_kanban_cards_autordem_ins()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_max_posicao integer;\nBEGIN\n    -- Se não foi especificada posição, colocar no final\n    IF NEW.posicao IS NULL OR NEW.posicao = 0 THEN\n        SELECT COALESCE(MAX(posicao), 0) + 10\n        INTO v_max_posicao\n        FROM kanban_cards\n        WHERE coluna_id = NEW.coluna_id;\n\n        NEW.posicao := v_max_posicao;\n        RAISE NOTICE 'Card inserido na posição % da coluna %', NEW.posicao, NEW.coluna_id;\n    END IF;\n\n    -- Garantir que posição seja múltiplo de 10 para facilitar reordenação\n    IF NEW.posicao % 10 != 0 THEN\n        NEW.posicao := ROUND(NEW.posicao / 10.0) * 10;\n    END IF;\n\n    -- Timestamps\n    NEW.created_at := NOW();\n    NEW.updated_at := NOW();\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER kanban_cards_autordem_ins\n    BEFORE INSERT ON kanban_cards\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_kanban_cards_autordem_ins()","COMMENT ON TRIGGER kanban_cards_autordem_ins ON kanban_cards IS\n'Atribui posição automaticamente ao inserir novo card no kanban'","-- =================================================================\n-- TRIGGER: kanban_cards_autordem_upd\n-- Descrição: Auto-ordenar ao atualizar posição\n-- =================================================================\n\nDROP TRIGGER IF EXISTS kanban_cards_autordem_upd ON kanban_cards","DROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_upd()","CREATE OR REPLACE FUNCTION trigger_kanban_cards_autordem_upd()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_cards_to_shift integer;\nBEGIN\n    -- Se mudou de coluna, ajustar posições\n    IF OLD.coluna_id IS DISTINCT FROM NEW.coluna_id THEN\n        -- Se não especificou nova posição, colocar no final da nova coluna\n        IF NEW.posicao = OLD.posicao OR NEW.posicao IS NULL THEN\n            SELECT COALESCE(MAX(posicao), 0) + 10\n            INTO NEW.posicao\n            FROM kanban_cards\n            WHERE coluna_id = NEW.coluna_id\n                AND id != NEW.id;\n        END IF;\n\n        RAISE NOTICE 'Card movido para coluna %, posição %', NEW.coluna_id, NEW.posicao;\n\n        -- Reordenar cards na coluna antiga (fechar gap)\n        UPDATE kanban_cards\n        SET posicao = posicao - 10\n        WHERE coluna_id = OLD.coluna_id\n            AND posicao > OLD.posicao\n            AND id != NEW.id;\n\n        -- Abrir espaço na nova coluna se necessário\n        UPDATE kanban_cards\n        SET posicao = posicao + 10\n        WHERE coluna_id = NEW.coluna_id\n            AND posicao >= NEW.posicao\n            AND id != NEW.id;\n\n    ELSIF OLD.posicao != NEW.posicao THEN\n        -- Moveu dentro da mesma coluna\n        IF NEW.posicao > OLD.posicao THEN\n            -- Movendo para baixo\n            UPDATE kanban_cards\n            SET posicao = posicao - 10\n            WHERE coluna_id = NEW.coluna_id\n                AND posicao > OLD.posicao\n                AND posicao <= NEW.posicao\n                AND id != NEW.id;\n        ELSE\n            -- Movendo para cima\n            UPDATE kanban_cards\n            SET posicao = posicao + 10\n            WHERE coluna_id = NEW.coluna_id\n                AND posicao >= NEW.posicao\n                AND posicao < OLD.posicao\n                AND id != NEW.id;\n        END IF;\n\n        RAISE NOTICE 'Card reposicionado de % para %', OLD.posicao, NEW.posicao;\n    END IF;\n\n    -- Atualizar timestamp\n    NEW.updated_at := NOW();\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER kanban_cards_autordem_upd\n    BEFORE UPDATE ON kanban_cards\n    FOR EACH ROW\n    WHEN (OLD.coluna_id IS DISTINCT FROM NEW.coluna_id OR OLD.posicao IS DISTINCT FROM NEW.posicao)\n    EXECUTE FUNCTION trigger_kanban_cards_autordem_upd()","COMMENT ON TRIGGER kanban_cards_autordem_upd ON kanban_cards IS\n'Reorganiza posições dos cards ao mover entre colunas ou reordenar'","-- =================================================================\n-- TRIGGER: kanban_colunas_set_pos\n-- Descrição: Auto-ordenar colunas\n-- =================================================================\n\nDROP TRIGGER IF EXISTS kanban_colunas_set_pos ON kanban_colunas","DROP FUNCTION IF EXISTS trigger_kanban_colunas_set_pos()","CREATE OR REPLACE FUNCTION trigger_kanban_colunas_set_pos()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_max_posicao integer;\nBEGIN\n    -- Ao inserir nova coluna\n    IF TG_OP = 'INSERT' THEN\n        -- Se não foi especificada posição, colocar no final\n        IF NEW.posicao IS NULL OR NEW.posicao = 0 THEN\n            SELECT COALESCE(MAX(posicao), 0) + 1\n            INTO v_max_posicao\n            FROM kanban_colunas\n            WHERE board_id = NEW.board_id;\n\n            NEW.posicao := v_max_posicao;\n            RAISE NOTICE 'Coluna inserida na posição % do board %', NEW.posicao, NEW.board_id;\n        ELSE\n            -- Abrir espaço se necessário\n            UPDATE kanban_colunas\n            SET posicao = posicao + 1\n            WHERE board_id = NEW.board_id\n                AND posicao >= NEW.posicao\n                AND id != NEW.id;\n        END IF;\n\n        NEW.created_at := NOW();\n    END IF;\n\n    -- Ao atualizar posição\n    IF TG_OP = 'UPDATE' AND OLD.posicao != NEW.posicao THEN\n        IF NEW.posicao > OLD.posicao THEN\n            -- Movendo para direita\n            UPDATE kanban_colunas\n            SET posicao = posicao - 1\n            WHERE board_id = NEW.board_id\n                AND posicao > OLD.posicao\n                AND posicao <= NEW.posicao\n                AND id != NEW.id;\n        ELSE\n            -- Movendo para esquerda\n            UPDATE kanban_colunas\n            SET posicao = posicao + 1\n            WHERE board_id = NEW.board_id\n                AND posicao >= NEW.posicao\n                AND posicao < OLD.posicao\n                AND id != NEW.id;\n        END IF;\n\n        RAISE NOTICE 'Coluna reposicionada de % para %', OLD.posicao, NEW.posicao;\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER kanban_colunas_set_pos\n    BEFORE INSERT OR UPDATE ON kanban_colunas\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_kanban_colunas_set_pos()","COMMENT ON TRIGGER kanban_colunas_set_pos ON kanban_colunas IS\n'Gerencia automaticamente a posição das colunas do kanban'","-- =================================================================\n-- FUNÇÃO AUXILIAR: kanban_move_card\n-- Descrição: Mover card entre colunas\n-- =================================================================\n\nDROP FUNCTION IF EXISTS kanban_move_card(uuid, uuid, integer)","CREATE OR REPLACE FUNCTION kanban_move_card(\n    p_card_id uuid,\n    p_new_coluna_id uuid,\n    p_new_posicao integer DEFAULT NULL\n)\nRETURNS boolean\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_old_coluna_id uuid;\n    v_old_posicao integer;\nBEGIN\n    RAISE NOTICE 'kanban_move_card - Card: %, Nova coluna: %, Nova posição: %',\n        p_card_id, p_new_coluna_id, p_new_posicao;\n\n    -- Obter posição atual\n    SELECT coluna_id, posicao\n    INTO v_old_coluna_id, v_old_posicao\n    FROM kanban_cards\n    WHERE id = p_card_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Card não encontrado: %', p_card_id;\n    END IF;\n\n    -- Se não especificou posição, colocar no final\n    IF p_new_posicao IS NULL THEN\n        SELECT COALESCE(MAX(posicao), 0) + 10\n        INTO p_new_posicao\n        FROM kanban_cards\n        WHERE coluna_id = p_new_coluna_id;\n    END IF;\n\n    -- Atualizar card (triggers farão o reordenamento)\n    UPDATE kanban_cards\n    SET\n        coluna_id = p_new_coluna_id,\n        posicao = p_new_posicao,\n        updated_at = NOW()\n    WHERE id = p_card_id;\n\n    RAISE NOTICE 'Card movido com sucesso de coluna % pos % para coluna % pos %',\n        v_old_coluna_id, v_old_posicao, p_new_coluna_id, p_new_posicao;\n\n    RETURN TRUE;\n\nEND;\n$$","COMMENT ON FUNCTION kanban_move_card IS\n'Move um card entre colunas do kanban, reordenando automaticamente as posições'","-- =================================================================\n-- FUNÇÃO AUXILIAR: kanban_get_board_status\n-- Descrição: Obter status do board\n-- =================================================================\n\nDROP FUNCTION IF EXISTS kanban_get_board_status(text)","CREATE OR REPLACE FUNCTION kanban_get_board_status(\n    p_modulo text\n)\nRETURNS json\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_result json;\n    v_board_id uuid;\nBEGIN\n    -- Obter board_id\n    SELECT id INTO v_board_id\n    FROM kanban_boards\n    WHERE ambiente = p_modulo;\n\n    IF NOT FOUND THEN\n        RETURN json_build_object(\n            'error', 'Board não encontrado',\n            'modulo', p_modulo\n        );\n    END IF;\n\n    -- Montar estatísticas\n    SELECT json_build_object(\n        'board_id', v_board_id,\n        'modulo', p_modulo,\n        'colunas', (\n            SELECT json_agg(\n                json_build_object(\n                    'id', c.id,\n                    'titulo', c.titulo,\n                    'cor', c.cor,\n                    'posicao', c.posicao,\n                    'total_cards', COUNT(kc.id),\n                    'valor_total', COALESCE(SUM(kc.valor), 0)\n                ) ORDER BY c.posicao\n            )\n            FROM kanban_colunas c\n            LEFT JOIN kanban_cards kc ON kc.coluna_id = c.id\n            WHERE c.board_id = v_board_id\n            GROUP BY c.id, c.titulo, c.cor, c.posicao\n        ),\n        'totais', (\n            SELECT json_build_object(\n                'total_cards', COUNT(kc.id),\n                'valor_total', COALESCE(SUM(kc.valor), 0),\n                'cards_sem_responsavel', COUNT(*) FILTER (WHERE kc.responsavel_id IS NULL)\n            )\n            FROM kanban_cards kc\n            INNER JOIN kanban_colunas c ON c.id = kc.coluna_id\n            WHERE c.board_id = v_board_id\n        ),\n        'timestamp', NOW()\n    ) INTO v_result;\n\n    RETURN v_result;\n\nEND;\n$$","COMMENT ON FUNCTION kanban_get_board_status IS\n'Retorna estatísticas e status completo de um board kanban'","-- =================================================================\n-- FIM DA MIGRATION 022\n-- =================================================================\n\nDO $$ BEGIN RAISE NOTICE 'Migration 022 - Funções Kanban criadas com sucesso!'; END $$"}	criar_funcoes_kanban
023	{"-- =============================================\n-- MIGRATION: 023\n-- Descrição: Funções Propostas/Cronograma (gestão de propostas comerciais)\n-- Data: 2025-11-03\n-- =============================================\n\n-- =================================================================\n-- FUNÇÃO: recalc_proposta_total\n-- Descrição: Recalcular total da proposta baseado nos itens JSONB\n-- =================================================================\n\nDROP FUNCTION IF EXISTS recalc_proposta_total(uuid)","CREATE OR REPLACE FUNCTION recalc_proposta_total(\n    p_proposta_id uuid\n)\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_total numeric := 0;\n    v_itens jsonb;\n    v_item jsonb;\nBEGIN\n    RAISE NOTICE 'recalc_proposta_total - Recalculando proposta: %', p_proposta_id;\n\n    -- Obter itens da proposta\n    SELECT itens INTO v_itens\n    FROM propostas\n    WHERE id = p_proposta_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;\n    END IF;\n\n    -- Calcular total dos itens\n    IF v_itens IS NOT NULL AND jsonb_array_length(v_itens) > 0 THEN\n        FOR v_item IN SELECT * FROM jsonb_array_elements(v_itens)\n        LOOP\n            -- Somar: quantidade * valor_unitario\n            v_total := v_total + COALESCE(\n                (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,\n                0\n            );\n        END LOOP;\n    END IF;\n\n    -- Atualizar total na proposta\n    UPDATE propostas\n    SET\n        valor_total = v_total,\n        updated_at = NOW()\n    WHERE id = p_proposta_id;\n\n    RAISE NOTICE 'Total recalculado: R$ %', v_total;\n\nEND;\n$$","COMMENT ON FUNCTION recalc_proposta_total IS\n'Recalcula o valor total da proposta baseado nos itens (campo JSONB)'","-- =================================================================\n-- FUNÇÃO: purchase_order_create\n-- Descrição: Criar pedido de compra (ordem de compra)\n-- =================================================================\n\nDROP FUNCTION IF EXISTS purchase_order_create(uuid, uuid, text, jsonb)","CREATE OR REPLACE FUNCTION purchase_order_create(\n    p_entity_id uuid,\n    p_fornecedor_id uuid,\n    p_status text DEFAULT 'pendente',\n    p_itens jsonb DEFAULT '[]'::jsonb\n)\nRETURNS uuid\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_ordem_id uuid;\n    v_numero text;\n    v_total numeric := 0;\n    v_item jsonb;\nBEGIN\n    RAISE NOTICE 'purchase_order_create - Entity: %, Fornecedor: %', p_entity_id, p_fornecedor_id;\n\n    -- Gerar número único\n    v_numero := 'OC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||\n        LPAD(NEXTVAL('pg_catalog.pg_dist_node_group_id_seq')::text, 4, '0');\n\n    -- Calcular total dos itens\n    IF p_itens IS NOT NULL AND jsonb_array_length(p_itens) > 0 THEN\n        FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)\n        LOOP\n            v_total := v_total + COALESCE(\n                (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,\n                0\n            );\n        END LOOP;\n    END IF;\n\n    -- Criar nova proposta como ordem de compra\n    INSERT INTO propostas (\n        numero,\n        cliente_id,\n        titulo,\n        descricao,\n        valor_total,\n        status,\n        tipo,\n        itens,\n        dados,\n        data_emissao\n    ) VALUES (\n        v_numero,\n        p_entity_id,\n        'Ordem de Compra - ' || v_numero,\n        'Pedido de compra para fornecedor',\n        v_total,\n        p_status,\n        'ordem_compra',\n        p_itens,\n        jsonb_build_object(\n            'fornecedor_id', p_fornecedor_id,\n            'tipo_documento', 'ordem_compra',\n            'criado_por', auth.uid(),\n            'criado_em', NOW()\n        ),\n        CURRENT_DATE\n    )\n    RETURNING id INTO v_ordem_id;\n\n    RAISE NOTICE 'Ordem de compra criada: % (Total: R$ %)', v_numero, v_total;\n    RETURN v_ordem_id;\n\nEND;\n$$","COMMENT ON FUNCTION purchase_order_create IS\n'Cria uma ordem de compra (pedido de compra) com itens e fornecedor'","-- =================================================================\n-- FUNÇÃO: recompute_invoice_status\n-- Descrição: Recalcular status de nota fiscal baseado em títulos\n-- =================================================================\n\nDROP FUNCTION IF EXISTS recompute_invoice_status(uuid)","CREATE OR REPLACE FUNCTION recompute_invoice_status(\n    p_invoice_id uuid\n)\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_proposta RECORD;\n    v_titulos_pagos integer;\n    v_titulos_total integer;\n    v_novo_status text;\nBEGIN\n    RAISE NOTICE 'recompute_invoice_status - Invoice: %', p_invoice_id;\n\n    -- Buscar proposta/invoice\n    SELECT * INTO v_proposta\n    FROM propostas\n    WHERE id = p_invoice_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Invoice/Proposta não encontrada: %', p_invoice_id;\n    END IF;\n\n    -- Contar títulos relacionados (buscar no campo dados->invoice_id ou documento)\n    SELECT\n        COUNT(*) FILTER (WHERE status = 'Pago'),\n        COUNT(*)\n    INTO v_titulos_pagos, v_titulos_total\n    FROM titulos_financeiros\n    WHERE documento = v_proposta.numero\n        OR (dados->>'invoice_id')::uuid = p_invoice_id;\n\n    -- Determinar novo status\n    IF v_titulos_total = 0 THEN\n        v_novo_status := 'pendente';\n    ELSIF v_titulos_pagos = 0 THEN\n        v_novo_status := 'em_aberto';\n    ELSIF v_titulos_pagos < v_titulos_total THEN\n        v_novo_status := 'parcialmente_pago';\n    ELSE\n        v_novo_status := 'pago';\n    END IF;\n\n    -- Atualizar status se mudou\n    IF v_proposta.status IS DISTINCT FROM v_novo_status THEN\n        UPDATE propostas\n        SET\n            status = v_novo_status,\n            updated_at = NOW(),\n            dados = dados || jsonb_build_object(\n                'status_atualizado_em', NOW(),\n                'titulos_pagos', v_titulos_pagos,\n                'titulos_total', v_titulos_total\n            )\n        WHERE id = p_invoice_id;\n\n        RAISE NOTICE 'Status atualizado de % para % (Pagos: %/%)',\n            v_proposta.status, v_novo_status, v_titulos_pagos, v_titulos_total;\n    ELSE\n        RAISE NOTICE 'Status mantido: % (Pagos: %/%)',\n            v_novo_status, v_titulos_pagos, v_titulos_total;\n    END IF;\n\nEND;\n$$","COMMENT ON FUNCTION recompute_invoice_status IS\n'Recalcula o status de uma nota fiscal/proposta baseado nos títulos financeiros relacionados'","-- =================================================================\n-- FUNÇÃO: cronograma_seed_from_proposta (ADAPTADA)\n-- Descrição: Criar cronograma baseado em proposta\n-- Nota: Como não existe tabela cronograma, vamos criar cards no kanban\n-- =================================================================\n\nDROP FUNCTION IF EXISTS cronograma_seed_from_proposta(uuid, uuid)","CREATE OR REPLACE FUNCTION cronograma_seed_from_proposta(\n    p_cronograma_id uuid,  -- Será o board_id do kanban\n    p_proposta_id uuid\n)\nRETURNS integer\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_proposta RECORD;\n    v_itens jsonb;\n    v_item jsonb;\n    v_cards_criados integer := 0;\n    v_coluna_id uuid;\nBEGIN\n    RAISE NOTICE 'cronograma_seed_from_proposta - Proposta: %', p_proposta_id;\n\n    -- Buscar proposta\n    SELECT * INTO v_proposta\n    FROM propostas\n    WHERE id = p_proposta_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;\n    END IF;\n\n    -- Buscar primeira coluna do board (A Fazer)\n    SELECT id INTO v_coluna_id\n    FROM kanban_colunas\n    WHERE board_id = p_cronograma_id\n    ORDER BY posicao\n    LIMIT 1;\n\n    IF NOT FOUND THEN\n        -- Criar coluna padrão se não existir\n        INSERT INTO kanban_colunas (board_id, titulo, posicao, cor)\n        VALUES (p_cronograma_id, 'A Executar', 1, '#94a3b8')\n        RETURNING id INTO v_coluna_id;\n    END IF;\n\n    -- Processar itens da proposta\n    v_itens := v_proposta.itens;\n\n    IF v_itens IS NOT NULL AND jsonb_array_length(v_itens) > 0 THEN\n        FOR v_item IN SELECT * FROM jsonb_array_elements(v_itens)\n        LOOP\n            -- Criar card para cada item\n            INSERT INTO kanban_cards (\n                coluna_id,\n                titulo,\n                descricao,\n                valor,\n                entity_id,\n                posicao,\n                dados\n            ) VALUES (\n                v_coluna_id,\n                COALESCE(v_item->>'descricao', 'Item da proposta'),\n                'Quantidade: ' || COALESCE(v_item->>'quantidade', '1') ||\n                ' - Valor Unit.: R$ ' || COALESCE(v_item->>'valor_unitario', '0'),\n                COALESCE(\n                    (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,\n                    0\n                ),\n                v_proposta.cliente_id,\n                (v_cards_criados + 1) * 10,\n                jsonb_build_object(\n                    'proposta_id', p_proposta_id,\n                    'proposta_numero', v_proposta.numero,\n                    'item_original', v_item,\n                    'tipo', 'cronograma_tarefa'\n                )\n            );\n\n            v_cards_criados := v_cards_criados + 1;\n        END LOOP;\n    END IF;\n\n    RAISE NOTICE 'Cronograma criado com % tarefas/cards', v_cards_criados;\n    RETURN v_cards_criados;\n\nEND;\n$$","COMMENT ON FUNCTION cronograma_seed_from_proposta IS\n'Cria cards no kanban (cronograma) baseado nos itens de uma proposta. Adaptado para usar kanban_cards em vez de tabela cronograma'","-- =================================================================\n-- TRIGGER: trg_proposta_itens_after_change\n-- Descrição: Recalcular total após mudar itens\n-- =================================================================\n\nDROP TRIGGER IF EXISTS trg_proposta_itens_after_change ON propostas","DROP FUNCTION IF EXISTS trigger_proposta_itens_after_change()","CREATE OR REPLACE FUNCTION trigger_proposta_itens_after_change()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_total numeric := 0;\n    v_item jsonb;\nBEGIN\n    -- Só recalcular se itens mudaram\n    IF OLD.itens IS DISTINCT FROM NEW.itens THEN\n        -- Calcular novo total\n        IF NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN\n            FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)\n            LOOP\n                v_total := v_total + COALESCE(\n                    (v_item->>'quantidade')::numeric * (v_item->>'valor_unitario')::numeric,\n                    0\n                );\n            END LOOP;\n        END IF;\n\n        NEW.valor_total := v_total;\n        RAISE NOTICE 'Total da proposta recalculado: R$ %', v_total;\n    END IF;\n\n    -- Atualizar timestamp\n    NEW.updated_at := NOW();\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER trg_proposta_itens_after_change\n    BEFORE UPDATE ON propostas\n    FOR EACH ROW\n    WHEN (OLD.itens IS DISTINCT FROM NEW.itens)\n    EXECUTE FUNCTION trigger_proposta_itens_after_change()","COMMENT ON TRIGGER trg_proposta_itens_after_change ON propostas IS\n'Recalcula automaticamente o valor total da proposta quando os itens são modificados'","-- =================================================================\n-- TRIGGER: trg_propostas_before_insert\n-- Descrição: Validações e defaults antes de inserir proposta\n-- =================================================================\n\nDROP TRIGGER IF EXISTS trg_propostas_before_insert ON propostas","DROP FUNCTION IF EXISTS trigger_propostas_before_insert()","CREATE OR REPLACE FUNCTION trigger_propostas_before_insert()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_seq_numero integer;\nBEGIN\n    -- Gerar número automático se não informado\n    IF NEW.numero IS NULL OR NEW.numero = '' THEN\n        -- Buscar próximo número sequencial\n        SELECT COALESCE(MAX(\n            CASE\n                WHEN numero ~ '^PROP-[0-9]+$'\n                THEN SUBSTRING(numero FROM 'PROP-([0-9]+)')::integer\n                ELSE 0\n            END\n        ), 0) + 1\n        INTO v_seq_numero\n        FROM propostas;\n\n        NEW.numero := 'PROP-' || LPAD(v_seq_numero::text, 6, '0');\n        RAISE NOTICE 'Número da proposta gerado: %', NEW.numero;\n    END IF;\n\n    -- Status padrão\n    IF NEW.status IS NULL THEN\n        NEW.status := 'pendente';\n    END IF;\n\n    -- Data de emissão padrão\n    IF NEW.data_emissao IS NULL THEN\n        NEW.data_emissao := CURRENT_DATE;\n    END IF;\n\n    -- Data de validade padrão (30 dias)\n    IF NEW.data_validade IS NULL AND NEW.validade_dias IS NOT NULL THEN\n        NEW.data_validade := NEW.data_emissao + (NEW.validade_dias || ' days')::interval;\n    END IF;\n\n    -- Responsável padrão (usuário atual)\n    IF NEW.responsavel_id IS NULL THEN\n        NEW.responsavel_id := auth.uid();\n    END IF;\n\n    -- Inicializar arrays JSONB\n    IF NEW.itens IS NULL THEN\n        NEW.itens := '[]'::jsonb;\n    END IF;\n\n    IF NEW.anexos IS NULL THEN\n        NEW.anexos := '[]'::jsonb;\n    END IF;\n\n    IF NEW.dados IS NULL THEN\n        NEW.dados := '{}'::jsonb;\n    END IF;\n\n    -- Timestamps\n    NEW.created_at := NOW();\n    NEW.updated_at := NOW();\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER trg_propostas_before_insert\n    BEFORE INSERT ON propostas\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_propostas_before_insert()","COMMENT ON TRIGGER trg_propostas_before_insert ON propostas IS\n'Define valores padrão e valida dados antes de inserir uma nova proposta'","-- =================================================================\n-- TRIGGER: trg_propostas_itens_before_change\n-- Descrição: Validações antes de mudar itens\n-- =================================================================\n\nDROP TRIGGER IF EXISTS trg_propostas_itens_before_change ON propostas","DROP FUNCTION IF EXISTS trigger_propostas_itens_before_change()","CREATE OR REPLACE FUNCTION trigger_propostas_itens_before_change()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_item jsonb;\n    v_item_validado jsonb;\n    v_itens_validados jsonb := '[]'::jsonb;\nBEGIN\n    -- Validar estrutura dos itens\n    IF NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN\n        FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)\n        LOOP\n            -- Garantir campos obrigatórios\n            v_item_validado := jsonb_build_object(\n                'descricao', COALESCE(v_item->>'descricao', 'Item sem descrição'),\n                'quantidade', COALESCE((v_item->>'quantidade')::numeric, 1),\n                'valor_unitario', COALESCE((v_item->>'valor_unitario')::numeric, 0),\n                'unidade', COALESCE(v_item->>'unidade', 'UN'),\n                'observacao', v_item->>'observacao'\n            );\n\n            -- Adicionar campos extras se existirem\n            IF v_item ? 'codigo' THEN\n                v_item_validado := v_item_validado || jsonb_build_object('codigo', v_item->>'codigo');\n            END IF;\n\n            IF v_item ? 'categoria' THEN\n                v_item_validado := v_item_validado || jsonb_build_object('categoria', v_item->>'categoria');\n            END IF;\n\n            v_itens_validados := v_itens_validados || v_item_validado;\n        END LOOP;\n\n        NEW.itens := v_itens_validados;\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER trg_propostas_itens_before_change\n    BEFORE INSERT OR UPDATE ON propostas\n    FOR EACH ROW\n    WHEN (NEW.itens IS NOT NULL)\n    EXECUTE FUNCTION trigger_propostas_itens_before_change()","COMMENT ON TRIGGER trg_propostas_itens_before_change ON propostas IS\n'Valida e normaliza a estrutura dos itens da proposta antes de salvar'","-- =================================================================\n-- TRIGGER: calculate_valor_venda\n-- Descrição: Calcular valor de venda com margem\n-- =================================================================\n\nDROP TRIGGER IF EXISTS calculate_valor_venda ON propostas","DROP FUNCTION IF EXISTS trigger_calculate_valor_venda()","CREATE OR REPLACE FUNCTION trigger_calculate_valor_venda()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_margem_padrao numeric := 1.3; -- 30% de margem padrão\n    v_custo_total numeric := 0;\n    v_item jsonb;\nBEGIN\n    -- Se tipo = 'venda' e há itens com custo, calcular preço de venda\n    IF NEW.tipo = 'venda' AND NEW.itens IS NOT NULL AND jsonb_array_length(NEW.itens) > 0 THEN\n        FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.itens)\n        LOOP\n            -- Se tem custo mas não tem valor de venda, calcular\n            IF (v_item ? 'custo') AND NOT (v_item ? 'valor_venda') THEN\n                v_custo_total := v_custo_total + COALESCE(\n                    (v_item->>'quantidade')::numeric * (v_item->>'custo')::numeric,\n                    0\n                );\n            END IF;\n        END LOOP;\n\n        -- Aplicar margem se calculou custo\n        IF v_custo_total > 0 AND NEW.valor_total = 0 THEN\n            NEW.valor_total := ROUND(v_custo_total * v_margem_padrao, 2);\n            NEW.dados := NEW.dados || jsonb_build_object(\n                'custo_total', v_custo_total,\n                'margem_aplicada', v_margem_padrao,\n                'calculo_automatico', true\n            );\n            RAISE NOTICE 'Valor de venda calculado: R$ % (Custo: R$ %, Margem: %)',\n                NEW.valor_total, v_custo_total, ((v_margem_padrao - 1) * 100)::text || '%';\n        END IF;\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER calculate_valor_venda\n    BEFORE INSERT OR UPDATE ON propostas\n    FOR EACH ROW\n    WHEN (NEW.tipo = 'venda')\n    EXECUTE FUNCTION trigger_calculate_valor_venda()","COMMENT ON TRIGGER calculate_valor_venda ON propostas IS\n'Calcula automaticamente o valor de venda aplicando margem sobre o custo dos itens'","-- =================================================================\n-- TRIGGER: cronograma_tarefas_auto_ordem (ADAPTADO)\n-- Descrição: Auto-ordenar tarefas do cronograma (kanban cards)\n-- Nota: Usando kanban_cards como proxy para cronograma_tarefas\n-- =================================================================\n\n-- Este trigger já existe em kanban_cards_autordem_ins/upd\n-- Vamos criar um alias ou função auxiliar\n\nDROP FUNCTION IF EXISTS cronograma_reordenar_tarefas(uuid)","CREATE OR REPLACE FUNCTION cronograma_reordenar_tarefas(\n    p_board_id uuid\n)\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_card RECORD;\n    v_posicao integer;\n    v_coluna_atual uuid;\nBEGIN\n    RAISE NOTICE 'cronograma_reordenar_tarefas - Board: %', p_board_id;\n\n    v_coluna_atual := NULL;\n    v_posicao := 0;\n\n    -- Reordenar cards por coluna e posição\n    FOR v_card IN\n        SELECT kc.id, kc.coluna_id\n        FROM kanban_cards kc\n        INNER JOIN kanban_colunas col ON col.id = kc.coluna_id\n        WHERE col.board_id = p_board_id\n            AND kc.dados->>'tipo' = 'cronograma_tarefa'\n        ORDER BY col.posicao, kc.posicao, kc.created_at\n    LOOP\n        -- Reset contador ao mudar de coluna\n        IF v_coluna_atual IS DISTINCT FROM v_card.coluna_id THEN\n            v_coluna_atual := v_card.coluna_id;\n            v_posicao := 0;\n        END IF;\n\n        v_posicao := v_posicao + 10;\n\n        UPDATE kanban_cards\n        SET posicao = v_posicao\n        WHERE id = v_card.id;\n    END LOOP;\n\n    RAISE NOTICE 'Tarefas do cronograma reordenadas';\n\nEND;\n$$","COMMENT ON FUNCTION cronograma_reordenar_tarefas IS\n'Reordena tarefas do cronograma (cards marcados como tipo cronograma_tarefa no kanban)'","-- =================================================================\n-- FUNÇÃO AUXILIAR: proposta_gerar_titulos\n-- Descrição: Gerar títulos financeiros a partir de proposta aprovada\n-- =================================================================\n\nDROP FUNCTION IF EXISTS proposta_gerar_titulos(uuid, integer)","CREATE OR REPLACE FUNCTION proposta_gerar_titulos(\n    p_proposta_id uuid,\n    p_parcelas integer DEFAULT 1\n)\nRETURNS integer\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_proposta RECORD;\n    v_valor_parcela numeric;\n    v_data_base date;\n    v_titulos_criados integer := 0;\n    i integer;\nBEGIN\n    RAISE NOTICE 'proposta_gerar_titulos - Proposta: %, Parcelas: %', p_proposta_id, p_parcelas;\n\n    -- Buscar proposta\n    SELECT * INTO v_proposta\n    FROM propostas\n    WHERE id = p_proposta_id;\n\n    IF NOT FOUND THEN\n        RAISE EXCEPTION 'Proposta não encontrada: %', p_proposta_id;\n    END IF;\n\n    IF v_proposta.valor_total <= 0 THEN\n        RAISE EXCEPTION 'Proposta sem valor total definido';\n    END IF;\n\n    -- Calcular valor da parcela\n    v_valor_parcela := ROUND(v_proposta.valor_total / p_parcelas, 2);\n    v_data_base := COALESCE(v_proposta.data_emissao, CURRENT_DATE);\n\n    -- Criar títulos\n    FOR i IN 1..p_parcelas LOOP\n        INSERT INTO titulos_financeiros (\n            empresa_id,\n            tipo,\n            descricao,\n            valor,\n            data_emissao,\n            data_vencimento,\n            status,\n            documento,\n            fornecedor_cliente\n        ) VALUES (\n            (SELECT empresa_id FROM entities WHERE id = v_proposta.cliente_id),\n            'Receber',\n            v_proposta.titulo || ' - Parcela ' || i || '/' || p_parcelas,\n            CASE\n                WHEN i = p_parcelas\n                THEN v_proposta.valor_total - (v_valor_parcela * (p_parcelas - 1)) -- Ajustar última parcela\n                ELSE v_valor_parcela\n            END,\n            v_data_base,\n            v_data_base + (30 * i || ' days')::interval,\n            'Previsto',\n            v_proposta.numero,\n            (SELECT nome FROM entities WHERE id = v_proposta.cliente_id)\n        );\n\n        v_titulos_criados := v_titulos_criados + 1;\n    END LOOP;\n\n    -- Atualizar status da proposta\n    UPDATE propostas\n    SET\n        status = 'aprovada',\n        dados = dados || jsonb_build_object(\n            'titulos_gerados', v_titulos_criados,\n            'titulos_gerados_em', NOW(),\n            'parcelas', p_parcelas\n        ),\n        updated_at = NOW()\n    WHERE id = p_proposta_id;\n\n    RAISE NOTICE '% títulos financeiros criados para a proposta %', v_titulos_criados, v_proposta.numero;\n    RETURN v_titulos_criados;\n\nEND;\n$$","COMMENT ON FUNCTION proposta_gerar_titulos IS\n'Gera títulos financeiros (contas a receber) a partir de uma proposta aprovada, com opção de parcelamento'","-- =================================================================\n-- FIM DA MIGRATION 023\n-- =================================================================\n\nDO $$ BEGIN RAISE NOTICE 'Migration 023 - Funções Propostas/Cronograma criadas com sucesso!'; END $$"}	criar_funcoes_propostas_cronograma
024	{"-- =============================================\n-- MIGRATION: 024\n-- Descrição: Helpers e Triggers Diversos (funções auxiliares e triggers de sistema)\n-- Data: 2025-11-03\n-- =============================================\n\n-- =================================================================\n-- FUNÇÃO: current_org\n-- Descrição: Retorna UUID da organização/empresa atual\n-- =================================================================\n\nDROP FUNCTION IF EXISTS current_org()","CREATE OR REPLACE FUNCTION current_org()\nRETURNS uuid\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_empresa_id uuid;\nBEGIN\n    -- Primeiro tenta buscar empresa padrão do usuário atual\n    SELECT empresa_id INTO v_empresa_id\n    FROM profiles\n    WHERE id = auth.uid();\n\n    -- Se não encontrou, busca primeira empresa ativa\n    IF v_empresa_id IS NULL THEN\n        SELECT id INTO v_empresa_id\n        FROM empresas\n        WHERE ativo = true\n        ORDER BY created_at\n        LIMIT 1;\n    END IF;\n\n    -- Se ainda não encontrou, cria empresa padrão\n    IF v_empresa_id IS NULL THEN\n        INSERT INTO empresas (\n            nome,\n            razao_social,\n            cnpj,\n            ativo\n        ) VALUES (\n            'Empresa Padrão',\n            'Empresa Padrão LTDA',\n            '00000000000000',\n            true\n        )\n        RETURNING id INTO v_empresa_id;\n\n        RAISE NOTICE 'Empresa padrão criada: %', v_empresa_id;\n    END IF;\n\n    RETURN v_empresa_id;\n\nEND;\n$$","COMMENT ON FUNCTION current_org IS\n'Retorna o UUID da empresa/organização atual do contexto, criando uma padrão se necessário'","-- =================================================================\n-- FUNÇÃO: get_account_org_id\n-- Descrição: Retorna org_id de uma conta financeira\n-- =================================================================\n\nDROP FUNCTION IF EXISTS get_account_org_id(uuid)","CREATE OR REPLACE FUNCTION get_account_org_id(\n    p_account_id uuid\n)\nRETURNS uuid\nLANGUAGE plpgsql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_org_id uuid;\nBEGIN\n    SELECT empresa_id INTO v_org_id\n    FROM contas_financeiras\n    WHERE id = p_account_id;\n\n    IF NOT FOUND THEN\n        RAISE WARNING 'Conta financeira não encontrada: %', p_account_id;\n        -- Retornar org padrão\n        RETURN current_org();\n    END IF;\n\n    RETURN v_org_id;\nEND;\n$$","COMMENT ON FUNCTION get_account_org_id IS\n'Retorna o ID da empresa/organização de uma conta financeira'","-- =================================================================\n-- FUNÇÃO: get_category_org_id\n-- Descrição: Retorna org_id de uma categoria\n-- =================================================================\n\nDROP FUNCTION IF EXISTS get_category_org_id(uuid)","CREATE OR REPLACE FUNCTION get_category_org_id(\n    p_category_id uuid\n)\nRETURNS uuid\nLANGUAGE plpgsql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_org_id uuid;\nBEGIN\n    SELECT empresa_id INTO v_org_id\n    FROM categorias\n    WHERE id = p_category_id;\n\n    IF NOT FOUND THEN\n        RAISE WARNING 'Categoria não encontrada: %', p_category_id;\n        -- Retornar org padrão\n        RETURN current_org();\n    END IF;\n\n    RETURN v_org_id;\nEND;\n$$","COMMENT ON FUNCTION get_category_org_id IS\n'Retorna o ID da empresa/organização de uma categoria'","-- =================================================================\n-- FUNÇÃO: get_party_org_id\n-- Descrição: Retorna org_id de uma entity/party\n-- =================================================================\n\nDROP FUNCTION IF EXISTS get_party_org_id(uuid)","CREATE OR REPLACE FUNCTION get_party_org_id(\n    p_party_id uuid\n)\nRETURNS uuid\nLANGUAGE plpgsql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_org_id uuid;\nBEGIN\n    SELECT empresa_id INTO v_org_id\n    FROM entities\n    WHERE id = p_party_id;\n\n    IF NOT FOUND THEN\n        RAISE WARNING 'Entity/Party não encontrada: %', p_party_id;\n        -- Retornar org padrão\n        RETURN current_org();\n    END IF;\n\n    RETURN v_org_id;\nEND;\n$$","COMMENT ON FUNCTION get_party_org_id IS\n'Retorna o ID da empresa/organização de uma entidade (cliente, fornecedor, etc)'","-- =================================================================\n-- FUNÇÃO: ensure_pipeline\n-- Descrição: Garantir que pipeline existe\n-- =================================================================\n\nDROP FUNCTION IF EXISTS ensure_pipeline(text, text, text[])","CREATE OR REPLACE FUNCTION ensure_pipeline(\n    p_modulo text,\n    p_nome text,\n    p_stages text[] DEFAULT ARRAY['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento']\n)\nRETURNS uuid\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_pipeline_id uuid;\n    v_stage text;\n    v_posicao integer := 0;\nBEGIN\n    RAISE NOTICE 'ensure_pipeline - Módulo: %, Nome: %', p_modulo, p_nome;\n\n    -- Verificar se pipeline já existe (usando campo nome como identificador único por módulo)\n    SELECT id INTO v_pipeline_id\n    FROM pipelines\n    WHERE nome = p_nome\n        AND dados->>'modulo' = p_modulo\n    LIMIT 1;\n\n    IF NOT FOUND THEN\n        -- Criar novo pipeline\n        INSERT INTO pipelines (\n            nome,\n            estagio,\n            probabilidade,\n            dados\n        ) VALUES (\n            p_nome,\n            p_stages[1], -- Primeiro estágio como padrão\n            20, -- Probabilidade inicial\n            jsonb_build_object(\n                'modulo', p_modulo,\n                'stages', p_stages,\n                'criado_por', 'ensure_pipeline',\n                'criado_em', NOW()\n            )\n        )\n        RETURNING id INTO v_pipeline_id;\n\n        RAISE NOTICE 'Pipeline criado: % (%)', p_nome, v_pipeline_id;\n\n        -- Criar registros para cada estágio\n        FOREACH v_stage IN ARRAY p_stages\n        LOOP\n            v_posicao := v_posicao + 1;\n\n            INSERT INTO pipelines (\n                nome,\n                estagio,\n                probabilidade,\n                dados\n            ) VALUES (\n                p_nome || ' - ' || v_stage,\n                v_stage,\n                CASE v_posicao\n                    WHEN 1 THEN 20  -- Prospecção\n                    WHEN 2 THEN 40  -- Qualificação\n                    WHEN 3 THEN 60  -- Proposta\n                    WHEN 4 THEN 80  -- Negociação\n                    WHEN 5 THEN 100 -- Fechamento\n                    ELSE 50\n                END,\n                jsonb_build_object(\n                    'modulo', p_modulo,\n                    'pipeline_id', v_pipeline_id,\n                    'posicao', v_posicao,\n                    'tipo', 'stage'\n                )\n            );\n        END LOOP;\n\n        RAISE NOTICE 'Estágios criados: %', array_length(p_stages, 1);\n    ELSE\n        RAISE NOTICE 'Pipeline já existe: % (%)', p_nome, v_pipeline_id;\n    END IF;\n\n    RETURN v_pipeline_id;\n\nEND;\n$$","COMMENT ON FUNCTION ensure_pipeline IS\n'Garante que um pipeline existe com os estágios especificados, criando se necessário'","-- =================================================================\n-- FUNÇÃO: ensure_default_pipelines\n-- Descrição: Criar pipelines padrão do sistema\n-- =================================================================\n\nDROP FUNCTION IF EXISTS ensure_default_pipelines()","CREATE OR REPLACE FUNCTION ensure_default_pipelines()\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n    RAISE NOTICE 'ensure_default_pipelines - Criando pipelines padrão';\n\n    -- Pipeline de Vendas\n    PERFORM ensure_pipeline(\n        'vendas',\n        'Pipeline de Vendas',\n        ARRAY['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento', 'Pós-venda']\n    );\n\n    -- Pipeline de Projetos\n    PERFORM ensure_pipeline(\n        'projetos',\n        'Pipeline de Projetos',\n        ARRAY['Planejamento', 'Em Execução', 'Em Revisão', 'Aprovação', 'Concluído']\n    );\n\n    -- Pipeline de Suporte\n    PERFORM ensure_pipeline(\n        'suporte',\n        'Pipeline de Suporte',\n        ARRAY['Novo', 'Em Análise', 'Em Atendimento', 'Aguardando Cliente', 'Resolvido']\n    );\n\n    -- Pipeline de Marketing\n    PERFORM ensure_pipeline(\n        'marketing',\n        'Pipeline de Marketing',\n        ARRAY['Lead', 'MQL', 'SQL', 'Oportunidade', 'Cliente']\n    );\n\n    RAISE NOTICE 'Pipelines padrão criados/verificados';\n\nEND;\n$$","COMMENT ON FUNCTION ensure_default_pipelines IS\n'Cria os pipelines padrão do sistema (vendas, projetos, suporte, marketing)'","-- =================================================================\n-- FUNÇÃO: generate_item_code\n-- Descrição: Gerar código único para itens\n-- =================================================================\n\nDROP FUNCTION IF EXISTS generate_item_code(text)","CREATE OR REPLACE FUNCTION generate_item_code(\n    p_category text DEFAULT 'GERAL'\n)\nRETURNS text\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_prefix text;\n    v_sequence integer;\n    v_code text;\nBEGIN\n    -- Definir prefixo baseado na categoria\n    v_prefix := CASE UPPER(p_category)\n        WHEN 'PRODUTO' THEN 'PRD'\n        WHEN 'SERVICO' THEN 'SRV'\n        WHEN 'MATERIAL' THEN 'MAT'\n        WHEN 'EQUIPAMENTO' THEN 'EQP'\n        WHEN 'SOFTWARE' THEN 'SFW'\n        WHEN 'LICENCA' THEN 'LIC'\n        ELSE 'ITM'\n    END;\n\n    -- Buscar próximo número da sequência\n    -- Como não temos tabela específica de sequências, vamos usar uma estratégia alternativa\n    SELECT COUNT(*) + 1\n    INTO v_sequence\n    FROM (\n        SELECT 1 FROM propostas WHERE dados->>'item_code' LIKE v_prefix || '%'\n        UNION ALL\n        SELECT 1 FROM kanban_cards WHERE dados->>'item_code' LIKE v_prefix || '%'\n    ) t;\n\n    -- Montar código: PREFIX-YYYYMMDD-NNNN\n    v_code := v_prefix || '-' ||\n        TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||\n        LPAD(v_sequence::text, 4, '0');\n\n    RAISE NOTICE 'Código gerado: %', v_code;\n    RETURN v_code;\n\nEND;\n$$","COMMENT ON FUNCTION generate_item_code IS\n'Gera código único para itens baseado na categoria (PRD-20251103-0001)'","-- =================================================================\n-- TRIGGER: trg_entities_normalize\n-- Descrição: Normalizar dados de entities\n-- =================================================================\n\nDROP TRIGGER IF EXISTS trg_entities_normalize ON entities","DROP FUNCTION IF EXISTS trigger_entities_normalize()","CREATE OR REPLACE FUNCTION trigger_entities_normalize()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nBEGIN\n    -- Normalizar nome (trim e capitalizar)\n    IF NEW.nome IS NOT NULL THEN\n        NEW.nome := TRIM(NEW.nome);\n        -- Capitalizar primeira letra de cada palavra\n        NEW.nome := INITCAP(NEW.nome);\n    END IF;\n\n    -- Normalizar email (lowercase)\n    IF NEW.email IS NOT NULL THEN\n        NEW.email := LOWER(TRIM(NEW.email));\n    END IF;\n\n    -- Normalizar telefone (remover caracteres não numéricos)\n    IF NEW.telefone IS NOT NULL THEN\n        NEW.telefone := REGEXP_REPLACE(NEW.telefone, '[^0-9]', '', 'g');\n    END IF;\n\n    -- Normalizar CPF/CNPJ (remover caracteres não numéricos)\n    IF NEW.cpf_cnpj IS NOT NULL THEN\n        NEW.cpf_cnpj := REGEXP_REPLACE(NEW.cpf_cnpj, '[^0-9]', '', 'g');\n    END IF;\n\n    -- ⚠️ COMENTADO: Campos tipo_pessoa e empresa_id não existem na tabela entities\n    -- -- Definir tipo baseado no tamanho do documento\n    -- IF NEW.cpf_cnpj IS NOT NULL AND NEW.tipo_pessoa IS NULL THEN\n    --     IF LENGTH(NEW.cpf_cnpj) = 11 THEN\n    --         NEW.tipo_pessoa := 'fisica';\n    --     ELSIF LENGTH(NEW.cpf_cnpj) = 14 THEN\n    --         NEW.tipo_pessoa := 'juridica';\n    --     END IF;\n    -- END IF;\n\n    -- -- Garantir empresa_id\n    -- IF NEW.empresa_id IS NULL THEN\n    --     NEW.empresa_id := current_org();\n    -- END IF;\n\n    -- Timestamps\n    IF TG_OP = 'INSERT' THEN\n        NEW.created_at := NOW();\n    END IF;\n    NEW.updated_at := NOW();\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER trg_entities_normalize\n    BEFORE INSERT OR UPDATE ON entities\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_entities_normalize()","COMMENT ON TRIGGER trg_entities_normalize ON entities IS\n'Normaliza dados de entities (capitalização, formatação, validações)'","-- =================================================================\n-- TRIGGER: trg_conta_set_empresa_id\n-- Descrição: Setar empresa_id automaticamente\n-- =================================================================\n\nDROP TRIGGER IF EXISTS trg_conta_set_empresa_id ON contas_financeiras","DROP FUNCTION IF EXISTS trigger_conta_set_empresa_id()","CREATE OR REPLACE FUNCTION trigger_conta_set_empresa_id()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nBEGIN\n    -- Se não tem empresa_id, usar empresa padrão\n    IF NEW.empresa_id IS NULL THEN\n        NEW.empresa_id := current_org();\n        RAISE NOTICE 'Empresa definida automaticamente: %', NEW.empresa_id;\n    END IF;\n\n    -- Timestamps\n    IF TG_OP = 'INSERT' THEN\n        NEW.created_at := NOW();\n    END IF;\n    NEW.updated_at := NOW();\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER trg_conta_set_empresa_id\n    BEFORE INSERT ON contas_financeiras\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_conta_set_empresa_id()","COMMENT ON TRIGGER trg_conta_set_empresa_id ON contas_financeiras IS\n'Define automaticamente empresa_id para contas financeiras'","-- =================================================================\n-- TRIGGER: tg_lanc_total\n-- Descrição: Calcular total de lançamento\n-- =================================================================\n\nDROP TRIGGER IF EXISTS tg_lanc_total ON lancamentos_financeiros","DROP FUNCTION IF EXISTS trigger_lanc_total()","CREATE OR REPLACE FUNCTION trigger_lanc_total()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_total numeric;\nBEGIN\n    -- Se tem dados com itens, calcular total\n    IF NEW.dados IS NOT NULL AND NEW.dados ? 'itens' THEN\n        SELECT SUM(\n            COALESCE((item->>'quantidade')::numeric, 1) *\n            COALESCE((item->>'valor_unitario')::numeric, 0)\n        )\n        INTO v_total\n        FROM jsonb_array_elements(NEW.dados->'itens') AS item;\n\n        IF v_total IS NOT NULL AND v_total != NEW.valor THEN\n            NEW.valor := v_total;\n            RAISE NOTICE 'Total recalculado: R$ %', v_total;\n        END IF;\n    END IF;\n\n    -- Garantir empresa_id\n    IF NEW.empresa_id IS NULL THEN\n        NEW.empresa_id := current_org();\n    END IF;\n\n    -- Status padrão\n    IF NEW.status IS NULL THEN\n        NEW.status := 'previsto';\n    END IF;\n\n    -- Tipo padrão baseado no valor\n    IF NEW.tipo IS NULL THEN\n        IF NEW.valor >= 0 THEN\n            NEW.tipo := 'receita';\n        ELSE\n            NEW.tipo := 'despesa';\n            NEW.valor := ABS(NEW.valor); -- Sempre positivo\n        END IF;\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER tg_lanc_total\n    BEFORE INSERT OR UPDATE ON lancamentos_financeiros\n    FOR EACH ROW\n    EXECUTE FUNCTION trigger_lanc_total()","COMMENT ON TRIGGER tg_lanc_total ON lancamentos_financeiros IS\n'Calcula automaticamente o total do lançamento baseado nos itens e define valores padrão'","-- =================================================================\n-- TRIGGER: on_oportunidade_concluida\n-- Descrição: Ações ao concluir oportunidade (pipelines)\n-- =================================================================\n\nDROP TRIGGER IF EXISTS on_oportunidade_concluida ON pipelines","DROP FUNCTION IF EXISTS trigger_on_oportunidade_concluida()","CREATE OR REPLACE FUNCTION trigger_on_oportunidade_concluida()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_titulo_id uuid;\nBEGIN\n    -- Se mudou para estágio final (100% probabilidade) ou status 'ganho'\n    IF NEW.probabilidade = 100 AND OLD.probabilidade < 100 THEN\n        RAISE NOTICE 'Oportunidade concluída: %', NEW.nome;\n\n        -- Criar título a receber se tem valor\n        IF NEW.valor IS NOT NULL AND NEW.valor > 0 THEN\n            INSERT INTO titulos_financeiros (\n                empresa_id,\n                tipo,\n                descricao,\n                valor,\n                data_emissao,\n                data_vencimento,\n                status,\n                fornecedor_cliente\n            ) VALUES (\n                current_org(),\n                'Receber',\n                'Oportunidade Ganha: ' || NEW.nome,\n                NEW.valor,\n                CURRENT_DATE,\n                CURRENT_DATE + INTERVAL '30 days',\n                'Previsto',\n                (SELECT nome FROM entities WHERE id = NEW.entity_id)\n            )\n            RETURNING id INTO v_titulo_id;\n\n            -- Atualizar dados da oportunidade\n            NEW.dados := COALESCE(NEW.dados, '{}'::jsonb) || jsonb_build_object(\n                'status', 'ganho',\n                'data_fechamento', NOW(),\n                'titulo_gerado', v_titulo_id\n            );\n\n            RAISE NOTICE 'Título financeiro criado: %', v_titulo_id;\n        END IF;\n\n        -- Registrar vitória nos dados\n        NEW.dados := COALESCE(NEW.dados, '{}'::jsonb) || jsonb_build_object(\n            'ganho_em', NOW(),\n            'ganho_por', auth.uid()\n        );\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER on_oportunidade_concluida\n    BEFORE UPDATE ON pipelines\n    FOR EACH ROW\n    WHEN (NEW.probabilidade = 100 AND OLD.probabilidade < 100)\n    EXECUTE FUNCTION trigger_on_oportunidade_concluida()","COMMENT ON TRIGGER on_oportunidade_concluida ON pipelines IS\n'Executa ações quando uma oportunidade é marcada como ganha (100% probabilidade)'","-- =================================================================\n-- TRIGGER: propagate_won_opportunity\n-- Descrição: Propagar oportunidade ganha para outros módulos\n-- =================================================================\n\nDROP TRIGGER IF EXISTS propagate_won_opportunity ON pipelines","DROP FUNCTION IF EXISTS trigger_propagate_won_opportunity()","CREATE OR REPLACE FUNCTION trigger_propagate_won_opportunity()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_card_id uuid;\n    v_coluna_concluido uuid;\nBEGIN\n    -- Se oportunidade foi ganha, criar card no kanban de projetos\n    IF NEW.probabilidade = 100 AND OLD.probabilidade < 100 AND NEW.dados->>'modulo' = 'vendas' THEN\n        -- Buscar coluna \\"Concluído\\" ou última coluna do board de projetos\n        SELECT id INTO v_coluna_concluido\n        FROM kanban_colunas\n        WHERE board_id = (\n            SELECT id FROM kanban_boards WHERE ambiente = 'projetos' LIMIT 1\n        )\n        ORDER BY\n            CASE WHEN LOWER(titulo) LIKE '%conclu%' THEN 0 ELSE 1 END,\n            posicao DESC\n        LIMIT 1;\n\n        IF v_coluna_concluido IS NOT NULL THEN\n            -- Criar card no kanban\n            INSERT INTO kanban_cards (\n                coluna_id,\n                titulo,\n                descricao,\n                valor,\n                entity_id,\n                responsavel_id,\n                dados\n            ) VALUES (\n                v_coluna_concluido,\n                'Projeto: ' || NEW.nome,\n                'Projeto originado de oportunidade ganha',\n                NEW.valor,\n                NEW.entity_id,\n                auth.uid(),\n                jsonb_build_object(\n                    'origem', 'oportunidade_ganha',\n                    'oportunidade_id', NEW.id,\n                    'data_origem', NOW()\n                )\n            )\n            RETURNING id INTO v_card_id;\n\n            RAISE NOTICE 'Card de projeto criado: %', v_card_id;\n        END IF;\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER propagate_won_opportunity\n    AFTER UPDATE ON pipelines\n    FOR EACH ROW\n    WHEN (NEW.probabilidade = 100 AND OLD.probabilidade < 100)\n    EXECUTE FUNCTION trigger_propagate_won_opportunity()","COMMENT ON TRIGGER propagate_won_opportunity ON pipelines IS\n'Propaga oportunidades ganhas criando cards em outros módulos (projetos, etc)'","-- =================================================================\n-- TRIGGER: bank_accounts_uni_principal\n-- Descrição: Garantir apenas uma conta principal por empresa\n-- ⚠️ COMENTADO: Tabela contas_financeiras não tem coluna 'dados'\n-- =================================================================\n\n-- DROP TRIGGER IF EXISTS bank_accounts_uni_principal ON contas_financeiras;\n-- DROP FUNCTION IF EXISTS trigger_bank_accounts_uni_principal();\n\n-- CREATE OR REPLACE FUNCTION trigger_bank_accounts_uni_principal()\n-- RETURNS trigger\n-- LANGUAGE plpgsql\n-- AS $$\n-- BEGIN\n--     -- Se está marcando como principal (adicionando campo principal aos dados)\n--     IF NEW.dados->>'principal' = 'true' THEN\n--         -- Desmarcar outras contas da mesma empresa\n--         UPDATE contas_financeiras\n--         SET dados = dados - 'principal'\n--         WHERE empresa_id = NEW.empresa_id\n--             AND id != NEW.id\n--             AND dados->>'principal' = 'true';\n\n--         RAISE NOTICE 'Conta % definida como principal', NEW.apelido;\n--     END IF;\n\n--     RETURN NEW;\n-- END;\n-- $$;\n\n-- CREATE TRIGGER bank_accounts_uni_principal\n--     BEFORE INSERT OR UPDATE ON contas_financeiras\n--     FOR EACH ROW\n--     WHEN (NEW.dados->>'principal' = 'true')\n--     EXECUTE FUNCTION trigger_bank_accounts_uni_principal();\n\n-- COMMENT ON TRIGGER bank_accounts_uni_principal ON contas_financeiras IS\n-- 'Garante que apenas uma conta financeira seja marcada como principal por empresa';\n\n-- ⚠️ NOTA: Adicionar coluna 'dados JSONB' na tabela contas_financeiras se necessário\n\n-- =================================================================\n-- TRIGGER: calc_quantidade_diaria\n-- Descrição: Calcular quantidade diária (para controle de estoque/produção)\n-- =================================================================\n\n-- Esta trigger seria para tabela de estoque/produção que não existe\n-- Vamos criar para lancamentos_financeiros como exemplo\n\nDROP TRIGGER IF EXISTS calc_quantidade_diaria ON lancamentos_financeiros","DROP FUNCTION IF EXISTS trigger_calc_quantidade_diaria()","CREATE OR REPLACE FUNCTION trigger_calc_quantidade_diaria()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    v_dias_uteis integer;\n    v_quantidade_diaria numeric;\nBEGIN\n    -- Se tem data inicial e final, calcular quantidade diária\n    IF NEW.dados ? 'data_inicial' AND NEW.dados ? 'data_final' AND NEW.dados ? 'quantidade_total' THEN\n        -- Calcular dias úteis entre as datas\n        SELECT COUNT(*)\n        INTO v_dias_uteis\n        FROM generate_series(\n            (NEW.dados->>'data_inicial')::date,\n            (NEW.dados->>'data_final')::date,\n            '1 day'::interval\n        ) AS dia\n        WHERE EXTRACT(DOW FROM dia) NOT IN (0, 6); -- Excluir sábado e domingo\n\n        IF v_dias_uteis > 0 THEN\n            v_quantidade_diaria := (NEW.dados->>'quantidade_total')::numeric / v_dias_uteis;\n\n            NEW.dados := NEW.dados || jsonb_build_object(\n                'dias_uteis', v_dias_uteis,\n                'quantidade_diaria', ROUND(v_quantidade_diaria, 2)\n            );\n\n            RAISE NOTICE 'Quantidade diária calculada: % (% dias úteis)',\n                v_quantidade_diaria, v_dias_uteis;\n        END IF;\n    END IF;\n\n    RETURN NEW;\nEND;\n$$","CREATE TRIGGER calc_quantidade_diaria\n    BEFORE INSERT OR UPDATE ON lancamentos_financeiros\n    FOR EACH ROW\n    WHEN (NEW.dados ? 'data_inicial' AND NEW.dados ? 'data_final')\n    EXECUTE FUNCTION trigger_calc_quantidade_diaria()","COMMENT ON TRIGGER calc_quantidade_diaria ON lancamentos_financeiros IS\n'Calcula quantidade diária quando há período definido (usado para rateios e distribuições)'","-- =================================================================\n-- FUNÇÃO AUXILIAR: cleanup_old_data\n-- Descrição: Limpar dados antigos (manutenção)\n-- =================================================================\n\nDROP FUNCTION IF EXISTS cleanup_old_data(integer)","CREATE OR REPLACE FUNCTION cleanup_old_data(\n    p_days_to_keep integer DEFAULT 90\n)\nRETURNS json\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_cutoff_date date;\n    v_deleted_titulos integer := 0;\n    v_deleted_lancamentos integer := 0;\n    v_deleted_cards integer := 0;\nBEGIN\n    v_cutoff_date := CURRENT_DATE - (p_days_to_keep || ' days')::interval;\n    RAISE NOTICE 'cleanup_old_data - Removendo dados anteriores a %', v_cutoff_date;\n\n    -- Limpar títulos cancelados antigos\n    DELETE FROM titulos_financeiros\n    WHERE status = 'Cancelado'\n        AND updated_at < v_cutoff_date;\n    GET DIAGNOSTICS v_deleted_titulos = ROW_COUNT;\n\n    -- Limpar lançamentos cancelados\n    DELETE FROM lancamentos_financeiros\n    WHERE status = 'cancelado'\n        AND updated_at < v_cutoff_date;\n    GET DIAGNOSTICS v_deleted_lancamentos = ROW_COUNT;\n\n    -- Limpar cards arquivados do kanban\n    DELETE FROM kanban_cards\n    WHERE dados->>'arquivado' = 'true'\n        AND updated_at < v_cutoff_date;\n    GET DIAGNOSTICS v_deleted_cards = ROW_COUNT;\n\n    RAISE NOTICE 'Limpeza concluída - Títulos: %, Lançamentos: %, Cards: %',\n        v_deleted_titulos, v_deleted_lancamentos, v_deleted_cards;\n\n    RETURN json_build_object(\n        'cutoff_date', v_cutoff_date,\n        'deleted_titulos', v_deleted_titulos,\n        'deleted_lancamentos', v_deleted_lancamentos,\n        'deleted_cards', v_deleted_cards,\n        'executed_at', NOW()\n    );\n\nEND;\n$$","COMMENT ON FUNCTION cleanup_old_data IS\n'Remove dados antigos cancelados/arquivados para manutenção do banco (usar com cuidado)'","-- =================================================================\n-- FUNÇÃO AUXILIAR: system_health_check\n-- Descrição: Verificar saúde do sistema\n-- =================================================================\n\nDROP FUNCTION IF EXISTS system_health_check()","CREATE OR REPLACE FUNCTION system_health_check()\nRETURNS json\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_result json;\nBEGIN\n    SELECT json_build_object(\n        'timestamp', NOW(),\n        'database_size', pg_size_pretty(pg_database_size(current_database())),\n        'tables', (\n            SELECT json_object_agg(\n                tablename,\n                pg_size_pretty(pg_total_relation_size(quote_ident(tablename)::regclass))\n            )\n            FROM pg_tables\n            WHERE schemaname = 'public'\n            AND tablename IN (\n                'titulos_financeiros',\n                'lancamentos_financeiros',\n                'kanban_cards',\n                'propostas',\n                'entities',\n                'empresas'\n            )\n        ),\n        'counts', json_build_object(\n            'titulos_vencidos', (\n                SELECT COUNT(*)\n                FROM titulos_financeiros\n                WHERE status IN ('Previsto', 'Aprovado')\n                AND data_vencimento < CURRENT_DATE\n            ),\n            'propostas_pendentes', (\n                SELECT COUNT(*)\n                FROM propostas\n                WHERE status = 'pendente'\n            ),\n            'cards_sem_responsavel', (\n                SELECT COUNT(*)\n                FROM kanban_cards\n                WHERE responsavel_id IS NULL\n            )\n        ),\n        'alerts', CASE\n            WHEN EXISTS (\n                SELECT 1\n                FROM titulos_financeiros\n                WHERE status IN ('Previsto', 'Aprovado')\n                AND data_vencimento < CURRENT_DATE - INTERVAL '30 days'\n            ) THEN 'Existem títulos vencidos há mais de 30 dias!'\n            ELSE 'Sistema operando normalmente'\n        END\n    ) INTO v_result;\n\n    RETURN v_result;\n\nEND;\n$$","COMMENT ON FUNCTION system_health_check IS\n'Retorna métricas de saúde do sistema incluindo tamanhos, contadores e alertas'","-- =================================================================\n-- FIM DA MIGRATION 024\n-- =================================================================\n\nDO $$ BEGIN RAISE NOTICE 'Migration 024 - Helpers e Triggers criados com sucesso!'; END $$"}	criar_helpers_triggers
025	{"-- =============================================\n-- MIGRATION: 025\n-- Descrição: Dados de teste (SEED) para desenvolvimento\n-- Data: 2025-11-03\n-- Autor: Claude Code\n-- =============================================\n-- IMPORTANTE: Este seed é apenas para AMBIENTE LOCAL!\n-- NÃO aplicar em PRODUÇÃO!\n-- =============================================\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 1. CRIAR CLIENTES DE TESTE (Entities)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nINSERT INTO entities (nome, tipo, cpf_cnpj, telefone, email, cidade, estado)\nVALUES\n  ('João Silva Construções', 'cliente', '12345678901', '(11) 98765-4321', 'joao@example.com', 'São Paulo', 'SP'),\n  ('Maria Santos Arquitetura', 'cliente', '98765432109', '(11) 97654-3210', 'maria@example.com', 'Rio de Janeiro', 'RJ'),\n  ('Construtora ABC Ltda', 'cliente', '12.345.678/0001-90', '(11) 96543-2109', 'contato@abc.com', 'Belo Horizonte', 'MG')\nON CONFLICT DO NOTHING","-- Não duplicar se já existir\n\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 2. CRIAR OBRAS DE TESTE (Status variados)\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Obras em PLANEJAMENTO (2)\nINSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2025-001', id, 'Reforma Apartamento Centro', 'planejamento', 150000.00, 5\nFROM entities WHERE nome = 'João Silva Construções'\nON CONFLICT (codigo) DO NOTHING","INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2025-002', id, 'Projeto Residencial Jardins', 'planejamento', 320000.00, 10\nFROM entities WHERE nome = 'Maria Santos Arquitetura'\nON CONFLICT (codigo) DO NOTHING","-- Obras EM ANDAMENTO (3)\nINSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2025-003', id, 'Obra Comercial Shopping', 'em_execucao', 850000.00, 45\nFROM entities WHERE nome = 'Construtora ABC Ltda'\nON CONFLICT (codigo) DO NOTHING","INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2025-004', id, 'Reforma Escritório', 'em_execucao', 95000.00, 60\nFROM entities WHERE nome = 'João Silva Construções'\nON CONFLICT (codigo) DO NOTHING","INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2025-005', id, 'Ampliação Galpão Industrial', 'em_execucao', 420000.00, 30\nFROM entities WHERE nome = 'Maria Santos Arquitetura'\nON CONFLICT (codigo) DO NOTHING","-- Obras CONCLUÍDAS (2)\nINSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2024-012', id, 'Casa de Campo Itatiba', 'finalizada', 280000.00, 100\nFROM entities WHERE nome = 'Construtora ABC Ltda'\nON CONFLICT (codigo) DO NOTHING","INSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2024-015', id, 'Restaurante Boulevard', 'finalizada', 160000.00, 100\nFROM entities WHERE nome = 'João Silva Construções'\nON CONFLICT (codigo) DO NOTHING","-- Obras PAUSADAS (1) - Usando 'atrasada' por compatibilidade LIVE\nINSERT INTO obras (codigo, cliente_id, titulo, status, valor_orcado, progresso)\nSELECT 'OBR-2025-006', id, 'Condomínio Residencial (Fase 2)', 'atrasada', 1200000.00, 25\nFROM entities WHERE nome = 'Construtora ABC Ltda'\nON CONFLICT (codigo) DO NOTHING","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 3. VERIFICAÇÃO DOS DADOS CRIADOS\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDO $$\nBEGIN\n    RAISE NOTICE '✅ Dados de teste criados com sucesso!';\n    RAISE NOTICE '';\n    RAISE NOTICE 'Clientes criados:';\n    RAISE NOTICE '  - João Silva Construções';\n    RAISE NOTICE '  - Maria Santos Arquitetura';\n    RAISE NOTICE '  - Construtora ABC Ltda';\n    RAISE NOTICE '';\n    RAISE NOTICE 'Obras criadas por status:';\n    RAISE NOTICE '  - Planejamento: 2 obras';\n    RAISE NOTICE '  - Em Andamento: 3 obras';\n    RAISE NOTICE '  - Concluída: 2 obras';\n    RAISE NOTICE '  - Pausada: 1 obra';\n    RAISE NOTICE '';\n    RAISE NOTICE 'Total: 8 obras (R$ 3.475.000,00)';\nEND $$","-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- 4. QUERIES DE VALIDAÇÃO\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n-- Verificar view de status das obras\n-- SELECT * FROM v_obras_status ORDER BY status;\n\n-- Verificar obras por cliente\n-- SELECT\n--   e.nome,\n--   COUNT(o.id) as total_obras,\n--   SUM(o.valor_orcado) as valor_total\n-- FROM entities e\n-- JOIN obras o ON o.cliente_id = e.id\n-- GROUP BY e.nome\n-- ORDER BY total_obras DESC;\n\n\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n-- FIM DA MIGRATION 025\n-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"}	seed_dados_teste
20251102200927	{"-- =============================================\n-- Migration: Sistema de URL Dinâmica\n-- Descrição: Cria tabela app_config e função get_api_url()\n--            para detectar automaticamente ambiente LOCAL/LIVE\n-- Objetivo: Edge Functions podem buscar URL sem hardcode\n-- Benefício: Deploy sem preocupação com URLs\n-- Criado: 02/11/2025\n-- =============================================\n\n-- =============================================\n-- 1. TABELA DE CONFIGURAÇÃO\n-- =============================================\n\n-- Criar tabela para armazenar configurações do app\nCREATE TABLE IF NOT EXISTS public.app_config (\n    key text PRIMARY KEY,\n    value text NOT NULL,\n    description text,\n    created_at timestamptz DEFAULT now(),\n    updated_at timestamptz DEFAULT now()\n)","-- Comentário\nCOMMENT ON TABLE public.app_config IS\n    'Configurações gerais do aplicativo (ambiente, URLs, features flags, etc)'","-- Trigger para atualizar updated_at automaticamente\nCREATE OR REPLACE FUNCTION public.update_updated_at_column()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nAS $$\nBEGIN\n    NEW.updated_at = now();\n    RETURN NEW;\nEND;\n$$","DROP TRIGGER IF EXISTS update_app_config_updated_at ON public.app_config","CREATE TRIGGER update_app_config_updated_at\n    BEFORE UPDATE ON public.app_config\n    FOR EACH ROW\n    EXECUTE FUNCTION public.update_updated_at_column()","-- Inserir configurações padrão (LOCAL)\n-- IMPORTANTE: Ao fazer deploy em LIVE, rodar UPDATE para mudar valores!\nINSERT INTO public.app_config (key, value, description)\nVALUES\n    ('environment', 'local', 'Ambiente atual: local ou live'),\n    ('api_url', 'http://127.0.0.1:54321', 'URL base da API Supabase'),\n    ('project_id', 'WG', 'Project ID do Supabase'),\n    ('version', '1.0.0', 'Versão do sistema')\nON CONFLICT (key) DO NOTHING","-- Não sobrescrever se já existe\n\n-- =============================================\n-- 2. FUNÇÃO get_api_url()\n-- =============================================\n\n-- Dropar versões antigas se existirem\nDROP FUNCTION IF EXISTS public.get_api_url()","-- Criar função que retorna URL baseada no ambiente\nCREATE OR REPLACE FUNCTION public.get_api_url()\nRETURNS text\nLANGUAGE plpgsql\nSTABLE -- Resultado pode ser cacheado durante a query\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_api_url text;\nBEGIN\n    -- Buscar URL da tabela de configuração\n    SELECT value INTO v_api_url\n    FROM app_config\n    WHERE key = 'api_url';\n\n    -- Se não encontrou, retornar LIVE como fallback\n    IF v_api_url IS NULL THEN\n        v_api_url := 'https://vyxscnevgeubfgfstmtf.supabase.co';\n    END IF;\n\n    RETURN v_api_url;\n\nEXCEPTION\n    WHEN OTHERS THEN\n        -- Em caso de erro, retornar LIVE como fallback seguro\n        RAISE LOG 'Erro em get_api_url: %', SQLERRM;\n        RETURN 'https://vyxscnevgeubfgfstmtf.supabase.co';\nEND;\n$$","COMMENT ON FUNCTION public.get_api_url IS\n    'Retorna URL da API Supabase baseado no ambiente (local ou live). Usada em Edge Functions para deploy sem preocupação.'","-- =============================================\n-- 3. FUNÇÃO get_environment()\n-- =============================================\n\n-- Função auxiliar para checar ambiente\nDROP FUNCTION IF EXISTS public.get_environment()","CREATE OR REPLACE FUNCTION public.get_environment()\nRETURNS text\nLANGUAGE plpgsql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n    v_environment text;\nBEGIN\n    SELECT value INTO v_environment\n    FROM app_config\n    WHERE key = 'environment';\n\n    -- Default: live\n    IF v_environment IS NULL THEN\n        v_environment := 'live';\n    END IF;\n\n    RETURN v_environment;\n\nEXCEPTION\n    WHEN OTHERS THEN\n        RETURN 'live';\nEND;\n$$","COMMENT ON FUNCTION public.get_environment IS\n    'Retorna ambiente atual: local ou live'","-- =============================================\n-- 4. FUNÇÃO is_local_environment()\n-- =============================================\n\n-- Helper booleano para checar se é local\nDROP FUNCTION IF EXISTS public.is_local_environment()","CREATE OR REPLACE FUNCTION public.is_local_environment()\nRETURNS boolean\nLANGUAGE plpgsql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n    RETURN (SELECT get_environment() = 'local');\nEND;\n$$","COMMENT ON FUNCTION public.is_local_environment IS\n    'Retorna true se ambiente é local, false se live'","-- =============================================\n-- 5. PERMISSÕES\n-- =============================================\n\n-- Permitir leitura para usuários autenticados\nGRANT SELECT ON public.app_config TO authenticated","GRANT SELECT ON public.app_config TO anon","-- Funções podem ser chamadas por qualquer usuário\nGRANT EXECUTE ON FUNCTION public.get_api_url() TO authenticated","GRANT EXECUTE ON FUNCTION public.get_api_url() TO anon","GRANT EXECUTE ON FUNCTION public.get_environment() TO authenticated","GRANT EXECUTE ON FUNCTION public.get_environment() TO anon","GRANT EXECUTE ON FUNCTION public.is_local_environment() TO authenticated","GRANT EXECUTE ON FUNCTION public.is_local_environment() TO anon","-- =============================================\n-- 6. TESTES (executar manualmente)\n-- =============================================\n\n-- Testar funções:\n-- SELECT get_api_url();         -- Deve retornar: http://127.0.0.1:54321 (local)\n-- SELECT get_environment();     -- Deve retornar: local\n-- SELECT is_local_environment(); -- Deve retornar: true\n\n-- =============================================\n-- 7. INSTRUÇÕES PARA DEPLOY EM LIVE\n-- =============================================\n\n/*\nQuando fazer deploy em LIVE, execute:\n\nUPDATE app_config\nSET value = 'live'\nWHERE key = 'environment';\n\nUPDATE app_config\nSET value = 'https://vyxscnevgeubfgfstmtf.supabase.co'\nWHERE key = 'api_url';\n\nUPDATE app_config\nSET value = 'vyxscnevgeubfgfstmtf'\nWHERE key = 'project_id';\n\n-- Verificar:\nSELECT get_api_url();         -- Deve retornar: https://vyxscnevgeubfgfstmtf.supabase.co\nSELECT get_environment();     -- Deve retornar: live\nSELECT is_local_environment(); -- Deve retornar: false\n*/\n\n-- =============================================\n-- FIM DA MIGRATION\n-- ============================================="}	criar_sistema_url_dinamica
20251103140000	{"-- =============================================\n-- Migration: Corrigir RLS Policies - Kanban Cards\n-- Arquivo: 20251103140000_corrigir_rls_kanban_cards.sql\n-- Data: 2025-11-03\n-- Autor: Claude Code\n--\n-- Descrição:\n--   Simplifica e corrige políticas RLS da tabela kanban_cards\n--   para permitir que usuários autenticados possam mover cards.\n--\n-- Problema:\n--   UPDATE via supabase.from('kanban_cards').update(...) não persistia.\n--   Card movia visualmente mas voltava ao recarregar página.\n--\n-- Causa:\n--   Políticas RLS conflitantes e faltando WITH CHECK em UPDATE.\n--\n-- Solução:\n--   - Remove políticas antigas conflitantes\n--   - Cria políticas simples e claras\n--   - Garante USING + WITH CHECK em UPDATE\n--   - Mantém DELETE apenas para admins/gestores\n--\n-- Referências:\n--   - https://supabase.com/docs/guides/database/postgres/row-level-security\n--   - https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8\n-- =============================================\n\nBEGIN","-- =============================================\n-- PASSO 1: Remover Políticas Antigas\n-- =============================================\n\nDROP POLICY IF EXISTS \\"Any user can update cards\\" ON kanban_cards","DROP POLICY IF EXISTS \\"Authenticated users can view cards\\" ON kanban_cards","DROP POLICY IF EXISTS \\"Managers can do everything with cards\\" ON kanban_cards","DROP POLICY IF EXISTS \\"Sellers can create cards\\" ON kanban_cards","-- =============================================\n-- PASSO 2: Criar Políticas Simplificadas\n-- =============================================\n\n-- Policy 1: SELECT\n-- Todos usuários autenticados podem visualizar cards\nCREATE POLICY \\"authenticated_users_can_view_cards\\"\nON kanban_cards FOR SELECT\nTO authenticated\nUSING (true)","-- Policy 2: INSERT\n-- Todos usuários autenticados podem criar cards\nCREATE POLICY \\"authenticated_users_can_create_cards\\"\nON kanban_cards FOR INSERT\nTO authenticated\nWITH CHECK (true)","-- Policy 3: UPDATE\n-- Todos usuários autenticados podem atualizar cards\n-- IMPORTANTE: UPDATE requer USING (como SELECT) e WITH CHECK (como INSERT)\nCREATE POLICY \\"authenticated_users_can_update_cards\\"\nON kanban_cards FOR UPDATE\nTO authenticated\nUSING (true)       -- Quais linhas podem ser atualizadas (filtra primeiro)\nWITH CHECK (true)","-- Validação dos novos valores (aplica depois)\n\n-- Policy 4: DELETE\n-- Apenas admins e gestores podem deletar cards\nCREATE POLICY \\"managers_can_delete_cards\\"\nON kanban_cards FOR DELETE\nTO authenticated\nUSING (\n  EXISTS (\n    SELECT 1\n    FROM usuarios_perfis\n    WHERE user_id = auth.uid()\n    AND perfil IN ('admin', 'gestor')\n  )\n)","-- =============================================\n-- PASSO 3: Garantir que RLS está Ativo\n-- =============================================\n\nALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY","-- =============================================\n-- PASSO 4: Adicionar Comentários (Documentação)\n-- =============================================\n\nCOMMENT ON POLICY \\"authenticated_users_can_view_cards\\" ON kanban_cards IS\n  'Permite que qualquer usuário autenticado visualize cards do kanban. Política permissiva para colaboração.'","COMMENT ON POLICY \\"authenticated_users_can_create_cards\\" ON kanban_cards IS\n  'Permite que qualquer usuário autenticado crie novos cards no kanban. Facilita workflow colaborativo.'","COMMENT ON POLICY \\"authenticated_users_can_update_cards\\" ON kanban_cards IS\n  'Permite que qualquer usuário autenticado atualize cards (mover entre colunas, editar campos, etc). Essencial para kanban colaborativo.'","COMMENT ON POLICY \\"managers_can_delete_cards\\" ON kanban_cards IS\n  'Restringe deleção de cards apenas para usuários com perfil admin ou gestor. Protege contra deleções acidentais.'","-- =============================================\n-- PASSO 5: Log de Sucesso\n-- =============================================\n\nDO $$\nBEGIN\n  RAISE NOTICE '✅ RLS Policies para kanban_cards atualizadas com sucesso!';\n  RAISE NOTICE 'Políticas criadas:';\n  RAISE NOTICE '  - SELECT:  authenticated_users_can_view_cards';\n  RAISE NOTICE '  - INSERT:  authenticated_users_can_create_cards';\n  RAISE NOTICE '  - UPDATE:  authenticated_users_can_update_cards';\n  RAISE NOTICE '  - DELETE:  managers_can_delete_cards';\nEND $$",COMMIT,"-- =============================================\n-- VALIDAÇÃO (Executar após aplicar migration)\n-- =============================================\n\n-- Verificar políticas criadas:\n-- SELECT schemaname, tablename, policyname, permissive, roles, cmd\n-- FROM pg_policies\n-- WHERE tablename = 'kanban_cards'\n-- ORDER BY cmd, policyname;\n\n-- Testar UPDATE (substitua <card_id> por ID real):\n-- BEGIN;\n--   UPDATE kanban_cards SET posicao = 999 WHERE id = '<card_id>';\n--   SELECT id, titulo, posicao FROM kanban_cards WHERE id = '<card_id>';\n-- ROLLBACK;"}	corrigir_rls_kanban_cards
20251103230000	{"-- =============================================\n-- Migration: Remover Triggers Problemáticos do Kanban\n-- Arquivo: 20251103230000_remover_triggers_kanban_autordem.sql\n-- Data: 2025-11-03\n-- Autor: Claude Code\n--\n-- Descrição:\n--   Remove triggers de auto-ordenação que causavam loop infinito\n--   recursivo no banco de dados (stack overflow).\n--\n-- Problema:\n--   Triggers kanban_cards_autordem_ins e kanban_cards_autordem_upd\n--   causavam \\"stack depth limit exceeded\\" ao tentar reordenar cards.\n--\n-- Causa:\n--   Os triggers atualizavam outros cards, o que disparava os triggers\n--   novamente, criando um loop infinito recursivo.\n--\n-- Solução:\n--   Remover os triggers problemáticos. A ordenação será gerenciada\n--   pelo frontend usando múltiplos de 10 para as posições.\n--\n-- Referências:\n--   - Migration original: 022_criar_triggers_kanban_autordem.sql\n--   - Documentação: KANBAN_FIX_DRAG_DROP.md\n-- =============================================\n\nBEGIN","-- =============================================\n-- PASSO 1: Remover Triggers de Auto-Ordenação\n-- =============================================\n\n-- Trigger de INSERT (também problemático)\nDROP TRIGGER IF EXISTS kanban_cards_autordem_ins ON kanban_cards","-- Trigger de UPDATE (causa loop infinito)\nDROP TRIGGER IF EXISTS kanban_cards_autordem_upd ON kanban_cards","-- =============================================\n-- PASSO 2: Remover Funções dos Triggers\n-- =============================================\n\n-- Função do trigger de INSERT\nDROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_ins()","-- Função do trigger de UPDATE\nDROP FUNCTION IF EXISTS trigger_kanban_cards_autordem_upd()","-- =============================================\n-- PASSO 3: Validar Remoção\n-- =============================================\n\nDO $$\nDECLARE\n    v_trigger_count INT;\nBEGIN\n    -- Contar triggers restantes na tabela kanban_cards\n    SELECT COUNT(*) INTO v_trigger_count\n    FROM pg_trigger\n    WHERE tgrelid = 'kanban_cards'::regclass\n    AND tgname LIKE '%autordem%';\n\n    IF v_trigger_count > 0 THEN\n        RAISE EXCEPTION 'Ainda existem % triggers de autordem na tabela kanban_cards', v_trigger_count;\n    END IF;\n\n    RAISE NOTICE '✅ Triggers de auto-ordenação removidos com sucesso!';\n    RAISE NOTICE 'A ordenação será gerenciada pelo frontend.';\n    RAISE NOTICE 'Posições devem ser múltiplos de 10 (10, 20, 30...).';\nEND $$",COMMIT,"-- =============================================\n-- OBSERVAÇÕES IMPORTANTES\n-- =============================================\n\n-- 1. FRONTEND RESPONSÁVEL PELA ORDENAÇÃO:\n--    O código React em Oportunidades.jsx já está preparado para\n--    gerenciar a ordenação usando múltiplos de 10.\n--\n-- 2. FORMATO DAS POSIÇÕES:\n--    - Index 0 → Posição 10\n--    - Index 1 → Posição 20\n--    - Index 2 → Posição 30\n--    Formula: (index + 1) * 10\n--\n-- 3. POR QUE MÚLTIPLOS DE 10?:\n--    Permite inserir cards entre outros sem reordenar tudo.\n--    Exemplo: Card entre posição 10 e 20 pode ser posição 15.\n--\n-- 4. TRIGGERS RESTANTES (OK):\n--    - kanban_cards_updated_at: Atualiza campo updated_at (seguro)\n--    - RI_ConstraintTrigger_*: Triggers de foreign keys (seguro)\n--\n-- 5. RLS POLICIES:\n--    As políticas RLS criadas pela migration anterior\n--    (20251103140000_corrigir_rls_kanban_cards.sql) continuam ativas\n--    e funcionando corretamente.\n\n-- =============================================\n-- VALIDAÇÃO PÓS-MIGRATION (executar manualmente)\n-- =============================================\n\n-- Listar triggers restantes (deve mostrar apenas updated_at e RI_Constraint):\n-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'kanban_cards'::regclass;\n\n-- Testar UPDATE manual:\n-- BEGIN;\n--   UPDATE kanban_cards SET posicao = 999 WHERE id = '<algum-id>';\n--   SELECT id, titulo, posicao FROM kanban_cards WHERE id = '<algum-id>';\n-- ROLLBACK;"}	remover_triggers_kanban_autordem
20251104030038	{"-- =============================================\n-- Migration: Criar boards de projetos e dados de teste\n-- Descrição: Adiciona boards de arquitetura, engenharia e marcenaria com colunas e dados de teste\n-- Data: 2025-11-03\n-- =============================================\n\nBEGIN","-- ========================================\n-- 1. CRIAR BOARDS FALTANTES\n-- ========================================\n\n-- Board Arquitetura\nINSERT INTO kanban_boards (id, titulo, ambiente, descricao)\nVALUES (\n  gen_random_uuid(),\n  'Projetos de Arquitetura',\n  'arquitetura',\n  'Gestão de projetos arquitetônicos'\n) ON CONFLICT (ambiente) DO NOTHING","-- Board Engenharia\nINSERT INTO kanban_boards (id, titulo, ambiente, descricao)\nVALUES (\n  gen_random_uuid(),\n  'Projetos de Engenharia',\n  'engenharia',\n  'Gestão de projetos de engenharia'\n) ON CONFLICT (ambiente) DO NOTHING","-- Board Marcenaria\nINSERT INTO kanban_boards (id, titulo, ambiente, descricao)\nVALUES (\n  gen_random_uuid(),\n  'Projetos de Marcenaria',\n  'marcenaria',\n  'Gestão de projetos de marcenaria'\n) ON CONFLICT (ambiente) DO NOTHING","-- ========================================\n-- 2. CRIAR COLUNAS PADRÃO PARA CADA BOARD\n-- ========================================\n\n-- Colunas para Arquitetura\nDO $$\nDECLARE\n  v_board_id uuid;\nBEGIN\n  SELECT id INTO v_board_id FROM kanban_boards WHERE ambiente = 'arquitetura';\n\n  -- Briefing\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Briefing', 0, '#3B82F6');\n\n  -- Conceitual\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Conceitual', 1, '#8B5CF6');\n\n  -- Executivo\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Executivo', 2, '#F59E0B');\n\n  -- Aprovação\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Aprovação', 3, '#10B981');\n\n  -- Concluído\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Concluído', 4, '#6B7280');\nEND $$","-- Colunas para Engenharia\nDO $$\nDECLARE\n  v_board_id uuid;\nBEGIN\n  SELECT id INTO v_board_id FROM kanban_boards WHERE ambiente = 'engenharia';\n\n  -- Planejamento\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Planejamento', 0, '#3B82F6');\n\n  -- Em Execução\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Em Execução', 1, '#F59E0B');\n\n  -- Vistoria\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Vistoria', 2, '#8B5CF6');\n\n  -- Concluída\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Concluída', 3, '#10B981');\nEND $$","-- Colunas para Marcenaria\nDO $$\nDECLARE\n  v_board_id uuid;\nBEGIN\n  SELECT id INTO v_board_id FROM kanban_boards WHERE ambiente = 'marcenaria';\n\n  -- Projeto\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Projeto', 0, '#3B82F6');\n\n  -- Produção\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Produção', 1, '#F59E0B');\n\n  -- Acabamento\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Acabamento', 2, '#8B5CF6');\n\n  -- Instalação\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Instalação', 3, '#10B981');\n\n  -- Finalizado\n  INSERT INTO kanban_colunas (id, board_id, titulo, posicao, cor)\n  VALUES (gen_random_uuid(), v_board_id, 'Finalizado', 4, '#6B7280');\nEND $$","-- ========================================\n-- 3. CRIAR ENTIDADES (CLIENTES) DE TESTE\n-- ========================================\n\n-- Cliente Arquitetura\nINSERT INTO entities (id, tipo, nome, email, telefone)\nVALUES (\n  gen_random_uuid(),\n  'cliente',\n  'João Silva Arquitetura',\n  'joao@email.com',\n  '(11) 98765-4321'\n)","-- Cliente Engenharia\nINSERT INTO entities (id, tipo, nome, email, telefone)\nVALUES (\n  gen_random_uuid(),\n  'cliente',\n  'Maria Santos Construtora',\n  'maria@email.com',\n  '(11) 97654-3210'\n)","-- Cliente Marcenaria\nINSERT INTO entities (id, tipo, nome, email, telefone)\nVALUES (\n  gen_random_uuid(),\n  'cliente',\n  'Pedro Oliveira Móveis',\n  'pedro@email.com',\n  '(11) 96543-2109'\n)","-- ========================================\n-- 4. CRIAR CONTRATOS DE TESTE\n-- ========================================\n\n-- Contrato Arquitetura\nDO $$\nDECLARE\n  v_entity_id uuid;\n  v_contrato_id uuid;\nBEGIN\n  SELECT id INTO v_entity_id FROM entities WHERE nome = 'João Silva Arquitetura';\n  v_contrato_id := gen_random_uuid();\n\n  INSERT INTO contratos (\n    id, numero, cliente_id, titulo, descricao, valor_total,\n    data_inicio, status, tipo, created_at\n  ) VALUES (\n    v_contrato_id,\n    'ARQ-2025-001',\n    v_entity_id,\n    'Projeto Residencial Alto Padrão',\n    'Projeto arquitetônico completo para residência de 350m²',\n    85000.00,\n    CURRENT_DATE,\n    'ativo',\n    'arquitetura',\n    NOW()\n  );\nEND $$","-- Contrato Engenharia\nDO $$\nDECLARE\n  v_entity_id uuid;\n  v_contrato_id uuid;\nBEGIN\n  SELECT id INTO v_entity_id FROM entities WHERE nome = 'Maria Santos Construtora';\n  v_contrato_id := gen_random_uuid();\n\n  INSERT INTO contratos (\n    id, numero, cliente_id, titulo, descricao, valor_total,\n    data_inicio, status, tipo, created_at\n  ) VALUES (\n    v_contrato_id,\n    'ENG-2025-001',\n    v_entity_id,\n    'Projeto Estrutural Edifício Comercial',\n    'Cálculo estrutural e acompanhamento de obra',\n    125000.00,\n    CURRENT_DATE,\n    'ativo',\n    'engenharia',\n    NOW()\n  );\nEND $$","-- Contrato Marcenaria\nDO $$\nDECLARE\n  v_entity_id uuid;\n  v_contrato_id uuid;\nBEGIN\n  SELECT id INTO v_entity_id FROM entities WHERE nome = 'Pedro Oliveira Móveis';\n  v_contrato_id := gen_random_uuid();\n\n  INSERT INTO contratos (\n    id, numero, cliente_id, titulo, descricao, valor_total,\n    data_inicio, status, tipo, created_at\n  ) VALUES (\n    v_contrato_id,\n    'MAR-2025-001',\n    v_entity_id,\n    'Móveis Planejados Sala e Cozinha',\n    'Produção e instalação de móveis planejados',\n    45000.00,\n    CURRENT_DATE,\n    'ativo',\n    'marcenaria',\n    NOW()\n  );\nEND $$","-- ========================================\n-- 5. CRIAR CARDS KANBAN VINCULADOS\n-- ========================================\n\n-- Card Arquitetura (Conceitual)\nDO $$\nDECLARE\n  v_coluna_id uuid;\n  v_contrato_id uuid;\nBEGIN\n  SELECT kc.id INTO v_coluna_id\n  FROM kanban_colunas kc\n  JOIN kanban_boards kb ON kb.id = kc.board_id\n  WHERE kb.ambiente = 'arquitetura' AND kc.titulo = 'Conceitual';\n\n  SELECT id INTO v_contrato_id FROM contratos WHERE numero = 'ARQ-2025-001';\n\n  INSERT INTO kanban_cards (\n    id, coluna_id, titulo, descricao, valor, posicao,\n    entity_id, dados\n  ) VALUES (\n    gen_random_uuid(),\n    v_coluna_id,\n    'Projeto Residencial Alto Padrão',\n    'Cliente: João Silva - Fase de estudo conceitual',\n    85000.00,\n    0,\n    (SELECT cliente_id FROM contratos WHERE id = v_contrato_id),\n    jsonb_build_object('contrato_id', v_contrato_id, 'tipo', 'arquitetura')\n  );\nEND $$","-- Card Engenharia (Em Execução)\nDO $$\nDECLARE\n  v_coluna_id uuid;\n  v_contrato_id uuid;\nBEGIN\n  SELECT kc.id INTO v_coluna_id\n  FROM kanban_colunas kc\n  JOIN kanban_boards kb ON kb.id = kc.board_id\n  WHERE kb.ambiente = 'engenharia' AND kc.titulo = 'Em Execução';\n\n  SELECT id INTO v_contrato_id FROM contratos WHERE numero = 'ENG-2025-001';\n\n  INSERT INTO kanban_cards (\n    id, coluna_id, titulo, descricao, valor, posicao,\n    entity_id, dados\n  ) VALUES (\n    gen_random_uuid(),\n    v_coluna_id,\n    'Projeto Estrutural Edifício Comercial',\n    'Cliente: Maria Santos - Obra em execução',\n    125000.00,\n    0,\n    (SELECT cliente_id FROM contratos WHERE id = v_contrato_id),\n    jsonb_build_object('contrato_id', v_contrato_id, 'tipo', 'engenharia')\n  );\nEND $$","-- Card Marcenaria (Produção)\nDO $$\nDECLARE\n  v_coluna_id uuid;\n  v_contrato_id uuid;\nBEGIN\n  SELECT kc.id INTO v_coluna_id\n  FROM kanban_colunas kc\n  JOIN kanban_boards kb ON kb.id = kc.board_id\n  WHERE kb.ambiente = 'marcenaria' AND kc.titulo = 'Produção';\n\n  SELECT id INTO v_contrato_id FROM contratos WHERE numero = 'MAR-2025-001';\n\n  INSERT INTO kanban_cards (\n    id, coluna_id, titulo, descricao, valor, posicao,\n    entity_id, dados\n  ) VALUES (\n    gen_random_uuid(),\n    v_coluna_id,\n    'Móveis Planejados Sala e Cozinha',\n    'Cliente: Pedro Oliveira - Em produção na marcenaria',\n    45000.00,\n    0,\n    (SELECT cliente_id FROM contratos WHERE id = v_contrato_id),\n    jsonb_build_object('contrato_id', v_contrato_id, 'tipo', 'marcenaria')\n  );\nEND $$","-- ========================================\n-- COMMIT\n-- ========================================\n\nCOMMIT","-- Comentário\nCOMMENT ON TABLE kanban_boards IS 'Boards do sistema Kanban incluindo arquitetura, engenharia e marcenaria'"}	criar_boards_projetos_dados_teste
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: app_config app_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_config
    ADD CONSTRAINT app_config_pkey PRIMARY KEY (key);


--
-- Name: assistencias assistencias_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistencias
    ADD CONSTRAINT assistencias_codigo_key UNIQUE (codigo);


--
-- Name: assistencias assistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistencias
    ADD CONSTRAINT assistencias_pkey PRIMARY KEY (id);


--
-- Name: centros_custo centros_custo_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centros_custo
    ADD CONSTRAINT centros_custo_codigo_key UNIQUE (codigo);


--
-- Name: centros_custo centros_custo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centros_custo
    ADD CONSTRAINT centros_custo_pkey PRIMARY KEY (id);


--
-- Name: contas_financeiras contas_financeiras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras
    ADD CONSTRAINT contas_financeiras_pkey PRIMARY KEY (id);


--
-- Name: contratos contratos_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_numero_key UNIQUE (numero);


--
-- Name: contratos contratos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_pkey PRIMARY KEY (id);


--
-- Name: empresas empresas_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_cnpj_key UNIQUE (cnpj);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);


--
-- Name: entities entities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);


--
-- Name: kanban_boards kanban_boards_ambiente_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_boards
    ADD CONSTRAINT kanban_boards_ambiente_key UNIQUE (ambiente);


--
-- Name: kanban_boards kanban_boards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_boards
    ADD CONSTRAINT kanban_boards_pkey PRIMARY KEY (id);


--
-- Name: kanban_cards kanban_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_cards
    ADD CONSTRAINT kanban_cards_pkey PRIMARY KEY (id);


--
-- Name: kanban_colunas kanban_colunas_board_id_posicao_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_colunas
    ADD CONSTRAINT kanban_colunas_board_id_posicao_key UNIQUE (board_id, posicao);


--
-- Name: kanban_colunas kanban_colunas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_colunas
    ADD CONSTRAINT kanban_colunas_pkey PRIMARY KEY (id);


--
-- Name: lancamentos_financeiros lancamentos_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_pkey PRIMARY KEY (id);


--
-- Name: lancamentos lancamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos
    ADD CONSTRAINT lancamentos_pkey PRIMARY KEY (id);


--
-- Name: obras obras_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_codigo_key UNIQUE (codigo);


--
-- Name: obras obras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_pkey PRIMARY KEY (id);


--
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- Name: plano_contas plano_contas_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plano_contas
    ADD CONSTRAINT plano_contas_codigo_key UNIQUE (codigo);


--
-- Name: plano_contas plano_contas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plano_contas
    ADD CONSTRAINT plano_contas_pkey PRIMARY KEY (id);


--
-- Name: produtos_servicos produtos_servicos_codigo_interno_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produtos_servicos
    ADD CONSTRAINT produtos_servicos_codigo_interno_key UNIQUE (codigo_interno);


--
-- Name: produtos_servicos produtos_servicos_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produtos_servicos
    ADD CONSTRAINT produtos_servicos_nome_key UNIQUE (nome);


--
-- Name: produtos_servicos produtos_servicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produtos_servicos
    ADD CONSTRAINT produtos_servicos_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: propostas propostas_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_numero_key UNIQUE (numero);


--
-- Name: propostas propostas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_pkey PRIMARY KEY (id);


--
-- Name: registro_categorias registro_categorias_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_categorias
    ADD CONSTRAINT registro_categorias_nome_key UNIQUE (nome);


--
-- Name: registro_categorias registro_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_categorias
    ADD CONSTRAINT registro_categorias_pkey PRIMARY KEY (id);


--
-- Name: registros_trabalho registros_trabalho_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_pkey PRIMARY KEY (id);


--
-- Name: titulos_financeiros titulos_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.titulos_financeiros
    ADD CONSTRAINT titulos_financeiros_pkey PRIMARY KEY (id);


--
-- Name: usuarios_perfis usuarios_perfis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_perfis
    ADD CONSTRAINT usuarios_perfis_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_03 messages_2025_11_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_03
    ADD CONSTRAINT messages_2025_11_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_04 messages_2025_11_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_04
    ADD CONSTRAINT messages_2025_11_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_05 messages_2025_11_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_05
    ADD CONSTRAINT messages_2025_11_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_06 messages_2025_11_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_06
    ADD CONSTRAINT messages_2025_11_06_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_07 messages_2025_11_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_07
    ADD CONSTRAINT messages_2025_11_07_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_assistencias_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assistencias_cliente ON public.assistencias USING btree (cliente_id);


--
-- Name: idx_assistencias_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assistencias_codigo ON public.assistencias USING btree (codigo);


--
-- Name: idx_assistencias_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assistencias_data ON public.assistencias USING btree (data_solicitacao);


--
-- Name: idx_assistencias_responsavel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assistencias_responsavel ON public.assistencias USING btree (responsavel_id);


--
-- Name: idx_assistencias_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assistencias_status ON public.assistencias USING btree (status);


--
-- Name: idx_centros_custo_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_centros_custo_ativo ON public.centros_custo USING btree (ativo);


--
-- Name: idx_centros_custo_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_centros_custo_empresa ON public.centros_custo USING btree (empresa_id);


--
-- Name: idx_contas_financeiras_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contas_financeiras_empresa ON public.contas_financeiras USING btree (empresa_id);


--
-- Name: idx_contratos_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_cliente ON public.contratos USING btree (cliente_id);


--
-- Name: idx_contratos_dados; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_dados ON public.contratos USING gin (dados);


--
-- Name: idx_contratos_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_numero ON public.contratos USING btree (numero);


--
-- Name: idx_contratos_proposta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_proposta ON public.contratos USING btree (proposta_id);


--
-- Name: idx_contratos_responsavel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_responsavel ON public.contratos USING btree (responsavel_id);


--
-- Name: idx_contratos_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_status ON public.contratos USING btree (status);


--
-- Name: idx_empresas_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_empresas_ativo ON public.empresas USING btree (ativo);


--
-- Name: idx_empresas_cnpj; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_empresas_cnpj ON public.empresas USING btree (cnpj);


--
-- Name: idx_entities_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entities_ativo ON public.entities USING btree (ativo);


--
-- Name: idx_entities_cpf_cnpj; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entities_cpf_cnpj ON public.entities USING btree (cpf_cnpj);


--
-- Name: idx_entities_dados; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entities_dados ON public.entities USING gin (dados);


--
-- Name: idx_entities_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entities_email ON public.entities USING btree (email);


--
-- Name: idx_entities_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entities_tipo ON public.entities USING btree (tipo);


--
-- Name: idx_kanban_boards_ambiente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kanban_boards_ambiente ON public.kanban_boards USING btree (ambiente);


--
-- Name: idx_kanban_cards_coluna; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kanban_cards_coluna ON public.kanban_cards USING btree (coluna_id);


--
-- Name: idx_kanban_cards_dados; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kanban_cards_dados ON public.kanban_cards USING gin (dados);


--
-- Name: idx_kanban_cards_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kanban_cards_entity ON public.kanban_cards USING btree (entity_id);


--
-- Name: idx_kanban_cards_responsavel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kanban_cards_responsavel ON public.kanban_cards USING btree (responsavel_id);


--
-- Name: idx_kanban_colunas_board; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kanban_colunas_board ON public.kanban_colunas USING btree (board_id);


--
-- Name: idx_kanban_colunas_posicao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kanban_colunas_posicao ON public.kanban_colunas USING btree (posicao);


--
-- Name: idx_lancamentos_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_data ON public.lancamentos USING btree (data);


--
-- Name: idx_lancamentos_financeiros_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_categoria ON public.lancamentos_financeiros USING btree (categoria);


--
-- Name: idx_lancamentos_financeiros_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_cliente ON public.lancamentos_financeiros USING btree (cliente_id);


--
-- Name: idx_lancamentos_financeiros_contrato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_contrato ON public.lancamentos_financeiros USING btree (contrato_id);


--
-- Name: idx_lancamentos_financeiros_emissao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_emissao ON public.lancamentos_financeiros USING btree (data_emissao);


--
-- Name: idx_lancamentos_financeiros_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_empresa ON public.lancamentos_financeiros USING btree (empresa_id);


--
-- Name: idx_lancamentos_financeiros_obra; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_obra ON public.lancamentos_financeiros USING btree (obra_id);


--
-- Name: idx_lancamentos_financeiros_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_status ON public.lancamentos_financeiros USING btree (status);


--
-- Name: idx_lancamentos_financeiros_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_tipo ON public.lancamentos_financeiros USING btree (tipo);


--
-- Name: idx_lancamentos_financeiros_vencimento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_financeiros_vencimento ON public.lancamentos_financeiros USING btree (data_vencimento);


--
-- Name: idx_lancamentos_titulo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lancamentos_titulo ON public.lancamentos USING btree (titulo_id);


--
-- Name: idx_obras_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_obras_cliente ON public.obras USING btree (cliente_id);


--
-- Name: idx_obras_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_obras_codigo ON public.obras USING btree (codigo);


--
-- Name: idx_obras_contrato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_obras_contrato ON public.obras USING btree (contrato_id);


--
-- Name: idx_obras_dados; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_obras_dados ON public.obras USING gin (dados);


--
-- Name: idx_obras_responsavel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_obras_responsavel ON public.obras USING btree (responsavel_id);


--
-- Name: idx_obras_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_obras_status ON public.obras USING btree (status);


--
-- Name: idx_pipelines_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipelines_entity ON public.pipelines USING btree (entity_id);


--
-- Name: idx_pipelines_estagio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipelines_estagio ON public.pipelines USING btree (estagio);


--
-- Name: idx_plano_contas_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plano_contas_ativo ON public.plano_contas USING btree (ativo);


--
-- Name: idx_plano_contas_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plano_contas_empresa ON public.plano_contas USING btree (empresa_id);


--
-- Name: idx_plano_contas_grupo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plano_contas_grupo ON public.plano_contas USING btree (grupo);


--
-- Name: idx_produtos_servicos_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_produtos_servicos_ativo ON public.produtos_servicos USING btree (ativo);


--
-- Name: idx_produtos_servicos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_produtos_servicos_categoria ON public.produtos_servicos USING btree (categoria);


--
-- Name: idx_produtos_servicos_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_produtos_servicos_codigo ON public.produtos_servicos USING btree (codigo_interno);


--
-- Name: idx_produtos_servicos_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_produtos_servicos_nome ON public.produtos_servicos USING btree (nome);


--
-- Name: idx_produtos_servicos_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_produtos_servicos_tipo ON public.produtos_servicos USING btree (tipo);


--
-- Name: idx_profiles_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_ativo ON public.profiles USING btree (ativo);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_propostas_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_propostas_cliente ON public.propostas USING btree (cliente_id);


--
-- Name: idx_propostas_dados; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_propostas_dados ON public.propostas USING gin (dados);


--
-- Name: idx_propostas_data_emissao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_propostas_data_emissao ON public.propostas USING btree (data_emissao);


--
-- Name: idx_propostas_itens; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_propostas_itens ON public.propostas USING gin (itens);


--
-- Name: idx_propostas_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_propostas_numero ON public.propostas USING btree (numero);


--
-- Name: idx_propostas_responsavel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_propostas_responsavel ON public.propostas USING btree (responsavel_id);


--
-- Name: idx_propostas_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_propostas_status ON public.propostas USING btree (status);


--
-- Name: idx_registro_categorias_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registro_categorias_ativo ON public.registro_categorias USING btree (ativo);


--
-- Name: idx_registro_categorias_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registro_categorias_nome ON public.registro_categorias USING btree (nome);


--
-- Name: idx_registros_trabalho_aprovado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_aprovado ON public.registros_trabalho USING btree (aprovado);


--
-- Name: idx_registros_trabalho_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_categoria ON public.registros_trabalho USING btree (categoria_id);


--
-- Name: idx_registros_trabalho_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_cliente ON public.registros_trabalho USING btree (cliente_id);


--
-- Name: idx_registros_trabalho_contrato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_contrato ON public.registros_trabalho USING btree (contrato_id);


--
-- Name: idx_registros_trabalho_dados; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_dados ON public.registros_trabalho USING gin (dados);


--
-- Name: idx_registros_trabalho_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_data ON public.registros_trabalho USING btree (data);


--
-- Name: idx_registros_trabalho_lancamento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_lancamento ON public.registros_trabalho USING btree (lancamento_id);


--
-- Name: idx_registros_trabalho_obra; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_obra ON public.registros_trabalho USING btree (obra_id);


--
-- Name: idx_registros_trabalho_profissional; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_profissional ON public.registros_trabalho USING btree (profissional_id);


--
-- Name: idx_registros_trabalho_proposta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_trabalho_proposta ON public.registros_trabalho USING btree (proposta_id);


--
-- Name: idx_titulos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_titulos_categoria ON public.titulos_financeiros USING btree (categoria_id);


--
-- Name: idx_titulos_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_titulos_empresa ON public.titulos_financeiros USING btree (empresa_id);


--
-- Name: idx_titulos_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_titulos_status ON public.titulos_financeiros USING btree (status);


--
-- Name: idx_titulos_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_titulos_tipo ON public.titulos_financeiros USING btree (tipo);


--
-- Name: idx_titulos_vencimento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_titulos_vencimento ON public.titulos_financeiros USING btree (data_vencimento);


--
-- Name: idx_usuarios_perfis_perfil; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_perfis_perfil ON public.usuarios_perfis USING btree (perfil);


--
-- Name: idx_usuarios_perfis_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_perfis_user ON public.usuarios_perfis USING btree (user_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_03_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_03_inserted_at_topic_idx ON realtime.messages_2025_11_03 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_04_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_04_inserted_at_topic_idx ON realtime.messages_2025_11_04 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_05_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_05_inserted_at_topic_idx ON realtime.messages_2025_11_05 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_06_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_06_inserted_at_topic_idx ON realtime.messages_2025_11_06 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_07_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_07_inserted_at_topic_idx ON realtime.messages_2025_11_07 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (bucket_id, name);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_11_03_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_03_inserted_at_topic_idx;


--
-- Name: messages_2025_11_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_03_pkey;


--
-- Name: messages_2025_11_04_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_04_inserted_at_topic_idx;


--
-- Name: messages_2025_11_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_04_pkey;


--
-- Name: messages_2025_11_05_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_05_inserted_at_topic_idx;


--
-- Name: messages_2025_11_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_05_pkey;


--
-- Name: messages_2025_11_06_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_06_inserted_at_topic_idx;


--
-- Name: messages_2025_11_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_06_pkey;


--
-- Name: messages_2025_11_07_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_07_inserted_at_topic_idx;


--
-- Name: messages_2025_11_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_07_pkey;


--
-- Name: assistencias assistencias_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER assistencias_updated_at BEFORE UPDATE ON public.assistencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lancamentos_financeiros calc_quantidade_diaria; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calc_quantidade_diaria BEFORE INSERT OR UPDATE ON public.lancamentos_financeiros FOR EACH ROW WHEN (((new.dados ? 'data_inicial'::text) AND (new.dados ? 'data_final'::text))) EXECUTE FUNCTION public.trigger_calc_quantidade_diaria();


--
-- Name: TRIGGER calc_quantidade_diaria ON lancamentos_financeiros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER calc_quantidade_diaria ON public.lancamentos_financeiros IS 'Calcula quantidade diária quando há período definido (usado para rateios e distribuições)';


--
-- Name: propostas calculate_valor_venda; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calculate_valor_venda BEFORE INSERT OR UPDATE ON public.propostas FOR EACH ROW WHEN ((new.tipo = 'venda'::text)) EXECUTE FUNCTION public.trigger_calculate_valor_venda();


--
-- Name: TRIGGER calculate_valor_venda ON propostas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER calculate_valor_venda ON public.propostas IS 'Calcula automaticamente o valor de venda aplicando margem sobre o custo dos itens';


--
-- Name: contas_financeiras contas_financeiras_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER contas_financeiras_updated_at BEFORE UPDATE ON public.contas_financeiras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contratos contratos_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER contratos_updated_at BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: empresas empresas_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: entities entities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER entities_updated_at BEFORE UPDATE ON public.entities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: titulos_financeiros fin_txn_compute_amount; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER fin_txn_compute_amount BEFORE INSERT OR UPDATE ON public.titulos_financeiros FOR EACH ROW EXECUTE FUNCTION public.trigger_fin_txn_compute_amount();


--
-- Name: TRIGGER fin_txn_compute_amount ON titulos_financeiros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER fin_txn_compute_amount ON public.titulos_financeiros IS 'Valida e calcula valores antes de inserir ou atualizar títulos';


--
-- Name: titulos_financeiros fin_txn_defaults; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER fin_txn_defaults BEFORE INSERT OR UPDATE ON public.titulos_financeiros FOR EACH ROW EXECUTE FUNCTION public.trigger_fin_txn_defaults();


--
-- Name: TRIGGER fin_txn_defaults ON titulos_financeiros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER fin_txn_defaults ON public.titulos_financeiros IS 'Preenche valores padrão e atualiza status automaticamente';


--
-- Name: kanban_cards kanban_cards_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER kanban_cards_updated_at BEFORE UPDATE ON public.kanban_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: kanban_colunas kanban_colunas_set_pos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER kanban_colunas_set_pos BEFORE INSERT OR UPDATE ON public.kanban_colunas FOR EACH ROW EXECUTE FUNCTION public.trigger_kanban_colunas_set_pos();


--
-- Name: TRIGGER kanban_colunas_set_pos ON kanban_colunas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER kanban_colunas_set_pos ON public.kanban_colunas IS 'Gerencia automaticamente a posição das colunas do kanban';


--
-- Name: lancamentos_financeiros lancamentos_financeiros_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER lancamentos_financeiros_updated_at BEFORE UPDATE ON public.lancamentos_financeiros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: obras obras_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER obras_updated_at BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pipelines on_oportunidade_concluida; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_oportunidade_concluida BEFORE UPDATE ON public.pipelines FOR EACH ROW WHEN (((new.probabilidade = 100) AND (old.probabilidade < 100))) EXECUTE FUNCTION public.trigger_on_oportunidade_concluida();


--
-- Name: TRIGGER on_oportunidade_concluida ON pipelines; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER on_oportunidade_concluida ON public.pipelines IS 'Executa ações quando uma oportunidade é marcada como ganha (100% probabilidade)';


--
-- Name: produtos_servicos produtos_servicos_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER produtos_servicos_updated_at BEFORE UPDATE ON public.produtos_servicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pipelines propagate_won_opportunity; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER propagate_won_opportunity AFTER UPDATE ON public.pipelines FOR EACH ROW WHEN (((new.probabilidade = 100) AND (old.probabilidade < 100))) EXECUTE FUNCTION public.trigger_propagate_won_opportunity();


--
-- Name: TRIGGER propagate_won_opportunity ON pipelines; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER propagate_won_opportunity ON public.pipelines IS 'Propaga oportunidades ganhas criando cards em outros módulos (projetos, etc)';


--
-- Name: propostas propostas_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER propostas_updated_at BEFORE UPDATE ON public.propostas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: registro_categorias registro_categorias_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER registro_categorias_updated_at BEFORE UPDATE ON public.registro_categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: registros_trabalho registros_trabalho_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER registros_trabalho_updated_at BEFORE UPDATE ON public.registros_trabalho FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lancamentos_financeiros tg_lanc_total; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tg_lanc_total BEFORE INSERT OR UPDATE ON public.lancamentos_financeiros FOR EACH ROW EXECUTE FUNCTION public.trigger_lanc_total();


--
-- Name: TRIGGER tg_lanc_total ON lancamentos_financeiros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER tg_lanc_total ON public.lancamentos_financeiros IS 'Calcula automaticamente o total do lançamento baseado nos itens e define valores padrão';


--
-- Name: titulos_financeiros titulos_financeiros_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER titulos_financeiros_updated_at BEFORE UPDATE ON public.titulos_financeiros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contas_financeiras trg_conta_set_empresa_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_conta_set_empresa_id BEFORE INSERT ON public.contas_financeiras FOR EACH ROW EXECUTE FUNCTION public.trigger_conta_set_empresa_id();


--
-- Name: TRIGGER trg_conta_set_empresa_id ON contas_financeiras; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER trg_conta_set_empresa_id ON public.contas_financeiras IS 'Define automaticamente empresa_id para contas financeiras';


--
-- Name: entities trg_entities_normalize; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_entities_normalize BEFORE INSERT OR UPDATE ON public.entities FOR EACH ROW EXECUTE FUNCTION public.trigger_entities_normalize();


--
-- Name: TRIGGER trg_entities_normalize ON entities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER trg_entities_normalize ON public.entities IS 'Normaliza dados de entities (capitalização, formatação, validações)';


--
-- Name: propostas trg_proposta_itens_after_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_proposta_itens_after_change BEFORE UPDATE ON public.propostas FOR EACH ROW WHEN ((old.itens IS DISTINCT FROM new.itens)) EXECUTE FUNCTION public.trigger_proposta_itens_after_change();


--
-- Name: TRIGGER trg_proposta_itens_after_change ON propostas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER trg_proposta_itens_after_change ON public.propostas IS 'Recalcula automaticamente o valor total da proposta quando os itens são modificados';


--
-- Name: propostas trg_propostas_before_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_propostas_before_insert BEFORE INSERT ON public.propostas FOR EACH ROW EXECUTE FUNCTION public.trigger_propostas_before_insert();


--
-- Name: TRIGGER trg_propostas_before_insert ON propostas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER trg_propostas_before_insert ON public.propostas IS 'Define valores padrão e valida dados antes de inserir uma nova proposta';


--
-- Name: propostas trg_propostas_itens_before_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_propostas_itens_before_change BEFORE INSERT OR UPDATE ON public.propostas FOR EACH ROW WHEN ((new.itens IS NOT NULL)) EXECUTE FUNCTION public.trigger_propostas_itens_before_change();


--
-- Name: TRIGGER trg_propostas_itens_before_change ON propostas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TRIGGER trg_propostas_itens_before_change ON public.propostas IS 'Valida e normaliza a estrutura dos itens da proposta antes de salvar';


--
-- Name: app_config update_app_config_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_app_config_updated_at BEFORE UPDATE ON public.app_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: assistencias assistencias_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistencias
    ADD CONSTRAINT assistencias_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.entities(id) ON DELETE CASCADE;


--
-- Name: assistencias assistencias_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistencias
    ADD CONSTRAINT assistencias_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: centros_custo centros_custo_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centros_custo
    ADD CONSTRAINT centros_custo_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: contas_financeiras contas_financeiras_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras
    ADD CONSTRAINT contas_financeiras_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: contratos contratos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.entities(id) ON DELETE CASCADE;


--
-- Name: contratos contratos_proposta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_proposta_id_fkey FOREIGN KEY (proposta_id) REFERENCES public.propostas(id) ON DELETE SET NULL;


--
-- Name: contratos contratos_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: kanban_cards kanban_cards_coluna_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_cards
    ADD CONSTRAINT kanban_cards_coluna_id_fkey FOREIGN KEY (coluna_id) REFERENCES public.kanban_colunas(id) ON DELETE CASCADE;


--
-- Name: kanban_cards kanban_cards_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_cards
    ADD CONSTRAINT kanban_cards_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON DELETE SET NULL;


--
-- Name: kanban_cards kanban_cards_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_cards
    ADD CONSTRAINT kanban_cards_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: kanban_colunas kanban_colunas_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_colunas
    ADD CONSTRAINT kanban_colunas_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.kanban_boards(id) ON DELETE CASCADE;


--
-- Name: lancamentos lancamentos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos
    ADD CONSTRAINT lancamentos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.plano_contas(id) ON DELETE SET NULL;


--
-- Name: lancamentos lancamentos_centro_custo_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos
    ADD CONSTRAINT lancamentos_centro_custo_cliente_id_fkey FOREIGN KEY (centro_custo_cliente_id) REFERENCES public.centros_custo(id) ON DELETE SET NULL;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.plano_contas(id) ON DELETE SET NULL;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_centro_custo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_centro_custo_id_fkey FOREIGN KEY (centro_custo_id) REFERENCES public.centros_custo(id) ON DELETE SET NULL;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.entities(id) ON DELETE SET NULL;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_conta_financeira_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_conta_financeira_id_fkey FOREIGN KEY (conta_financeira_id) REFERENCES public.contas_financeiras(id) ON DELETE SET NULL;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE SET NULL;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE SET NULL;


--
-- Name: lancamentos_financeiros lancamentos_financeiros_titulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_financeiros
    ADD CONSTRAINT lancamentos_financeiros_titulo_id_fkey FOREIGN KEY (titulo_id) REFERENCES public.titulos_financeiros(id) ON DELETE SET NULL;


--
-- Name: lancamentos lancamentos_titulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos
    ADD CONSTRAINT lancamentos_titulo_id_fkey FOREIGN KEY (titulo_id) REFERENCES public.titulos_financeiros(id) ON DELETE CASCADE;


--
-- Name: obras obras_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.entities(id) ON DELETE CASCADE;


--
-- Name: obras obras_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE SET NULL;


--
-- Name: obras obras_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: pipelines pipelines_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON DELETE CASCADE;


--
-- Name: plano_contas plano_contas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plano_contas
    ADD CONSTRAINT plano_contas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: propostas propostas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.entities(id) ON DELETE CASCADE;


--
-- Name: propostas propostas_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: registros_trabalho registros_trabalho_aprovado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_aprovado_por_fkey FOREIGN KEY (aprovado_por) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: registros_trabalho registros_trabalho_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.registro_categorias(id) ON DELETE SET NULL;


--
-- Name: registros_trabalho registros_trabalho_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.entities(id) ON DELETE CASCADE;


--
-- Name: registros_trabalho registros_trabalho_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE SET NULL;


--
-- Name: registros_trabalho registros_trabalho_lancamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_lancamento_id_fkey FOREIGN KEY (lancamento_id) REFERENCES public.lancamentos_financeiros(id) ON DELETE SET NULL;


--
-- Name: registros_trabalho registros_trabalho_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE SET NULL;


--
-- Name: registros_trabalho registros_trabalho_profissional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_profissional_id_fkey FOREIGN KEY (profissional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: registros_trabalho registros_trabalho_proposta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_trabalho
    ADD CONSTRAINT registros_trabalho_proposta_id_fkey FOREIGN KEY (proposta_id) REFERENCES public.propostas(id) ON DELETE SET NULL;


--
-- Name: titulos_financeiros titulos_financeiros_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.titulos_financeiros
    ADD CONSTRAINT titulos_financeiros_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.plano_contas(id) ON DELETE SET NULL;


--
-- Name: titulos_financeiros titulos_financeiros_centro_custo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.titulos_financeiros
    ADD CONSTRAINT titulos_financeiros_centro_custo_id_fkey FOREIGN KEY (centro_custo_id) REFERENCES public.centros_custo(id) ON DELETE SET NULL;


--
-- Name: titulos_financeiros titulos_financeiros_conta_financeira_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.titulos_financeiros
    ADD CONSTRAINT titulos_financeiros_conta_financeira_id_fkey FOREIGN KEY (conta_financeira_id) REFERENCES public.contas_financeiras(id) ON DELETE SET NULL;


--
-- Name: titulos_financeiros titulos_financeiros_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.titulos_financeiros
    ADD CONSTRAINT titulos_financeiros_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE SET NULL;


--
-- Name: usuarios_perfis usuarios_perfis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_perfis
    ADD CONSTRAINT usuarios_perfis_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: iceberg_namespaces iceberg_namespaces_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: kanban_boards Admins can manage boards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage boards" ON public.kanban_boards TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: kanban_colunas Admins can manage columns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage columns" ON public.kanban_colunas TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: empresas Admins can manage companies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage companies" ON public.empresas TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: registro_categorias Admins e gestores podem atualizar categorias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins e gestores podem atualizar categorias" ON public.registro_categorias FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text]))))));


--
-- Name: registro_categorias Admins e gestores podem criar categorias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins e gestores podem criar categorias" ON public.registro_categorias FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text]))))));


--
-- Name: contratos Admins e gestores podem criar contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins e gestores podem criar contratos" ON public.contratos FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text]))))));


--
-- Name: obras Admins, gestores e arquitetos podem criar obras; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins, gestores e arquitetos podem criar obras" ON public.obras FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text, 'arquiteto'::text]))))));


--
-- Name: lancamentos_financeiros Admins, gestores e financeiro podem atualizar lançamentos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins, gestores e financeiro podem atualizar lançamentos" ON public.lancamentos_financeiros FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text, 'financeiro'::text]))))));


--
-- Name: lancamentos_financeiros Admins, gestores e financeiro podem criar lançamentos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins, gestores e financeiro podem criar lançamentos" ON public.lancamentos_financeiros FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text, 'financeiro'::text]))))));


--
-- Name: contratos Admins, gestores e responsáveis podem atualizar contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins, gestores e responsáveis podem atualizar contratos" ON public.contratos FOR UPDATE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text]))))) OR (responsavel_id = auth.uid())));


--
-- Name: propostas Admins, gestores e vendedores podem criar propostas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins, gestores e vendedores podem criar propostas" ON public.propostas FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text, 'vendedor'::text]))))));


--
-- Name: obras Admins, gestores, arquitetos e responsáveis podem atualizar ob; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins, gestores, arquitetos e responsáveis podem atualizar ob" ON public.obras FOR UPDATE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text, 'arquiteto'::text]))))) OR (responsavel_id = auth.uid())));


--
-- Name: propostas Admins, gestores, vendedores e responsáveis podem atualizar pr; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins, gestores, vendedores e responsáveis podem atualizar pr" ON public.propostas FOR UPDATE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text, 'vendedor'::text]))))) OR (responsavel_id = auth.uid())));


--
-- Name: registro_categorias Apenas admins podem deletar categorias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Apenas admins podem deletar categorias" ON public.registro_categorias FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: contratos Apenas admins podem deletar contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Apenas admins podem deletar contratos" ON public.contratos FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: lancamentos_financeiros Apenas admins podem deletar lançamentos financeiros; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Apenas admins podem deletar lançamentos financeiros" ON public.lancamentos_financeiros FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: obras Apenas admins podem deletar obras; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Apenas admins podem deletar obras" ON public.obras FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: propostas Apenas admins podem deletar propostas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Apenas admins podem deletar propostas" ON public.propostas FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))));


--
-- Name: entities Authenticated users can create entities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can create entities" ON public.entities FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: entities Authenticated users can update entities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update entities" ON public.entities FOR UPDATE TO authenticated USING (true);


--
-- Name: kanban_boards Authenticated users can view boards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view boards" ON public.kanban_boards FOR SELECT TO authenticated USING (true);


--
-- Name: kanban_colunas Authenticated users can view columns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view columns" ON public.kanban_colunas FOR SELECT TO authenticated USING (true);


--
-- Name: empresas Authenticated users can view companies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view companies" ON public.empresas FOR SELECT TO authenticated USING (true);


--
-- Name: entities Authenticated users can view entities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view entities" ON public.entities FOR SELECT TO authenticated USING (true);


--
-- Name: lancamentos Financial users can manage lancamentos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Financial users can manage lancamentos" ON public.lancamentos TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'financeiro'::text, 'gestor'::text]))))));


--
-- Name: titulos_financeiros Financial users can manage titles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Financial users can manage titles" ON public.titulos_financeiros TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'financeiro'::text, 'gestor'::text]))))));


--
-- Name: kanban_cards Managers can edit any card; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Managers can edit any card" ON public.kanban_cards TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text]))))));


--
-- Name: kanban_cards Responsible user can edit own cards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Responsible user can edit own cards" ON public.kanban_cards FOR UPDATE TO authenticated USING ((responsavel_id = auth.uid()));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: lancamentos Users can view lancamentos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view lancamentos" ON public.lancamentos FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'financeiro'::text, 'gestor'::text]))))));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: titulos_financeiros Users can view titles of accessible companies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view titles of accessible companies" ON public.titulos_financeiros FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text)))) OR true));


--
-- Name: registros_trabalho Usuários podem atualizar seus registros de trabalho; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem atualizar seus registros de trabalho" ON public.registros_trabalho FOR UPDATE TO authenticated USING ((((profissional_id = auth.uid()) AND (aprovado = false)) OR (EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text])))))));


--
-- Name: registros_trabalho Usuários podem criar seus registros de trabalho; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem criar seus registros de trabalho" ON public.registros_trabalho FOR INSERT TO authenticated WITH CHECK ((profissional_id = auth.uid()));


--
-- Name: registros_trabalho Usuários podem deletar seus registros não aprovados; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem deletar seus registros não aprovados" ON public.registros_trabalho FOR DELETE TO authenticated USING ((((profissional_id = auth.uid()) AND (aprovado = false)) OR (EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = 'admin'::text))))));


--
-- Name: registro_categorias Usuários podem ver categorias de registro; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem ver categorias de registro" ON public.registro_categorias FOR SELECT TO authenticated USING (true);


--
-- Name: contratos Usuários podem ver contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem ver contratos" ON public.contratos FOR SELECT TO authenticated USING (true);


--
-- Name: lancamentos_financeiros Usuários podem ver lançamentos financeiros; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem ver lançamentos financeiros" ON public.lancamentos_financeiros FOR SELECT TO authenticated USING (true);


--
-- Name: obras Usuários podem ver obras; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem ver obras" ON public.obras FOR SELECT TO authenticated USING (true);


--
-- Name: propostas Usuários podem ver propostas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem ver propostas" ON public.propostas FOR SELECT TO authenticated USING (true);


--
-- Name: registros_trabalho Usuários podem ver seus registros de trabalho; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem ver seus registros de trabalho" ON public.registros_trabalho FOR SELECT TO authenticated USING (((profissional_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text])))))));


--
-- Name: kanban_cards authenticated_users_can_create_cards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_users_can_create_cards ON public.kanban_cards FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: POLICY authenticated_users_can_create_cards ON kanban_cards; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY authenticated_users_can_create_cards ON public.kanban_cards IS 'Permite que qualquer usuário autenticado crie novos cards no kanban. Facilita workflow colaborativo.';


--
-- Name: kanban_cards authenticated_users_can_update_cards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_users_can_update_cards ON public.kanban_cards FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: POLICY authenticated_users_can_update_cards ON kanban_cards; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY authenticated_users_can_update_cards ON public.kanban_cards IS 'Permite que qualquer usuário autenticado atualize cards (mover entre colunas, editar campos, etc). Essencial para kanban colaborativo.';


--
-- Name: kanban_cards authenticated_users_can_view_cards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_users_can_view_cards ON public.kanban_cards FOR SELECT TO authenticated USING (true);


--
-- Name: POLICY authenticated_users_can_view_cards ON kanban_cards; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY authenticated_users_can_view_cards ON public.kanban_cards IS 'Permite que qualquer usuário autenticado visualize cards do kanban. Política permissiva para colaboração.';


--
-- Name: contratos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

--
-- Name: empresas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

--
-- Name: entities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

--
-- Name: kanban_boards; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;

--
-- Name: kanban_cards; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: kanban_colunas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.kanban_colunas ENABLE ROW LEVEL SECURITY;

--
-- Name: lancamentos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;

--
-- Name: lancamentos_financeiros; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;

--
-- Name: kanban_cards managers_can_delete_cards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY managers_can_delete_cards ON public.kanban_cards FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_perfis
  WHERE ((usuarios_perfis.user_id = auth.uid()) AND (usuarios_perfis.perfil = ANY (ARRAY['admin'::text, 'gestor'::text]))))));


--
-- Name: POLICY managers_can_delete_cards ON kanban_cards; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY managers_can_delete_cards ON public.kanban_cards IS 'Restringe deleção de cards apenas para usuários com perfil admin ou gestor. Protege contra deleções acidentais.';


--
-- Name: obras; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

--
-- Name: pipelines; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: propostas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;

--
-- Name: registro_categorias; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.registro_categorias ENABLE ROW LEVEL SECURITY;

--
-- Name: registros_trabalho; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.registros_trabalho ENABLE ROW LEVEL SECURITY;

--
-- Name: titulos_financeiros; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.titulos_financeiros ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios_perfis; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios_perfis ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION gtrgm_in(cstring); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_in(cstring) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_out(extensions.gtrgm); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_out(extensions.gtrgm) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gin_extract_value_trgm(text, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gin_extract_value_trgm(text, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION gtrgm_compress(internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_compress(internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_consistent(internal, text, smallint, oid, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_consistent(internal, text, smallint, oid, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_decompress(internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_decompress(internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_distance(internal, text, smallint, oid, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_distance(internal, text, smallint, oid, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_options(internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_options(internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_penalty(internal, internal, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_penalty(internal, internal, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_picksplit(internal, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_picksplit(internal, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_same(extensions.gtrgm, extensions.gtrgm, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_same(extensions.gtrgm, extensions.gtrgm, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gtrgm_union(internal, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gtrgm_union(internal, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_limit(real); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_limit(real) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION show_limit(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.show_limit() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION show_trgm(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.show_trgm(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION similarity(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.similarity(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION similarity_dist(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.similarity_dist(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION similarity_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.similarity_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION strict_word_similarity(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.strict_word_similarity(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION strict_word_similarity_commutator_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.strict_word_similarity_commutator_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION strict_word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.strict_word_similarity_dist_commutator_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION strict_word_similarity_dist_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.strict_word_similarity_dist_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION strict_word_similarity_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.strict_word_similarity_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unaccent(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.unaccent(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unaccent(regdictionary, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.unaccent(regdictionary, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unaccent_init(internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.unaccent_init(internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unaccent_lexize(internal, internal, internal, internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.unaccent_lexize(internal, internal, internal, internal) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION word_similarity(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.word_similarity(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION word_similarity_commutator_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.word_similarity_commutator_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.word_similarity_dist_commutator_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION word_similarity_dist_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.word_similarity_dist_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION word_similarity_op(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.word_similarity_op(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION _ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public._ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text) TO anon;
GRANT ALL ON FUNCTION public._ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text) TO authenticated;
GRANT ALL ON FUNCTION public._ensure_coluna(p_board_id uuid, p_titulo text, p_posicao integer, p_cor text) TO service_role;


--
-- Name: FUNCTION cleanup_old_data(p_days_to_keep integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cleanup_old_data(p_days_to_keep integer) TO anon;
GRANT ALL ON FUNCTION public.cleanup_old_data(p_days_to_keep integer) TO authenticated;
GRANT ALL ON FUNCTION public.cleanup_old_data(p_days_to_keep integer) TO service_role;


--
-- Name: FUNCTION cronograma_reordenar_tarefas(p_board_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cronograma_reordenar_tarefas(p_board_id uuid) TO anon;
GRANT ALL ON FUNCTION public.cronograma_reordenar_tarefas(p_board_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.cronograma_reordenar_tarefas(p_board_id uuid) TO service_role;


--
-- Name: FUNCTION cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid) TO anon;
GRANT ALL ON FUNCTION public.cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.cronograma_seed_from_proposta(p_cronograma_id uuid, p_proposta_id uuid) TO service_role;


--
-- Name: FUNCTION current_empresa_id(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_empresa_id() TO anon;
GRANT ALL ON FUNCTION public.current_empresa_id() TO authenticated;
GRANT ALL ON FUNCTION public.current_empresa_id() TO service_role;


--
-- Name: FUNCTION current_org(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_org() TO anon;
GRANT ALL ON FUNCTION public.current_org() TO authenticated;
GRANT ALL ON FUNCTION public.current_org() TO service_role;


--
-- Name: FUNCTION current_user_email(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_user_email() TO anon;
GRANT ALL ON FUNCTION public.current_user_email() TO authenticated;
GRANT ALL ON FUNCTION public.current_user_email() TO service_role;


--
-- Name: FUNCTION current_user_id(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_user_id() TO anon;
GRANT ALL ON FUNCTION public.current_user_id() TO authenticated;
GRANT ALL ON FUNCTION public.current_user_id() TO service_role;


--
-- Name: FUNCTION current_user_role(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_user_role() TO anon;
GRANT ALL ON FUNCTION public.current_user_role() TO authenticated;
GRANT ALL ON FUNCTION public.current_user_role() TO service_role;


--
-- Name: FUNCTION ensure_default_pipelines(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.ensure_default_pipelines() TO anon;
GRANT ALL ON FUNCTION public.ensure_default_pipelines() TO authenticated;
GRANT ALL ON FUNCTION public.ensure_default_pipelines() TO service_role;


--
-- Name: FUNCTION ensure_pipeline(p_modulo text, p_nome text, p_stages text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.ensure_pipeline(p_modulo text, p_nome text, p_stages text[]) TO anon;
GRANT ALL ON FUNCTION public.ensure_pipeline(p_modulo text, p_nome text, p_stages text[]) TO authenticated;
GRANT ALL ON FUNCTION public.ensure_pipeline(p_modulo text, p_nome text, p_stages text[]) TO service_role;


--
-- Name: FUNCTION fin_card_soft_delete(p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fin_card_soft_delete(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fin_card_soft_delete(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fin_card_soft_delete(p_id uuid) TO service_role;


--
-- Name: FUNCTION fin_txn_duplicate(p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fin_txn_duplicate(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fin_txn_duplicate(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fin_txn_duplicate(p_id uuid) TO service_role;


--
-- Name: FUNCTION fin_txn_soft_delete(p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fin_txn_soft_delete(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fin_txn_soft_delete(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fin_txn_soft_delete(p_id uuid) TO service_role;


--
-- Name: FUNCTION finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid) TO anon;
GRANT ALL ON FUNCTION public.finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.finance_report(p_data_ini date, p_data_fim date, p_tipo text, p_status text, p_categoria_id uuid, p_empresa_id uuid, p_conta_id uuid) TO service_role;


--
-- Name: FUNCTION fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date) TO anon;
GRANT ALL ON FUNCTION public.fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date) TO authenticated;
GRANT ALL ON FUNCTION public.fn_cashflow_daily(p_org uuid, p_d1 date, p_d2 date) TO service_role;


--
-- Name: FUNCTION fn_dre(p_org uuid, p_d1 date, p_d2 date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_dre(p_org uuid, p_d1 date, p_d2 date) TO anon;
GRANT ALL ON FUNCTION public.fn_dre(p_org uuid, p_d1 date, p_d2 date) TO authenticated;
GRANT ALL ON FUNCTION public.fn_dre(p_org uuid, p_d1 date, p_d2 date) TO service_role;


--
-- Name: FUNCTION format_cep_br(digits text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.format_cep_br(digits text) TO anon;
GRANT ALL ON FUNCTION public.format_cep_br(digits text) TO authenticated;
GRANT ALL ON FUNCTION public.format_cep_br(digits text) TO service_role;


--
-- Name: FUNCTION format_cnpj(digits text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.format_cnpj(digits text) TO anon;
GRANT ALL ON FUNCTION public.format_cnpj(digits text) TO authenticated;
GRANT ALL ON FUNCTION public.format_cnpj(digits text) TO service_role;


--
-- Name: FUNCTION format_cpf(digits text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.format_cpf(digits text) TO anon;
GRANT ALL ON FUNCTION public.format_cpf(digits text) TO authenticated;
GRANT ALL ON FUNCTION public.format_cpf(digits text) TO service_role;


--
-- Name: FUNCTION format_phone_br(digits text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.format_phone_br(digits text) TO anon;
GRANT ALL ON FUNCTION public.format_phone_br(digits text) TO authenticated;
GRANT ALL ON FUNCTION public.format_phone_br(digits text) TO service_role;


--
-- Name: FUNCTION generate_item_code(p_category text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_item_code(p_category text) TO anon;
GRANT ALL ON FUNCTION public.generate_item_code(p_category text) TO authenticated;
GRANT ALL ON FUNCTION public.generate_item_code(p_category text) TO service_role;


--
-- Name: FUNCTION get_account_org_id(p_account_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_account_org_id(p_account_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_account_org_id(p_account_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_account_org_id(p_account_id uuid) TO service_role;


--
-- Name: FUNCTION get_api_url(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_api_url() TO anon;
GRANT ALL ON FUNCTION public.get_api_url() TO authenticated;
GRANT ALL ON FUNCTION public.get_api_url() TO service_role;


--
-- Name: FUNCTION get_category_org_id(p_category_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_category_org_id(p_category_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_category_org_id(p_category_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_category_org_id(p_category_id uuid) TO service_role;


--
-- Name: FUNCTION get_environment(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_environment() TO anon;
GRANT ALL ON FUNCTION public.get_environment() TO authenticated;
GRANT ALL ON FUNCTION public.get_environment() TO service_role;


--
-- Name: FUNCTION get_finance_dashboard_data(p_empresa_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_finance_dashboard_data(p_empresa_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_finance_dashboard_data(p_empresa_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_finance_dashboard_data(p_empresa_id uuid) TO service_role;


--
-- Name: FUNCTION get_jwt_claim(claim_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_jwt_claim(claim_name text) TO anon;
GRANT ALL ON FUNCTION public.get_jwt_claim(claim_name text) TO authenticated;
GRANT ALL ON FUNCTION public.get_jwt_claim(claim_name text) TO service_role;


--
-- Name: FUNCTION get_party_org_id(p_party_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_party_org_id(p_party_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_party_org_id(p_party_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_party_org_id(p_party_id uuid) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION has_role(p_role text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_role(p_role text) TO anon;
GRANT ALL ON FUNCTION public.has_role(p_role text) TO authenticated;
GRANT ALL ON FUNCTION public.has_role(p_role text) TO service_role;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- Name: FUNCTION is_cnpj_valid(doc text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_cnpj_valid(doc text) TO anon;
GRANT ALL ON FUNCTION public.is_cnpj_valid(doc text) TO authenticated;
GRANT ALL ON FUNCTION public.is_cnpj_valid(doc text) TO service_role;


--
-- Name: FUNCTION is_cpf_cnpj_valid(doc text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_cpf_cnpj_valid(doc text) TO anon;
GRANT ALL ON FUNCTION public.is_cpf_cnpj_valid(doc text) TO authenticated;
GRANT ALL ON FUNCTION public.is_cpf_cnpj_valid(doc text) TO service_role;


--
-- Name: FUNCTION is_cpf_valid(doc text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_cpf_valid(doc text) TO anon;
GRANT ALL ON FUNCTION public.is_cpf_valid(doc text) TO authenticated;
GRANT ALL ON FUNCTION public.is_cpf_valid(doc text) TO service_role;


--
-- Name: FUNCTION is_local_environment(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_local_environment() TO anon;
GRANT ALL ON FUNCTION public.is_local_environment() TO authenticated;
GRANT ALL ON FUNCTION public.is_local_environment() TO service_role;


--
-- Name: FUNCTION kanban_ensure_board(p_modulo text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.kanban_ensure_board(p_modulo text) TO anon;
GRANT ALL ON FUNCTION public.kanban_ensure_board(p_modulo text) TO authenticated;
GRANT ALL ON FUNCTION public.kanban_ensure_board(p_modulo text) TO service_role;


--
-- Name: FUNCTION kanban_get_board_status(p_modulo text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.kanban_get_board_status(p_modulo text) TO anon;
GRANT ALL ON FUNCTION public.kanban_get_board_status(p_modulo text) TO authenticated;
GRANT ALL ON FUNCTION public.kanban_get_board_status(p_modulo text) TO service_role;


--
-- Name: FUNCTION kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer) TO anon;
GRANT ALL ON FUNCTION public.kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer) TO authenticated;
GRANT ALL ON FUNCTION public.kanban_move_card(p_card_id uuid, p_new_coluna_id uuid, p_new_posicao integer) TO service_role;


--
-- Name: FUNCTION only_digits(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.only_digits(text) TO anon;
GRANT ALL ON FUNCTION public.only_digits(text) TO authenticated;
GRANT ALL ON FUNCTION public.only_digits(text) TO service_role;


--
-- Name: FUNCTION proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer) TO anon;
GRANT ALL ON FUNCTION public.proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer) TO authenticated;
GRANT ALL ON FUNCTION public.proposta_gerar_titulos(p_proposta_id uuid, p_parcelas integer) TO service_role;


--
-- Name: FUNCTION purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb) TO anon;
GRANT ALL ON FUNCTION public.purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.purchase_order_create(p_entity_id uuid, p_fornecedor_id uuid, p_status text, p_itens jsonb) TO service_role;


--
-- Name: FUNCTION recalc_proposta_total(p_proposta_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.recalc_proposta_total(p_proposta_id uuid) TO anon;
GRANT ALL ON FUNCTION public.recalc_proposta_total(p_proposta_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.recalc_proposta_total(p_proposta_id uuid) TO service_role;


--
-- Name: FUNCTION recompute_invoice_status(p_invoice_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.recompute_invoice_status(p_invoice_id uuid) TO anon;
GRANT ALL ON FUNCTION public.recompute_invoice_status(p_invoice_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.recompute_invoice_status(p_invoice_id uuid) TO service_role;


--
-- Name: FUNCTION reorder_cards(p_modulo text, p_stage_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reorder_cards(p_modulo text, p_stage_id uuid) TO anon;
GRANT ALL ON FUNCTION public.reorder_cards(p_modulo text, p_stage_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.reorder_cards(p_modulo text, p_stage_id uuid) TO service_role;


--
-- Name: FUNCTION system_health_check(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.system_health_check() TO anon;
GRANT ALL ON FUNCTION public.system_health_check() TO authenticated;
GRANT ALL ON FUNCTION public.system_health_check() TO service_role;


--
-- Name: FUNCTION trigger_calc_quantidade_diaria(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_calc_quantidade_diaria() TO anon;
GRANT ALL ON FUNCTION public.trigger_calc_quantidade_diaria() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_calc_quantidade_diaria() TO service_role;


--
-- Name: FUNCTION trigger_calculate_valor_venda(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_calculate_valor_venda() TO anon;
GRANT ALL ON FUNCTION public.trigger_calculate_valor_venda() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_calculate_valor_venda() TO service_role;


--
-- Name: FUNCTION trigger_conta_set_empresa_id(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_conta_set_empresa_id() TO anon;
GRANT ALL ON FUNCTION public.trigger_conta_set_empresa_id() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_conta_set_empresa_id() TO service_role;


--
-- Name: FUNCTION trigger_entities_normalize(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_entities_normalize() TO anon;
GRANT ALL ON FUNCTION public.trigger_entities_normalize() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_entities_normalize() TO service_role;


--
-- Name: FUNCTION trigger_fin_txn_compute_amount(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_fin_txn_compute_amount() TO anon;
GRANT ALL ON FUNCTION public.trigger_fin_txn_compute_amount() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_fin_txn_compute_amount() TO service_role;


--
-- Name: FUNCTION trigger_fin_txn_defaults(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_fin_txn_defaults() TO anon;
GRANT ALL ON FUNCTION public.trigger_fin_txn_defaults() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_fin_txn_defaults() TO service_role;


--
-- Name: FUNCTION trigger_kanban_colunas_set_pos(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_kanban_colunas_set_pos() TO anon;
GRANT ALL ON FUNCTION public.trigger_kanban_colunas_set_pos() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_kanban_colunas_set_pos() TO service_role;


--
-- Name: FUNCTION trigger_lanc_total(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_lanc_total() TO anon;
GRANT ALL ON FUNCTION public.trigger_lanc_total() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_lanc_total() TO service_role;


--
-- Name: FUNCTION trigger_on_oportunidade_concluida(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_on_oportunidade_concluida() TO anon;
GRANT ALL ON FUNCTION public.trigger_on_oportunidade_concluida() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_on_oportunidade_concluida() TO service_role;


--
-- Name: FUNCTION trigger_propagate_won_opportunity(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_propagate_won_opportunity() TO anon;
GRANT ALL ON FUNCTION public.trigger_propagate_won_opportunity() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_propagate_won_opportunity() TO service_role;


--
-- Name: FUNCTION trigger_proposta_itens_after_change(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_proposta_itens_after_change() TO anon;
GRANT ALL ON FUNCTION public.trigger_proposta_itens_after_change() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_proposta_itens_after_change() TO service_role;


--
-- Name: FUNCTION trigger_propostas_before_insert(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_propostas_before_insert() TO anon;
GRANT ALL ON FUNCTION public.trigger_propostas_before_insert() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_propostas_before_insert() TO service_role;


--
-- Name: FUNCTION trigger_propostas_itens_before_change(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_propostas_itens_before_change() TO anon;
GRANT ALL ON FUNCTION public.trigger_propostas_itens_before_change() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_propostas_itens_before_change() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE app_config; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.app_config TO anon;
GRANT ALL ON TABLE public.app_config TO authenticated;
GRANT ALL ON TABLE public.app_config TO service_role;


--
-- Name: TABLE assistencias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.assistencias TO anon;
GRANT ALL ON TABLE public.assistencias TO authenticated;
GRANT ALL ON TABLE public.assistencias TO service_role;


--
-- Name: TABLE centros_custo; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.centros_custo TO anon;
GRANT ALL ON TABLE public.centros_custo TO authenticated;
GRANT ALL ON TABLE public.centros_custo TO service_role;


--
-- Name: TABLE contas_financeiras; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contas_financeiras TO anon;
GRANT ALL ON TABLE public.contas_financeiras TO authenticated;
GRANT ALL ON TABLE public.contas_financeiras TO service_role;


--
-- Name: TABLE contratos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contratos TO anon;
GRANT ALL ON TABLE public.contratos TO authenticated;
GRANT ALL ON TABLE public.contratos TO service_role;


--
-- Name: TABLE empresas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.empresas TO anon;
GRANT ALL ON TABLE public.empresas TO authenticated;
GRANT ALL ON TABLE public.empresas TO service_role;


--
-- Name: TABLE entities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.entities TO anon;
GRANT ALL ON TABLE public.entities TO authenticated;
GRANT ALL ON TABLE public.entities TO service_role;


--
-- Name: TABLE kanban_boards; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.kanban_boards TO anon;
GRANT ALL ON TABLE public.kanban_boards TO authenticated;
GRANT ALL ON TABLE public.kanban_boards TO service_role;


--
-- Name: TABLE kanban_cards; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.kanban_cards TO anon;
GRANT ALL ON TABLE public.kanban_cards TO authenticated;
GRANT ALL ON TABLE public.kanban_cards TO service_role;


--
-- Name: TABLE kanban_colunas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.kanban_colunas TO anon;
GRANT ALL ON TABLE public.kanban_colunas TO authenticated;
GRANT ALL ON TABLE public.kanban_colunas TO service_role;


--
-- Name: TABLE lancamentos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.lancamentos TO anon;
GRANT ALL ON TABLE public.lancamentos TO authenticated;
GRANT ALL ON TABLE public.lancamentos TO service_role;


--
-- Name: TABLE lancamentos_financeiros; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.lancamentos_financeiros TO anon;
GRANT ALL ON TABLE public.lancamentos_financeiros TO authenticated;
GRANT ALL ON TABLE public.lancamentos_financeiros TO service_role;


--
-- Name: TABLE obras; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.obras TO anon;
GRANT ALL ON TABLE public.obras TO authenticated;
GRANT ALL ON TABLE public.obras TO service_role;


--
-- Name: TABLE pipelines; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pipelines TO anon;
GRANT ALL ON TABLE public.pipelines TO authenticated;
GRANT ALL ON TABLE public.pipelines TO service_role;


--
-- Name: TABLE plano_contas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.plano_contas TO anon;
GRANT ALL ON TABLE public.plano_contas TO authenticated;
GRANT ALL ON TABLE public.plano_contas TO service_role;


--
-- Name: TABLE produtos_servicos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.produtos_servicos TO anon;
GRANT ALL ON TABLE public.produtos_servicos TO authenticated;
GRANT ALL ON TABLE public.produtos_servicos TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE propostas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.propostas TO anon;
GRANT ALL ON TABLE public.propostas TO authenticated;
GRANT ALL ON TABLE public.propostas TO service_role;


--
-- Name: TABLE registro_categorias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.registro_categorias TO anon;
GRANT ALL ON TABLE public.registro_categorias TO authenticated;
GRANT ALL ON TABLE public.registro_categorias TO service_role;


--
-- Name: TABLE registros_trabalho; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.registros_trabalho TO anon;
GRANT ALL ON TABLE public.registros_trabalho TO authenticated;
GRANT ALL ON TABLE public.registros_trabalho TO service_role;


--
-- Name: TABLE titulos_financeiros; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.titulos_financeiros TO anon;
GRANT ALL ON TABLE public.titulos_financeiros TO authenticated;
GRANT ALL ON TABLE public.titulos_financeiros TO service_role;


--
-- Name: TABLE usuarios_perfis; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.usuarios_perfis TO anon;
GRANT ALL ON TABLE public.usuarios_perfis TO authenticated;
GRANT ALL ON TABLE public.usuarios_perfis TO service_role;


--
-- Name: TABLE v_clientes_ativos_contratos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_clientes_ativos_contratos TO anon;
GRANT ALL ON TABLE public.v_clientes_ativos_contratos TO authenticated;
GRANT ALL ON TABLE public.v_clientes_ativos_contratos TO service_role;


--
-- Name: TABLE v_despesas_mes_categoria; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_despesas_mes_categoria TO anon;
GRANT ALL ON TABLE public.v_despesas_mes_categoria TO authenticated;
GRANT ALL ON TABLE public.v_despesas_mes_categoria TO service_role;


--
-- Name: TABLE v_fluxo_caixa; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_fluxo_caixa TO anon;
GRANT ALL ON TABLE public.v_fluxo_caixa TO authenticated;
GRANT ALL ON TABLE public.v_fluxo_caixa TO service_role;


--
-- Name: TABLE v_kanban_cards_board; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_kanban_cards_board TO anon;
GRANT ALL ON TABLE public.v_kanban_cards_board TO authenticated;
GRANT ALL ON TABLE public.v_kanban_cards_board TO service_role;


--
-- Name: TABLE v_obras_status; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_obras_status TO anon;
GRANT ALL ON TABLE public.v_obras_status TO authenticated;
GRANT ALL ON TABLE public.v_obras_status TO service_role;


--
-- Name: TABLE v_registros_trabalho; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_registros_trabalho TO anon;
GRANT ALL ON TABLE public.v_registros_trabalho TO authenticated;
GRANT ALL ON TABLE public.v_registros_trabalho TO service_role;


--
-- Name: TABLE v_top10_clientes_receita; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_top10_clientes_receita TO anon;
GRANT ALL ON TABLE public.v_top10_clientes_receita TO authenticated;
GRANT ALL ON TABLE public.v_top10_clientes_receita TO service_role;


--
-- Name: TABLE vw_oportunidades_completas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.vw_oportunidades_completas TO anon;
GRANT ALL ON TABLE public.vw_oportunidades_completas TO authenticated;
GRANT ALL ON TABLE public.vw_oportunidades_completas TO service_role;


--
-- Name: TABLE vw_pipeline_oportunidades; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.vw_pipeline_oportunidades TO anon;
GRANT ALL ON TABLE public.vw_pipeline_oportunidades TO authenticated;
GRANT ALL ON TABLE public.vw_pipeline_oportunidades TO service_role;


--
-- Name: TABLE vw_titulos_resumo; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.vw_titulos_resumo TO anon;
GRANT ALL ON TABLE public.vw_titulos_resumo TO authenticated;
GRANT ALL ON TABLE public.vw_titulos_resumo TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_11_03; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_03 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_03 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_04; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_04 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_04 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_05; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_05 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_05 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_06; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_06 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_06 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_07; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_07 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_07 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE iceberg_namespaces; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_namespaces TO service_role;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO anon;


--
-- Name: TABLE iceberg_tables; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_tables TO service_role;
GRANT SELECT ON TABLE storage.iceberg_tables TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_tables TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict qHkApMFWDrWZPhjlxiImNiudgKq9y2WdYwFGg4FMfsmRfjGvGtkd9CChJlBaTL4

