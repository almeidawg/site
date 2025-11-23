import {
  gerarDownloadURL,
  removerArquivo,
  uploadArquivo
} from "../../arquivos/services/arquivosService";
import { useEffect, useState } from "react";

export default function ObraArquivos({ arquivos: arquivosIniciais, obraId }) {
  const [arquivos, setArquivos] = useState(arquivosIniciais);
  const [file, setFile] = useState(null);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    const novo = await uploadArquivo({
      file,
      tipo_relacao: "obra",
      referencia_id: obraId
    });

    setArquivos((prev) => [novo, ...prev]);
    setFile(null);
  }

  async function handleRemove(a) {
    if (!confirm("Remover?")) return;
    await removerArquivo(a.id, a.caminho);
    setArquivos((prev) => prev.filter((x) => x.id !== a.id));
  }

  async function abrir(a) {
    const url = await gerarDownloadURL(a.caminho);
    window.open(url, "_blank");
  }

  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>Arquivos da obra</h2>

      <form onSubmit={handleUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button style={btnEnviar}>Enviar</button>
      </form>

      <div style={{ marginTop: 20 }}>
        {arquivos.length === 0 && <p>Nenhum arquivo enviado.</p>}

        {arquivos.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>Tipo</th>
                <th style={th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {arquivos.map((a) => (
                <tr key={a.id}>
                  <td style={td}>{a.nome_original}</td>
                  <td style={td}>{a.tipo_mime}</td>
                  <td style={td}>
                    <button style={btn} onClick={() => abrir(a)}>
                      Abrir
                    </button>
                    <button
                      style={{ ...btn, background: "#dc2626" }}
                      onClick={() => handleRemove(a)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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

const btnEnviar = {
  marginLeft: 8,
  padding: "6px 12px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "#fff"
};

const btn = {
  marginRight: 6,
  padding: "4px 8px",
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer"
};
