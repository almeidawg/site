-- =============================================
-- Migration: Sync final LIVE = LOCAL (apenas objetos essenciais)
-- Descrição: Adicionar apenas views e função que realmente não existem
-- Data: 2025-11-04
-- =============================================

-- 1. Adicionar coluna obras.ativo PRIMEIRO (antes da view que a usa)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'obras'
                 AND column_name = 'ativo') THEN
    ALTER TABLE "public"."obras" ADD COLUMN "ativo" boolean DEFAULT true;
  END IF;
END $$;

-- 2. Recriar views (agora que a coluna existe)
DROP VIEW IF EXISTS "public"."v_obras_status";
CREATE VIEW "public"."v_obras_status" AS
  SELECT status,
    count(*) AS total
   FROM public.obras
  WHERE (ativo = true)
  GROUP BY status;

DROP VIEW IF EXISTS "public"."v_registros_trabalho";
CREATE VIEW "public"."v_registros_trabalho" AS
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

-- 3. Criar função handle_updated_at se não existir
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
