// pages/api/obras/criar-turnkey.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    cliente,
    obra,
    contrato,
    marcenariaAmbientes,
    financeiro
  } = req.body;

  const client = supabaseAdmin;

  try {
    // 1) Cliente
    let clienteId = cliente.id as string | null;

    if (!clienteId) {
      const { data: novoCliente, error: errCliente } = await client
        .from('clientes')
        .insert({
          nome: cliente.nome,
          documento: cliente.documento ?? null,
          tipo: cliente.tipo ?? 'pf',
          email: cliente.email ?? null,
          telefone: cliente.telefone ?? null,
          cidade: cliente.cidade ?? null,
          estado: cliente.estado ?? null
        })
        .select()
        .single();

      if (errCliente) throw errCliente;
      clienteId = novoCliente.id;
    }

    // 2) Obra
    const { data: novaObra, error: errObra } = await client
      .from('obras')
      .insert({
        cliente_id: clienteId,
        nome: obra.nome,
        codigo_interno: obra.codigo_interno ?? null,
        sistema: obra.sistema ?? 'turnkey',
        status: 'planejamento',
        cidade: obra.cidade ?? null,
        estado: obra.estado ?? null
      })
      .select()
      .single();

    if (errObra) throw errObra;

    const obraId = novaObra.id;

    // 3) Contrato
    const { data: novoContrato, error: errContrato } = await client
      .from('contratos')
      .insert({
        obra_id: obraId,
        cliente_id: clienteId,
        tipo: contrato.tipo ?? 'turnkey',
        status: 'em_elaboracao',
        valor_contratado: contrato.valor_contratado,
        condicoes_pagamento: contrato.condicoes_pagamento ?? null,
        data_emissao: contrato.data_emissao ?? new Date().toISOString().slice(0, 10)
      })
      .select()
      .single();

    if (errContrato) throw errContrato;

    const contratoId = novoContrato.id;

    // 4) Ambientes de marcenaria (se vierem no payload)
    if (Array.isArray(marcenariaAmbientes) && marcenariaAmbientes.length > 0) {
      const ambientesPayload = marcenariaAmbientes.map((a: any, idx: number) => ({
        obra_id: obraId,
        contrato_id: contratoId,
        nome: a.nome,
        descricao: a.descricao ?? null,
        ordem: idx + 1
      }));

      const { error: errAmb } = await client
        .from('marcenaria_ambientes')
        .insert(ambientesPayload);

      if (errAmb) throw errAmb;
    }

    // 5) Lançamento financeiro + parcelas
    if (financeiro && financeiro.valor_total && Array.isArray(financeiro.parcelas)) {
      const { data: lanc, error: errLanc } = await client
        .from('financeiro_lancamentos')
        .insert({
          tipo: 'receita',
          origem: 'contrato',
          obra_id: obraId,
          contrato_id: contratoId,
          cliente_id: clienteId,
          descricao: financeiro.descricao ?? `Receita contrato ${novoContrato.codigo_interno ?? ''}`.trim(),
          categoria: 'Contrato Turnkey',
          valor_total: financeiro.valor_total,
          status: 'planejado',
          competencia: financeiro.competencia ?? new Date().toISOString().slice(0, 10)
        })
        .select()
        .single();

      if (errLanc) throw errLanc;

      const lancamentoId = lanc.id;

      const parcelasPayload = financeiro.parcelas.map((p: any, idx: number) => ({
        lancamento_id: lancamentoId,
        numero_parcela: idx + 1,
        vencimento: p.vencimento,
        valor_previsto: p.valor,
        status: 'aberto',
        descricao: p.descricao ?? `Parcela ${idx + 1}`
      }));

      const { error: errParc } = await client
        .from('financeiro_parcelas')
        .insert(parcelasPayload);

      if (errParc) throw errParc;
    }

    return res.status(200).json({
      ok: true,
      cliente_id: clienteId,
      obra_id: obraId,
      contrato_id: contratoId
    });

  } catch (err: any) {
    console.error('Erro fluxo turnkey:', err);
    return res.status(500).json({ ok: false, error: err.message ?? 'Erro interno' });
  }
}
