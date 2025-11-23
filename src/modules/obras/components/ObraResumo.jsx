export default function ObraResumo({ obra }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "#fff"
      }}
    >
      <h2 style={h2}>Informações da Obra</h2>

      <p><strong>Cliente:</strong> {obra.clientes?.nome}</p>
      <p><strong>Status:</strong> {obra.status}</p>
      <p><strong>Cidade:</strong> {obra.cidade}</p>
      <p><strong>Estado:</strong> {obra.estado}</p>

      <p style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
        Criada em {obra.created_at?.slice(0, 10)}
      </p>
    </div>
  );
}

const h2 = {
  fontSize: 18,
  marginBottom: 12
};
