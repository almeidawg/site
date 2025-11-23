import { useEffect, useState } from "react";
import {
  uploadArquivo,
  listarArquivos,
  removerArquivo,
  gerarDownloadURL
} from "../services/arquivosService";
import { listarObras } from "../../obras/services/obrasService";

export default function ArquivosObraPage() {
  const [obras, setObras] = useState([]);
  const [obraId, setObraId] = useState("");
  const [arquivos, setArquivos] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function carregarObras() {
    const { obras } = await listarObras({ page: 1, pageSize: 300 });
    setObras(obras);
  }

  async function carregarArquivos() {
    if (!obraId) return;
    const data = await listarArquivos("obra", obraId);
    setArquivos(data);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("Selecione um arquivo.");
    if (!obraId) return alert("Selecione uma obra.");

    setLoading(true);
    try {
      await uploadArquivo({
        file,
        tipo_relacao: "obra",
        referencia_id: obraId
      });

      setFile(null);
      await carregarArquivos();
    } catch (err) {
      alert("Erro ao enviar arquivo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemover(arq) {
    if (!confirm("Remover arquivo?")) return;

    await removerArquivo(arq.id, arq.caminho);
    await carregarArquivos();
  }

  async function handleDownload(arq) {
    const url = await gerarDownloadURL(arq.caminho);
    window.open(url, "_blank");
  }

  useEffect(() => {
    carregarObras();
  }, []);

  useEffect(() => {
    carregarArquivos();
  }, [obraId]);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Arquivos da Obra</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={label}>Obra</label>
        <select
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          style={input}
        >
          <option value="">Selecione...</option>
          {obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
      </div>

      {obraId && (
        <form onSubmit={handleUpload} style={{ marginBottom: 20 }}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button style={btn} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      )}

      <div
        style={{
          borderRadius: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff"
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Arquivos</h2>

        {arquivos.length === 0 && (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            Nenhum arquivo enviado para esta obra.
          </p>
        )}

        {arquivos.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>Tipo</th>
                <th style={th}>Tamanho</th>
                <th style={th}>Data</th>
                <th style={th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {arquivos.map((a) => (
                <tr key={a.id}>
                  <td style={td}>{a.nome_original}</td>
                  <td style={td}>{a.tipo_mime}</td>
                  <td style={td}>{(a.tamanho_bytes / 1024).toFixed(1)} KB</td>
                  <td style={td}>{a.created_at.slice(0, 10)}</td>
                  <td style={td}>
                    <button
                      style={btnMini}
                      onClick={() => handleDownload(a)}
                    >
                      Abrir
                    </button>

                    <button
                      style={{ ...btnMini, backgroundColor: "#dc2626" }}
                      onClick={() => handleRemover(a)}
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

const label = {
  display: "block",
  fontSize: 12,
  marginBottom: 4,
  color: "#6b7280"
};

const input = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  minWidth: 200
};

const th = {
  textAlign: "left",
  padding: 8,
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: 8,
  borderBottom: "1px solid #f3f4f6",
  fontSize: 13
};

const btn = {
  marginLeft: 8,
  padding: "6px 14px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer"
};

const btnMini = {
  padding: "4px 8px",
  marginRight: 6,
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontSize: 12,
  cursor: "pointer"
};
