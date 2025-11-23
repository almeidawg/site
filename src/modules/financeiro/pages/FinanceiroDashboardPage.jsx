// src/modules/financeiro/pages/DashboardFinanceiroObras.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarDashboardFinanceiroObras } from "../services/dashboardFinanceiroService";

export default function DashboardFinanceiroObras() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const data = await listarDashboardFinanceiroObras();
        setObras(data);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar o dashboard financeiro.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-600">Carregando dashboard…</div>;
  }

  if (erro) {
    return <div className="p-6 text-red-600">{erro}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Dashboard Financeiro das Obras
          </h1>
          <p className="text-sm text-slate-600">
            Integra contrato, cronograma, marcenaria e lançamentos financeiros.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {obras.map((obra) => {
          const contrato = obra.contrato_total || 0;
          const executado = obra.cronograma_executado || 0;
          const entradas = obra.entradas || 0;
          const saidas = obra.saidas || 0;
          const saldo = obra.saldo_financeiro || 0;
          const marcenaria = obra.marcenaria_total || 0;

          const percExec =
            contrato > 0 ? ((executado / contrato) * 100).toFixed(1) : "0.0";
          const percEntradas =
            contrato > 0 ? ((entradas / contrato) * 100).toFixed(1) : "0.0";
          const percMarcenaria =
            contrato > 0 ? ((marcenaria / contrato) * 100).toFixed(1) : "0.0";

          return (
            <div
              key={obra.projeto_id}
              className="rounded-2xl border bg-white shadow-sm p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {obra.projeto_nome || `Obra ${obra.projeto_id}`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Contrato: R$ {contrato.toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    saldo >= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  Saldo: R$ {saldo.toLocaleString("pt-BR")}
                </span>
              </div>

              {/* Barras de progresso */}
              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Execução física/financeira</span>
                    <span>{percExec}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percExec}%`,
                        backgroundColor: "#0f766e",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Entradas (faturado)</span>
                    <span>{percEntradas}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percEntradas}%`,
                        backgroundColor: "#1d4ed8",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Marcenaria / contrato</span>
                    <span>{percMarcenaria}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percMarcenaria}%`,
                        backgroundColor: "#8b5e3c",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mt-1">
                <div className="space-y-1">
                  <p>
                    Executado (cronograma):{" "}
                    <span className="font-semibold">
                      R$ {executado.toLocaleString("pt-BR")}
                    </span>
                  </p>
                  <p>
                    Entradas:{" "}
                    <span className="font-semibold text-blue-700">
                      R$ {entradas.toLocaleString("pt-BR")}
                    </span>
                  </p>
                  <p>
                    Saídas:{" "}
                    <span className="font-semibold text-red-700">
                      R$ {saidas.toLocaleString("pt-BR")}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    Marcenaria (pedidos):{" "}
                    <span className="font-semibold">
                      R$ {marcenaria.toLocaleString("pt-BR")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Link
                  to={`/obras/${obra.projeto_id}/cronograma`}
                  className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
                >
                  Ver cronograma
                </Link>
                <Link
                  to={`/obras/${obra.projeto_id}/financeiro`}
                  className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
                >
                  Ver financeiro
                </Link>
                <Link
                  to={`/obras/${obra.projeto_id}/gantt`}
                  className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
                >
                  Ver Gantt
                </Link>
              </div>
            </div>
          );
        })}

        {obras.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhuma obra encontrada com dados financeiros.
          </p>
        )}
      </div>
    </div>
  );
}
