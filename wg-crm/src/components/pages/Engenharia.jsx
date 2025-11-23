import React from 'react';
import { KanbanBoard } from '@/components/kanban';
import { HardHat } from 'lucide-react';

const Engenharia = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-engenharia">
            <HardHat /> Projetos de Engenharia
          </h1>
          <p className="text-wg-gray-medium mt-1">
            Gerencie o fluxo de trabalho das suas obras e reformas.
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <KanbanBoard modulo="engenharia" />
      </div>
    </div>
  );
};

export default Engenharia;
