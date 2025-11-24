import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type DiarioFoto = {
  id: string;
  obra_id: string;
  drive_file_id: string;
  url_publica: string;
  titulo: string | null;
  data_foto: string;
  semana_ref: string | null;
  ordem: number | null;
};

type FotosPorSemana = Record<string, DiarioFoto[]>;

export function useDiarioObra(obraId: string) {
  const [fotosPorSemana, setFotosPorSemana] = useState<FotosPorSemana>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!obraId) return;

    async function load() {
      setLoading(true);

      const { data } = await supabase
        .from("cliente_portal_diario_fotos")
        .select("*")
        .eq("obra_id", obraId)
        .order("semana_ref", { ascending: true })
        .order("data_foto", { ascending: true });

      const grouped: FotosPorSemana = {};

      (data || []).forEach((foto) => {
        const key = foto.semana_ref || foto.data_foto;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(foto);
      });

      setFotosPorSemana(grouped);
      setLoading(false);
    }

    load();
  }, [obraId]);

  return { fotosPorSemana, loading };
}
