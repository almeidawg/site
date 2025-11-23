
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut,
  User,
  Contact
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Sidebar = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNavigation = (page) => {
    setCurrentPage(page);
    navigate(`/${page}`);
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
    { name: 'assistencia', icon: Wrench, label: 'Assistência' },
    { name: 'financeiro', icon: Banknote, label: 'Financeiro' },
    { name: 'pessoas', icon: Contact, label: 'Pessoas' },
    { name: 'usuarios', icon: Users2, label: 'Usuários' },
    { name: 'configuracoes', icon: Settings, label: 'Configurações' },
  ];
  
  const bottomMenuItems = [
    { name: 'onboarding', icon: User, label: 'Onboarding', action: () => navigate('/onboarding')},
  ];

  const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '5rem' },
  };

  const getActiveStyles = (itemName) => {
    if (currentPage !== itemName) return '';
    const specialColors = {
      'arquitetura': 'bg-wg-arquitetura text-white',
      'engenharia': 'bg-wg-engenharia text-white',
      'marcenaria': 'bg-wg-marcenaria text-white',
    };
    return specialColors[itemName] || 'bg-wg-orange-base text-white';
  };
  
  const getHoverStyles = (itemName) => {
    const specialHoverColors = {
      'arquitetura': 'hover:bg-wg-arquitetura/20',
      'engenharia': 'hover:bg-wg-engenharia/20',
      'marcenaria': 'hover:bg-wg-marcenaria/20',
    };
    return specialHoverColors[itemName] || 'hover:bg-wg-orange-base/10';
  }

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
              <img src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png" alt="Logo" className="h-10" />
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-gray-200/50 transition-colors">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <div key={item.name} className="relative">
              <button
                onClick={() => handleNavigation(item.name)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors text-sm font-medium ${
                  currentPage === item.name
                    ? getActiveStyles(item.name)
                    : `text-gray-600 ${getHoverStyles(item.name)}`
                }`}
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
            </div>
          ))}
        </nav>
      </div>

      <div className="p-2 border-t border-gray-200">
        {bottomMenuItems.map((item) => (
          <button
            key={item.name}
            onClick={item.action}
            className={`w-full flex items-center p-3 rounded-lg transition-colors text-sm font-medium text-gray-600 hover:bg-gray-200/50`}
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
