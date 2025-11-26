
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
import IntegrationsPage from '@/pages/IntegrationsPage';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Arquitetura from '@/components/pages/Arquitetura';
import Engenharia from '@/components/pages/Engenharia';
import Assistencia from '@/components/pages/Assistencia';
import Onboarding from '@/components/pages/Onboarding';
import PortalCliente from '@/pages/PortalCliente';
import Usuarios from '@/components/pages/Usuarios';
import Configuracoes from '@/components/pages/Configuracoes';
import PlaceholderPage from '@/components/pages/PlaceholderPage';
import Pessoas from '@/components/pages/Pessoas';
import FinanceiroModule from '@/modules/financeiro/FinanceiroModule';
import CronogramaModule from '@/modules/cronograma/CronogramaModule';
import { X } from 'lucide-react';

const TAB_CONFIG = {
  dashboard: { label: 'Dashboard', basePath: '/dashboard' },
  oportunidades: { label: 'Oportunidades', basePath: '/oportunidades' },
  propostas: { label: 'Propostas', basePath: '/propostas' },
  contratos: { label: 'Contratos', basePath: '/contratos' },
  arquitetura: { label: 'Arquitetura', basePath: '/arquitetura' },
  engenharia: { label: 'Engenharia', basePath: '/engenharia' },
  marcenaria: { label: 'Marcenaria', basePath: '/marcenaria' },
  compras: { label: 'Compras', basePath: '/compras' },
  assistencia: { label: 'Assistência', basePath: '/assistencia' },
  pessoas: { label: 'Pessoas', basePath: '/pessoas' },
  usuarios: { label: 'Usuários', basePath: '/usuarios' },
  configuracoes: { label: 'Configurações', basePath: '/configuracoes' },
  financeiro: { label: 'Financeiro', basePath: '/financeiro' },
  cronograma: { label: 'Cronograma', basePath: '/cronograma' },
};

const DEFAULT_TAB_KEY = 'dashboard';

const buildTab = (key, pathname) => {
  const config = TAB_CONFIG[key] || {
    label: key.charAt(0).toUpperCase() + key.slice(1),
    basePath: `/${key}`,
  };
  return {
    key,
    label: config.label,
    basePath: config.basePath,
    lastPath: pathname || config.basePath,
  };
};

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
  const [openTabs, setOpenTabs] = useState(() => [buildTab(getCurrentPage(), location.pathname || '/dashboard')]);

  useEffect(() => {
    const pageKey = getCurrentPage();
    setCurrentPage(pageKey);
    setOpenTabs((prevTabs) => {
      const exists = prevTabs.find((tab) => tab.key === pageKey);
      if (exists) {
        return prevTabs.map((tab) =>
          tab.key === pageKey ? { ...tab, lastPath: location.pathname } : tab
        );
      }
      return [...prevTabs, buildTab(pageKey, location.pathname)];
    });
  }, [location.pathname]);

  const handleTabClick = (tab) => {
    if (tab.lastPath) {
      navigate(tab.lastPath);
    } else if (tab.basePath) {
      navigate(tab.basePath);
    }
  };

  const handleCloseTab = (tabKey) => {
    setOpenTabs((prevTabs) => {
      let nextTabs = prevTabs.filter((tab) => tab.key !== tabKey);
      if (nextTabs.length === 0) {
        nextTabs = [buildTab(DEFAULT_TAB_KEY, '/dashboard')];
      }

      if (tabKey === getCurrentPage()) {
        const nextTab = nextTabs[nextTabs.length - 1];
        setTimeout(() => handleTabClick(nextTab), 0);
      }

      return nextTabs;
    });
  };


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
        <div className="px-6 pt-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-4">
            {openTabs.map((tab) => {
              const isActive = tab.key === currentPage;
              return (
                <div
                  key={tab.key}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-white border-wg-orange-base text-wg-orange-base shadow-sm'
                      : 'bg-white/60 border-transparent text-gray-600 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabClick(tab)}
                >
                  <span>{tab.label}</span>
                  {tab.key !== DEFAULT_TAB_KEY && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab.key);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <main className="p-6 pt-0">
          <Routes>
            <Route path="/" element={<Dashboard navigate={navigate} />} />
            <Route path="/dashboard" element={<Dashboard navigate={navigate} />} />
            <Route path="/oportunidades" element={<Oportunidades />} />
            <Route path="/propostas" element={<Propostas />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/engenharia" element={<Engenharia />} />
            <Route path="/marcenaria" element={<Marcenaria />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/financeiro/*" element={<FinanceiroModule />} />
            <Route path="/cronograma/*" element={<CronogramaModule />} />
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
