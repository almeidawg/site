import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type ClienteObra = {
  id: string;
  contract_code: string | null;
  nome_obra: string;
  endereco: string | null;
  status: "planejamento" | "execucao" | "finalizada";
  created_at: string;
};

export function useClienteObra(obraId: string) {
  const [obra, setObra] = useState<ClienteObra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!obraId) return;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("cliente_portal_obras")
        .select("*")
        .eq("id", obraId)
        .single();

      if (error) {
        console.error(error);
        setError("Não foi possível carregar os dados da obra.");
      } else {
        setObra(data as ClienteObra);
      }

      setLoading(false);
    }

    load();
  }, [obraId]);

  return { obra, loading, error };
}
