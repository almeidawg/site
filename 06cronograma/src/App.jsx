import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Catalog from '@/pages/Catalog';
import Teams from '@/pages/Teams';

function App() {
  return (
    <>
      <Helmet>
        <title>WGEasy Cronograma - Sistema de Planejamento de Obras</title>
        <meta name="description" content="Sistema inteligente de cronograma de obras com cálculo automático por produtividade, dependências e caminho crítico" />
      </Helmet>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="teams" element={<Teams />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;