// src/components/pages/Obras.jsx
import React from "react";
import KanbanObras from "../kanban/KanbanObras";

function Obras() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Obras</h1>
      <p className="text-muted-foreground mb-4">
        Painel de acompanhamento das obras.
      </p>

      <KanbanObras />
    </div>
  );
}

export default Obras;
