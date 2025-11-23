// src/modules/financeiro/services/financeiroService.js

// Import correto do Supabase, baseado na estrutura real:
// src/config/supabaseClient.js
import { supabase } from "../../../config/supabaseClient";

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
 *    Tabela/VIEW: financeiro_resumo_obra
 *    Esperado: 1 linha por projeto_id (use maybeSingle)
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
 * 3) Cria pagamento (entrada ou saída)
 *    Retorna o registro criado (para já atualizar lista/local state)
 */
export async function criarPagamento(pagamento) {
  try {
    const { data, error } = await supabase
      .from("financeiro_pagamentos")
      .insert(pagamento)
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
 * Export para compatibilidade com diferentes padrões de importação
 */
export const financeiroService = {
  getResumoFinanceiro,
  listarPagamentos,
  criarPagamento,
  removerPagamento,
 buscarPagamentoPorId,
};

export default financeiroService;