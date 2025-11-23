// src/modules/obras/pages/ObrasListaPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function ObrasListaPage() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(false);

  async function carregarObras() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("id, nome, status, cidade, uf")
        .order("nome", { ascending: true });

      if (error) throw error;
      setObras(data || []);
    } catch (err) {
      console.error("Erro ao carregar obras:", err);
      alert("Erro ao carregar obras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarObras();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Obras</h1>

      {loading && <p>Carregando...</p>}

      {!loading && obras.length === 0 && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Nenhuma obra cadastrada ainda.
        </p>
      )}

      {!loading && obras.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            marginTop: 8
          }}
        >
          <thead>
            <tr>
              <th style={th}>Obra</th>
              <th style={th}>Cidade/UF</th>
              <th style={th}>Status</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id}>
                <td style={td}>{obra.nome}</td>
                <td style={td}>
                  {obra.cidade} {obra.uf && `- ${obra.uf}`}
                </td>
                <td style={td}>{obra.status || "-"}</td>
                <td style={td}>
                  <Link
                    to={`/obras/${obra.id}`}
                    style={linkBtn}
                  >
                    Painel
                  </Link>
                  <Link
                    to={`/obras/${obra.id}/arquivos`}
                    style={linkBtn}
                  >
                    Arquivos
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "6px 4px",
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: "6px 4px",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle"
};

const linkBtn = {
  marginRight: 8,
  fontSize: 12,
  textDecoration: "none",
  color: "#2563eb"
};
