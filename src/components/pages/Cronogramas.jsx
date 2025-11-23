
import React from 'react';
import EmbeddedPage from './EmbeddedPage';
import { PROJECTS_DASHBOARD_URL } from '@/config/externalApps';

const Cronogramas = () => {
  return (
    <EmbeddedPage 
      src={PROJECTS_DASHBOARD_URL}
      title="Cronogramas Externo"
    />
  );
};

export default Cronogramas;
