import { useParams } from "react-router-dom";
import { KanbanBoard } from "../components/KanbanBoard";

export default function CronoProjetoTarefasPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <div className="p-4 text-sm text-red-500">
        Projeto não encontrado.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">
          Cronograma / Kanban
        </h1>
      </header>

      <section className="flex-1 overflow-auto">
        <KanbanBoard projectId={projectId} />
      </section>
    </div>
  );
}
