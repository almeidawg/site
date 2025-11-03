import React from 'react';
import { Helmet } from 'react-helmet';

const Logistica = () => {
  return (
    <>
      <Helmet>
        <title>Logística - CRM WG</title>
      </Helmet>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Logística</h1>
        <p className="text-muted-foreground">Módulo de logística em desenvolvimento.</p>
      </div>
    </>
  );
};

export default Logistica;