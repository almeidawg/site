// src/modules/financeiro/services/financeiroService.js
import { supabase } from "../../../config/supabaseClient";

/**
 * Service de Financeiro - WGEasy
 * Tabela principal: fin_transactions
 * Relacionamentos: obras, fin_categories, parties
 */

/**
 * Lista todos os lançamentos financeiros com filtros opcionais
 * @param {Object} filters - Filtros opcionais
 * @param {string} filters.searchText - Texto para buscar na descrição
 * @param {string} filters.type - Tipo: 'income' ou 'expense'
 * @param {string} filters.projectId - ID da obra/projeto
 * @param {string} filters.categoryId - ID da categoria
 * @returns {Promise<Array>}
 */
export async function listarLancamentos(filters = {}) {
  try {
    let query = supabase
      .from("fin_transactions")
      .select(`
        *,
        project:project_id(id, nome),
        category:category_id(id, name, kind),
        party:party_id(id, name)
      `)
      .order("occurred_at", { ascending: false });

    // Filtro por texto na descrição
    if (filters.searchText) {
      query = query.ilike("description", `%${filters.searchText}%`);
    }

    // Filtro por tipo (income/expense)
    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    // Filtro por projeto/obra
    if (filters.projectId) {
      query = query.eq("project_id", filters.projectId);
    }

    // Filtro por categoria
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[financeiroService] Erro ao listar lançamentos:", err);
    throw err;
  }
}

/**
 * Busca um lançamento específico por ID
 * @param {string} id - ID do lançamento
 * @returns {Promise<Object|null>}
 */
export async function buscarLancamentoPorId(id) {
  try {
    const { data, error } = await supabase
      .from("fin_transactions")
      .select(`
        *,
        project:project_id(id, nome),
        category:category_id(id, name, kind),
        party:party_id(id, name)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[financeiroService] Erro ao buscar lançamento:", err);
    throw err;
  }
}

/**
 * Cria um novo lançamento financeiro
 * @param {Object} lancamento - Dados do lançamento
 * @param {string} lancamento.type - 'income' ou 'expense'
 * @param {string} lancamento.description - Descrição do lançamento
 * @param {number} lancamento.amount - Valor
 * @param {string} lancamento.occurred_at - Data do lançamento (ISO)
 * @param {string} lancamento.project_id - ID da obra (opcional)
 * @param {string} lancamento.category_id - ID da categoria (opcional)
 * @param {string} lancamento.party_id - ID da parte (fornecedor/cliente) (opcional)
 * @returns {Promise<Object>}
 */
export async function criarLancamento(lancamento) {
  try {
    const payload = {
      type: lancamento.type,
      description: lancamento.description,
      amount: Number(lancamento.amount),
      occurred_at: lancamento.occurred_at,
      project_id: lancamento.project_id || null,
      category_id: lancamento.category_id || null,
      party_id: lancamento.party_id || null,
    };

    const { data, error } = await supabase
      .from("fin_transactions")
      .insert(payload)
      .select(`
        *,
        project:project_id(id, nome),
        category:category_id(id, name, kind),
        party:party_id(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[financeiroService] Erro ao criar lançamento:", err);
    throw err;
  }
}

/**
 * Atualiza um lançamento existente
 * @param {string} id - ID do lançamento
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object>}
 */
export async function atualizarLancamento(id, updates) {
  try {
    const payload = {};

    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.amount !== undefined) payload.amount = Number(updates.amount);
    if (updates.occurred_at !== undefined) payload.occurred_at = updates.occurred_at;
    if (updates.project_id !== undefined) payload.project_id = updates.project_id;
    if (updates.category_id !== undefined) payload.category_id = updates.category_id;
    if (updates.party_id !== undefined) payload.party_id = updates.party_id;

    const { data, error } = await supabase
      .from("fin_transactions")
      .update(payload)
      .eq("id", id)
      .select(`
        *,
        project:project_id(id, nome),
        category:category_id(id, name, kind),
        party:party_id(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[financeiroService] Erro ao atualizar lançamento:", err);
    throw err;
  }
}

/**
 * Remove um lançamento
 * @param {string} id - ID do lançamento
 * @returns {Promise<boolean>}
 */
export async function removerLancamento(id) {
  try {
    const { error } = await supabase
      .from("fin_transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[financeiroService] Erro ao remover lançamento:", err);
    throw err;
  }
}

/**
 * Lista todas as categorias financeiras
 * @returns {Promise<Array>}
 */
export async function listarCategorias() {
  try {
    const { data, error } = await supabase
      .from("fin_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[financeiroService] Erro ao listar categorias:", err);
    throw err;
  }
}

/**
 * Lista todas as obras para seleção
 * @returns {Promise<Array>}
 */
export async function listarObras() {
  try {
    const { data, error } = await supabase
      .from("obras")
      .select("id, nome, orcamento")
      .order("nome", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[financeiroService] Erro ao listar obras:", err);
    throw err;
  }
}

/**
 * Lista parties (fornecedores/clientes)
 * @returns {Promise<Array>}
 */
export async function listarParties() {
  try {
    const { data, error } = await supabase
      .from("parties")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[financeiroService] Erro ao listar parties:", err);
    throw err;
  }
}

/**
 * Calcula resumo financeiro por projeto
 * @param {string} projectId - ID do projeto
 * @returns {Promise<Object>}
 */
export async function getResumoFinanceiroPorProjeto(projectId) {
  try {
    const { data, error } = await supabase
      .from("fin_transactions")
      .select("type, amount")
      .eq("project_id", projectId);

    if (error) throw error;

    const resumo = {
      totalReceitas: 0,
      totalDespesas: 0,
      saldo: 0,
    };

    (data || []).forEach((item) => {
      const valor = Number(item.amount) || 0;
      if (item.type === "income") {
        resumo.totalReceitas += valor;
      } else if (item.type === "expense") {
        resumo.totalDespesas += valor;
      }
    });

    resumo.saldo = resumo.totalReceitas - resumo.totalDespesas;

    return resumo;
  } catch (err) {
    console.error("[financeiroService] Erro ao calcular resumo:", err);
    throw err;
  }
}

export const financeiroService = {
  listarLancamentos,
  buscarLancamentoPorId,
  criarLancamento,
  atualizarLancamento,
  removerLancamento,
  listarCategorias,
  listarObras,
  listarParties,
  getResumoFinanceiroPorProjeto,
};

export default financeiroService;
