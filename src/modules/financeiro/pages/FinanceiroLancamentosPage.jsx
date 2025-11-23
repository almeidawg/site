// src/modules/financeiro/pages/FinanceiroLancamentosPage.jsx
import { useEffect, useState } from "react";
import {
  listarLancamentosFinanceiros,
  criarLancamentoFinanceiro
} from "../services/financeiroService";

export default function FinanceiroLancamentosPage() {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipo: "receita",
    data_prevista: new Date().toISOString().slice(0, 10),
    valor: "",
    descricao: ""
  });

  async function carregarLancamentos() {
    setLoading(true);
    try {
      const data = await listarLancamentosFinanceiros({});
      setLancamentos(data);
    } catch (err) {
      console.error("Erro ao carregar lançamentos:", err);
      alert("Erro ao carregar lançamentos financeiros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarLancamentos();
  }, []);

  function handleChangeForm(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!form.valor || isNaN(Number(form.valor))) {
      alert("Informe um valor válido.");
      return;
    }

    try {
      await criarLancamentoFinanceiro({
        tipo: form.tipo,
        data_prevista: form.data_prevista,
        valor: Number(form.valor),
        descricao: form.descricao || null,
        conta_id: 1, // ajuste depois para conta real
        categoria_id: null,
        obra_id: null,
        contrato_id: null,
        cliente_id: null,
        status: "confirmado"
      });

      setForm((prev) => ({
        ...prev,
        valor: "",
        descricao: ""
      }));

      await carregarLancamentos();
    } catch (err) {
      console.error("Erro ao salvar lançamento:", err);
      alert("Erro ao salvar lançamento financeiro.");
    }
  }

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "receita")
    .reduce((sum, l) => sum + (l.valor || 0), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "despesa")
    .reduce((sum, l) => sum + (l.valor || 0), 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Financeiro – Lançamentos</h1>

      {/* Resumo */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap"
        }}
      >
        <ResumoCard
          titulo="Receitas"
          valor={totalReceitas}
          cor="#16a34a"
        />
        <ResumoCard
          titulo="Despesas"
          valor={totalDespesas}
          cor="#dc2626"
        />
        <ResumoCard
          titulo="Saldo"
          valor={saldo}
          cor={saldo >= 0 ? "#16a34a" : "#dc2626"}
        />
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSalvar}
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
            name="tipo"
            value={form.tipo}
            onChange={handleChangeForm}
            style={input}
          >
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div>
          <label style={label}>Data prevista</label>
          <input
            type="date"
            name="data_prevista"
            value={form.data_prevista}
            onChange={handleChangeForm}
            style={input}
          />
        </div>
        <div>
          <label style={label}>Valor (R$)</label>
          <input
            name="valor"
            value={form.valor}
            onChange={handleChangeForm}
            style={input}
          />
        </div>
        <div>
          <label style={label}>Descrição</label>
          <input
            name="descricao"
            value={form.descricao}
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
            Registrar
          </button>
        </div>
      </form>

      {/* Tabela */}
      {loading && <p>Carregando...</p>}

      {!loading && lancamentos.length === 0 && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>Nenhum lançamento registrado.</p>
      )}

      {!loading && lancamentos.length > 0 && (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff"
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13
            }}
          >
            <thead style={{ backgroundColor: "#f3f4f6" }}>
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
                    {l.valor
                      ? l.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        })
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ResumoCard({ titulo, valor, cor }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 180,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        padding: 12
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{titulo}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: cor }}>
        {valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: "8px 10px",
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
