export default function ObraFinanceiro({ lancamentos }) {
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Financeiro da Obra</h2>

      {lancamentos.length === 0 && <p>Nenhum lançamento financeiro.</p>}

      {lancamentos.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Data</th>
              <th style={th}>Tipo</th>
              <th style={th}>Descrição</th>
              <th style={th}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((l) => (
              <tr key={l.id}>
                <td style={td}>{l.data_prevista}</td>
                <td style={td}>{l.tipo}</td>
                <td style={td}>{l.descricao}</td>
                <td style={td}>
                  {l.valor?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
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
  padding: 8,
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left"
};

const td = {
  padding: 8,
  borderBottom: "1px solid #f3f4f6"
};
