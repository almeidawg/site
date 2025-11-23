import { supabase } from "../../../config/supabaseClient";

export async function obterResumoPeriodo(inicio, fim) {
  const { data, error } = await supabase.rpc("financeiro_resumo_periodo", {
    p_inicio: inicio,
    p_fim: fim
  });

  if (error) {
    console.error("Erro resumo período:", error);
    throw error;
  }

  return data?.[0] || { receitas: 0, despesas: 0, saldo: 0 };
}

export async function obterResumoPorObra(inicio, fim) {
  const { data, error } = await supabase.rpc("financeiro_resumo_por_obra", {
    p_inicio: inicio,
    p_fim: fim
  });

  if (error) {
    console.error("Erro resumo por obra:", error);
    throw error;
  }

  return data || [];
}

export async function obterFluxoMensal(ano) {
  const { data, error } = await supabase.rpc("financeiro_fluxo_mensal", {
    p_ano: ano
  });

  if (error) {
    console.error("Erro fluxo mensal:", error);
    throw error;
  }

  return data || [];
}
