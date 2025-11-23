// src/modules/obras/pages/ObrasPainelPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function ObraPainelPage() {
  const { id } = useParams();
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(false);

  async function carregarObra() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("id, nome, status, cidade, uf, data_inicio, data_fim")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setObra(data);
    } catch (err) {
      console.error("Erro ao carregar obra:", err);
      alert("Erro ao carregar obra.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) carregarObra();
  }, [id]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Painel da Obra</h1>

      {loading && <p>Carregando...</p>}

      {!loading && !obra && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Obra não encontrada.
        </p>
      )}

      {!loading && obra && (
        <>
          <p style={{ fontSize: 14, marginBottom: 12 }}>
            <strong>{obra.nome}</strong>
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 16
            }}
          >
            <div style={card}>
              <div style={cardLabel}>Status</div>
              <div style={cardValue}>{obra.status || "-"}</div>
            </div>
            <div style={card}>
              <div style={cardLabel}>Cidade/UF</div>
              <div style={cardValue}>
                {obra.cidade} {obra.uf && `- ${obra.uf}`}
              </div>
            </div>
            <div style={card}>
              <div style={cardLabel}>Período</div>
              <div style={cardValue}>
                {obra.data_inicio || "-"}{" "}
                {obra.data_fim && ` → ${obra.data_fim}`}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 13 }}>
            <Link
              to={`/obras/${obra.id}/arquivos`}
              style={{
                textDecoration: "none",
                color: "#2563eb",
                marginRight: 12
              }}
            >
              Ver arquivos da obra
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  padding: 12,
  border: "1px solid #e5e7eb"
};

const cardLabel = {
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 4
};

const cardValue = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827"
};
