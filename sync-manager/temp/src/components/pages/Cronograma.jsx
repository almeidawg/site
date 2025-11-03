import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, GanttChart } from 'lucide-react';
import CronogramaGantt from '@/components/cronogramas/CronogramaGantt';

const sanitizeUUIDFields = (obj) => {
  const out = { ...obj };
  for (const k in out) {
    if (k.endsWith('_id') && typeof out[k] === 'string' && out[k].trim() === '') {
      out[k] = null;
    }
  }
  return out;
}

const Cronograma = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [selectedCronograma, setSelectedCronograma] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCronogramaData, setNewCronogramaData] = useState({ titulo: '', cliente_id: '', proposta_id: '', data_inicio: new Date().toISOString().slice(0,10) });
  const [clientes, setClientes] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const { toast } = useToast();

  const fetchCronogramas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cronogramas').select('id, titulo').order('criado_em', { ascending: false });
      if (error) throw error;
      setCronogramas(data);
      if (data.length > 0 && !selectedCronograma) {
        setSelectedCronograma(data[0].id);
      }
    } catch (error) {
      toast({ title: "Erro ao buscar cronogramas", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedCronograma]);

  const fetchTarefas = useCallback(async () => {
    if (!selectedCronograma) {
        setTarefas([]);
        return;
    };
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cronograma_tarefas').select('*').eq('cronograma_id', selectedCronograma).order('ordem');
      if (error) throw error;
      setTarefas(data);
    } catch (error) {
      toast({ title: "Erro ao buscar tarefas", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedCronograma, toast]);

  useEffect(() => {
    fetchCronogramas();
    const fetchDropdownData = async () => {
      const { data: clientesData } = await supabase.from('entities').select('id, nome_razao_social').eq('tipo', 'cliente');
      setClientes(clientesData || []);
      const { data: propostasData } = await supabase.from('propostas').select('id, status');
      setPropostas(propostasData || []);
    };
    fetchDropdownData();
  }, [fetchCronogramas]);

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const handleCreateCronograma = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = sanitizeUUIDFields({
      titulo: (newCronogramaData.titulo ?? '').trim() || 'Cronograma',
      cliente_id: newCronogramaData.cliente_id,
      proposta_id: newCronogramaData.proposta_id,
      data_inicio: newCronogramaData.data_inicio || new Date().toISOString().slice(0,10),
      criado_por: user.id,
      status: 'planejamento'
    });

    const { data, error } = await supabase.from('cronogramas').insert([payload]).select().single();
    if (error) {
      toast({ title: "Erro ao criar cronograma", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cronograma criado com sucesso!" });
      if (newCronogramaData.proposta_id) {
        const { error: rpcError } = await supabase.rpc('cronograma_seed_from_proposta', { p_cronograma_id: data.id, p_proposta_id: newCronogramaData.proposta_id });
        if (rpcError) toast({ title: "Erro ao popular tarefas", description: rpcError.message, variant: "destructive" });
        else toast({ title: "Tarefas populadas da proposta!" });
      }
      setIsDialogOpen(false);
      setNewCronogramaData({ titulo: '', cliente_id: '', proposta_id: '', data_inicio: new Date().toISOString().slice(0,10) });
      await fetchCronogramas();
      setSelectedCronograma(data.id);
    }
  };

  const handleTaskChange = async (task) => {
    const { error } = await supabase.from('cronograma_tarefas').update({
      inicio: task.start.toISOString().slice(0, 10),
      fim: task.end.toISOString().slice(0, 10),
      progresso: Math.round(task.progress || 0),
    }).eq('id', task.id);

    if (error) {
      toast({ title: "Erro ao atualizar tarefa", description: error.message, variant: "destructive" });
    } else {
      setTarefas(prev => prev.map(t => t.id === task.id ? { ...t, inicio: task.start.toISOString().slice(0, 10), fim: task.end.toISOString().slice(0, 10), progresso: Math.round(task.progress || 0) } : t));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center"><GanttChart className="mr-3" /> Cronogramas</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedCronograma || ''} onValueChange={setSelectedCronograma}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um cronograma" />
            </SelectTrigger>
            <SelectContent>
              {cronogramas.map(c => <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Novo Cronograma</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (selectedCronograma && tarefas.length > 0) ? (
        <CronogramaGantt tarefas={tarefas} onChangeTask={handleTaskChange} />
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Nenhuma tarefa encontrada.</h2>
          <p className="text-gray-500">Crie um novo cronograma ou selecione um existente para começar.</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cronograma</DialogTitle>
            <DialogDescription>Preencha as informações para criar um novo cronograma de projeto.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="titulo" className="text-right">Título</Label>
              <Input id="titulo" value={newCronogramaData.titulo} onChange={e => setNewCronogramaData({ ...newCronogramaData, titulo: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cliente" className="text-right">Cliente</Label>
              <Select onValueChange={value => setNewCronogramaData({ ...newCronogramaData, cliente_id: value })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_razao_social}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="proposta" className="text-right">Proposta (Opcional)</Label>
              <Select onValueChange={value => setNewCronogramaData({ ...newCronogramaData, proposta_id: value })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione uma proposta" /></SelectTrigger>
                <SelectContent>{propostas.map(p => <SelectItem key={p.id} value={p.id}>{`Proposta ${p.id.substring(0, 8)}...`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data_inicio" className="text-right">Data de Início</Label>
              <Input id="data_inicio" type="date" value={newCronogramaData.data_inicio} onChange={e => setNewCronogramaData({ ...newCronogramaData, data_inicio: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCronograma}>Criar Cronograma</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cronograma;