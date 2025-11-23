// src/cronograma/CronogramaPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import StatusSelect from "../components/StatusSelect";

const MACROCEL_LABELS = {
  ARQ: "Arquitetura",
  ENG: "Engenharia",
  MAR: "Marcenaria",
};

const MACROCEL_COLORS = {
  ARQ: "#5E9B94", // Verde Mineral
  ENG: "#2B4580", // Azul Técnico
  MAR: "#8B5E3C", // Marrom Carvalho
};

const STATUS_LABELS = {
  planejado: "Planejado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
  nao_iniciada: "Não iniciada",
  em_execucao: "Em execução",
  pausada: "Pausada",
};

function StatusPill({ status }) {
  if (!status) return null;

  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  let extra = " bg-gray-100 text-gray-700";
  if (["em_andamento", "em_execucao"].includes(status))
    extra = " bg-emerald-100 text-emerald-800";
  if (["concluido", "concluida"].includes(status))
    extra = " bg-blue-100 text-blue-800";
  if (["atrasado", "atrasada"].includes(status))
    extra = " bg-red-100 text-red-800";
  if (["cancelado"].includes(status)) extra = " bg-slate-200 text-slate-700";

  return (
    <span className={`${base} ${extra}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

<Link
  to={`/etapas/${etapa.id}/medicoes`}
  className="text-xs text-blue-600 underline"
>
  Medições
</Link>


function CronogramaPage() {
  // rota tipo: /obras/:projetoId/cronograma
  const { projetoId } = useParams();

  const [cronograma, setCronograma] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroMacrocel, setFiltroMacrocel] = useState("TODOS");

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro("");

        // 1. Buscar cronograma do projeto
        const { data: cronogramaData, error: erroCronograma } = await supabase
          .from("cronograma_projetos")
          .select("*")
          .eq("projeto_id", projetoId)
          .single();

        if (erroCronograma) {
          console.error(erroCronograma);
          throw new Error("Não foi possível carregar o cronograma.");
        }

        setCronograma(cronogramaData);

        // 2. Buscar etapas
        const { data: etapasData, error: erroEtapas } = await supabase
          .from("cronograma_etapas")
          .select("*")
          .eq("cronograma_id", cronogramaData.id)
          .order("ordem", { ascending: true });

        if (erroEtapas) {
          console.error(erroEtapas);
          throw new Error("Não foi possível carregar as etapas.");
        }

        setEtapas(etapasData || []);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }

    if (projetoId) {
      carregarDados();
    }
  }, [projetoId]);

  // função para atualizar o status da etapa
  async function atualizarStatusEtapa(etapaId, novoStatus) {
    const { error } = await supabase
      .from("cronograma_etapas")
      .update({ status: novoStatus })
      .eq("id", etapaId);

    if (error) {
      console.error("Erro ao atualizar status da etapa:", error);
      return;
    }

    setEtapas((prev) =>
      prev.map((e) => (e.id === etapaId ? { ...e, status: novoStatus } : e))
    );
  }

  // filtrar por macrocelula (ARQ / ENG / MAR / TODOS)
  const etapasFiltradas = useMemo(() => {
    if (filtroMacrocel === "TODOS") return etapas;
    return etapas.filter((e) => e.macrocelula === filtroMacrocel);
  }, [etapas, filtroMacrocel]);

  // calcular duração máxima para o mini-Gantt
  const duracaoMax = useMemo(() => {
    if (!etapas.length) return 1;
    return Math.max(...etapas.map((e) => e.duracao_prevista_dias || 1));
  }, [etapas]);

  // total financeiro planejado (soma das etapas)
  const totalFinanceiro = useMemo(
    () => etapas.reduce((acc, e) => acc + (e.valor_planejado || 0), 0),
    [etapas]
  );

  // total financeiro real executado
  const totalExecutado = useMemo(
    () => etapas.reduce((acc, e) => acc + (e.valor_real || 0), 0),
    [etapas]
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Carregando cronograma…</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          Ocorreu um erro ao carregar o cronograma: {erro}
        </p>
      </div>
    );
  }

  if (!cronograma) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">
          Nenhum cronograma encontrado para este projeto.
        </p>
      </div>
    );
  }

  const percentual = Number(cronograma.percentual_execucao || 0).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Cronograma da Obra
          </h1>
          <p className="text-sm text-slate-600">
            Modelo Turn Key WG Premium ·{" "}
            <span className="font-medium">
              {cronograma.data_inicio_prevista
                ? `Início previsto: ${cronograma.data_inicio_prevista}`
                : "Início ainda não definido"}
            </span>
          </p>

          {cronograma.valor_total_contrato && (
            <>
              <p className="mt-1 text-xs text-slate-500">
                Valor total alocado no cronograma:{" "}
                <span className="font-semibold">
                  R{"$ "}
                  {totalFinanceiro.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-emerald-700">
                Valor executado:{" "}
                <span className="font-semibold">
                  R{"$ "}
                  {totalExecutado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
            </>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <StatusPill status={cronograma.status} />
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-medium">{percentual}%</span>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              concluído
            </span>
          </div>
        </div>
      </div>

      {/* Filtro de macro-células */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase text-slate-500">
          Macro-célula
        </span>
        {["TODOS", "ARQ", "ENG", "MAR"].map((macro) => {
          const isActive = filtroMacrocel === macro;
          const label = macro === "TODOS" ? "Todas" : MACROCEL_LABELS[macro];
          const base =
            "px-3 py-1 rounded-full border text-xs font-medium cursor-pointer transition";
          const active =
            "border-slate-900 bg-slate-900 text-white shadow-sm";
          const inactive =
            "border-slate-200 bg-white text-slate-700 hover:border-slate-400";

          return (
            <button
              key={macro}
              type="button"
              onClick={() => setFiltroMacrocel(macro)}
              className={`${base} ${isActive ? active : inactive}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Legenda de cores */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
        {Object.entries(MACROCEL_LABELS).map(([id, nome]) => (
          <div key={id} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: MACROCEL_COLORS[id] }}
            />
            <span>{nome}</span>
          </div>
        ))}
      </div>

      {/* Tabela + Mini Gantt */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Cabeçalho da tabela (desktop) */}
        <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 md:grid md:grid-cols-[0.5fr_2fr_1.8fr_3fr] md:gap-4">
          <span>Etapa</span>
          <span>Descrição</span>
          <span>Duração / Valor / Risco</span>
          <span>Linha do tempo</span>
        </div>

        {/* Linhas */}
        <div className="divide-y divide-slate-100">
          {etapasFiltradas.map((etapa) => {
            const corBarra = MACROCEL_COLORS[etapa.macrocelula] || "#4B5563";
            const largura =
              ((etapa.duracao_prevista_dias || 1) / duracaoMax) * 100;

            return (
              <div
                key={etapa.id}
                className="px-4 py-3 text-sm md:grid md:grid-cols-[0.5fr_2fr_1.8fr_3fr] md:gap-4"
              >
                {/* Coluna 1 - Código / Nome / Macro-célula + Status */}
                <div className="mb-2 flex flex-col gap-1 md:mb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {etapa.etapa_codigo}
                    </span>
                    <StatusPill status={etapa.status} />
                  </div>
                  <div className="font-medium text-slate-900">
                    {etapa.nome}
                  </div>
                  <div className="text-xs text-slate-500">
                    {MACROCEL_LABELS[etapa.macrocelula] ||
                      etapa.macrocelula}
                  </div>
                  {/* Select de status */}
                  <div className="mt-1">
                    <StatusSelect
                      value={etapa.status}
                      onChange={(novoStatus) =>
                        atualizarStatusEtapa(etapa.id, novoStatus)
                      }
                    />
                  </div>
                </div>

                {/* Coluna 2 - Descrição */}
                <div className="mb-2 text-xs text-slate-600 md:mb-0">
                  {etapa.descricao}
                </div>

                {/* Coluna 3 - Duração + Valor financeiro + datas + risco */}
                <div className="mb-2 flex flex-col text-xs text-slate-700 md:mb-0 space-y-1">
                  <span className="font-medium">
                    {etapa.duracao_prevista_dias} dia(s)
                  </span>

                  {cronograma.valor_total_contrato && (
                    <>
                      <span className="text-slate-700">
                        Valor planejado:{" "}
                        <span className="font-semibold">
                          R{"$ "}
                          {Number(
                            etapa.valor_planejado || 0
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </span>
                      <span className="text-emerald-700">
                        Valor executado:{" "}
                        <span className="font-semibold">
                          R{"$ "}
                          {Number(
                            etapa.valor_real || 0
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </span>
                    </>
                  )}

                  {etapa.data_inicio_prevista && (
                    <span className="text-slate-500">
                      {etapa.data_inicio_prevista} →{" "}
                      {etapa.data_fim_prevista || "—"}
                    </span>
                  )}

                  {(etapa.risco || etapa.impacto_dias) && (
                    <span className="text-xs text-red-600">
                      Risco: {Number(etapa.risco || 0).toFixed(1)}% · Impacto:{" "}
                      {etapa.impacto_dias || 0} dia(s)
                    </span>
                  )}
                </div>

                {/* Coluna 4 - Mini Gantt */}
                <div className="flex items-center">
                  <div className="relative h-3 w-full rounded-full bg-slate-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${largura}%`,
                        backgroundColor: corBarra,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {etapasFiltradas.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              Nenhuma etapa encontrada para o filtro selecionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CronogramaPage;
