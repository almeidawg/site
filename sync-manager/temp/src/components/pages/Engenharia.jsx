import React from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { Helmet } from 'react-helmet';

const Engenharia = () => {
  return (
    <div className="flex flex-col h-full">
        <Helmet>
            <title>Engenharia - Kanban</title>
            <meta name="description" content="Gestão de projetos e obras de engenharia via Kanban." />
        </Helmet>
        <div className="p-4 border-b bg-background">
            <h1 className="text-2xl font-bold">Andamento de Engenharia</h1>
        </div>
        <div className="flex-grow overflow-hidden p-4">
            <KanbanBoard modulo="engenharia" />
        </div>
    </div>
  );
};

export default Engenharia;