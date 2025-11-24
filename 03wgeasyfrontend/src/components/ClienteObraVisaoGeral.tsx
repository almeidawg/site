import { ClienteObra } from "../hooks/useClienteObra";

type Props = { obra: ClienteObra };

export function ClienteObraVisaoGeral({ obra }: Props) {
  const statusLabel =
    obra.status === "planejamento"
      ? "Planejamento"
      : obra.status === "execucao"
      ? "Em execução"
      : "Finalizada";

  const statusColor =
    obra.status === "planejamento"
      ? "bg-sky-100 text-sky-700"
      : obra.status === "execucao"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className="grid gap-4 md:grid-cols-3 mt-4">
      <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Projeto / Obra
            </div>
            <div className="text-xl font-semibold">{obra.nome_obra}</div>
          </div>

          <span className={`px-3 py-1 text-xs rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="bg-slate-950 text-slate-50 rounded-2xl p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Suporte
        </div>
        <div className="text-sm mt-2">
          contato@wgalmeida.com.br  
          <br />
          (11) 00000-0000
        </div>
      </div>
    </div>
  );
}
