
import React from 'react';
import EmbeddedPage from './EmbeddedPage';
import { PROJECTS_DASHBOARD_URL } from '@/config/externalApps';

const Projects = () => {
  return (
    <EmbeddedPage 
      src={PROJECTS_DASHBOARD_URL}
      title="Projects Externo"
    />
  );
};

export default Projects;
