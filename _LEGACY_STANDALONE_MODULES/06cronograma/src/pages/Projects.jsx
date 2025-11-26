import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, MapPin, Trash2, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useProjects } from '@/hooks/useProjects';
import { useEntities } from '@/hooks/useEntities';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';

const ProjectForm = ({ onFinished }) => {
  const { addProject } = useProjects();
  const { getEntities, getEntityById } = useEntities();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [entities, setEntities] = useState([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [openClientSelector, setOpenClientSelector] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadEntities = async () => {
      setLoadingEntities(true);
      const entityList = await getEntities();
      setEntities(entityList);
      setLoadingEntities(false);
    };
    loadEntities();
  }, [getEntities]);

  const handleClientSelect = useCallback(async (clientId) => {
    setSelectedClientId(clientId);
    setOpenClientSelector(false);
    
    console.log(`Client selected: ${clientId}. Fetching details.`);
    const entityDetails = await getEntityById(clientId);
    if (entityDetails && entityDetails.endereco) {
      const { logradouro, numero, bairro, cidade, uf } = entityDetails.endereco;
      const addressString = [logradouro, numero, bairro, cidade, uf].filter(Boolean).join(', ');
      console.log(`Address found: ${addressString}`);
      setFormData(prev => ({ ...prev, address: addressString }));
    } else {
        console.log("No address found for client, clearing address field.");
        setFormData(prev => ({ ...prev, address: '' }));
    }
  }, [getEntityById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !selectedClientId) {
        toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Nome do projeto e cliente são obrigatórios.' });
        return;
    }
    setIsSubmitting(true);
    try {
        const newProject = await addProject({ ...formData, client_id: selectedClientId });
        toast({ title: "Projeto criado! 🎉", description: `${formData.name} foi adicionado.` });
        onFinished();
        navigate(`/projects/${newProject.id}`);
    } catch (error) {
        console.error("Failed to create project:", error);
        toast({ variant: "destructive", title: "Erro ao criar projeto", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const selectedClient = entities.find(e => e.id === selectedClientId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="client">Cliente</Label>
        <Popover open={openClientSelector} onOpenChange={setOpenClientSelector}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openClientSelector} className="w-full justify-between">
              {selectedClient ? selectedClient.nome : "Selecione um cliente..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Buscar cliente..." />
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              <CommandGroup>
                {loadingEntities && <CommandItem disabled>Carregando...</CommandItem>}
                {entities.map((entity) => (
                  <CommandItem key={entity.id} value={entity.id} onSelect={() => handleClientSelect(entity.id)}>
                    <Check className={cn("mr-2 h-4 w-4", selectedClientId === entity.id ? "opacity-100" : "opacity-0")} />
                    {entity.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="name">Nome do Projeto</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Reforma Apartamento 101" required/>
      </div>
      <div>
        <Label htmlFor="address">Endereço da Obra</Label>
        <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Preenchido automaticamente pelo cliente" required/>
      </div>
      <div>
        <Label htmlFor="start_date">Data de Início</Label>
        <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required/>
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Criar Projeto"}
      </Button>
    </form>
  );
}

const Projects = () => {
  const { projects, loading, deleteProject } = useProjects();
  const { toast } = useToast();
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    const success = await deleteProject(projectToDelete.id);
    if (success) {
      toast({ title: 'Projeto excluído com sucesso!' });
    } else {
      toast({ variant: 'destructive', title: 'Erro ao excluir projeto.' });
    }
    setProjectToDelete(null);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.address && p.address.toLowerCase().includes(search.toLowerCase())) ||
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()))
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
              <p className="text-slate-600 mt-2">Gerencie seus projetos de obra</p>
            </div>
            <Dialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Novo Projeto</DialogTitle></DialogHeader>
                <ProjectForm onFinished={() => setAddProjectDialogOpen(false)} />
              </DialogContent>
            </Dialog>
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
                  <Link to={`/projects/${project.id}`} className="block h-full">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold flex-1 pr-2">{project.name}</h3>
                        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {project.status === 'active' ? 'Ativo' : 'Rascunho'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600 mt-auto">
                          {project.client_name && <p className="font-medium text-slate-800">{project.client_name}</p>}
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{project.address || 'Endereço não informado'}</span></div>
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Início: {new Date(project.start_date + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span></div>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          { !loading && filteredProjects.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-600">Nenhum projeto encontrado</p></div>
          )}
        </div>
      </div>
      
      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "{projectToDelete?.name}" e todos os seus dados.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Projects;
