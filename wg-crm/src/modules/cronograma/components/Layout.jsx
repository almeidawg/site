import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, FolderKanban, List, Users } from 'lucide-react';

const Layout = ({ basePath = '/cronograma' }) => {
  const navItems = [
    { name: 'Dashboard', href: `${basePath}/dashboard`, icon: Home },
    { name: 'Projetos', href: `${basePath}/projects`, icon: FolderKanban },
    { name: 'Catalogo', href: `${basePath}/catalog`, icon: List },
    { name: 'Equipes', href: `${basePath}/teams`, icon: Users },
  ];

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-100">
      <div className="hidden border-r bg-slate-800 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center justify-center border-b border-slate-700 px-4 lg:h-[60px] lg:px-6">
            <NavLink to={basePath} className="flex items-center gap-2 font-semibold text-white">
              <img
                src="https://horizons-cdn.hostinger.com/378de1a7-16dc-45cb-902e-80ce1d49a1f3/grupo-wg-TEmSq.png"
                alt="Grupo WG Almeida Logo"
                className="h-10 object-contain"
              />
            </NavLink>
          </div>
          <nav className="flex-1 overflow-auto py-4 px-2 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink key={item.name} to={item.href} className={navLinkClasses}>
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 md:hidden">
          <NavLink to={basePath} className="flex items-center gap-2 font-semibold mr-auto">
            <img src="/logo_grupo_wg_almeida.png" alt="Grupo WG Almeida Logo" className="h-8 object-contain" />
          </NavLink>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
