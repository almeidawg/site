import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CronogramaPage from "./cronograma/CronogramaPage";
import MedicoesPage from "./cronograma/MedicoesPage";
import GanttAvancadoPage from "./cronograma/GanttAvancadoPage";
import FinanceiroPage from "./modules/financeiro/pages/FinanceiroPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
        <Route
          path="/obras/:projetoId/financeiro"
          element={<FinanceiroPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
