import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('crm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
         const defaultUser = {
            id: '1',
            nome: 'William Almeida',
            email: 'william@wgalmeida.com.br',
            perfil: 'diretoria',
            avatar: null
         };
         localStorage.setItem('crm_user', JSON.stringify(defaultUser));
         setUser(defaultUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    console.log("Tentando login com:", email, password);
    const mockUser = {
        id: '1',
        nome: 'William Almeida',
        email: 'william@wgalmeida.com.br',
        perfil: 'diretoria',
        avatar: null
    };
    localStorage.setItem('crm_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  };
  
  const logout = () => {
    localStorage.removeItem('crm_user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    const permissions = {
      diretoria: ['all'],
      vendas: ['leads', 'oportunidades', 'propostas', 'contratos_view'],
      engenharia: ['obras', 'compras', 'tarefas'],
      marcenaria: ['marcenaria', 'ops'],
      compras: ['compras', 'fornecedores', 'pcs'],
      fornecedor: ['portal_fornecedor']
    };

    const userPermissions = permissions[user.perfil] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  const canViewCosts = () => {
    return user?.perfil === 'diretoria';
  };

  return { user, setUser, loading, login, logout, hasPermission, canViewCosts };
};