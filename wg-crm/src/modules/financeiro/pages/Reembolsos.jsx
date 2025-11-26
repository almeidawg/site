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
  const [categorias, setCategorias] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReembolso, setNewReembolso] = useState({
    destinatario_id: '',
    destinatario_tipo: 'colaborador',
    categoria_id: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    status: 'Pendente',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: reembolsosData, error: reembolsosError } = await supabase
      .from('reembolsos')
      .select('*, destinatario:entities(nome_razao_social), categoria:fin_categories(name)');

    const { data: categoriasData, error: catError } = await supabase.from('fin_categories').select('id, name');
    const { data: destData, error: destError } = await supabase
      .from('entities')
      .select('id, nome_razao_social, tipo')
      .in('tipo', ['colaborador', 'fornecedor']);
    
    if (reembolsosError || catError || destError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: reembolsosError?.message || catError?.message || destError?.message });
    } else {
      setReembolsos(reembolsosData || []);
      setCategorias(categoriasData || []);
      setDestinatarios(destData || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  const handleInputChange = (e) => setNewReembolso(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setNewReembolso(prev => ({ ...prev, [name]: value }));

  const handleAddReembolso = async () => {
    const payload = {
      ...newReembolso,
      valor: parseFloat(newReembolso.valor) || 0,
    };
    const { error } = await supabase.from('reembolsos').insert([payload]);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Reembolso adicionado.' });
      setIsDialogOpen(false);
      setNewReembolso({
        destinatario_id: '',
        destinatario_tipo: 'colaborador',
        categoria_id: '',
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        status: 'Pendente',
      });
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
                    <p className="font-bold">{r.destinatario?.nome_razao_social || 'Sem destinatário'} - {r.categoria?.name || 'Categoria'}</p>
                    <p className="text-sm text-gray-600">{r.descricao || 'Reembolso'}</p>
                    <p className="text-sm text-gray-600">Data: {new Date(r.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-[#2B4580]">R$ {Number(r.valor || 0).toLocaleString('pt-BR')}</p>
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
            <Select onValueChange={(v) => handleSelectChange('destinatario_id', v)}>
              <SelectTrigger><SelectValue placeholder="Destinatário" /></SelectTrigger>
              <SelectContent>{destinatarios.map(d => <SelectItem key={d.id} value={d.id}>{d.nome_razao_social}</SelectItem>)}</SelectContent>
            </Select>
            <Select onValueChange={(v) => handleSelectChange('categoria_id', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione a Categoria" /></SelectTrigger>
              <SelectContent>{categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input name="descricao" placeholder="Descrição" value={newReembolso.descricao} onChange={handleInputChange} />
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
