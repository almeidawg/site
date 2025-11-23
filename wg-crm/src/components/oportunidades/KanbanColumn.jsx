
import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import OportunidadeCard from '@/components/oportunidades/OportunidadeCard';
import { MoreHorizontal, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const KanbanColumn = ({ column, columnId, onRenameColumn, onDeleteColumn, onUpdateOportunidade, onEditOportunidade }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(column.name);

  const handleRename = () => {
    if (newName && newName !== column.name) {
      onRenameColumn(column.id, newName);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(column.name);
    }
  };
  
  return (
    <div
      className={`flex flex-col w-80 min-w-[320px] rounded-2xl bg-transparent`}
      style={{
        borderTop: `4px solid ${column.color || '#e5e7eb'}`
      }}
    >
      <div className="p-3 sticky top-0 bg-inherit rounded-t-2xl z-10 flex justify-between items-center">
        {isRenaming ? (
          <div className="flex items-center gap-1 w-full">
            <Input 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              autoFocus
              className="h-8 text-sm font-bold"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRename}><Check className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsRenaming(false)}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <>
            <h3 
              className="font-bold text-sm uppercase cursor-pointer"
              onClick={() => setIsRenaming(true)}
              style={{ color: column.color || '#374151' }}
            >
              {column.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md hover:bg-gray-200">
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>Renomear</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteColumn(column.id)} className="text-red-600">Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
      <Droppable droppableId={columnId} type="OPORTUNIDADE">
        {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-2 pt-0 overflow-y-auto flex-grow transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-gray-200/50' : 'bg-transparent'}`}
            >
              {column.items.map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <OportunidadeCard
                        data={item}
                        isDragging={snapshot.isDragging}
                        onUpdateOportunidade={onUpdateOportunidade}
                        onEdit={() => onEditOportunidade(item)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
