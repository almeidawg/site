
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/pages/Dashboard';
import Oportunidades from '@/components/pages/Oportunidades';
import Propostas from '@/components/pages/Propostas';
import Contratos from '@/components/pages/Contratos';
import Pessoas from '@/components/pages/Pessoas';
import Arquitetura from '@/components/pages/Arquitetura';
import Engenharia from '@/components/pages/Engenharia';
import Marcenaria from '@/components/pages/Marcenaria';
import Assistencia from '@/components/pages/Assistencia';
import Compras from '@/components/pages/Compras';
import Configuracoes from '@/components/pages/Configuracoes';
import Usuarios from '@/components/pages/Usuarios';
import Onboarding from '@/components/pages/Onboarding';
import Documentos from '@/components/pages/Documentos';
import EmbeddedPage from '@/components/pages/EmbeddedPage';
import TabManager from '@/components/layout/TabManager';
import { useTabs } from '@/contexts/TabContext';
import Cronogramas from '@/components/pages/Cronogramas';
import Storage from '@/components/pages/Storage';

const componentMap = {
  '/': Dashboard,
  '/oportunidades': Oportunidades,
  '/propostas': Propostas,
  '/contratos': Contratos,
  '/pessoas': Pessoas,
  '/clientes': Pessoas,
  '/arquitetura': Arquitetura,
  '/engenharia': Engenharia,
  '/obras': Obras,
  '/cronogramas': Cronogramas,
  '/compras': Compras,
  '/assistencia': Assistencia,
  '/storage': Storage,              // <<< NOVA ROTA
  '/onboarding': Onboarding,
  '/usuarios': Usuarios,
  '/configuracoes': Configuracoes,
  '#projects-modal': () => <EmbeddedPage ... />,
  '#store-modal': () => <EmbeddedPage ... />,
};

const CrmLayout = () => {
  const { activeTab } = useTabs();

  const ActiveComponent = activeTab ? componentMap[activeTab.path] : Dashboard;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TabManager />
        <main className="flex-1 overflow-y-auto bg-background">
          {ActiveComponent ? <ActiveComponent /> : <Dashboard />}
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;
