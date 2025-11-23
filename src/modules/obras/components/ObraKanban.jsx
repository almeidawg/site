import { useEffect, useState } from "react";
import { carregarBoardCompleto } from "../../kanban/services/kanbanService";

export default function ObraKanban({ obraId }) {
  const [listas, setListas] = useState([]);

  async function carregar() {
    try {
      const data = await carregarBoardCompleto("obra-" + obraId);
      setListas(data || []);
    } catch (e) {
      console.warn("Nenhum quadro de kanban específico da obra.");
    }
  }

  useEffect(() => {
      carregar();
  }, [obraId]);

  if (listas.length === 0)
    return <p>Nenhum quadro de Kanban configurado para esta obra.</p>;

  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
      {listas.map((l) => (
        <div key={l.id} style={coluna}>
          <div style={titulo}>{l.titulo}</div>
          {l.kanban_cards?.map((c) => (
            <div key={c.id} style={card}>{c.titulo}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

const coluna = {
  minWidth: 240,
  padding: 12,
  borderRadius: 12,
  background: "#f9fafb",
  border: "1px solid #e5e7eb"
};

const titulo = {
  fontWeight: 600,
  marginBottom: 12
};

const card = {
  background: "#fff",
  padding: 8,
  borderRadius: 8,
  marginBottom: 8,
  border: "1px solid #e5e7eb",
  fontSize: 13
};
