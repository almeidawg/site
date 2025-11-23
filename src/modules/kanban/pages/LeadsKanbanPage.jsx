import { useKanban } from "../hooks/useKanban";
import { KanbanColumn } from "../components/KanbanColumn";
import { NewLeadForm } from "../components/NewLeadForm";

export default function LeadsKanbanPage() {
  const { status, leads, loading, error, mover, criarLead } = useKanban();

  return (
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-2xl font-semibold mb-4">
        Kanban de Leads &amp; Oportunidades
      </h1>

      <NewLeadForm onCreate={criarLead} />

      {loading && (
        <p className="text-sm text-gray-500 mb-4">
          Carregando colunas e leads...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mb-4">
          Ocorreu um erro ao carregar o Kanban. Verifique o console.
        </p>
      )}

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 pb-4">
          {status.map((s) => (
            <KanbanColumn
              key={s.id}
              titulo={s.nome}
              leads={leads.filter((l) => l.status_id === s.id)}
              onDrop={(id) => mover(id, s.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
