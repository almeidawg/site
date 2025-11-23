// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";

// Páginas de Financeiro
import FinanceiroPage from "./modules/financeiro/pages/FinanceiroPage";

// Páginas de Cronograma
import CronogramaPage from "./modules/cronograma/pages/CronogramaPage";
import GanttAvancadoPage from "./cronograma/GanttAvancadoPage";
import MedicoesPage from "./cronograma/MedicoesPage";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Menu Lateral */}
        <Sidebar />

        {/* Conteúdo Principal */}
        <main style={{ flex: 1, backgroundColor: "#f8fafc" }}>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<DashboardPlaceholder />} />

            {/* Financeiro */}
            <Route path="/financeiro" element={<FinanceiroPage />} />

            {/* Cronograma */}
            <Route path="/cronograma" element={<CronogramaPage />} />
            <Route
              path="/obras/:projetoId/cronograma"
              element={<CronogramaPage />}
            />
            <Route
              path="/obras/:projetoId/gantt"
              element={<GanttAvancadoPage />}
            />
            <Route
              path="/etapas/:etapaId/medicoes"
              element={<MedicoesPage />}
            />

            {/* Outras rotas (placeholders) */}
            <Route path="/kanban" element={<PlaceholderPage title="Kanban" />} />
            <Route path="/obras" element={<PlaceholderPage title="Obras" />} />
            <Route
              path="/marcenaria"
              element={<PlaceholderPage title="Marcenaria" />}
            />
            <Route
              path="/contratos"
              element={<PlaceholderPage title="Contratos" />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Componente placeholder para Dashboard
function DashboardPlaceholder() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">
        Dashboard WGEasy
      </h1>
      <p className="text-slate-600">
        Bem-vindo ao sistema de gestão integrada do Grupo WG Almeida.
      </p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Financeiro</h3>
          <p className="text-sm text-slate-600">
            Acesse a gestão completa de lançamentos, categorias e obras.
          </p>
        </div>
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Cronograma</h3>
          <p className="text-sm text-slate-600">
            Gerencie tarefas, etapas e o progresso das obras.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente placeholder genérico para outras páginas
function PlaceholderPage({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">{title}</h1>
      <p className="text-slate-600">
        Esta página está em desenvolvimento. Em breve terá funcionalidades completas.
      </p>
    </div>
  );
}

export default App;
