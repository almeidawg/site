import React from 'react';
import { KanbanBoard } from '@/components/kanban';
import { Target } from 'lucide-react';

const Oportunidades = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-orange-base">
            <Target /> Pipeline de Oportunidades
          </h1>
          <p className="text-wg-gray-medium mt-1">
            Gerencie o funil de vendas e acompanhe suas oportunidades até o fechamento.
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <KanbanBoard modulo="oportunidades" />
      </div>
    </div>
  );
};

export default Oportunidades;
