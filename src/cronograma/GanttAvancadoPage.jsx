// src/cronograma/GanttAvancadoPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

const MACROCEL_LABELS = {
  ARQ: "Arquitetura",
  ENG: "Engenharia",
  MAR: "Marcenaria",
};

const MACROCEL_COLORS = {
  ARQ: "#5E9B94",
  ENG: "#2B4580",
  MAR: "#8B5E3C",
};

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(startStr, endStr) {
  const s = new Date(startStr);
  const e = new Date(endStr);
  const diffMs = e.getTime() - s.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export default function GanttAvancadoPage() {
  const { projetoId } = useParams();
  const [cronograma, setCronograma] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [salvandoId, setSalvandoId] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const { data: cronogramaData, error: erroCron } = await supabase
          .from("cronograma_projetos")
          .select("*")
          .eq("projeto_id", projetoId)
          .single();

        if (erroCron) throw erroCron;
        setCronograma(cronogramaData);

        const { data: etapasData, error: erroEtapas } = await supabase
          .from("cronograma_etapas")
          .select("*")
          .eq("cronograma_id", cronogramaData.id)
          .order("ordem", { ascending: true });

        if (erroEtapas) throw erroEtapas;
        setEtapas(etapasData || []);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar o Gantt.");
      } finally {
        setLoading(false);
      }
    }

    if (projetoId) carregar();
  }, [projetoId]);

  // Base temporal do Gantt
  const { baseDate, totalDias } = useMemo(() => {
    if (!etapas.length) {
      const hoje = new Date().toISOString().slice(0, 10);
      return { baseDate: hoje, totalDias: 30 };
    }

    let menor = null;
    let maior = null;

    etapas.forEach((e) => {
      if (e.data_inicio_prevista) {
        if (!menor || e.data_inicio_prevista < menor) menor = e.data_inicio_prevista;
      }
      if (e.data_fim_prevista) {
        if (!maior || e.data_fim_prevista > maior) maior = e.data_fim_prevista;
      }
    });

    if (!menor) menor = new Date().toISOString().slice(0, 10);
    if (!maior) maior = addDays(menor, 30);

    const dias = Math.max(30, diffDays(menor, maior) + 5);
    return { baseDate: menor, totalDias: dias };
  }, [etapas]);

  async function salvarEtapa(etapa) {
    try {
      setSalvandoId(etapa.id);
      const { error } = await supabase
        .from("cronograma_etapas")
        .update({
          data_inicio_prevista: etapa.data_inicio_prevista,
          duracao_prevista_dias: etapa.duracao_prevista_dias,
        })
        .eq("id", etapa.id);

      if (error) throw error;

      // opcional: chamar RPC para recalcular datas encadeadas (se criou calcular_datas_cronograma)
      await supabase.rpc("calcular_datas_cronograma", {
        p_cronograma_id: etapa.cronograma_id,
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar etapa.");
    } finally {
      setSalvandoId(null);
    }
  }

  function atualizarCampoLocal(id, campo, valor) {
    setEtapas((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, [campo]: valor } : e
      )
    );
  }

  if (loading) return <div className="p-6">Carregando Gantt…</div>;
  if (erro) return <div className="p-6 text-red-600">{erro}</div>;
  if (!cronograma) return <div className="p-6">Cronograma não encontrado.</div>;

  const colTemplate = `repeat(${totalDias}, minmax(16px, 1fr))`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Gantt Avançado — {cronograma.id?.slice(0, 8)}
          </h1>
          <p className="text-sm text-slate-600">
            Visão temporal detalhada das etapas da obra.
          </p>
        </div>
        <div className="text-right text-xs">
          <div>Base: {baseDate}</div>
          <div>Janela: {totalDias} dias</div>
        </div>
      </div>

      <div className="text-sm">
        <Link
          to={`/obras/${projetoId}/cronograma`}
          className="text-slate-600 underline"
        >
          ← Voltar para Cronograma
        </Link>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 text-xs text-slate-600">
        {Object.entries(MACROCEL_LABELS).map(([id, nome]) => (
          <div key={id} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: MACROCEL_COLORS[id] }}
            />
            {nome}
          </div>
        ))}
      </div>

      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Header de dias */}
        <div className="grid grid-cols-[220px_1fr] bg-slate-50 border-b">
          <div className="px-3 py-2 text-xs font-semibold text-slate-600">
            Etapas
          </div>
          <div
            className="px-3 py-2 text-[10px] text-slate-500 grid gap-[1px]"
            style={{ gridTemplateColumns: colTemplate }}
          >
            {Array.from({ length: totalDias }).map((_, idx) => {
              const dia = addDays(baseDate, idx);
              return (
                <div key={idx} className="text-center">
                  {dia.slice(5)}{/* mostra MM-DD */}
                </div>
              );
            })}
          </div>
        </div>

        {/* Linhas de etapas */}
        <div>
          {etapas.map((e) => {
            const inicio = e.data_inicio_prevista || baseDate;
            const offset = diffDays(baseDate, inicio);
            const dur = e.duracao_prevista_dias || 1;

            return (
              <div
                key={e.id}
                className="grid grid-cols-[220px_1fr] border-b last:border-0"
              >
                {/* Coluna de infos e edição */}
                <div className="px-3 py-2 text-xs space-y-1 border-r bg-slate-50">
                  <div className="font-semibold text-slate-800">
                    {e.etapa_codigo} · {e.nome}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {MACROCEL_LABELS[e.macrocelula] || e.macrocelula}
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[11px] text-slate-500">
                      Início previsto:
                    </label>
                    <input
                      type="date"
                      value={e.data_inicio_prevista || baseDate}
                      onChange={(ev) =>
                        atualizarCampoLocal(
                          e.id,
                          "data_inicio_prevista",
                          ev.target.value
                        )
                      }
                      className="border rounded px-1 py-[2px] text-[11px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[11px] text-slate-500">
                      Duração (dias):
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={e.duracao_prevista_dias || 1}
                      onChange={(ev) =>
                        atualizarCampoLocal(
                          e.id,
                          "duracao_prevista_dias",
                          Number(ev.target.value || 1)
                        )
                      }
                      className="border rounded px-1 py-[2px] text-[11px] w-16"
                    />
                  </div>

                  <button
                    onClick={() => salvarEtapa(e)}
                    disabled={salvandoId === e.id}
                    className="mt-2 w-full rounded bg-slate-900 text-white text-[11px] py-1 disabled:opacity-60"
                  >
                    {salvandoId === e.id ? "Salvando..." : "Salvar etapa"}
                  </button>
                </div>

                {/* Gantt row */}
                <div
                  className="px-3 py-2 grid items-center"
                  style={{ gridTemplateColumns: colTemplate }}
                >
                  {/* linha de fundo */}
                  {Array.from({ length: totalDias }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-6 border-r border-dashed border-slate-100 last:border-r-0"
                    />
                  ))}

                  {/* barra da etapa */}
                  <div
                    className="h-4 rounded-full shadow-sm"
                    style={{
                      gridColumn: `${offset + 1} / span ${Math.max(
                        1,
                        dur
                      )}`,
                      backgroundColor:
                        MACROCEL_COLORS[e.macrocelula] || "#4B5563",
                      marginTop: "-22px",
                    }}
                  />
                </div>
              </div>
            );
          })}

          {etapas.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              Nenhuma etapa cadastrada para este cronograma.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
