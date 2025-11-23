// src/modules/clientes/services/clientesService.js
import { supabase } from "../../../config/supabaseClient";

/**
 * Lista clientes com paginação e busca por nome.
 */
export async function listarClientes({ search = "", page = 1, pageSize = 20 } = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("clientes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("nome", `%${search}%`);
  }

  const { data, error, count } = await supabase
  .from("clientes")   // <-- exatamente esse nome
  .select("*", { count: "exact" })

  if (error) {
    console.error("Erro ao listar clientes:", error);
    throw error;
  }

  return { clientes: data || [], total: count || 0 };
}

/**
 * Busca cliente por ID.
 */
export async function buscarClientePorId(id) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar cliente:", error);
    throw error;
  }

  return data;
}

/**
 * Cria cliente.
 */
export async function criarCliente(payload) {
  const { data, error } = await supabase
    .from("clientes")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar cliente:", error);
    throw error;
  }

  return data;
}

/**
 * Atualiza cliente.
 */
export async function atualizarCliente(id, payload) {
  const { data, error } = await supabase
    .from("clientes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }

  return data;
}

/**
 * Remove cliente.
 */
export async function removerCliente(id) {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover cliente:", error);
    throw error;
  }

  return true;
}
