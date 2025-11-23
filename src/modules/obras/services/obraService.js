// src/modules/obras/services/obraService.js
import { supabase } from "../../../config/supabaseClient";

// Buscar dados principais da obra + cliente
export async function buscarObraPorId(id) {
  const { data, error } = await supabase
    .from("obras")
    .select(
      "*, clientes ( id, nome, tipo_cliente, documento, email, telefone )"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar obra:", error);
    throw error;
  }

  return data;
}

// Contratos vinculados à obra
export async function listarContratosDaObra(obraId) {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("obra_id", obraId);

  if (error) {
    console.error("Erro ao listar contratos da obra:", error);
    throw error;
  }

  return data || [];
}

// Lançamentos financeiros da obra
export async function listarFinanceiroDaObra(obraId) {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select("*")
    .eq("obra_id", obraId)
    .order("data_prevista", { ascending: true });

  if (error) {
    console.error("Erro ao listar financeiro da obra:", error);
    throw error;
  }

  return data || [];
}

// Ambientes de marcenaria ligados à obra
// (por enquanto, traz todos os ambientes; depois refinamos filtro por obra)
export async function listarAmbientesDaObra(/* obraId */) {
  const { data, error } = await supabase
    .from("marcenaria_ambientes")
    .select("*");

  if (error) {
    console.error("Erro ao listar ambientes de marcenaria da obra:", error);
    throw error;
  }

  return data || [];
}

// Arquivos da obra
export async function listarArquivosDaObra(obraId) {
  const { data, error } = await supabase
    .from("arquivos")
    .select("*")
    .eq("tipo_relacao", "obra")
    .eq("referencia_id", obraId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar arquivos da obra:", error);
    throw error;
  }

  return data || [];
}
