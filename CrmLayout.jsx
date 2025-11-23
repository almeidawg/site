import FinanceDashboard from '@/modules/finance/pages/FinanceDashboard';
import FinanceTransactions from '@/modules/finance/pages/TransactionsPage';
import FinanceReports from '@/modules/finance/pages/ReportsPage';

const componentMap = {
  // ...
  '/financeiro': FinanceDashboard,
  '/financeiro/lancamentos': FinanceTransactions,
  '/financeiro/relatorios': FinanceReports,
};
{
  section: 'Financeiro',
  items: [
    { path: '/financeiro', label: 'Visão Geral', icon: 'DollarSign' },
    { path: '/financeiro/lancamentos', label: 'Lançamentos', icon: 'List' },
    { path: '/financeiro/relatorios', label: 'Relatórios', icon: 'PieChart' },
  ]
}

