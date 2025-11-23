
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PROJECTS_DASHBOARD_URL } from '@/config/externalApps';

const TabContext = createContext();

export const useTabs = () => useContext(TabContext);

const componentMap = {
  '/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
  '/pessoas': { label: 'Pessoas', icon: 'Users' },
  '/oportunidades': { label: 'Oportunidades', icon: 'KanbanSquare' },
  '/propostas': { label: 'Propostas', icon: 'FileText' },
  '/contratos': { label: 'Contratos', icon: 'FileSignature' },
  '/financeiro': { label: 'Financeiro', icon: 'DollarSign' },
  '/documentos': { label: 'Documentos', icon: 'Folder' },
  '/arquitetura': { label: 'Arquitetura', icon: 'DraftingCompass' },
  '/engenharia': { label: 'Engenharia', icon: 'HardHat' },
  '/marcenaria': { label: 'Marcenaria', icon: 'Lamp' },
  '/cronogramas': { label: 'Cronogramas', icon: 'GanttChart' },
  '/deposito': { label: 'Depósito', icon: 'Archive' },
  '/compras': { label: 'Compras', icon: 'ShoppingCart' },
  '/assistencia': { label: 'Assistência', icon: 'Wrench' },
  '/usuarios': { label: 'Usuários', icon: 'Users2' },
  '/configuracoes': { label: 'Configurações', icon: 'Settings' },
  '/projects': { label: 'Projects', icon: 'Briefcase'},
  '#financeiro-externo': { label: 'Financeiro Externo', icon: 'DollarSign', url: 'https://chocolate-gazelle-254830.hostingersite.com/login', external: true },
  '#store-modal': { label: 'WG Store', icon: 'Store', url: 'https://wgalmeida.com.br/store', external: true },
  '#projects-modal': { label: 'Projects Externo', icon: 'Briefcase', url: PROJECTS_DASHBOARD_URL, external: true },
};

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([{ path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' }]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    const tabDetails = componentMap[currentPath];
    if (tabDetails && !tabs.find(tab => tab.path === currentPath)) {
      const newTab = { path: currentPath, ...tabDetails };
      setTabs(prev => [...prev, newTab]);
      setActiveTab(newTab);
    } else {
      const existingTab = tabs.find(tab => tab.path === currentPath);
      if (existingTab) setActiveTab(existingTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const openTab = useCallback((path) => {
    if (path.startsWith('#')) {
        const tabDetails = componentMap[path];
        if (tabDetails && tabDetails.external) {
            window.open(tabDetails.url, '_blank', 'noopener,noreferrer');
        }
        return;
    }

    const tabDetails = componentMap[path];
    if (!tabDetails) return;

    if (!tabs.find(t => t.path === path)) {
      setTabs(prev => [...prev, {path, ...tabDetails}]);
    }
    setActiveTab({path, ...tabDetails});
    navigate(path);
  }, [tabs, navigate]);

  const closeTab = (tabToClose) => {
    if (tabToClose.path === '/dashboard') return;

    const tabIndex = tabs.findIndex(t => t.path === tabToClose.path);
    if (tabIndex === -1) return;

    const newTabs = tabs.filter(t => t.path !== tabToClose.path);
    
    if (activeTab.path === tabToClose.path) {
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
      setActiveTab(newActiveTab);
      navigate(newActiveTab.path);
    }
    setTabs(newTabs);
  };

  const value = { tabs, activeTab, openTab, closeTab, setActiveTab };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};
