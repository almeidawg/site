
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FolderKanban, Calendar, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';

const Dashboard = () => {
  const { projects } = useProjects();

  const activeProjects = projects.filter(p => p.status === 'active');
  const totalTasks = projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);

  const stats = [
    { label: 'Projetos Ativos', value: activeProjects.length, icon: FolderKanban, color: 'from-blue-500 to-indigo-500' },
    { label: 'Total de Tarefas', value: totalTasks, icon: Calendar, color: 'from-emerald-500 to-teal-500' },
    { label: 'Em Andamento', value: projects.filter(p => p.status === 'active').length, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
    { label: 'Atrasados', value: 0, icon: AlertCircle, color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - WGEasy Cronograma</title>
        <meta name="description" content="Visão geral dos seus projetos e cronogramas de obra" />
      </Helmet>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Visão geral dos seus projetos</p>
            </div>
            <Link to="/projects">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/30">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-2xl font-bold mb-6">Projetos Recentes</h2>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 mb-4">Nenhum projeto criado ainda</p>
                <Link to="/projects">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-500">
                    Criar Primeiro Projeto
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <p className="text-slate-600 text-sm">{project.address}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status === 'active' ? 'Ativo' : 'Rascunho'}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
