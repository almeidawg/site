// src/modules/financeiro/pages/FinanceiroPage.jsx
import React, { useEffect, useState } from "react";
import {
  listarLancamentos,
  removerLancamento,
  listarCategorias,
  listarObras,
} from "../services/financeiroService";
import NovoLancamentoDialog from "../components/NovoLancamentoDialog";

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterProject, setFilterProject] = useState("");

  async function carregar() {
    setLoading(true);
    try {
      const filters = {};
      if (searchText) filters.searchText = searchText;
      if (filterType) filters.type = filterType;
      if (filterProject) filters.projectId = filterProject;

      const [lancamentosData, categoriasData, obrasData] = await Promise.all([
        listarLancamentos(filters),
        listarCategorias(),
        listarObras(),
      ]);

      setLancamentos(lancamentosData);
      setCategorias(categoriasData);
      setObras(obrasData);
    } catch (err) {
      console.error("Erro ao carregar financeiro:", err);
      alert("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(id) {
    if (!confirm("Deseja realmente excluir este lançamento?")) return;

    try {
      await removerLancamento(id);
      carregar();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir lançamento");
    }
  }

  function handleNovo() {
    setDialogOpen(true);
  }

  function handleDialogClose(saved) {
    setDialogOpen(false);
    if (saved) carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  // Calcular resumo
  const resumo = lancamentos.reduce(
    (acc, item) => {
      const valor = Number(item.amount) || 0;
      if (item.type === "income") {
        acc.receitas += valor;
      } else if (item.type === "expense") {
        acc.despesas += valor;
      }
      return acc;
    },
    { receitas: 0, despesas: 0 }
  );
  resumo.saldo = resumo.receitas - resumo.despesas;

  if (loading) {
    return (
      <div className="p-6 text-slate-600">Carregando lançamentos financeiros...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Financeiro - Lançamentos
        </h1>
        <button
          onClick={handleNovo}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          + Novo Lançamento
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total Receitas</p>
          <p className="text-2xl font-bold text-emerald-600">
            {resumo.receitas.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total Despesas</p>
          <p className="text-2xl font-bold text-red-600">
            {resumo.despesas.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Saldo</p>
          <p
            className={`text-2xl font-bold ${
              resumo.saldo >= 0 ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {resumo.saldo.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 border rounded-xl bg-white shadow-sm">
        <div className="grid md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Buscar descrição..."
            className="border p-2 rounded text-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="">Todas as obras</option>
            {obras.map((obra) => (
              <option key={obra.id} value={obra.id}>
                {obra.nome}
              </option>
            ))}
          </select>

          <button
            onClick={carregar}
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded text-sm font-medium transition"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Data
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Descrição
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Tipo
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Obra
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Categoria
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">
                Valor
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3">
                  {item.occurred_at
                    ? new Date(item.occurred_at).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td className="px-4 py-3">{item.description || "-"}</td>
                <td className="px-4 py-3">
                  {item.type === "income" ? (
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
                      Receita
                    </span>
                  ) : item.type === "expense" ? (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                      Despesa
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.project?.nome || "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.category?.name || "-"}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    item.type === "income" ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {typeof item.amount === "number"
                    ? item.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleExcluir(item.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}

            {!lancamentos.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nenhum lançamento encontrado.
                  <br />
                  <button
                    onClick={handleNovo}
                    className="mt-2 text-slate-900 underline"
                  >
                    Criar primeiro lançamento
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog de Novo Lançamento */}
      {dialogOpen && (
        <NovoLancamentoDialog
          onClose={handleDialogClose}
          categorias={categorias}
          obras={obras}
        />
      )}
    </div>
  );
}
