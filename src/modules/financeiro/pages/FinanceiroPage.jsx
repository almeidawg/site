// src/modules/financeiro/pages/FinanceiroPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getResumoFinanceiro,
  listarPagamentos,
  criarPagamento,
  removerPagamento,
} from "../services/financeiroService";

export default function FinanceiroPage() {
  const { projetoId } = useParams();

  const [resumo, setResumo] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [categoria, setCategoria] = useState("");
  const [obs, setObs] = useState("");

  async function carregar() {
    const r = await getResumoFinanceiro(projetoId);
    setResumo(r);

    const p = await listarPagamentos(projetoId);
    setPagamentos(p);
  }

  async function adicionarPagamento(e) {
    e.preventDefault();

    await criarPagamento({
      projeto_id: projetoId,
      valor: Number(valor),
      tipo,
      categoria,
      observacao: obs,
    });

    setValor("");
    setObs("");
    carregar();
  }

  async function excluir(id) {
    await removerPagamento(id);
    carregar();
  }

  useEffect(() => {
    carregar();
  }, [projetoId]);

  if (!resumo)
    return <div className="p-6 text-slate-600">Carregando financeiro…</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <h1 className="text-2xl font-semibold text-slate-900">
        Financeiro da Obra
      </h1>

      {/* Resumo */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500">Contrato Total</p>
          <p className="text-xl font-bold">
            R$ {resumo.contrato_total.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500">Executado (Cronograma)</p>
          <p className="text-xl font-bold text-emerald-700">
            R$ {resumo.executado_cronograma.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500">Entradas</p>
          <p className="text-xl font-bold text-blue-700">
            R$ {resumo.entradas.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500">Saídas</p>
          <p className="text-xl font-bold text-red-700">
            R$ {resumo.saidas.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form
        onSubmit={adicionarPagamento}
        className="p-4 border rounded-xl bg-white shadow space-y-3"
      >
        <h2 className="text-sm font-semibold text-slate-700">
          Novo lançamento
        </h2>

        <div className="grid md:grid-cols-4 gap-3">
          <input
            type="number"
            placeholder="Valor"
            className="border p-2 rounded"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input
            type="text"
            placeholder="Categoria"
            className="border p-2 rounded"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
          <input
            type="text"
            placeholder="Observação"
            className="border p-2 rounded"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </div>

        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg">
          Registrar
        </button>
      </form>

      {/* Lista de pagamentos */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Lançamentos</h2>

        {pagamentos.map((p) => (
          <div
            key={p.id}
            className="p-3 border rounded-lg bg-white shadow-sm flex justify-between"
          >
            <div>
              <p className="font-semibold">
                R$ {Number(p.valor).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-slate-500">{p.categoria}</p>
              <p className="text-xs text-slate-400">{p.observacao}</p>
            </div>

            <button
              onClick={() => excluir(p.id)}
              className="text-red-600 text-xs"
            >
              excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
