import { supabase } from "../../../config/supabaseClient";

export async function dashboardResumo() {
  try {
    // total de clientes
    const { count: totalClientes } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true });

    // total de obras por status
    const obrasStatus = await supabase.rpc("obras_por_status"); // criaremos essa função abaixo

    // total de contratos e soma de valores
    const contratos = await supabase.rpc("contratos_resumo");

    // financeiro
    const financeiro = await supabase.rpc("financeiro_resumo");

    // tarefas kanban (cards pendentes)
    const { count: kanbanPendentes } = await supabase
      .from("kanban_cards")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativo");

    return {
      totalClientes,
      obrasStatus: obrasStatus.data || [],
      contratosResumo: contratos.data || {},
      financeiroResumo: financeiro.data || {},
      kanbanPendentes
    };
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    throw error;
  }
}
