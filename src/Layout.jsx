// src/Layout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Barra lateral simples provisória */}
      <aside
        style={{
          width: 260,
          padding: "16px",
          borderRight: "1px solid #eee",
          background: "#fafafa",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>WGEasy</h1>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
          <Link to="/crm/leads">CRM · Leads</Link>
          <Link to="/crm/clientes">CRM · Clientes</Link>
          <Link to="/crm/propostas">CRM · Propostas</Link>
          <Link to="/crm/contratos">CRM · Contratos</Link>

          <hr style={{ margin: "12px 0" }} />

          <Link to="/engenharia/obras">Engenharia · Obras</Link>
          <Link to="/arquitetura">Arquitetura</Link>
          <Link to="/marcenaria">Marcenaria</Link>

          <hr style={{ margin: "12px 0" }} />

          <Link to="/operacional/projects">Operacional · Projects</Link>
          <Link to="/financeiro">Financeiro</Link>
        </nav>
      </aside>

      {/* Conteúdo das rotas */}
      <main style={{ flex: 1, padding: "24px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
