
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const Projects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar projetos', description: error.message });
      setProjects([]);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.address || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.client_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Projetos - WGEasy Cronograma</title>
        <meta name="description" content="Gerencie todos os seus projetos de obra" />
      </Helmet>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Projetos</h1>
              <p className="text-slate-600 mt-2">Fluxo do cronograma. Ao aprovar proposta e gerar contrato, o projeto aparece aqui automaticamente.</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder="Buscar por projeto, cliente ou endereço..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10"/>
          </div>
          
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="relative group">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold flex-1 pr-2">{project.name || 'Projeto sem nome'}</h3>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {project.status === 'active' ? 'Ativo' : 'Rascunho'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600 mt-auto">
                        {project.client_name && <p className="font-medium text-slate-800">{project.client_name}</p>}
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{project.address || 'Endereço não informado'}</span></div>
                        {project.start_date && (
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Início: {new Date(`${project.start_date}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span></div>
                        )}
                      </div>
                  </div>
                </motion.div>
              ))}
              {!loading && filteredProjects.length === 0 && (
                <div className="col-span-full text-center text-slate-600">
                  Nenhum projeto ainda. Quando a proposta for aprovada e gerar contrato, o projeto é criado aqui automaticamente para iniciar o cronograma.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;
