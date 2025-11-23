// src/Router.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ObrasPage from "./modules/obras/ObrasPage";
import FinanceiroPage from "./modules/financeiro/FinanceiroPage";
import KanbanPage from "./modules/kanban/KanbanPage";
import MarcenariaPage from "./modules/marcenaria/MarcenariaPage";

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ObrasPage />} />
        <Route path="/financeiro" element={<FinanceiroPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/marcenaria" element={<MarcenariaPage />} />
      </Routes>
    </Layout>
  );
}
