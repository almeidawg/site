
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import Documentos from '@/components/pages/Documentos';
import TabManager from '@/components/layout/TabManager';
import Cronogramas from '@/components/pages/Cronogramas';
import Deposito from '@/components/pages/Deposito';
import Financeiro from '@/components/pages/Financeiro';
import Projects from '@/components/pages/Projects';


const componentMap = {
  '/dashboard': Dashboard,
  '/pessoas': Pessoas,
  '/oportunidades': Oportunidades,
  '/propostas': Propostas,
  '/contratos': Contratos,
  '/financeiro': Financeiro,
  '/documentos': Documentos,
  '/arquitetura': Arquitetura,
  '/engenharia': Engenharia,
  '/marcenaria': Marcenaria,
  '/cronogramas': Cronogramas,
  '/compras': Compras,
  '/assistencia': Assistencia,
  '/usuarios': Usuarios,
  '/configuracoes': Configuracoes,
  '/deposito': Deposito,
  '/projects': Projects,
};

const CrmLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TabManager />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {Object.keys(componentMap).map(path => {
                const Component = componentMap[path];
                return <Route key={path} path={path.substring(1)} element={<Component />} />;
            })}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;
