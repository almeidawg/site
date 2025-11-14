import CronoDashboard from '@/modules/cronograma/pages/Dashboard';
import CronoProjects from '@/modules/cronograma/pages/Projects';
import CronoCatalog from '@/modules/cronograma/pages/Catalog';

const componentMap = {
  // ...
  '/cronogramas': CronoDashboard,
  '/cronogramas/projetos': CronoProjects,
  '/cronogramas/catalogo': CronoCatalog,
};
{
  section: 'Operações',
  items: [
    { path: '/obras', label: 'Obras', icon: 'HardHat' },
    { path: '/cronogramas', label: 'Cronogramas', icon: 'GanttChart' },
    { path: '/storage', label: 'Storage', icon: 'Package' },
  ]
}
