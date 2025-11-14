import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Obras from "./components/pages/Obras";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* CRM */}
          <Route path="crm/leads" element={<div>Leads</div>} />
          <Route path="crm/clientes" element={<div>Clientes</div>} />
          <Route path="crm/propostas" element={<div>Propostas</div>} />
          <Route path="crm/contratos" element={<div>Contratos</div>} />

          {/* Arquitetura / Engenharia / Marcenaria */}
          <Route path="engenharia/obras" element={<Obras />} /> {/* ⬅ aqui entrou o Kanban */}
          <Route path="arquitetura" element={<div>Painel Arquitetura</div>} />
          <Route path="marcenaria" element={<div>Painel Marcenaria</div>} />

          {/* Operacional */}
          <Route path="operacional/projects" element={<div>Projects</div>} />
          <Route path="operacional/documentos" element={<div>Documentos</div>} />
          <Route path="operacional/compras" element={<div>Compras</div>} />
          <Route path="operacional/equipes" element={<div>Equipes</div>} />
          <Route path="operacional/assistencia" element={<div>Assistência</div>} />
          <Route path="operacional/deposito" element={<div>Depósito</div>} />

          {/* Financeiro */}
          <Route path="financeiro" element={<div>Financeiro</div>} />
          <Route path="financeiro/comissoes" element={<div>Comissões</div>} />

          {/* WG Storage / WG Store */}
          <Route path="wg-storage" element={<div>WG Storage</div>} />
          <Route path="wg-store" element={<div>WG Store</div>} />

          {/* Institucional */}
          <Route path="institucional/marketing" element={<div>Marketing</div>} />
          <Route path="institucional/material-vendas" element={<div>Material de Vendas</div>} />
          <Route path="institucional/modelos-prontos" element={<div>Modelos Prontos</div>} />
          <Route path="institucional/portfolios" element={<div>Portfólios</div>} />
          <Route path="institucional/material-apoio" element={<div>Material de Apoio</div>} />

          {/* Administrativo */}
          <Route path="admin/usuarios" element={<div>Usuários</div>} />
          <Route path="admin/configuracoes" element={<div>Configurações</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
