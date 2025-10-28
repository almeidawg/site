
import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import KanbanColumn from '@/components/oportunidades/KanbanColumn';

const KanbanBoard = ({ columns, onDragEnd, onRenameColumn, onDeleteColumn, onUpdateOportunidade, onEditOportunidade }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-2">
        {Object.entries(columns).map(([columnId, column]) => (
            <KanbanColumn
              key={columnId}
              column={column}
              columnId={columnId}
              onRenameColumn={onRenameColumn}
              onDeleteColumn={onDeleteColumn}
              onUpdateOportunidade={onUpdateOportunidade}
              onEditOportunidade={onEditOportunidade}
            />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
