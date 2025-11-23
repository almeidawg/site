export default function MarcenariaPage() {
  return (
    <>
      <h1>Marcenaria</h1>
      <p>Ambientes, itens e componentes.</p>
    </>
  );
// src/modules/marcenaria/services/marcenariaService.js
import { supabase } from "../../../config/supabaseClient";

/**
 * Lista o progresso da marcenaria por obra,
 * usando a função RPC do Supabase:
 * listar_progresso_marcenaria_por_obra()
 */
export async function listarProgressoMarcenariaPorObra() {
  const { data, error } = await supabase.rpc(
    "listar_progresso_marcenaria_por_obra"
  );

  if (error) {
    console.error("Erro ao listar progresso de marcenaria por obra:", error);
    throw error;
  }

  return data || [];
}

}

