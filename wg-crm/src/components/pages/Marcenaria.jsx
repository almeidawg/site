import React from 'react';
import { KanbanBoard } from '@/components/kanban';
import { Hammer } from 'lucide-react';

const Marcenaria = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-marcenaria">
            <Hammer /> Projetos de Marcenaria
          </h1>
          <p className="text-wg-gray-medium mt-1">
            Gerencie o fluxo de produção da marcenaria.
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <KanbanBoard modulo="marcenaria" />
      </div>
    </div>
  );
};

export default Marcenaria;
