/**
 * Application Routes
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  STORE: '/store',
  PRODUCT_DETAIL: '/product/:id',
  SUCCESS: '/success',

  // CRM routes
  DASHBOARD: '/dashboard',

  // Customer management
  CLIENTES: '/clientes',
  PESSOAS: '/pessoas',
  LEADS: '/leads',

  // Sales
  OPORTUNIDADES: '/oportunidades',
  PROPOSTAS: '/propostas',
  CONTRATOS: '/contratos',

  // Financial
  FINANCEIRO: '/financeiro',

  // Operations
  COMPRAS: '/compras',
  OBRAS: '/obras',
  ARQUITETURA: '/arquitetura',
  MARCENARIA: '/marcenaria',
  LOGISTICA: '/logistica',
  ASSISTENCIA: '/assistencia',

  // Configuration
  CONFIGURACOES: '/configuracoes',
  USUARIOS: '/usuarios',
  INTEGRATIONS: '/integrations',

  // Public cadastro
  PUBLIC_CADASTRO: '/cadastro/:type/novo',
};

// Route groups for authorization
export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.STORE, ROUTES.PRODUCT_DETAIL, ROUTES.SUCCESS],
  AUTHENTICATED: Object.values(ROUTES).filter(route =>
    !route.includes('/login') &&
    !route.includes('/register') &&
    !route.includes('/store') &&
    !route.includes('/product') &&
    !route.includes('/success')
  ),
};
