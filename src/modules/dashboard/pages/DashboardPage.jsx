// src/modules/dashboard/pages/DashboardPage.jsx

export default function DashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Dashboard</h1>

      <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 24 }}>
        Bem-vindo ao WGEasy – Gestão integrada WG Almeida.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        <div style={card}>
          <div style={cardTitle}>Obras</div>
          <div style={cardSubtitle}>Execução turnkey, controle e andamento.</div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Marcenaria</div>
          <div style={cardSubtitle}>
            Produção, instalação e pedidos sob medida.
          </div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Financeiro</div>
          <div style={cardSubtitle}>Fluxo de caixa, lançamentos e valores.</div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Kanban</div>
          <div style={cardSubtitle}>Fluxo operacional do time.</div>
        </div>
      </div>
    </div>
  );
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  padding: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 2px rgba(15,23,42,0.06)"
};

const cardTitle = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 6,
  color: "#1f2937"
};

const cardSubtitle = {
  fontSize: 12,
  color: "#6b7280"
};
