export function KanbanColumn({ titulo, leads, onDrop }) {
  function allowDrop(e) {
    e.preventDefault();
  }

  function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("lead_id");
    if (!id) return;
    onDrop(id);
  }

  return (
    <div
      onDragOver={allowDrop}
      onDrop={drop}
      className="w-64 min-w-[16rem] bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">{titulo}</h2>
        <span className="text-xs text-gray-500">
          {leads?.length || 0} lead(s)
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {(leads || []).map((l) => (
          <div
            key={l.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("lead_id", l.id)}
            className="p-3 bg-white rounded shadow-sm cursor-move border border-gray-100"
          >
            <p className="font-semibold text-sm text-gray-900">
              {l.nome || "Lead sem nome"}
            </p>
            {l.telefone && (
              <p className="text-xs text-gray-500 mt-1">{l.telefone}</p>
            )}
            {l.email && (
              <p className="text-xs text-gray-500 mt-0.5">{l.email}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
