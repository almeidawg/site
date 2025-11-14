
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Trash, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from '@/lib/customSupabaseClient';

const parseBRLToNumber = (v) => {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (!v) return 0;
    const n = String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const num = Number(n);
    return isFinite(num) ? num : 0;
};

const isUUID = (x) => {
    return typeof x === 'string' && /^[0-9a-f-]{36}$/i.test(x);
}

const NovaPropostaDialog = ({ open, onOpenChange, onSuccess, propostaToEdit, setPropostaToEdit }) => {
  const { toast } = useToast();
  const [entities, setEntities] = useState([]);
  const [priceListItems, setPriceListItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = {
    cliente_id: 'none',
    cliente_nome: '',
    descricao: '',
    status: 'rascunho',
    valor_total: 0,
    itens: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchInitialData = async () => {
        const { data: entitiesData, error: entitiesError } = await supabase.from('entities').select('id, nome_razao_social, tipo').eq('tipo', 'cliente');
        if (!entitiesError) setEntities(entitiesData);

        const { data: priceListData, error: priceListError } = await supabase.from('produtos_servicos').select('*').order('nome');
        if (!priceListError) setPriceListItems(priceListData);
    };

    if(open) {
        fetchInitialData();
    }
  }, [open]);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
        if (formData.cliente_id && formData.cliente_id !== 'none') {
            const { data, error } = await supabase
                .from('v_purchase_orders_full')
                .select('id, codigo, itens_descricao, valor_total')
                .eq('cliente_id', formData.cliente_id);
            
            if (error) {
                toast({ title: "Erro ao buscar PCs", description: error.message, variant: "destructive" });
                setPurchaseOrders([]);
            } else {
                setPurchaseOrders(data);
            }
        } else {
            setPurchaseOrders([]);
        }
    };
    fetchPurchaseOrders();
  }, [formData.cliente_id, toast]);

  useEffect(() => {
    const total = formData.itens.reduce((acc, item) => acc + (parseBRLToNumber(item.valor_total) || 0), 0);
    setFormData(prev => ({...prev, valor_total: total }));
  }, [formData.itens]);

  useEffect(() => {
    if (propostaToEdit && open) {
      setIsEditing(true);
      const fetchPropostaItens = async () => {
          const { data: itensData, error: itensError } = await supabase
              .from('propostas_itens')
              .select('*')
              .eq('proposta_id', propostaToEdit.id);
          
          const cliente = entities.find(c => c.id === propostaToEdit.cliente_id);
          setFormData({
            id: propostaToEdit.id,
            codigo: propostaToEdit.codigo,
            cliente_id: propostaToEdit.cliente_id || 'none',
            cliente_nome: cliente?.nome_razao_social || 'N/A',
            descricao: propostaToEdit.descricao,
            status: propostaToEdit.status,
            valor_total: propostaToEdit.valor_total,
            itens: itensError ? [] : itensData.map(item => ({...item, isSaved: true})),
          });
      };
      if (entities.length > 0) fetchPropostaItens();
    } else {
      setIsEditing(false);
      setFormData(initialFormState);
    }
  }, [propostaToEdit, open, entities]);

  const handleClose = () => {
    onOpenChange(false);
    if(setPropostaToEdit) setPropostaToEdit(null);
  };
  
  const handleAddItem = (itemId) => {
    const item = priceListItems.find(p => p.id === itemId);
    if (!item) return;
    
    const newItem = {
        id: `new-${Date.now()}`,
        produto_id: item.id,
        descricao: item.nome,
        unidade: item.unidade,
        quantidade: 1,
        valor_unitario: item.valor_venda,
        valor_total: item.valor_venda,
    };
    setFormData(prev => ({...prev, itens: [...prev.itens, newItem]}));
  };

  const handleImportPC = async (orderId) => {
    const { data: itemsData, error } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('order_id', orderId);

    if (error) {
        toast({ title: "Erro ao importar itens", description: error.message, variant: "destructive" });
        return;
    }

    const newItems = itemsData.map(item => ({
        id: `new-${Date.now()}-${item.id}`,
        produto_id: item.produto_id,
        descricao: item.descricao,
        unidade: item.unidade,
        quantidade: item.quantidade,
        valor_unitario: item.preco_unitario,
        valor_total: (item.quantidade || 0) * (item.preco_unitario || 0),
    }));

    setFormData(prev => ({ ...prev, itens: [...prev.itens, ...newItems] }));
    toast({ title: "Itens importados!", description: `${newItems.length} itens do pedido de compra foram adicionados.` });
  };

  const handleUpdateItem = (itemId, field, value) => {
    const updatedItens = formData.itens.map(item => {
        if (item.id === itemId) {
            const newItem = { ...item, [field]: value };
            if (field === 'quantidade' || field === 'valor_unitario') {
                newItem.valor_total = (parseBRLToNumber(newItem.quantidade) || 0) * (parseBRLToNumber(newItem.valor_unitario) || 0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const missing = [];
    if (!formData.descricao?.trim()) missing.push('Descrição');
    if (!isUUID(formData.cliente_id)) missing.push('Cliente');
    
    if (missing.length > 0) {
        toast({ title: "Campos obrigatórios", description: `Por favor, preencha: ${missing.join(', ')}`, variant: "destructive" });
        setLoading(false);
        return;
    }

    const propostaData = {
      cliente_id: formData.cliente_id,
      descricao: formData.descricao,
      status: formData.status,
      valor_total: formData.valor_total,
      codigo: formData.codigo || `PROP-${Math.floor(100000 + Math.random() * 900000)}`
    };

    try {
        let propostaId;
        if (isEditing) {
            const { data, error } = await supabase
                .from('propostas')
                .update(propostaData)
                .eq('id', formData.id)
                .select('id')
                .single();
            if (error) throw error;
            propostaId = data.id;

            const savedItemIds = formData.itens.filter(i => i.isSaved).map(i => i.id);
            const { data: currentItems } = await supabase.from('propostas_itens').select('id').eq('proposta_id', propostaId);
            const itemsToDelete = currentItems.filter(i => !savedItemIds.includes(i.id)).map(i => i.id);
            if (itemsToDelete.length > 0) {
                await supabase.from('propostas_itens').delete().in('id', itemsToDelete);
            }

        } else {
            const { data, error } = await supabase
                .from('propostas')
                .insert(propostaData)
                .select('id')
                .single();
            if (error) throw error;
            propostaId = data.id;
        }

        if (formData.itens.length > 0) {
            const itensToUpsert = formData.itens.map(({ id, isSaved, valor_total, ...item }) => ({
                ...(isSaved ? { id } : {}),
                proposta_id: propostaId,
                ...item,
                valor_total: (parseBRLToNumber(item.quantidade) || 0) * (parseBRLToNumber(item.valor_unitario) || 0)
            }));

            const { error: itensError } = await supabase.from('propostas_itens').upsert(itensToUpsert);
            if (itensError) throw itensError;
        }

        toast({ title: `Proposta ${isEditing ? 'atualizada' : 'criada'} com sucesso! 🎉`});
        onSuccess();
        handleClose();

    } catch (error) {
        console.error("Erro ao salvar proposta:", error);
        toast({ title: 'Erro ao salvar proposta', description: error.message, variant: 'destructive'});
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editando Proposta #${formData.codigo}` : 'Nova Proposta Detalhada'}</DialogTitle>
          <DialogDescription>Adicione itens do seu catálogo ou importe de um pedido de compra.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select 
                  onValueChange={(val) => {
                     const cliente = entities.find(c => c.id === val);
                     setFormData(prev => ({...prev, cliente_id: val, cliente_nome: cliente?.nome_razao_social, itens: isEditing ? prev.itens : [] }));
                  }}
                  value={formData.cliente_id || 'none'}
                  required
                >
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none" disabled>Selecione um cliente</SelectItem>
                        {entities.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.nome_razao_social}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição Geral da Proposta *</Label>
                <Input id="descricao" value={formData.descricao || ''} onChange={(e) => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Reforma completa de interiores"/>
              </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label>Itens da Proposta</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" disabled={!formData.cliente_id || formData.cliente_id === 'none' || purchaseOrders.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Importar Pedido de Compra
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Pedidos de Compra</h4>
                                <p className="text-sm text-muted-foreground">
                                    Selecione um PC para importar os itens.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                {purchaseOrders.map(pc => (
                                    <div key={pc.id} onClick={() => handleImportPC(pc.id)} className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                                        <span className="text-sm font-medium">#{pc.codigo}</span>
                                        <span className="text-xs text-muted-foreground">{pc.valor_total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/50 space-y-3 max-h-[300px] overflow-y-auto">
                {formData.itens.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                        <div className="col-span-4"><Input value={item.descricao} onChange={e => handleUpdateItem(item.id, 'descricao', e.target.value)} placeholder="Descrição"/></div>
                        <div className="col-span-2"><Input type="number" value={item.quantidade} onChange={e => handleUpdateItem(item.id, 'quantidade', e.target.value)} placeholder="Qtd"/></div>
                        <div className="col-span-2"><Input value={item.unidade} onChange={e => handleUpdateItem(item.id, 'unidade', e.target.value)} placeholder="Un."/></div>
                        <div className="col-span-2"><Input type="number" step="0.01" value={item.valor_unitario} onChange={e => handleUpdateItem(item.id, 'valor_unitario', e.target.value)} placeholder="Vl. Unit."/></div>
                        <div className="col-span-1 text-right font-semibold">{parseBRLToNumber(item.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash className="h-4 w-4 text-red-500"/></Button></div>
                    </div>
                ))}
                 <Select onValueChange={handleAddItem}>
                    <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Adicionar item do catálogo..."/>
                    </SelectTrigger>
                    <SelectContent>
                        {priceListItems.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nome} - {parseBRLToNumber(p.valor_venda).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-primary">{formData.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>

          <DialogFooter className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar Proposta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaPropostaDialog;
