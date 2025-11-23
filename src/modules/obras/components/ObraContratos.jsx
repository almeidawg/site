export default function ObraContratos({ contratos }) {
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Contratos vinculados</h2>

      {contratos.length === 0 && <p>Nenhum contrato encontrado.</p>}

      {contratos.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Número</th>
              <th style={th}>Tipo</th>
              <th style={th}>Valor</th>
              <th style={th}>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((c) => (
              <tr key={c.id}>
                <td style={td}>{c.numero}</td>
                <td style={td}>{c.tipo}</td>
                <td style={td}>
                  {c.valor_contratado?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </td>
                <td style={td}>{c.clientes?.nome}</td>
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
  padding: 10,
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: 10,
  borderBottom: "1px solid #f3f4f6"
};
