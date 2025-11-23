
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Autocomplete from '@/components/shared/Autocomplete';

const NovoLancamentoDialog = ({ open, onOpenChange, onSave, lancamentoToEdit }) => {
  const { toast } = useToast();
  const { orgId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getInitialState = () => ({
    type: 'expense',
    amount: '',
    description: '',
    occurred_at: new Date().toISOString().slice(0, 10),
    account_id: null,
    category_id: null,
    party_id: null,
    project_id: null,
    notes: '',
    cleared: false,
    is_reimbursement: false,
    reimbursement_description: '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (lancamentoToEdit) {
      setIsEditing(true);
      setFormData({
        ...getInitialState(),
        ...lancamentoToEdit,
        occurred_at: lancamentoToEdit.occurred_at ? new Date(lancamentoToEdit.occurred_at).toISOString().slice(0, 10) : '',
        amount: lancamentoToEdit.amount || '',
        is_reimbursement: !!lancamentoToEdit.reimbursement_description,
        reimbursement_description: lancamentoToEdit.reimbursement_description || '',
      });
    } else {
      setIsEditing(false);
      setFormData(getInitialState());
    }
  }, [lancamentoToEdit, open]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAutocompleteChange = (id, option) => {
    setFormData(prev => ({ ...prev, [id]: option ? option.id : null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) {
      toast({ title: 'Erro', description: 'Organização não identificada.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    const payload = {
      ...formData,
      org_id: orgId,
      amount: parseFloat(formData.amount) || 0,
      description: formData.is_reimbursement ? formData.reimbursement_description : formData.description,
    };
    
    // Remove reimbursement fields if not a reimbursement
    if (!payload.is_reimbursement) {
        delete payload.reimbursement_description;
    }
    delete payload.is_reimbursement;


    try {
      const { error } = isEditing
        ? await supabase.from('fin_transactions').update(payload).eq('id', formData.id)
        : await supabase.from('fin_transactions').insert(payload);

      if (error) throw error;

      toast({ title: 'Sucesso!', description: `Lançamento ${isEditing ? 'atualizado' : 'criado'}.` });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error);
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          <DialogDescription>Preencha os detalhes da transação financeira.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select onValueChange={(v) => handleSelectChange('type', v)} value={formData.type}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>Conta</Label>
            <Autocomplete table="fin_accounts" displayColumn="name" value={formData.account_id} onChange={(opt) => handleAutocompleteChange('account_id', opt)} placeholder="Selecione uma conta" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Autocomplete table="fin_categories" displayColumn="name" value={formData.category_id} onChange={(opt) => handleAutocompleteChange('category_id', opt)} placeholder="Selecione uma categoria" filterColumn="kind" filterValue={formData.type} />
            </div>
            <div className="space-y-2">
              <Label>Favorecido/Cliente</Label>
              <Autocomplete table="parties" displayColumn="name" value={formData.party_id} onChange={(opt) => handleAutocompleteChange('party_id', opt)} placeholder="Selecione um favorecido" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Centro de Custo (Obra)</Label>
              <Autocomplete table="obras" displayColumn="nome" value={formData.project_id} onChange={(opt) => handleAutocompleteChange('project_id', opt)} placeholder="Selecione uma obra" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occurred_at">Data da Ocorrência</Label>
              <Input id="occurred_at" type="date" value={formData.occurred_at} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" value={formData.notes} onChange={handleChange} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="cleared" checked={formData.cleared} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <Label htmlFor="cleared">Compensado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="is_reimbursement" checked={formData.is_reimbursement} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <Label htmlFor="is_reimbursement">É um Reembolso?</Label>
          </div>
          {formData.is_reimbursement && (
            <div className="space-y-2">
              <Label htmlFor="reimbursement_description">Descrição para Reembolso</Label>
              <Textarea id="reimbursement_description" value={formData.reimbursement_description} onChange={handleChange} placeholder="Detalhes do reembolso..." />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar Lançamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoLancamentoDialog;
