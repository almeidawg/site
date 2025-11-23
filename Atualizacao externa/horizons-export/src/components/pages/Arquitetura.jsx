import React from 'react';
    import KanbanBoard from '@/components/oportunidades/KanbanBoard';

    const Arquitetura = () => {
      return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Projetos de Arquitetura</h1>
            </div>
            <div className="flex-grow overflow-hidden">
                <KanbanBoard modulo="arquitetura" />
            </div>
        </div>
      );
    };
    
    export default Arquitetura;