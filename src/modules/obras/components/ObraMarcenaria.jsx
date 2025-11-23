export default function ObraMarcenaria({ ambientes }) {
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Marcenaria – Ambientes</h2>

      {ambientes.length === 0 && <p>Nenhum ambiente para esta obra.</p>}

      {ambientes.length > 0 && (
        <ul>
          {ambientes.map((a) => (
            <li key={a.id} style={{ marginBottom: 8 }}>
              <strong>{a.nome}</strong> — {a.status || "planejado"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
