// src/modules/kanban/pages/KanbanBoardPage.jsx
import { useEffect, useState } from "react";
import {
  listarBoardsKanban,
  carregarBoardCompleto
} from "../services/kanbanService";

export default function KanbanBoardPage() {
  const [boards, setBoards] = useState([]);
  const [boardSelecionado, setBoardSelecionado] = useState("");
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(false);

  async function carregarBoards() {
    try {
      const data = await listarBoardsKanban({});
      setBoards(data);
      if (data.length > 0) {
        setBoardSelecionado(data[0].id);
      }
    } catch (err) {
      console.error("Erro ao carregar boards Kanban:", err);
      alert("Erro ao carregar boards Kanban.");
    }
  }

  async function carregarBoard(id) {
    if (!id) {
      setListas([]);
      return;
    }
    setLoading(true);
    try {
      const listas = await carregarBoardCompleto(id);
      setListas(listas);
    } catch (err) {
      console.error("Erro ao carregar board:", err);
      alert("Erro ao carregar board.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarBoards();
  }, []);

  useEffect(() => {
    if (boardSelecionado) {
      carregarBoard(boardSelecionado);
    }
  }, [boardSelecionado]);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Kanban</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={label}>Board</label>
        <select
          value={boardSelecionado}
          onChange={(e) => setBoardSelecionado(e.target.value)}
          style={input}
        >
          <option value="">Selecione um board...</option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Carregando...</p>}

      {!loading && boardSelecionado && (
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            overflowX: "auto"
          }}
        >
          {listas.map((lista) => (
            <div
              key={lista.id}
              style={{
                minWidth: 240,
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                padding: 8,
                border: "1px solid #e5e7eb"
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: 13
                }}
              >
                {lista.titulo}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lista.kanban_cards?.map((card) => (
                  <div
                    key={card.id}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      padding: 8,
                      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
                      fontSize: 13
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {card.titulo}
                    </div>
                    {card.descricao && (
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {card.descricao}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !boardSelecionado && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Nenhum board selecionado. Crie um registro em <strong>kanban_boards</strong>{" "}
          no Supabase para começar a usar.
        </p>
      )}
    </div>
  );
}

const label = {
  display: "block",
  fontSize: 11,
  marginBottom: 4,
  color: "#6b7280"
};

const input = {
  width: "100%",
  maxWidth: 320,
  padding: 8,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 13
};
