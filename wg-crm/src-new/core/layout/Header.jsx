import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, ShoppingCart as ShoppingCartIcon, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import ShoppingCart from '@/components/ShoppingCart';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Header = ({ user, toggleSidebar, isStore = false }) => {
  const { cartItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className={`glass-effect border-b border-purple-200/50 sticky top-0 z-40 ${isStore ? 'bg-gray-900/50 border-white/10 text-white' : ''}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={`lg:hidden ${isStore ? 'text-white hover:bg-white/10' : ''}`}
            >
              <Menu size={20} />
            </Button>
            
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isStore ? 'text-gray-400' : 'text-muted-foreground'}`} size={18} />
              <input
                type="text"
                placeholder={isStore ? "Buscar produtos..." : "Buscar clientes, obras..."}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border transition-all ${isStore ? 'bg-white/10 border-white/20 focus:bg-white/20 focus:ring-purple-500/50' : 'border-purple-200/50 bg-white/50 focus:ring-purple-500/50'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isStore && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ShoppingCartIcon size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {totalItems}
                  </span>
                )}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2 rounded-xl transition-colors ${isStore ? 'hover:bg-white/10' : 'hover:bg-purple-100'}`}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={`flex items-center gap-3 pl-4 cursor-pointer ${isStore ? 'border-l border-white/20' : 'border-l border-purple-200/50'}`}>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{user?.nome || 'Usuário'}</p>
                    <p className={`text-xs capitalize ${isStore ? 'text-gray-300' : 'text-muted-foreground'}`}>{user?.perfil || 'Perfil'}</p>
                  </div>
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.nome} />
                    <AvatarFallback className="gradient-primary text-white font-semibold">
                      {user?.nome?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/usuarios')}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>
      {isStore && <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
    </>
  );
};

export default Header;