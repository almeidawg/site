// src/services/medicoesService.js
import { supabase } from "../config/supabaseClient";

export async function listarMedicoes(etapaId) {
  const { data, error } = await supabase
    .from("medicoes_etapa")
    .select("*")
    .eq("etapa_id", etapaId)
    .order("data_lancamento", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function criarMedicao({ etapaId, valor, observacao }) {
  const { error } = await supabase.from("medicoes_etapa").insert({
    etapa_id: etapaId,
    valor,
    observacao,
  });

  if (error) throw error;
}

export async function deletarMedicao(id) {
  const { error } = await supabase
    .from("medicoes_etapa")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
