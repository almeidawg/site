// src/modules/financeiro/services/financeiroService.js

import { supabase } from "@/config/supabaseClient";

/**
 * Tipagem básica do pagamento (ajuste conforme suas colunas no Supabase):
 *
 * @typedef {Object} Pagamento
 * @property {string}  projeto_id       - ID da obra/projeto
 * @property {string}  tipo             - 'entrada' | 'saida'
 * @property {number}  valor            - Valor financeiro
 * @property {string}  data             - ISO date (YYYY-MM-DD)
 * @property {string}  [categoria]      - Ex: 'obra', 'marcenaria', 'imposto'
 * @property {string}  [descricao]
 * @property {string}  [status]         - Ex: 'previsto', 'pago'
 * @property {string}  [metodo]         - Ex: 'pix', 'boleto', 'cartao'
 */

/**
 * 1) Resumo financeiro da obra
 *    VIEW/Tabela: financeiro_resumo_obra
 */
export async function getResumoFinanceiro(projetoId) {
  try {
    const { data, error } = await supabase
      .from("financeiro_resumo_obra")
      .select("*")
      .eq("projeto_id", projetoId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[financeiroService] Erro ao buscar resumo financeiro:", err);
    throw err;
  }
}

/**
 * 2) Lista entradas e saídas da obra
 *    Tabela: financeiro_pagamentos
 */
export async function listarPagamentos(projetoId) {
  try {
    const { data, error } = await supabase
      .from("financeiro_pagamentos")
      .select("*")
      .eq("projeto_id", projetoId)
      .order("data", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[financeiroService] Erro ao listar pagamentos:", err);
    throw err;
  }
}

/**
 * Alias semântico usado na tela FinanceiroLancamentosPage
 * Mantém compatibilidade com o import:
 *   import { listarLancamentosFinanceiros } from ".../financeiroService"
 */
export async function listarLancamentosFinanceiros(projetoId) {
  return listarPagamentos(projetoId);
}

/**
 * 3) Cria pagamento (entrada ou saída)
 *    Tabela: financeiro_pagamentos
 */
export async function criarPagamento(pagamento) {
  try {
    const payload = {
      ...pagamento,
      valor: pagamento.valor != null ? Number(pagamento.valor) : null,
    };

    const { data, error } = await supabase
      .from("financeiro_pagamentos")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[financeiroService] Erro ao criar pagamento:", err);
    throw err;
  }
}

/**
 * Alias semântico usado na tela FinanceiroLancamentosPage
 */
export async function criarLancamentoFinanceiro(lancamento) {
  return criarPagamento(lancamento);
}

/**
 * 4) Remove pagamento
 */
export async function removerPagamento(id) {
  try {
    const { error } = await supabase
      .from("financeiro_pagamentos")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[financeiroService] Erro ao remover pagamento:", err);
    throw err;
  }
}

/**
 * 5) Buscar 1 pagamento por ID
 */
export async function buscarPagamentoPorId(id) {
  try {
    const { data, error } = await supabase
      .from("financeiro_pagamentos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[financeiroService] Erro ao buscar pagamento:", err);
    throw err;
  }
}

/**
 * 6) Listar contratos financeiros
 *    (Usado na MarcenariaPage para vincular contratos)
 *
 *    Ajuste o nome da tabela/colunas conforme seu schema:
 *    - aqui estou assumindo: "financeiro_contratos"
 */
export async function listarContratos(projetoId) {
  try {
    let query = supabase
      .from("financeiro_contratos")
      .select("*")
      .order("data_contrato", { ascending: false });

    if (projetoId) {
      query = query.eq("projeto_id", projetoId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[financeiroService] Erro ao listar contratos:", err);
    throw err;
  }
}

/**
 * Objeto de serviço para manter compatibilidade com imports do tipo:
 * import financeiroService from ".../financeiroService";
 */
export const financeiroService = {
  getResumoFinanceiro,
  listarPagamentos,
  listarLancamentosFinanceiros,
  criarPagamento,
  criarLancamentoFinanceiro,
  removerPagamento,
  buscarPagamentoPorId,
  listarContratos,
};

export default financeiroService;
