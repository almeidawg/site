import { supabase } from "../../../config/SupabaseClient";

/**
 * 1) Progresso geral da marcenaria por obra
 *    (RPC: listar_progresso_marcenaria_por_obra)
 */
export async function listarProgressoMarcenariaPorObra() {
  try {
    const { data, error } = await supabase.rpc(
      "listar_progresso_marcenaria_por_obra"
    );

    if (error) {
      console.error(
        "Erro ao listar progresso da marcenaria por obra:",
        error
      );
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error(
      "Erro inesperado em listarProgressoMarcenariaPorObra:",
      err
    );
    return [];
  }
}

/**
 * 2) Lista de pedidos de marcenaria
 *    (Tabela: marcenaria_pedidos)
 */
export async function listarPedidosMarcenaria() {
  try {
    const { data, error } = await supabase
      .from("marcenaria_pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar pedidos de marcenaria:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Erro inesperado em listarPedidosMarcenaria:", err);
    return [];
  }
}

/**
 * 3) Lista ambientes vinculados a um pedido
 *    (Tabela: marcenaria_ambientes)
 */
export async function listarAmbientesPorPedido(pedidoId) {
  if (!pedidoId) return [];

  try {
    const { data, error } = await supabase
      .from("marcenaria_ambientes")
      .select("*")
      .eq("pedido_id", pedidoId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao listar ambientes do pedido:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Erro inesperado em listarAmbientesPorPedido:", err);
    return [];
  }
}

/**
 * 4) Alias para compatibilidade
 */
export async function listarAmbientesMarcenaria(pedidoId) {
  return listarAmbientesPorPedido(pedidoId);
}
