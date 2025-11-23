// src/modules/financeiro/pages/ContratosListaPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabaseClient";
import { Link } from "react-router-dom";

export default function ContratosListaPage() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);

  async function carregarContratos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contratos")
        .select("id, numero, cliente_nome, obra_id, valor_total, status")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (err) {
      console.error("Erro ao carregar contratos:", err);
      alert("Erro ao carregar contratos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarContratos();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Contratos</h1>

      {loading && <p>Carregando...</p>}

      {!loading && contratos.length === 0 && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Nenhum contrato cadastrado ainda.
        </p>
      )}

      {!loading && contratos.length > 0 && (
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
              <th style={th}>Número</th>
              <th style={th}>Cliente</th>
              <th style={th}>Obra</th>
              <th style={th}>Valor</th>
              <th style={th}>Status</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((c) => (
              <tr key={c.id}>
                <td style={td}>{c.numero || "-"}</td>
                <td style={td}>{c.cliente_nome || "-"}</td>
                <td style={td}>{c.obra_id || "-"}</td>
                <td style={td}>
                  {c.valor_total != null
                    ? `R$ ${Number(c.valor_total).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2
                      })}`
                    : "-"}
                </td>
                <td style={td}>{c.status || "-"}</td>
                <td style={td}>
                  {c.obra_id && (
                    <Link
                      to={`/obras/${c.obra_id}`}
                      style={{ fontSize: 12, color: "#2563eb" }}
                    >
                      Ir para obra
                    </Link>
                  )}
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
