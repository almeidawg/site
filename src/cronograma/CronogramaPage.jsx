// src/cronograma/CronogramaPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

export default function CronogramaPage() {
  const { projetoId } = useParams();  // Pega o ID do projeto pela URL
  const [cronograma, setCronograma] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(false);

  async function carregarCronograma() {
    setLoading(true);
    try {
      // Carrega o cronograma do projeto
      const { data: cronogramaData, error: cronogramaError } = await supabase
        .from("cronograma_projetos")
        .select("*")
        .eq("projeto_id", projetoId)
        .single();

      if (cronogramaError) throw cronogramaError;

      setCronograma(cronogramaData);

      // Carrega as etapas do cronograma
      const { data: etapasData, error: etapasError } = await supabase
        .from("cronograma_etapas")
        .select("*")
        .eq("cronograma_id", cronogramaData.id)
        .order("data_inicio", { ascending: true });

      if (etapasError) throw etapasError;

      setEtapas(etapasData);

    } catch (err) {
      console.error("Erro ao carregar cronograma:", err);
      alert("Erro ao carregar cronograma.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCronograma();
  }, [projetoId]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Cronograma do Projeto</h1>

      {loading && <p>Carregando cronograma...</p>}

      {!loading && !cronograma && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Nenhum cronograma encontrado para este projeto.
        </p>
      )}

      {!loading && cronograma && (
        <>
          <h2>{cronograma.descricao}</h2>
          <p>
            Início: {cronograma.data_inicio} | Fim: {cronograma.data_fim} | Status: {cronograma.status}
          </p>

          <h3>Etapas</h3>
          <ul>
            {etapas.map((etapa) => (
              <li key={etapa.id}>
                <strong>{etapa.nome_etapa}</strong>: {etapa.descricao} ({etapa.status})
                <br />
                {etapa.data_inicio} → {etapa.data_fim}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
