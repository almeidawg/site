import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Receipt, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const Reembolsos = () => {
  const { toast } = useToast();
  const [reembolsos, setReembolsos] = useState([]);
  const [obras, setObras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReembolso, setNewReembolso] = useState({ obra_id: '', categoria_id: '', valor: '', data: new Date().toISOString().split('T')[0], status: 'Pendente' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: reembolsosData, error: reembolsosError } = await supabase.from('reembolsos').select('*, obras(nome), categorias_custo(nome)');
    const { data: obrasData, error: obrasError } = await supabase.from('obras').select('id, nome');
    const { data: categoriasData, error: catError } = await supabase.from('categorias_custo').select('id, nome');
    
    if (reembolsosError || obrasError || catError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: reembolsosError?.message || obrasError?.message || catError?.message });
    } else {
      setReembolsos(reembolsosData);
      setObras(obrasData);
      setCategorias(categoriasData);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  const handleInputChange = (e) => setNewReembolso(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setNewReembolso(prev => ({ ...prev, [name]: value }));

  const handleAddReembolso = async () => {
    const { error } = await supabase.from('reembolsos').insert([{ ...newReembolso, valor: parseFloat(newReembolso.valor) }]);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Reembolso adicionado.' });
      setIsDialogOpen(false);
      setNewReembolso({ obra_id: '', categoria_id: '', valor: '', data: new Date().toISOString().split('T')[0], status: 'Pendente' });
      fetchData();
    }
  };

  const getStatusColor = (status) => status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <>
      <Helmet><title>Reembolsos - WG Almeida Gestão Financeira</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Controle de Reembolsos</h1>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-[#F25C26] hover:bg-[#d94d1f]"><Plus className="mr-2" /> Novo Reembolso</Button>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {reembolsos.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="wg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg"><Receipt className="text-blue-600" /></div>
                  <div>
                    <p className="font-bold">{r.obras?.nome || 'N/A'} - {r.categorias_custo?.nome || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Data: {new Date(r.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-[#2B4580]">R$ {r.valor.toLocaleString('pt-BR')}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>{r.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Reembolso</DialogTitle>
            <DialogDescription>Registre um novo pedido de reembolso.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select onValueChange={(v) => handleSelectChange('obra_id', v)}><SelectTrigger><SelectValue placeholder="Selecione a Obra" /></SelectTrigger><SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent></Select>
            <Select onValueChange={(v) => handleSelectChange('categoria_id', v)}><SelectTrigger><SelectValue placeholder="Selecione a Categoria" /></SelectTrigger><SelectContent>{categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select>
            <Input name="valor" placeholder="Valor" type="number" value={newReembolso.valor} onChange={handleInputChange} />
            <Input name="data" type="date" value={newReembolso.data} onChange={handleInputChange} />
          </div>
          <DialogFooter><Button onClick={handleAddReembolso} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Reembolsos;