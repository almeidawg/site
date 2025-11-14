// src/components/dropdown-menu.jsx

// Se você já usa ícones, pode importar aqui e colocar em cada item (opcional)
/// Exemplo:
// import { Users, FileText, Package, Settings } from "lucide-react";

export const menuSections = [
  {
    label: "CRM",
    items: [
      { label: "Leads & Oportunidades", path: "/crm/leads" },
      { label: "Clientes", path: "/crm/clientes" },
      { label: "Propostas", path: "/crm/propostas" },
      { label: "Contratos", path: "/crm/contratos" },
    ],
  },
  {
    label: "Arquitetura",
    items: [
      { label: "Painel de Arquitetura", path: "/arquitetura" },
    ],
  },
  {
    label: "Engenharia",
    items: [
      { label: "Obras", path: "/engenharia/obras" },
    ],
  },
  {
    label: "Marcenaria",
    items: [
      { label: "Painel de Marcenaria", path: "/marcenaria" },
    ],
  },
  {
    label: "Operacional",
    items: [
      { label: "Projects (Cronograma)", path: "/operacional/projects" },
      { label: "Documentos", path: "/operacional/documentos" },
      { label: "Compras", path: "/operacional/compras" },
      { label: "Equipes", path: "/operacional/equipes" },
      { label: "Assistência", path: "/operacional/assistencia" },
      { label: "Depósito", path: "/operacional/deposito" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Financeiro Geral", path: "/financeiro" },
      { label: "Calculadora de Comissão", path: "/financeiro/comissoes" },
    ],
  },
  {
    label: "WG Storage",
    items: [
      { label: "Biblioteca de Arquivos", path: "/wg-storage" },
    ],
  },
  {
    label: "WG Store",
    items: [
      { label: "Catálogo", path: "/wg-store" },
    ],
  },
  {
    label: "Institucional",
    items: [
      { label: "Marketing", path: "/institucional/marketing" },
      { label: "Material de Vendas", path: "/institucional/material-vendas" },
      { label: "Modelos Prontos", path: "/institucional/modelos-prontos" },
      { label: "Portfólios", path: "/institucional/portfolios" },
      { label: "Material de Apoio", path: "/institucional/material-apoio" },
    ],
  },
  {
    label: "Administrativo",
    items: [
      { label: "Usuários", path: "/admin/usuarios" },
      { label: "Configurações", path: "/admin/configuracoes" },
    ],
  },
];

// Componente de menu lateral (seu Layout provavelmente importa algo assim)
import { NavLink } from "react-router-dom";

export function SidebarMenu() {
  return (
    <nav className="sidebar-nav">
      {menuSections.map((section) => (
        <div key={section.label} className="sidebar-section">
          <div className="sidebar-section-label">{section.label}</div>
          <ul className="sidebar-section-list">
            {section.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    "sidebar-link" + (isActive ? " sidebar-link-active" : "")
                  }
                >
                  {/* Se usar ícone, coloque aqui antes do texto */}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
