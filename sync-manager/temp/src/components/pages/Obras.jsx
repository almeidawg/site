import React from 'react';
    import KanbanBoard from '@/components/oportunidades/KanbanBoard';

    const Obras = () => {
      return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Andamento de Engenharia</h1>
            </div>
            <div className="flex-grow overflow-hidden">
                <KanbanBoard modulo="engenharia" />
            </div>
        </div>
      );
    };
    
    export default Obras;