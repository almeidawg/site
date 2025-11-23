import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users2, Briefcase, FileText, FolderKanban, HardHat, Store,
    Nut, Wrench, GanttChart, Settings, LogOut, ChevronDown, ChevronRight, UserCircle, DollarSign, Archive, UserCheck, Tv
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users2, label: 'Pessoas', path: '/pessoas' }, // Pessoas agora é item principal
    {
        icon: Briefcase, label: 'Comercial', path: '#', children: [
            { icon: FolderKanban, label: 'Oportunidades', path: '/oportunidades' },
            { icon: FileText, label: 'Propostas', path: '/propostas' },
            { icon: FileText, label: 'Contratos', path: '/contratos' },
        ]
    },
    { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
    { icon: FolderKanban, label: 'Arquitetura', path: '/arquitetura', className: 'nav-item-arquitetura' },
    { icon: HardHat, label: 'Engenharia', path: '/engenharia', className: 'nav-item-engenharia' }, // Corrigido de Obras para Engenharia
    { icon: Nut, label: 'Marcenaria', path: '/marcenaria', className: 'nav-item-marcenaria' },
    { icon: Store, label: 'Compras', path: '/compras' },
    {
        icon: Wrench, label: 'Operacional', path: '#', children: [
            { icon: Wrench, label: 'Assistência', path: '/assistencia' },
            { icon: GanttChart, label: 'Cronogramas', path: '/cronograma' },
            { icon: Archive, label: 'Doc./Exigências', path: '/documentos' },
        ]
    },
    { icon: Tv, label: 'Onboarding', path: '/onboarding' },
    { icon: Store, label: 'WG Store', path: '/store' },
];

const bottomNavItems = [
    { icon: UserCircle, label: 'Usuários', path: '/usuarios' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];


const NavItem = ({ item, collapsed }) => {
    const { pathname } = useLocation();
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(
      item.children?.some(child => pathname.startsWith(child.path))
    );

    const isActive = item.path !== '#' && pathname === item.path;
    const isChildActive = item.children?.some(child => pathname.startsWith(child.path));

    const toggleSubMenu = () => {
        if(item.children) {
            setIsSubMenuOpen(!isSubMenuOpen);
        }
    };
    
    if (item.children) {
        return (
            <div>
                <div
                    onClick={toggleSubMenu}
                    className={cn(
                        "flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors nav-item",
                        isChildActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>}
                    {!collapsed && (isSubMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </div>
                <AnimatePresence>
                    {isSubMenuOpen && !collapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pl-6 border-l-2 border-primary/20 ml-3">
                                {item.children.map(child => (
                                    <NavItem key={child.path} item={child} collapsed={collapsed} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
    
    const navLinkContent = (
      <div className={cn(
            "flex items-center p-3 my-1 rounded-lg transition-colors nav-item",
            isActive ? (item.className ? `${item.className} active` : 'bg-primary text-primary-foreground') : item.className,
          )}>
          <item.icon className="h-5 w-5" />
          {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
      </div>
    );

    return (
        <NavLink to={item.path} end={item.path === '/dashboard' || item.path === '/engenharia'}>
            {collapsed ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {navLinkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            ) : navLinkContent}
        </NavLink>
    );
};


const Sidebar = () => {
    const { signOut, user, profile } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    
    const handleLogout = async () => {
        await signOut();
    };

    return (
        <motion.aside
            initial={{ width: 280 }}
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-screen p-4 bg-card border-r"
        >
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between pb-2 mb-4 border-b">
                    {!collapsed && (
                        <img 
                            src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png" 
                            alt="Logo" 
                            className="h-14 transition-opacity"
                        />
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight /> : <ChevronDown />}
                    </Button>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto pr-1">
                <ul>{navItems.map(item => <NavItem key={item.path + (item.label || 'key')} item={item} collapsed={collapsed} />)}</ul>
            </nav>

            <div className="pt-4 mt-auto border-t">
                <ul>{bottomNavItems.map(item => <NavItem key={item.path} item={item} collapsed={collapsed} />)}</ul>
                <div className="mt-4">
                     <div 
                        className={cn(
                          "flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors hover:bg-destructive/90 hover:text-destructive-foreground",
                          collapsed ? "justify-center" : ""
                        )} 
                        onClick={handleLogout}
                     >
                        <LogOut className="h-5 w-5" />
                        {!collapsed && <span className="ml-3 whitespace-nowrap">Sair</span>}
                    </div>
                </div>
                {!collapsed && profile && (
                    <div className="text-center mt-4 text-xs text-muted-foreground">
                        <p className="font-semibold">{profile.nome}</p>
                        <p>{profile.role}</p>
                    </div>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;