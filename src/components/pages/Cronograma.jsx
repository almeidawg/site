
import React from 'react';
import EmbeddedPage from '@/components/pages/EmbeddedPage';
import { Helmet } from 'react-helmet';
import { PROJECTS_DASHBOARD_URL } from '@/config/externalApps';

const Cronogramas = () => {
  return (
    <>
      <Helmet>
        <title>Cronogramas e Projetos | Grupo WG Almeida</title>
        <meta name="description" content="Gestão de cronogramas e projetos." />
      </Helmet>
      <EmbeddedPage 
        src={PROJECTS_DASHBOARD_URL}
        title="Cronogramas e Projetos"
      />
    </>
  );
};

export default Cronogramas;
