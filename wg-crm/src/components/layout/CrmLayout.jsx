
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/pages/Dashboard';
import Oportunidades from '@/components/pages/Oportunidades';
import Propostas from '@/components/pages/Propostas';
import Contratos from '@/components/pages/Contratos';
import Obras from '@/components/pages/Obras';
import Marcenaria from '@/components/pages/Marcenaria';
import Compras from '@/components/pages/Compras';
import Financeiro from '@/components/pages/Financeiro';
import IntegrationsPage from '@/pages/IntegrationsPage';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Arquitetura from '@/components/pages/Arquitetura';
import Assistencia from '@/components/pages/Assistencia';
import Onboarding from '@/components/pages/Onboarding';
import PortalCliente from '@/pages/PortalCliente';
import Usuarios from '@/components/pages/Usuarios';
import Configuracoes from '@/components/pages/Configuracoes';
import PlaceholderPage from '@/components/pages/PlaceholderPage';
import Pessoas from '@/components/pages/Pessoas';

const CrmLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profile } = useAuth();
  
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path;
  };
  
  const [currentPage, setCurrentPage] = useState(getCurrentPage());

  useEffect(() => {
    setCurrentPage(getCurrentPage());
  }, [location.pathname]);


  return (
    <div className="min-h-screen flex bg-wg-gray-light">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          user={profile || {}}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isStore={false}
        />
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard navigate={navigate} />} />
            <Route path="/dashboard" element={<Dashboard navigate={navigate} />} />
            <Route path="/oportunidades" element={<Oportunidades />} />
            <Route path="/propostas" element={<Propostas />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/engenharia" element={<Obras />} />
            <Route path="/marcenaria" element={<Marcenaria />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/arquitetura" element={<Arquitetura />} />
            <Route path="/assistencia" element={<Assistencia />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/colaboradores" element={<PlaceholderPage title="Colaboradores" />} />
            <Route path="/fornecedores" element={<PlaceholderPage title="Fornecedores" />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/portal-cliente/:id" element={<PortalCliente />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;
