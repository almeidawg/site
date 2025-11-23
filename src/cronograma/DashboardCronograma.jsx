// src/cronograma/DashboardCronograma.jsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../config/supabaseClient";

export default function DashboardCronograma({ cronogramaId }) {
  const [etapas, setEtapas] = useState([]);
  const [cronograma, setCronograma] = useState(null);

  // carregar dados
  useEffect(() => {
    async function fetchData() {
      const { data: c } = await supabase
        .from("cronograma_projetos")
        .select("*")
        .eq("id", cronogramaId)
        .single();

      const { data: e } = await supabase
        .from("cronograma_etapas")
        .select("*")
        .eq("cronograma_id", cronogramaId);

      setCronograma(c);
      setEtapas(e || []);
    }

    if (cronogramaId) fetchData();
  }, [cronogramaId]);

  // progresso físico
  const progressoFisico = useMemo(() => {
    if (!etapas.length) return 0;

    const somaPesos = etapas.reduce((acc, e) => acc + (e.peso || 0), 0);
    const progresso = etapas.reduce((acc, e) => {
      const fator =
        e.status === "concluida" || e.status === "concluido"
          ? 1
          : e.status === "em_execucao"
          ? 0.5
          : 0;
      return acc + fator * (e.peso || 0);
    }, 0);

    return ((progresso / somaPesos) * 100).toFixed(1);
  }, [etapas]);

  // progresso financeiro
  const progressoFinanceiro = useMemo(() => {
    const planejado = etapas.reduce(
      (acc, e) => acc + (e.valor_planejado || 0),
      0
    );
    const executado = etapas.reduce(
      (acc, e) => acc + (e.valor_real || 0),
      0
    );
    if (planejado === 0) return 0;

    return ((executado / planejado) * 100).toFixed(1);
  }, [etapas]);

  // risco
  const etapasCriticas = useMemo(() => {
    return [...etapas]
      .filter((e) => (e.risco || 0) > 0)
      .sort((a, b) => b.risco - a.risco)
      .slice(0, 5);
  }, [etapas]);

  // macros
  const valoresMacrocelula = useMemo(() => {
    return {
      ARQ: etapas
        .filter((e) => e.macrocelula === "ARQ")
        .reduce((acc, e) => acc + (e.valor_planejado || 0), 0),
      ENG: etapas
        .filter((e) => e.macrocelula === "ENG")
        .reduce((acc, e) => acc + (e.valor_planejado || 0), 0),
      MAR: etapas
        .filter((e) => e.macrocelula === "MAR")
        .reduce((acc, e) => acc + (e.valor_planejado || 0), 0),
    };
  }, [etapas]);

  return (
    <div className="space-y-6 p-4">
      {/* Progresso */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow">
          <h2 className="text-sm font-semibold text-slate-600">
            Progresso Físico
          </h2>
          <p className="text-3xl font-bold text-slate-900">
            {progressoFisico}%
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow">
          <h2 className="text-sm font-semibold text-slate-600">
            Progresso Financeiro
          </h2>
          <p className="text-3xl font-bold text-emerald-700">
            {progressoFinanceiro}%
          </p>
        </div>
      </div>

      {/* Financeiro por macro-célula */}
      <div className="rounded-xl border bg-white p-4 shadow">
        <h2 className="text-sm font-semibold text-slate-600">
          Distribuição Financeira por Área
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>Arquitetura: R$ {valoresMacrocelula.ARQ.toLocaleString("pt-BR")}</li>
          <li>Engenharia: R$ {valoresMacrocelula.ENG.toLocaleString("pt-BR")}</li>
          <li>Marcenaria: R$ {valoresMacrocelula.MAR.toLocaleString("pt-BR")}</li>
        </ul>
      </div>

      {/* Etapas críticas */}
      <div className="rounded-xl border bg-white p-4 shadow">
        <h2 className="text-sm font-semibold text-red-700">
          Etapas com Maior Risco
        </h2>

        {etapasCriticas.length === 0 ? (
          <p className="text-xs text-slate-500 mt-1">Nenhum risco detectado.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {etapasCriticas.map((e) => (
              <li key={e.id} className="border-b pb-2">
                <div className="font-semibold text-slate-800">{e.nome}</div>
                <div className="text-xs text-red-600">
                  Risco: {e.risco}% — Impacto: {e.impacto_dias} dias
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
