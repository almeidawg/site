// src/modules/kanban/services/kanbanService.js
import { supabase } from "../../../config/supabaseClient";

/**
 * Cria um board de Kanban.
 */
export async function criarBoardKanban(payload) {
  const { data, error } = await supabase
    .from("kanban_boards")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar board Kanban:", error);
    throw error;
  }

  return data;
}

/**
 * Lista boards, com filtros opcionais.
 */
export async function listarBoardsKanban({ contexto, obraId, contratoId } = {}) {
  let query = supabase
    .from("kanban_boards")
    .select("*")
    .eq("ativo", true)
    .order("created_at", { ascending: true });

  if (contexto) query = query.eq("contexto", contexto);
  if (obraId) query = query.eq("obra_id", obraId);
  if (contratoId) query = query.eq("contrato_id", contratoId);

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao listar boards Kanban:", error);
    throw error;
  }

  return data || [];
}

/**
 * Carrega listas + cards de um board.
 */
export async function carregarBoardCompleto(boardId) {
  const { data, error } = await supabase
    .from("kanban_listas")
    .select("*, kanban_cards (*)")
    .eq("board_id", boardId)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao carregar board Kanban:", error);
    throw error;
  }

  return data || [];
}

/**
 * Cria lista dentro de um board.
 */
export async function criarListaKanban(payload) {
  const { data, error } = await supabase
    .from("kanban_listas")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar lista Kanban:", error);
    throw error;
  }

  return data;
}

/**
 * Cria card.
 */
export async function criarCardKanban(payload) {
  const { data, error } = await supabase
    .from("kanban_cards")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar card Kanban:", error);
    throw error;
  }

  return data;
}
