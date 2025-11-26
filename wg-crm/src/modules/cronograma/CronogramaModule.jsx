import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Catalog from './pages/Catalog';
import Teams from './pages/Teams';
import CronoProjetoTarefasPage from './pages/CronoProjetoTarefasPage';

const CronogramaModule = () => (
  <Routes>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="projects" element={<Projects />} />
    <Route path="projects/:id" element={<ProjectDetail />} />
    <Route path="projects/:id/tarefas" element={<CronoProjetoTarefasPage />} />
    <Route path="catalog" element={<Catalog />} />
    <Route path="teams" element={<Teams />} />
    <Route path="*" element={<Navigate to="dashboard" replace />} />
  </Routes>
);

export default CronogramaModule;
