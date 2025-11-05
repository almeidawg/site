import React from 'react';
import { KanbanBoard } from '@/components/kanban';
import { Building } from 'lucide-react';

const Arquitetura = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-arquitetura">
            <Building /> Projetos de Arquitetura
          </h1>
          <p className="text-wg-gray-medium mt-1">
            Gerencie o fluxo de trabalho dos seus projetos arquitetônicos.
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <KanbanBoard modulo="arquitetura" />
      </div>
    </div>
  );
};

export default Arquitetura;
