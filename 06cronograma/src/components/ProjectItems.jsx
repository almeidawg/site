import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, FileDown, Search, Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const ItemForm = ({ project, onFinished }) => {
  const { addProjectItem } = useProjects();
  const { items: catalogItems } = useCatalog();
  const { toast } = useToast();
  const [itemSearch, setItemSearch] = useState('');
  const [formData, setFormData] = useState({ catalog_item_id: '', quantity: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.catalog_item_id || !formData.quantity) {
        toast({ variant: "destructive", title: "Campos obrigatórios", description: "Selecione um item e informe a quantidade." });
        return;
    }

    const result = await addProjectItem(project.id, { 
      catalog_item_id: formData.catalog_item_id, 
      quantity: parseFloat(formData.quantity) 
    });

    if (result) {
      toast({ title: "Item adicionado! 📦" });
      onFinished();
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar o item." });
    }
  };

  const filteredCatalogItems = catalogItems.filter(catItem => 
    catItem.name.toLowerCase().includes(itemSearch.toLowerCase()) || 
    (catItem.code && catItem.code.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="catalogItem">Item do Catálogo</Label>
        <Select value={formData.catalog_item_id} onValueChange={(value) => setFormData({ ...formData, catalog_item_id: value })}>
            <SelectTrigger><SelectValue placeholder="Selecione um item" /></SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Buscar item..." value={itemSearch} onChange={e => setItemSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredCatalogItems.map((catItem) => (<SelectItem key={catItem.id} value={catItem.id}>{catItem.name} ({catItem.code})</SelectItem>))}
              </div>
            </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="quantity">Quantidade</Label>
        <Input id="quantity" type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Ex: 100" required />
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">Adicionar</Button>
    </form>
  );
};

const ProjectItems = ({ project, isPrintMode = false }) => {
  const { removeProjectItem, bulkAddProjectItems } = useProjects();
  const { items: allCatalogItems } = useCatalog();
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  const projectItems = project?.items || [];

  const handleRemove = (itemId) => {
    removeProjectItem(project.id, itemId);
    toast({ description: "Item removido com sucesso." });
  };
  
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).slice(1).filter(line => line.trim() !== ''); // Skip header
        const newItems = [];

        for (const line of lines) {
            const [code, quantity] = line.split(',');
            if (code && quantity) {
                const catalogItem = allCatalogItems.find(item => item.code.trim() === code.trim());
                if (catalogItem) {
                    newItems.push({ catalog_item_id: catalogItem.id, quantity: parseFloat(quantity) });
                } else {
                    toast({ variant: "destructive", title: "Item não encontrado", description: `O item com código "${code.trim()}" não foi encontrado no catálogo.` });
                }
            }
        }
        if (newItems.length > 0) {
            toast({ title: `Importando ${newItems.length} itens...` });
            await bulkAddProjectItems(project.id, newItems);
            toast({ title: "Importação concluída!", description: `${newItems.length} itens foram adicionados ao projeto.`});
        }
    };
    reader.readAsText(file);
    event.target.value = null;
  };
  
  const content = (
    <div className={`bg-white ${isPrintMode ? '' : 'rounded-xl shadow-lg border border-slate-200'} overflow-hidden`}>
      <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isPrintMode ? 'bg-slate-200' : 'bg-slate-50'} border-b border-slate-200`}><tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Item</th><th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Quantidade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Unidade</th>
                {!isPrintMode && <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ações</th>}
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {projectItems.map((item) => {
                const catalogItem = item.catalog_item;
                if (!catalogItem) return null;
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${!isPrintMode ? 'hover:bg-slate-50' : ''} transition-colors`}>
                    <td className="px-6 py-4 text-sm font-medium">{catalogItem.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{catalogItem.unit}</td>
                    {!isPrintMode && 
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1">
                           <Link to={`/catalog?edit=${catalogItem.id}`}><Button variant="ghost" size="icon"><Edit className="h-4 w-4 text-blue-500" /></Button></Link>
                          <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                        </div>
                      </td>
                    }
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
      </div>
      </div>
  );

  if(isPrintMode) return content;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Itens do Projeto</h2>
        <div className="flex gap-2">
            <a href="/modelo-importacao-projeto.csv" download><Button variant="outline"><FileDown className="h-4 w-4 mr-2" />Modelo</Button></a>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
            <Button variant="outline" onClick={() => fileInputRef.current.click()}><Upload className="h-4 w-4 mr-2" />Importar</Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-500"><Plus className="h-4 w-4 mr-2" />Adicionar Item</Button></DialogTrigger>
              <DialogContent>
                  <DialogHeader><DialogTitle>Adicionar Item ao Projeto</DialogTitle></DialogHeader>
                  <ItemForm project={project} onFinished={() => setAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
        </div>
      </div>
      {projectItems.length > 0 ? content : (<div className="text-center py-12 bg-white rounded-xl border border-slate-200"><p className="text-slate-600">Nenhum item adicionado ainda</p></div>)}
    </div>
  );
};

export default ProjectItems;