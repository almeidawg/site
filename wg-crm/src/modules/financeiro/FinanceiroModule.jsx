import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Obras from './pages/Obras';
import Lancamentos from './pages/Lancamentos';
import Solicitacoes from './pages/Solicitacoes';
import Comissionamento from './pages/Comissionamento';
import Reembolsos from './pages/Reembolsos';
import PriceList from './pages/PriceList';
import Relatorios from './pages/Relatorios';
import Cobrancas from './pages/Cobrancas';

const FinanceiroModule = () => (
  <Routes>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="projetos" element={<Obras />} />
    <Route path="lancamentos" element={<Lancamentos />} />
    <Route path="solicitacoes" element={<Solicitacoes />} />
    <Route path="comissionamento" element={<Comissionamento />} />
    <Route path="reembolsos" element={<Reembolsos />} />
    <Route path="price-list" element={<PriceList />} />
    <Route path="relatorios" element={<Relatorios />} />
    <Route path="cobrancas" element={<Cobrancas />} />
    <Route path="*" element={<Navigate to="dashboard" replace />} />
  </Routes>
);

export default FinanceiroModule;
