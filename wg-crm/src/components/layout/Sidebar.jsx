import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  FileText,
  FileSignature,
  HardHat,
  Construction,
  ShoppingCart,
  Users,
  Banknote,
  Building2,
  Wrench,
  Users2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Contact,
  CalendarRange,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Sidebar = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [openMenus, setOpenMenus] = useState({ financeiro: false, cronograma: false });

  const handleNavigation = (page, pathOverride) => {
    setCurrentPage(page);
    navigate(pathOverride || `/${page}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { name: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { name: 'oportunidades', icon: Target, label: 'Oportunidades' },
    { name: 'propostas', icon: FileText, label: 'Propostas' },
    { name: 'contratos', icon: FileSignature, label: 'Contratos' },
    { name: 'arquitetura', icon: Building2, label: 'Arquitetura' },
    { name: 'engenharia', icon: HardHat, label: 'Engenharia' },
    { name: 'marcenaria', icon: Construction, label: 'Marcenaria' },
    { name: 'compras', icon: ShoppingCart, label: 'Compras' },
    { name: 'assistencia', icon: Wrench, label: 'Assistencia' },
      {
        name: 'financeiro',
        icon: Banknote,
        label: 'Financeiro',
        path: '/financeiro',
        children: [
          { name: 'financeiro-projetos', label: 'Projetos', path: '/financeiro/projetos' },
          { name: 'financeiro-lancamentos', label: 'Lancamentos', path: '/financeiro/lancamentos' },
          { name: 'financeiro-solicitacoes', label: 'Solicitações de Pagamento', path: '/financeiro/solicitacoes' },
          { name: 'financeiro-comissionamento', label: 'Comissionamento', path: '/financeiro/comissionamento' },
          { name: 'financeiro-reembolsos', label: 'Reembolsos', path: '/financeiro/reembolsos' },
          { name: 'financeiro-price-list', label: 'Price List', path: '/financeiro/price-list' },
          { name: 'financeiro-relatorios', label: 'Relatorios', path: '/financeiro/relatorios' },
          { name: 'financeiro-cobrancas', label: 'Cobrancas', path: '/financeiro/cobrancas' },
        ],
      },
      {
        name: 'cronograma',
        icon: CalendarRange,
        label: 'Cronograma',
        path: '/cronograma',
        children: [
          { name: 'cronograma-projects', label: 'Projetos', path: '/cronograma/projects' },
          { name: 'cronograma-teams', label: 'Equipes', path: '/cronograma/teams' },
          { name: 'cronograma-catalog', label: 'Catalogo', path: '/cronograma/catalog' },
        ],
      },
    { name: 'pessoas', icon: Contact, label: 'Pessoas' },
    { name: 'usuarios', icon: Users2, label: 'Usuarios' },
    { name: 'configuracoes', icon: Settings, label: 'Configuracoes' },
  ];

  const bottomMenuItems = [
    { name: 'onboarding', icon: User, label: 'Onboarding', action: () => navigate('/onboarding') },
  ];

  useEffect(() => {
    const path = location.pathname;
    setOpenMenus((prev) => ({
      ...prev,
      financeiro: prev.financeiro || path.startsWith('/financeiro'),
      cronograma: prev.cronograma || path.startsWith('/cronograma'),
    }));
  }, [location.pathname]);

  const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '5rem' },
  };

  const getActiveStyles = (itemName) => {
    if (currentPage !== itemName) return '';
    const specialColors = {
      arquitetura: 'bg-wg-arquitetura text-white',
      engenharia: 'bg-wg-engenharia text-white',
      marcenaria: 'bg-wg-marcenaria text-white',
    };
    return specialColors[itemName] || 'bg-wg-orange-base text-white';
  };

  const getHoverStyles = (itemName) => {
    const specialHoverColors = {
      arquitetura: 'hover:bg-wg-arquitetura/20',
      engenharia: 'hover:bg-wg-engenharia/20',
      marcenaria: 'hover:bg-wg-marcenaria/20',
    };
    return specialHoverColors[itemName] || 'hover:bg-wg-orange-base/10';
  };

  const renderChildren = (item) => {
    const showChildren = item.children && (openMenus[item.name] || location.pathname.startsWith(item.path || `/${item.name}`));
    if (!showChildren) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="ml-4 mt-1 space-y-1 overflow-hidden"
        >
          {item.children.map((child) => {
            const isChildActive = location.pathname.startsWith(child.path);
            return (
              <Link
                key={child.path}
                to={child.path}
                onClick={() => handleNavigation(child.name || item.name, child.path)}
                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                  isChildActive ? 'bg-wg-orange-base/10 text-wg-orange-base font-semibold' : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isOpen ? 'open' : 'closed'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-wg-gray-light/90 backdrop-blur-lg border-r border-gray-200 text-gray-800 flex flex-col fixed top-0 left-0 h-full z-50 shadow-xl shadow-gray-200/20"
    >
      <div className="flex items-center justify-between p-4 h-20 border-b border-gray-200">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            >
              <img
                src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png"
                alt="Logo"
                className="h-10"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-gray-200/50 transition-colors">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.name || location.pathname.startsWith(item.path || `/${item.name}`);
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const showChildren = hasChildren && (openMenus[item.name] || location.pathname.startsWith(item.path || `/${item.name}`));
            const mainPath = item.path || `/${item.name}`;

            return (
              <div key={item.name} className="relative">
                <button
                  onClick={() => {
                    if (hasChildren) {
                      setIsOpen(true);
                      setOpenMenus((prev) => {
                        const next = !prev[item.name];
                        if (next) {
                          handleNavigation(item.name, mainPath);
                        }
                        return { ...prev, [item.name]: next };
                      });
                    } else {
                      handleNavigation(item.name, mainPath);
                    }
                  }}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors text-sm font-medium ${
                    isActive ? getActiveStyles(item.name) : `text-gray-600 ${getHoverStyles(item.name)}`
                  }`}
                >
                  <Icon size={20} />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="ml-4 whitespace-nowrap flex-1 text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {hasChildren && isOpen && <ChevronDown className={`h-4 w-4 transition-transform ${showChildren ? 'rotate-180' : ''}`} />}
                </button>
                {hasChildren && showChildren && renderChildren(item)}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-gray-200">
        {bottomMenuItems.map((item) => (
          <button
            key={item.name}
            onClick={item.action}
            className="w-full flex items-center p-3 rounded-lg transition-colors text-sm font-medium text-gray-600 hover:bg-gray-200/50"
          >
            <item.icon size={20} />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="ml-4 whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
         <button
          onClick={handleSignOut}
          className="w-full flex items-center p-3 rounded-lg transition-colors text-sm font-medium text-red-500 hover:bg-red-100/50"
        >
          <LogOut size={20} />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="ml-4 whitespace-nowrap"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
