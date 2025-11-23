import { useEffect, useState } from "react";
import { listarClientes, criarCliente } from "../services/clientesService";

export default function ClientesListaPage() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tipo_cliente: "PF",
    nome: "",
    documento: "",
    email: "",
    telefone: ""
  });

  async function carregarClientes(filtro = "") {
    setLoading(true);
    try {
      const { clientes } = await listarClientes({
        search: filtro,
        page: 1,
        pageSize: 50
      });
      setClientes(clientes);
    } catch (err) {
      console.error("Erro detalhado ao carregar clientes:", err);
      alert("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  function handleBuscar(e) {
    e.preventDefault();
    carregarClientes(busca);
  }

  function handleChangeForm(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSalvarCliente(e) {
    e.preventDefault();
    try {
      const payload = {
        tipo_cliente: form.tipo_cliente || "PF",
        nome: form.nome,
        documento: form.documento || null,
        email: form.email || null,
        telefone: form.telefone || null
      };

      await criarCliente(payload);
      setShowForm(false);
      setForm({
        tipo_cliente: "PF",
        nome: "",
        documento: "",
        email: "",
        telefone: ""
      });
      await carregarClientes();
    } catch (err) {
      console.error("Erro ao criar cliente:", err);
      alert("Erro ao criar cliente.");
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Clientes</h1>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12
        }}
      >
        <form
          onSubmit={handleBuscar}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              minWidth: 260
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#111827",
              color: "#f9fafb",
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Buscar
          </button>
        </form>

        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#2563eb",
            color: "#f9fafb",
            fontSize: 13,
            cursor: "pointer"
          }}
        >
          {showForm ? "Fechar" : "Novo cliente"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSalvarCliente}
          style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          <div>
            <label style={label}>Tipo</label>
            <select
              name="tipo_cliente"
              value={form.tipo_cliente}
              onChange={handleChangeForm}
              style={input}
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>
          <div>
            <label style={label}>Nome</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChangeForm}
              style={input}
              required
            />
          </div>
          <div>
            <label style={label}>Documento</label>
            <input
              name="documento"
              value={form.documento}
              onChange={handleChangeForm}
              style={input}
            />
          </div>
          <div>
            <label style={label}>E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChangeForm}
              style={input}
            />
          </div>
          <div>
            <label style={label}>Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChangeForm}
              style={input}
            />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button
              type="submit"
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#16a34a",
                color: "#f9fafb",
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Salvar
            </button>
          </div>
        </form>
      )}

      {loading && <p>Carregando...</p>}

      {!loading && clientes.length === 0 && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>Nenhum cliente encontrado.</p>
      )}

      {!loading && clientes.length > 0 && (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff"
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ backgroundColor: "#f3f4f6" }}>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>Tipo</th>
                <th style={th}>Documento</th>
                <th style={th}>E-mail</th>
                <th style={th}>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td style={td}>{c.nome}</td>
                  <td style={td}>{c.tipo_cliente}</td>
                  <td style={td}>{c.documento}</td>
                  <td style={td}>{c.email}</td>
                  <td style={td}>{c.telefone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: 13
};

const label = {
  display: "block",
  fontSize: 11,
  marginBottom: 4,
  color: "#6b7280"
};

const input = {
  width: "100%",
  padding: 8,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 13
};
