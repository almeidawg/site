import React from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { Helmet } from 'react-helmet';

const Oportunidades = () => {
  return (
    <>
      <Helmet>
        <title>Oportunidades | Grupo WG Almeida</title>
        <meta name="description" content="Gerencie suas oportunidades de negócio com o pipeline de vendas." />
      </Helmet>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
        </div>
        <KanbanBoard />
      </div>
    </>
  );
};

export default Oportunidades;