import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEntities } from '@/hooks/useEntities.js';
import { useCatalog } from '@/hooks/useCatalog';
import { Loader2, Save, Trash, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const paymentMethodOptions = [
  'Cartão de Crédito',
  'Pix',
  'Transferência',
  'Boleto',
  'Santander',
  'Dinheiro'
];

const paymentPlanOptions = [
  { value: 'avista', label: 'À vista' },
  { value: 'parcelado', label: 'Parcelado' },
  { value: 'parcelado_entrada', label: 'Parcelado com entrada' },
];

const tipoPropostaOptions = ['arquitetura', 'engenharia', 'marcenaria'];

const initialFormState = {
  cliente_id: '',
  cliente_nome: '',
  descricao: '',
  valor_total: 0,
  itens: [],
  tipo_proposta: 'arquitetura',
  payment_method: 'Pix',
  payment_plan: 'avista',
  installments_count: 2,
  entry_amount: 0,
  first_payment_date: '',
  payment_interval_days: 30,
};

const NovaPropostaDialog = ({ open, onOpenChange, setPropostas, propostaToEdit, setPropostaToEdit }) => {
  const { toast } = useToast();
  const { entities: entitiesSupabase, loading: loadingEntities } = useEntities('cliente');
  const [entitiesLocal] = useLocalStorage('crm_entities', []);
  const entities = entitiesSupabase.length > 0 ? entitiesSupabase : entitiesLocal;
  const { items: catalogItems, loading: loadingCatalog } = useCatalog();
  const [compras] = useLocalStorage('crm_compras', []);
  const [isEditing, setIsEditing] = useState(false);
  const [aprovarAoSalvar, setAprovarAoSalvar] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [installments, setInstallments] = useState([]);

  const groupedCatalog = useMemo(() => {
    const result = {};
    catalogItems
      .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach(item => {
        const category = item.category || 'Outros';
        if (!result[category]) result[category] = [];
        result[category].push(item);
      });
    return result;
  }, [catalogItems, searchTerm]);

  useEffect(() => {
    if (propostaToEdit) {
      setIsEditing(true);
      const cliente = entities.find(c => c.id === propostaToEdit.cliente_id);
      setFormData({
        ...initialFormState,
        ...propostaToEdit,
        cliente_nome: cliente?.nome_razao_social || cliente?.nome || '',
        payment_method: propostaToEdit.paymentDetails?.method || 'Pix',
        payment_plan: propostaToEdit.paymentDetails?.plan || 'avista',
        installments_count: propostaToEdit.paymentDetails?.installments?.length || 2,
        entry_amount: propostaToEdit.paymentDetails?.entryAmount || 0,
        first_payment_date: propostaToEdit.paymentDetails?.firstPaymentDate || '',
        payment_interval_days: propostaToEdit.paymentDetails?.intervalDays || 30,
        itens: propostaToEdit.itens || [],
      });
      setInstallments(propostaToEdit.paymentDetails?.installments || []);
      setAprovarAoSalvar(propostaToEdit.status === 'aprovada');
    } else {
      setIsEditing(false);
      setFormData(initialFormState);
      setInstallments([]);
      setAprovarAoSalvar(false);
    }
  }, [propostaToEdit, entities]);

  useEffect(() => {
    const total = formData.itens.reduce((acc, item) => acc + (parseFloat(item.valor_total) || 0), 0);
    setFormData(prev => ({ ...prev, valor_total: total }));
  }, [formData.itens]);

  const generateInstallments = useCallback(() => {
    const total = Number(formData.valor_total) || 0;
    const intervalDays = Number(formData.payment_interval_days) || 30;
    const firstDate = formData.first_payment_date;
    if (!firstDate || total <= 0) return [];
    const installmentsList = [];
    const baseDate = new Date(firstDate);
    const formatDate = (date) => date.toISOString().split('T')[0];

    if (formData.payment_plan === 'avista') {
      installmentsList.push({ id: `inst-${Date.now()}`, date: formatDate(baseDate), amount: total });
      return installmentsList;
    }

    const count = Math.max(Number(formData.installments_count) || 2, 1);
    if (formData.payment_plan === 'parcelado_entrada') {
      const entry = Math.min(Number(formData.entry_amount) || 0, total);
      if (entry > 0) {
        installmentsList.push({ id: `inst-entry`, date: formatDate(baseDate), amount: entry });
        baseDate.setDate(baseDate.getDate() + intervalDays);
      }
      const remaining = total - (entry || 0);
      const parcels = Math.max(count - (entry > 0 ? 1 : 0), 1);
      const baseAmount = parcels > 0 ? remaining / parcels : remaining;
      for (let i = 0; i < parcels; i += 1) {
        installmentsList.push({
          id: `inst-${i}`,
          date: formatDate(new Date(baseDate.getTime() + intervalDays * i * 86400000)),
          amount: parseFloat(baseAmount.toFixed(2)),
        });
      }
      return installmentsList;
    }

    const baseAmount = total / count;
    for (let i = 0; i < count; i += 1) {
      installmentsList.push({
        id: `inst-${i}`,
        date: formatDate(new Date(baseDate.getTime() + intervalDays * i * 86400000)),
        amount: parseFloat(baseAmount.toFixed(2)),
      });
    }
    return installmentsList;
  }, [formData]);

  useEffect(() => {
    setInstallments(generateInstallments());
  }, [generateInstallments]);

  const handleInstallmentChange = (index, field, value) => {
    setInstallments(prev =>
      prev.map((inst, i) => (i === index ? { ...inst, [field]: field === 'amount' ? Number(value) : value } : inst))
    );
  };

  const handleAddCatalogItem = (item) => {
    if (!item) return;
    setFormData(prev => {
      const exists = prev.itens.find(i => i.catalog_item_id === item.id);
      if (exists) return prev;
      const newItem = {
        id: `cat-${item.id}-${Date.now()}`,
        catalog_item_id: item.id,
        nome: item.name,
        categoria: item.category,
        unidade: item.unit,
        quantidade: 1,
        valor_unitario: Number(item.value || 0),
        valor_total: Number(item.value || 0),
      };
      return { ...prev, itens: [...prev.itens, newItem] };
    });
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({ ...prev, itens: prev.itens.filter(item => item.id !== itemId) }));
  };

  const toggleCategory = (category) => {
    setExpandedCategory(prev => (prev === category ? null : category));
  };

  const handleImportCompras = () => {
    if (!formData.cliente_id) {
      toast({ title: 'Selecione um cliente primeiro', variant: 'destructive' });
      return;
    }
    const comprasDoCliente = compras.filter(c => c.cliente_id === formData.cliente_id);
    if (comprasDoCliente.length === 0) {
      toast({ title: 'Nenhum pedido de compra encontrado', variant: 'destructive' });
      return;
    }
    const novosItens = comprasDoCliente.map(compra => parseCompraParaItem(compra));
    setFormData(prev => ({ ...prev, itens: [...prev.itens, ...novosItens] }));
    toast({ title: `${novosItens.length} itens importados` });
  };

  const parseCompraParaItem = (compra) => {
    const descricao = compra.descricao || compra.fornecedor || 'Item importado';
    const quantidade = Number(compra.quantidade || 1);
    const valorTotal = Number(compra.valor_total || 0);
    const valorUnitario = quantidade > 0 ? valorTotal / quantidade : valorTotal;
    return {
      id: `comp-${compra.id || Date.now()}`,
      nome: descricao,
      descricao,
      quantidade,
      valor_unitario: Number(valorUnitario.toFixed(2)),
      valor_total: Number(valorTotal.toFixed(2)),
      source_compra_id: compra.id || null,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.cliente_id) {
      toast({ title: 'Selecione o cliente', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const proposalPayload = {
      ...formData,
      status: aprovarAoSalvar ? 'aprovada' : 'rascunho',
      paymentDetails: {
        method: formData.payment_method,
        plan: formData.payment_plan,
        installments,
        entryAmount: formData.entry_amount,
        firstPaymentDate: formData.first_payment_date,
        intervalDays: formData.payment_interval_days,
      },
    };

    if (isEditing) {
      const updated = {
        ...proposalPayload,
        versao: (formData.versao || 1) + 1,
      };
      setPropostas(prev => prev.map(p => (p.id === formData.id ? updated : p)));
      toast({
        title: aprovarAoSalvar ? 'Proposta aprovada!' : 'Proposta atualizada!',
        description: `Proposta #${formData.numero || updated.numero} ${aprovarAoSalvar ? 'aprovada' : 'atualizada'}.`,
      });
    } else {
      const novaProposta = {
        ...proposalPayload,
        id: `prop_${Date.now()}`,
        numero: `PROP-${Math.floor(Math.random() * 9000 + 1000)}`,
        versao: 1,
        data_criacao: new Date().toISOString(),
      };
      setPropostas(prev => [novaProposta, ...prev]);
      toast({
        title: aprovarAoSalvar ? 'Proposta criada e aprovada!' : 'Proposta criada!',
        description: `Proposta #${novaProposta.numero} ${aprovarAoSalvar ? 'aprovada' : 'criada'} com sucesso.`,
      });
    }

    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setPropostaToEdit(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editando Proposta #${formData.numero}` : 'Nova Proposta Detalhada'}</DialogTitle>
          <DialogDescription>Monte a proposta arrastando itens do catálogo e configure o plano de pagamento.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <section className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Catálogo</h3>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Search className="h-4 w-4" />
                  <Input
                    className="min-w-[160px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar item..."
                  />
                </div>
              </div>
              <div className="divider" />
              <div className="space-y-2 max-h-[450px] overflow-y-auto">
                {Object.entries(groupedCatalog).map(([category, items]) => (
                  <div key={category} className="border rounded-lg">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2 bg-slate-100"
                      onClick={() => toggleCategory(category)}
                    >
                      <span className="font-semibold">{category} ({items.length})</span>
                      {expandedCategory === category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {expandedCategory === category && (
                      <div className="divide-y divide-slate-200">
                        {items.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                            onClick={() => handleAddCatalogItem(item)}
                          >
                            <div>
                              <p className="text-sm font-semibold">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.unit} • {item.trade}</p>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                              {(item.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loadingCatalog && <p className="text-sm text-center text-slate-500">Carregando catálogo...</p>}
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-4 shadow-sm space-y-3 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Itens da proposta</h3>
                <Button type="button" size="sm" variant="outline" onClick={handleImportCompras} disabled={!formData.cliente_id}>
                  Importar compras
                </Button>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {formData.itens.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2 text-sm">
                    <div className="col-span-4 font-medium text-slate-900">{item.nome}</div>
                    <div className="col-span-2"><Input value={item.quantidade} type="number" min="1" onChange={(e) => handleUpdateItem(item.id, 'quantidade', e.target.value)} /></div>
                    <div className="col-span-2"><Input value={item.valor_unitario} type="number" step="0.01" onChange={(e) => handleUpdateItem(item.id, 'valor_unitario', e.target.value)} /></div>
                    <div className="col-span-2 text-right font-semibold">
                      {(item.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="col-span-2 text-right">
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {formData.itens.length === 0 && (
                  <p className="text-center text-slate-500">Clique em um item do catálogo para adicioná-lo.</p>
                )}
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs uppercase text-slate-500">Valor total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formData.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-4 shadow-sm space-y-4">
              <div className="space-y-3">
                <Label>Cliente *</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => {
                    const cliente = entities.find(c => c.id === value);
                    setFormData(prev => ({
                      ...prev,
                      cliente_id: value,
                      cliente_nome: cliente?.nome_razao_social || cliente?.nome || '',
                    }));
                  }}
                  required
                  disabled={loadingEntities}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEntities ? 'Carregando clientes...' : 'Selecione um cliente'} />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome_razao_social || c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Tipo de Proposta</Label>
                <Select value={formData.tipo_proposta} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_proposta: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoPropostaOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descrição geral</Label>
                <Textarea value={formData.descricao} onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))} />
              </div>

              <div>
                <Label>Forma de pagamento</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Plano de pagamento</Label>
                <Select value={formData.payment_plan} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_plan: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentPlanOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.payment_plan !== 'avista' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nº de parcelas</Label>
                    <Input type="number" min="2" value={formData.installments_count} onChange={(e) => setFormData(prev => ({ ...prev, installments_count: Number(e.target.value) || 2 }))} />
                  </div>
                  <div>
                    <Label>Dias entre pagamentos</Label>
                    <Input type="number" min="15" value={formData.payment_interval_days} onChange={(e) => setFormData(prev => ({ ...prev, payment_interval_days: Number(e.target.value) || 30 }))} />
                  </div>
                </div>
              )}

              {formData.payment_plan === 'parcelado_entrada' && (
                <div>
                  <Label>Valor de entrada</Label>
                  <Input type="number" min="0" step="0.01" value={formData.entry_amount} onChange={(e) => setFormData(prev => ({ ...prev, entry_amount: Number(e.target.value) || 0 }))} />
                </div>
              )}

              <div>
                <Label>Data do primeiro pagamento</Label>
                <Input type="date" value={formData.first_payment_date} onChange={(e) => setFormData(prev => ({ ...prev, first_payment_date: e.target.value }))} />
              </div>

              {installments.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-semibold text-slate-600">Parcelas geradas</p>
                  <div className="space-y-2">
                    {installments.map((inst, index) => (
                      <div key={inst.id} className="grid grid-cols-12 gap-1 items-center text-xs">
                        <Input
                          type="date"
                          value={inst.date}
                          onChange={(e) => handleInstallmentChange(index, 'date', e.target.value)}
                          className="col-span-5"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={inst.amount}
                          onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                          className="col-span-5 text-right"
                        />
                        <span className="col-span-2 text-right font-semibold text-slate-700">
                          {(inst.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <input
                type="checkbox"
                checked={aprovarAoSalvar}
                onChange={(e) => setAprovarAoSalvar(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
              Aprovar ao salvar
            </label>
            <div className="flex-1" />
            <Button onClick={handleClose} variant="outline">Cancelar</Button>
            <Button type="submit" className="gradient-primary text-white" disabled={loading || formData.itens.length === 0}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Salvar alterações' : 'Criar proposta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    );
  };

  const handleUpdateItem = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map(item => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantidade' || field === 'valor_unitario') {
          const quantidade = Number(field === 'quantidade' ? value : updated.quantidade) || 0;
          const valorUnitario = Number(field === 'valor_unitario' ? value : updated.valor_unitario) || 0;
          updated.valor_total = parseFloat((quantidade * valorUnitario).toFixed(2));
        }
        return updated;
      }),
    }));
  };

export default NovaPropostaDialog;
