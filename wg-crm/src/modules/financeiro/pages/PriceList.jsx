import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, FileText, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { parseCsvFile, validateCsvColumns } from '@/lib/csvImporter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TEMPLATE_PATH = '/templates/catalog-items-import.csv';
const EXPECTED_COLUMNS = ['code', 'name', 'category', 'type', 'unit', 'productivity', 'value'];

const PriceList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const fileInputRef = useRef(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('catalog_items').select('*').order('name', { ascending: true });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchItems]);
  
  const openFormForNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFileImport = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = '';
      const { columns, rows } = await parseCsvFile(file);
      const missing = validateCsvColumns(columns, EXPECTED_COLUMNS);
      if (missing.length) {
        toast({
          variant: 'destructive',
          title: 'Colunas inválidas',
          description: `Faltam: ${missing.join(', ')}`,
        });
        return;
      }
      toast({
        title: 'Arquivo validado',
        description: `${rows.length} linhas prontas para importação. (Importação em massa pode ser feita via Supabase Admin)`,
      });
    },
    [toast]
  );

  const handleDelete = async (id) => {
    const { error } = await supabase.from('catalog_items').delete().match({ id });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Item excluído.' });
      fetchItems();
    }
  };

  const showNotImplementedToast = () => {
    toast({
      title: '🚧 Em construção!',
      description: 'Esta funcionalidade ainda não foi implementada. Peça no próximo prompt! 🚀',
    });
  };

  return (
    <>
      <Helmet><title>Price List - WG Almeida</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Price List</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Buscar por nome..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Download className="mr-2 h-4 w-4" /> Importar</Button>
            <a href={TEMPLATE_PATH} download className="text-sm text-slate-600 hover:text-primary">Modelo</a>
            <Button onClick={openFormForNew} className="bg-[#F25C26] hover:bg-[#d94d1f]"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
          </div>
        </div>
        
        {loading ? (
           <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : (
          <div className="wg-card overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-semibold">Item</th>
                  <th className="p-4 text-left font-semibold">Código</th>
                  <th className="p-4 text-left font-semibold">Categoria</th>
                  <th className="p-4 text-left font-semibold">Tipo</th>
                  <th className="p-4 text-left font-semibold">Produtividade</th>
                  <th className="p-4 text-left font-semibold">Valor</th>
                  <th className="p-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <motion.tr 
                    key={item.id} 
                    className="border-b hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4">{item.code || '—'}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4">{item.type}</td>
                    <td className="p-4">{item.productivity ?? 0}</td>
                    <td className="p-4 font-bold text-[#F25C26]">R$ {item.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openFormForEdit(item)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação excluirá permanentemente o item.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="ghost" size="icon" onClick={showNotImplementedToast}><FileText className="h-4 w-4 text-gray-500" /></Button>
                        <Button variant="ghost" size="icon" onClick={showNotImplementedToast}><Share2 className="h-4 w-4 text-gray-500" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && !loading && (
              <div className="text-center py-16 text-gray-500">
                <p>Nenhum item encontrado.</p>
                <p className="text-sm">Tente ajustar sua busca ou adicione um novo item.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <ItemForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          item={editingItem}
          onSuccess={fetchItems}
        />
      )}
    </>
  );
};

const ItemForm = ({ isOpen, setIsOpen, item, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!item;
  const [formData, setFormData] = useState({ name: '', code: '', unit: '', value: '', category: '', type: 'Serviço', productivity: 0, setup_days: 0 });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: item.name || '',
        code: item.code || '',
        unit: item.unit || '',
        value: item.value || '',
        category: item.category || '',
        type: item.type || 'Serviço',
        productivity: item.productivity || 0,
        setup_days: item.setup_days || 0,
      });
    } else {
      setFormData({ name: '', code: '', unit: '', value: '', category: '', type: 'Serviço', productivity: 0, setup_days: 0 });
    }
  }, [item, isOpen]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    const dataToSubmit = {
      ...formData,
      value: parseFloat(formData.value) || 0,
      productivity: parseFloat(formData.productivity) || 0,
      setup_days: parseFloat(formData.setup_days) || 0,
    };
    
    const { error } = isEditing
      ? await supabase.from('catalog_items').update(dataToSubmit).match({ id: item.id })
      : await supabase.from('catalog_items').insert([dataToSubmit]);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Item ${isEditing ? 'atualizado' : 'adicionado'}.` });
      setIsOpen(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Item' : 'Novo Item no Price List'}</DialogTitle>
          <DialogDescription>Preencha os detalhes do serviço ou material.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input name="name" placeholder="Nome" value={formData.name} onChange={handleInputChange} />
          <Input name="code" placeholder="Código interno" value={formData.code} onChange={handleInputChange} />
          <Input name="unit" placeholder="Unidade (m², un, etc.)" value={formData.unit} onChange={handleInputChange} />
          <Input name="category" placeholder="Categoria" value={formData.category} onChange={handleInputChange} />
          <Input name="type" placeholder="Tipo (Produto ou Serviço)" value={formData.type} onChange={handleInputChange} />
          <Input name="productivity" placeholder="Produtividade" type="number" value={formData.productivity} onChange={handleInputChange} />
          <Input name="value" placeholder="Valor" type="number" value={formData.value} onChange={handleInputChange} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PriceList;
