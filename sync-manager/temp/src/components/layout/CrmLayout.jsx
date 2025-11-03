import React from 'react';
    import { Routes, Route, Navigate } from 'react-router-dom';
    import Sidebar from '@/components/layout/Sidebar';
    import Dashboard from '@/components/pages/Dashboard';
    import Oportunidades from '@/components/pages/Oportunidades';
    import Propostas from '@/components/pages/Propostas';
    import Contratos from '@/components/pages/Contratos';
    import Pessoas from '@/components/pages/Pessoas';
    import Arquitetura from '@/components/pages/Arquitetura';
    import Engenharia from '@/components/pages/Engenharia'; // Changed from Obras
    import Marcenaria from '@/components/pages/Marcenaria';
    import Cronograma from '@/components/pages/Cronograma';
    import Assistencia from '@/components/pages/Assistencia';
    import Compras from '@/components/pages/Compras';
    import Configuracoes from '@/components/pages/Configuracoes';
    import Usuarios from '@/components/pages/Usuarios';
    import Onboarding from '@/components/pages/Onboarding';
    import StoreLayout from '@/pages/StoreLayout';
    import PlaceholderPage from '@/components/pages/PlaceholderPage';
    import Financeiro from '@/components/pages/Financeiro';

    const CrmLayout = () => {
      return (
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pessoas" element={<Pessoas />} />
              <Route path="/oportunidades" element={<Oportunidades />} />
              <Route path="/propostas" element={<Propostas />} />
              <Route path="/contratos" element={<Contratos />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/arquitetura" element={<Arquitetura />} />
              <Route path="/engenharia" element={<Engenharia />} /> {/* Changed from /obras to /engenharia */}
              <Route path="/marcenaria" element={<Marcenaria />} />
              <Route path="/cronograma" element={<Cronograma />} />
              <Route path="/assistencia" element={<Assistencia />} />
              <Route path="/compras" element={<Compras />} />
              <Route path="/documentos" element={<PlaceholderPage title="Documentos e Exigências Legais" />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/store" element={<StoreLayout />} />
              <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
            </Routes>
          </main>
        </div>
      );
    };

    export default CrmLayout;