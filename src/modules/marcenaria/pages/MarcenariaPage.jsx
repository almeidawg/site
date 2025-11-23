// src/modules/marcenaria/pages/MarcenariaPage.jsx
import { useEffect, useState } from "react";
import {
  listarAmbientesMarcenaria,
  criarAmbienteMarcenaria,
  listarItensAmbiente,
  criarItemMarcenaria,
  atualizarStatusItemMarcenaria
} from "@/modules/marcenaria/services/marcenariaService";

import { listarContratos } from "@/modules/financeiro/services/financeiroService";

export default function MarcenariaPage() {
  const [contratos, setContratos] = useState([]);
  const [contratoId, setContratoId] = useState("");
  const [ambientes, setAmbientes] = useState([]);
  const [ambienteSelecionado, setAmbienteSelecionado] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formAmbiente, setFormAmbiente] = useState({
    nome: "",
    observacoes: ""
  });

  const [formItem, setFormItem] = useState({
    descricao: "",
    largura_mm: "",
    altura_mm: "",
    profundidade_mm: "",
    quantidade: 1
  });

  // Carregar contratos para vincular ambientes
  useEffect(() => {
    async function carregarContratos() {
      try {
        const data = await listarContratos({});
        setContratos(data);
      } catch (err) {
        console.error("Erro ao carregar contratos para marcenaria:", err);
      }
    }

    carregarContratos();
  }, []);

  // Carregar ambientes quando o contrato mudar
  useEffect(() => {
    if (!contratoId) {
      setAmbientes([]);
      setAmbienteSelecionado(null);
      setItens([]);
      return;
    }

    async function carregarAmbientes() {
      setLoading(true);
      try {
        const data = await listarAmbientesMarcenaria({ contratoId });
        setAmbientes(data);
        if (data.length > 0) {
          setAmbienteSelecionado(data[0]);
          const itens = await listarItensAmbiente(data[0].id);
          setItens(itens);
        } else {
          setAmbienteSelecionado(null);
          setItens([]);
        }
      } catch (err) {
        console.error("Erro ao carregar ambientes:", err);
        alert("Erro ao carregar ambientes de marcenaria.");
      } finally {
        setLoading(false);
      }
    }

    carregarAmbientes();
  }, [contratoId]);

  async function handleSelecionarAmbiente(ambiente) {
    setAmbienteSelecionado(ambiente);
    try {
      const itens = await listarItensAmbiente(ambiente.id);
      setItens(itens);
    } catch (err) {
      console.error("Erro ao carregar itens do ambiente:", err);
      alert("Erro ao carregar itens do ambiente.");
    }
  }

  function handleChangeAmbiente(e) {
    const { name, value } = e.target;
    setFormAmbiente((prev) => ({ ...prev, [name]: value }));
  }

  function handleChangeItem(e) {
    const { name, value } = e.target;
    setFormItem((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSalvarAmbiente(e) {
    e.preventDefault();
    if (!contratoId) {
      alert("Selecione um contrato.");
      return;
    }
    if (!formAmbiente.nome) {
      alert("Informe o nome do ambiente.");
      return;
    }

    try {
      const payload = {
        contrato_id: contratoId,
        nome: formAmbiente.nome,
        observacoes: formAmbiente.observacoes || null
      };

      await criarAmbienteMarcenaria(payload);
      setFormAmbiente({ nome: "", observacoes: "" });

      const data = await listarAmbientesMarcenaria({ contratoId });
      setAmbientes(data);
    } catch (err) {
      console.error("Erro ao criar ambiente:", err);
      alert("Erro ao criar ambiente.");
    }
  }

  async function handleSalvarItem(e) {
    e.preventDefault();
    if (!ambienteSelecionado) {
      alert("Selecione um ambiente.");
      return;
    }
    if (!formItem.descricao) {
      alert("Informe a descrição do item.");
      return;
    }

    try {
      const payload = {
        ambiente_id: ambienteSelecionado.id,
        descricao: formItem.descricao,
        largura_mm: formItem.largura_mm ? Number(formItem.largura_mm) : null,
        altura_mm: formItem.altura_mm ? Number(formItem.altura_mm) : null,
        profundidade_mm: formItem.profundidade_mm ? Number(formItem.profundidade_mm) : null,
        quantidade: formItem.quantidade ? Number(formItem.quantidade) : 1
      };

      await criarItemMarcenaria(payload);
      setFormItem({
        descricao: "",
        largura_mm: "",
        altura_mm: "",
        profundidade_mm: "",
        quantidade: 1
      });

      const itensAtualizados = await listarItensAmbiente(ambienteSelecionado.id);
      setItens(itensAtualizados);
    } catch (err) {
      console.error("Erro ao criar item de marcenaria:", err);
      alert("Erro ao criar item de marcenaria.");
    }
  }

  async function handleAlterarStatusItem(item, novoStatus) {
    try {
      await atualizarStatusItemMarcenaria(item.id, novoStatus);
      const itensAtualizados = await listarItensAmbiente(ambienteSelecionado.id);
      setItens(itensAtualizados);
    } catch (err) {
      console.error("Erro ao atualizar status do item:", err);
      alert("Erro ao atualizar status do item.");
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Marcenaria</h1>

      {/* Seleção de contrato */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>Contrato</label>
        <select
          value={contratoId}
          onChange={(e) => setContratoId(e.target.value)}
          style={input}
        >
          <option value="">Selecione um contrato...</option>
          {contratos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.numero || c.id} — {c.clientes?.nome || "Sem cliente"}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Carregando...</p>}

      {!loading && contratoId && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 2fr",
            gap: 16,
            alignItems: "flex-start"
          }}
        >
          {/* Coluna de ambientes */}
          <div>
            <h2 style={{ fontSize: 14, marginBottom: 8 }}>Ambientes</h2>

            <form
              onSubmit={handleSalvarAmbiente}
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                display: "grid",
                gap: 8
              }}
            >
              <div>
                <label style={label}>Nome do ambiente</label>
                <input
                  name="nome"
                  value={formAmbiente.nome}
                  onChange={handleChangeAmbiente}
                  style={input}
                  required
                />
              </div>
              <div>
                <label style={label}>Observações</label>
                <textarea
                  name="observacoes"
                  value={formAmbiente.observacoes}
                  onChange={handleChangeAmbiente}
                  style={{ ...input, minHeight: 60, resize: "vertical" }}
                />
              </div>
              <div style={{ textAlign: "right" }}>
                <button
                  type="submit"
                  style={btnPrimary}
                >
                  Adicionar ambiente
                </button>
              </div>
            </form>

            <div
              style={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                maxHeight: 380,
                overflowY: "auto"
              }}
            >
              {ambientes.length === 0 && (
                <p style={{ fontSize: 12, color: "#6b7280", padding: 12 }}>
                  Nenhum ambiente cadastrado para este contrato.
                </p>
              )}

              {ambientes.map((amb) => (
                <div
                  key={amb.id}
                  onClick={() => handleSelecionarAmbiente(amb)}
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    backgroundColor:
                      ambienteSelecionado?.id === amb.id ? "#eff6ff" : "#ffffff"
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{amb.nome}</div>
                  {amb.observacoes && (
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {amb.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna de itens */}
          <div>
            <h2 style={{ fontSize: 14, marginBottom: 8 }}>Itens do ambiente</h2>

            {!ambienteSelecionado && (
              <p style={{ fontSize: 12, color: "#6b7280" }}>
                Selecione um ambiente para visualizar e cadastrar itens.
              </p>
            )}

            {ambienteSelecionado && (
              <>
                <div
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {ambienteSelecionado.nome}
                  </div>
                  {ambienteSelecionado.observacoes && (
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {ambienteSelecionado.observacoes}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleSalvarItem}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 8
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={label}>Descrição</label>
                    <input
                      name="descricao"
                      value={formItem.descricao}
                      onChange={handleChangeItem}
                      style={input}
                      required
                    />
                  </div>
                  <div>
                    <label style={label}>Largura (mm)</label>
                    <input
                      name="largura_mm"
                      value={formItem.largura_mm}
                      onChange={handleChangeItem}
                      style={input}
                    />
                  </div>
                  <div>
                    <label style={label}>Altura (mm)</label>
                    <input
                      name="altura_mm"
                      value={formItem.altura_mm}
                      onChange={handleChangeItem}
                      style={input}
                    />
                  </div>
                  <div>
                    <label style={label}>Profundidade (mm)</label>
                    <input
                      name="profundidade_mm"
                      value={formItem.profundidade_mm}
                      onChange={handleChangeItem}
                      style={input}
                    />
                  </div>
                  <div>
                    <label style={label}>Quantidade</label>
                    <input
                      name="quantidade"
                      type="number"
                      min={1}
                      value={formItem.quantidade}
                      onChange={handleChangeItem}
                      style={input}
                    />
                  </div>
                  <div style={{ alignSelf: "end" }}>
                    <button
                      type="submit"
                      style={btnPrimary}
                    >
                      Adicionar item
                    </button>
                  </div>
                </form>

                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    maxHeight: 360,
                    overflowY: "auto"
                  }}
                >
                  {itens.length === 0 && (
                    <p style={{ fontSize: 12, color: "#6b7280", padding: 12 }}>
                      Nenhum item cadastrado neste ambiente.
                    </p>
                  )}

                  {itens.length > 0 && (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 12
                      }}
                    >
                      <thead style={{ backgroundColor: "#f3f4f6" }}>
                        <tr>
                          <th style={th}>Descrição</th>
                          <th style={th}>L (mm)</th>
                          <th style={th}>A (mm)</th>
                          <th style={th}>P (mm)</th>
                          <th style={th}>Qtd</th>
                          <th style={th}>Status</th>
                          <th style={th}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map((item) => (
                          <tr key={item.id}>
                            <td style={td}>{item.descricao}</td>
                            <td style={td}>{item.largura_mm}</td>
                            <td style={td}>{item.altura_mm}</td>
                            <td style={td}>{item.profundidade_mm}</td>
                            <td style={td}>{item.quantidade}</td>
                            <td style={td}>{item.status}</td>
                            <td style={td}>
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleAlterarStatusItem(item, e.target.value)
                                }
                                style={{
                                  fontSize: 11,
                                  padding: 4,
                                  borderRadius: 6,
                                  border: "1px solid #d1d5db"
                                }}
                              >
                                <option value="planejado">Planejado</option>
                                <option value="em_producao">Em produção</option>
                                <option value="instalado">Instalado</option>
                                <option value="ajuste">Ajuste</option>
                                <option value="concluido">Concluído</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!contratoId && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Selecione um contrato para gerenciar ambientes e itens de marcenaria.
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
  padding: 8,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 13
};

const btnPrimary = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  backgroundColor: "#2563eb",
  color: "#f9fafb",
  fontSize: 13,
  cursor: "pointer"
};

const th = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: "6px 8px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: 12
};
