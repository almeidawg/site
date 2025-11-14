export const menuSections = [
  {
    
    import { menuSections } from "../components/dropdown-menu";

function Sidebar() {
  return (
    <nav>
      {menuSections.map(section => (
        <div key={section.label}>
          <h4>{section.label}</h4>
          {section.items.map(item => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}   
    
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
    items: [{ label: "Biblioteca de Arquivos", path: "/wg-storage" }],
  },
  {
    label: "WG Store",
    items: [{ label: "Catálogo", path: "/wg-store" }],
  },
  {
    label: "Institucional",
    items: [
      { label: "Marketing", path: "/institucional/marketing" },
      { label: "Material de Vendas", path: "/institucional/material-vendas" },
      { label: "Modelos Prontos", path: "/institucional/modelos" },
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
