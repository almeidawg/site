import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Comissionamento = () => {
  const { toast } = useToast();
  const [comissoes, setComissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newComissao, setNewComissao] = useState({ vgv: '', percentual: '', mes_referencia: '', status: 'Pendente' });

  const fetchComissoes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('comissoes').select('*');
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar comissões', description: error.message });
    } else {
      setComissoes(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchComissoes();
  }, [fetchComissoes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComissao(prev => ({ ...prev, [name]: value }));
  };

  const handleAddComissao = async () => {
    const valor = (parseFloat(newComissao.vgv) * parseFloat(newComissao.percentual)) / 100;
    const { error } = await supabase.from('comissoes').insert([{ ...newComissao, vgv: parseFloat(newComissao.vgv), percentual: parseFloat(newComissao.percentual), valor }]);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao adicionar comissão', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Nova comissão adicionada.' });
      setIsDialogOpen(false);
      setNewComissao({ vgv: '', percentual: '', mes_referencia: '', status: 'Pendente' });
      fetchComissoes();
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-700';
      case 'Pendente': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <Helmet>
        <title>Comissionamento - WG Almeida Gestão Financeira</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Controle de Comissionamento</h1>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-[#F25C26] hover:bg-[#d94d1f]"><Plus className="mr-2" size={20} /> Adicionar</Button>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : (
          <div className="wg-card overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-semibold">Mês Referência</th>
                  <th className="p-4 text-left font-semibold">VGV</th>
                  <th className="p-4 text-left font-semibold">%</th>
                  <th className="p-4 text-left font-semibold">Valor</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {comissoes.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{c.mes_referencia}</td>
                    <td className="p-4">R$ {c.vgv.toLocaleString('pt-BR')}</td>
                    <td className="p-4">{c.percentual}%</td>
                    <td className="p-4 font-bold text-[#2B4580]">R$ {c.valor.toLocaleString('pt-BR')}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Comissão</DialogTitle>
            <DialogDescription>Calcule e registre uma nova comissão.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input name="mes_referencia" placeholder="Mês (ex: 2025-11)" value={newComissao.mes_referencia} onChange={handleInputChange} />
            <Input name="vgv" placeholder="VGV" value={newComissao.vgv} onChange={handleInputChange} type="number" />
            <Input name="percentual" placeholder="Percentual" value={newComissao.percentual} onChange={handleInputChange} type="number" />
          </div>
          <DialogFooter>
            <Button onClick={handleAddComissao} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Comissionamento;