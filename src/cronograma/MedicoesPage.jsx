// src/cronograma/MedicoesPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listarMedicoes, criarMedicao, deletarMedicao } from "../services/medicoesService";
import { supabase } from "@/config/supabaseClient";
import MedicaoForm from "./MedicaoForm";

export default function MedicoesPage() {
  const { etapaId } = useParams();
  const [etapa, setEtapa] = useState(null);
  const [medicoes, setMedicoes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregarTudo() {
    const { data: etapaData } = await supabase
      .from("cronograma_etapas")
      .select("*")
      .eq("id", etapaId)
      .single();

    const lista = await listarMedicoes(etapaId);

    setEtapa(etapaData);
    setMedicoes(lista);
    setLoading(false);
  }

  useEffect(() => {
    carregarTudo();
  }, [etapaId]);

  async function registrarMedicao(valor, observacao) {
    await criarMedicao({ etapaId, valor, observacao });
    carregarTudo();
  }

  async function remover(id) {
    await deletarMedicao(id);
    carregarTudo();
  }

  if (loading) return <div className="p-6">Carregando…</div>;

  return (
    <div className="p-6 space-y-6">
      <Link to={`/obras/${etapa.cronograma_id}/cronograma`} className="text-sm text-slate-600 underline">
        ← Voltar ao Cronograma
      </Link>

      <h1 className="text-xl font-semibold text-slate-900">
        Medições — {etapa.nome}
      </h1>

      <MedicaoForm onSubmit={registrarMedicao} />

      <div className="mt-4 space-y-3">
        {medicoes.map((m) => (
          <div
            key={m.id}
            className="p-3 border rounded-lg bg-white shadow-sm flex justify-between"
          >
            <div>
              <div className="font-medium">
                R$ {Number(m.valor).toLocaleString("pt-BR")}
              </div>
              <div className="text-xs text-slate-500">{m.data_lancamento}</div>
              {m.observacao && (
                <div className="text-xs text-slate-600">{m.observacao}</div>
              )}
            </div>

            <button
              onClick={() => remover(m.id)}
              className="text-red-600 text-xs"
            >
              Excluir
            </button>
          </div>
        ))}

        {medicoes.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma medição registrada.</p>
        )}
      </div>
    </div>
  );
}
