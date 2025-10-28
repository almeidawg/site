
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Loader2, Save, Plus, Trash } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/customSupabaseClient';

const NovaPropostaDialog = ({ open, onOpenChange, setPropostas, propostaToEdit, setPropostaToEdit }) => {
  const { toast } = useToast();
  const [entities] = useLocalStorage('crm_entities', []);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = {
    cliente_id: '',
    cliente_nome: '',
    descricao: '',
    valor_total: 0,
    itens: []
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProdutos = async () => {
    const { data, error } = await supabase.from('produtos_servicos').select('*').eq('ativo', true);
    if (!error) setProdutos(data);
  };
  
  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    const total = formData.itens.reduce((acc, item) => acc + (parseFloat(item.valor_total) || 0), 0);
    setFormData(prev => ({...prev, valor_total: total }));
  }, [formData.itens]);

  useEffect(() => {
    if (propostaToEdit) {
      setIsEditing(true);
      const cliente = entities.find(c => c.id === propostaToEdit.cliente_id);
      setFormData({
        id: propostaToEdit.id,
        numero: propostaToEdit.numero,
        cliente_id: propostaToEdit.cliente_id,
        cliente_nome: cliente?.nome_razao_social || 'N/A',
        descricao: propostaToEdit.descricao,
        valor_total: propostaToEdit.valor_total,
        versao: propostaToEdit.versao,
        data_criacao: propostaToEdit.data_criacao,
        itens: propostaToEdit.itens || [],
      });
    } else {
      setIsEditing(false);
      setFormData(initialFormState);
    }
  }, [propostaToEdit, open, entities]);

  const handleClose = () => {
    onOpenChange(false);
    setPropostaToEdit(null);
  };
  
  const handleAddItem = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;
    
    const newItem = {
        id: `item-${Date.now()}`,
        produto_id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao,
        unidade: produto.unidade,
        quantidade: 1,
        valor_unitario: produto.valor_unitario,
        valor_total: produto.valor_unitario,
    };
    setFormData(prev => ({...prev, itens: [...prev.itens, newItem]}));
  };

  const handleUpdateItem = (itemId, field, value) => {
    const updatedItens = formData.itens.map(item => {
        if (item.id === itemId) {
            const newItem = { ...item, [field]: value };
            if (field === 'quantidade' || field === 'valor_unitario') {
                newItem.valor_total = (parseFloat(newItem.quantidade) || 0) * (parseFloat(newItem.valor_unitario) || 0);
            }
            return newItem;
        }
        return item;
    });
    setFormData(prev => ({...prev, itens: updatedItens}));
  };

  const handleRemoveItem = (itemId) => {
     setFormData(prev => ({...prev, itens: prev.itens.filter(item => item.id !== itemId)}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.cliente_id) {
        toast({ title: "Cliente é obrigatório!", variant: "destructive" });
        setLoading(false);
        return;
    }

    if (isEditing) {
      const updatedProposta = {
        ...formData,
        versao: (formData.versao || 1) + 1,
        status: 'rascunho',
      };
      setPropostas(prev => prev.map(p => p.id === formData.id ? updatedProposta : p));
      toast({ title: "Proposta atualizada!", description: `A proposta #${formData.numero} foi alterada.` });
    } else {
      const novaProposta = {
        id: `prop_${Date.now()}`,
        numero: `PROP-${(Math.floor(Math.random() * 9000) + 1000)}`,
        cliente_id: formData.cliente_id,
        cliente_nome: formData.cliente_nome,
        descricao: formData.descricao,
        valor_total: formData.valor_total,
        itens: formData.itens,
        versao: 1,
        status: 'rascunho',
        data_criacao: new Date().toISOString(),
      };
      setPropostas(prev => [novaProposta, ...prev]);
      toast({ title: "Proposta criada! 🎉", description: `Proposta #${novaProposta.numero} foi criada com sucesso.` });
    }

    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editando Proposta #${formData.numero}` : 'Nova Proposta Detalhada'}</DialogTitle>
          <DialogDescription>Adicione itens do seu catálogo para montar um orçamento preciso.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select 
                  onValueChange={(val) => {
                     const cliente = entities.find(c => c.id === val);
                     setFormData(prev => ({...prev, cliente_id: val, cliente_nome: cliente?.nome_razao_social}));
                  }}
                  value={formData.cliente_id}
                  required
                >
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>
                        {entities.filter(e => e.tipo === 'cliente').map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.nome_razao_social}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição Geral da Proposta</Label>
                <Input id="descricao" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Reforma completa de interiores"/>
              </div>
          </div>

          <div className="space-y-2">
            <Label>Itens da Proposta</Label>
            <div className="p-3 border rounded-lg bg-gray-50 space-y-3 max-h-[300px] overflow-y-auto">
                {formData.itens.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-white rounded shadow-sm">
                        <div className="col-span-4"><Input value={item.nome} readOnly/></div>
                        <div className="col-span-2"><Input type="number" value={item.quantidade} onChange={e => handleUpdateItem(item.id, 'quantidade', e.target.value)} placeholder="Qtd"/></div>
                        <div className="col-span-2"><Input value={item.unidade} onChange={e => handleUpdateItem(item.id, 'unidade', e.target.value)} placeholder="Un."/></div>
                        <div className="col-span-2"><Input type="number" step="0.01" value={item.valor_unitario} onChange={e => handleUpdateItem(item.id, 'valor_unitario', e.target.value)} placeholder="Vl. Unit."/></div>
                        <div className="col-span-1 text-right font-semibold">{parseFloat(item.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash className="h-4 w-4 text-red-500"/></Button></div>
                    </div>
                ))}
                 <Select onValueChange={handleAddItem}>
                    <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Adicionar item do catálogo..."/>
                    </SelectTrigger>
                    <SelectContent>
                        {produtos.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nome} - {parseFloat(p.valor_unitario).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-primary">{formData.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gradient-primary text-white" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Proposta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaPropostaDialog;
