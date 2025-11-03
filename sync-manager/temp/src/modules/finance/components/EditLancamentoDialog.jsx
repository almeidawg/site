
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { updateLancamento } from '../services/lancamentos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Autocomplete from '@/components/shared/Autocomplete';

/**
 * @param {{
 *  open: boolean;
 *  lanc: import('../types').Lancamento | null;
 *  onClose: () => void;
 *  onSaved: (l: import('../types').Lancamento) => void;
 * }} props
 */
export default function EditLancamentoDialog({ open, onClose, lanc, onSaved }) {
  const { register, handleSubmit, reset, control, watch } = useForm();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [selectedItems, setSelectedItems] = useState({ 
    account_id: null, 
    party_id: null, 
    project_id: null, 
    category_id: null 
  });

  const type = watch('type');
  
  useEffect(() => {
    if (open && lanc) {
      const dataToEdit = { ...lanc };
      if (dataToEdit.occurred_at) {
        dataToEdit.occurred_at = new Date(dataToEdit.occurred_at + 'T00:00:00').toISOString().slice(0, 10);
      }
      reset(dataToEdit);
      
      setSelectedItems({
        account_id: lanc.account_id ? { id: lanc.account_id, nome: lanc.account_name || 'Carregando...' } : null,
        party_id: lanc.party_id ? { id: lanc.party_id, nome: lanc.party_name || 'Carregando...' } : null,
        project_id: lanc.project_id ? { id: lanc.project_id, nome: lanc.project_name || 'Carregando...' } : null,
        category_id: lanc.category_id ? { id: lanc.category_id, nome: lanc.category_name || 'Carregando...' } : null,
      });
    } else {
        reset({});
        setSelectedItems({ account_id: null, party_id: null, project_id: null, category_id: null });
    }
  }, [lanc, open, reset]);

  if (!open || !lanc) return null;

  const onSubmit = async (formData) => {
    setLoading(true);
    const patch = {
      occurred_at: formData.occurred_at,
      type: formData.type,
      description: formData.description ?? null,
      amount: Number(formData.amount),
      account_id: selectedItems.account_id?.id ?? null,
      category_id: selectedItems.category_id?.id ?? null,
      party_id: selectedItems.party_id?.id ?? null,
      project_id: selectedItems.project_id?.id ?? null,
    };
    
    try {
      const saved = await updateLancamento(lanc.id, patch);
      toast({ title: "Lançamento salvo com sucesso!" });
      onSaved(saved);
    } catch (e) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteChange = (field, item) => {
    setSelectedItems(prev => ({ ...prev, [field]: item }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader><DialogTitle>Editar Lançamento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                
                <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" {...register('occurred_at', { required: true })}/>
                </div>
                
                <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Controller name="type" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="income">Receita</SelectItem><SelectItem value="expense">Despesa</SelectItem></SelectContent>
                        </Select>
                    )}/>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                    <Label>Descrição</Label>
                    <Textarea {...register('description')} />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label>Valor</Label>
                    <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true, required: true })}/>
                </div>

                <div className="space-y-2">
                    <Label>Conta</Label>
                    <Autocomplete table="fin_accounts" displayColumn="name" value={selectedItems.account_id} onChange={(item) => handleAutocompleteChange('account_id', item)} placeholder="Busque a conta" />
                </div>
                
                <div className="space-y-2">
                    <Label>Categoria Financeira</Label>
                    <Autocomplete table="fin_categories" displayColumn="name" filterColumn="kind" filterValue={type} value={selectedItems.category_id} onChange={(item) => handleAutocompleteChange('category_id', item)} placeholder="Busque a categoria" />
                </div>

                <div className="space-y-2">
                    <Label>Favorecido (Fornecedor/Colaborador)</Label>
                    <Autocomplete table="parties" displayColumn="name" value={selectedItems.party_id} onChange={(item) => handleAutocompleteChange('party_id', item)} placeholder="Busque o favorecido" />
                </div>

                <div className="space-y-2">
                    <Label>Projeto (Centro de Custo)</Label>
                    <Autocomplete table="entities" displayColumn="nome_razao_social" filterColumn="tipo" filterValue="cliente" value={selectedItems.project_id} onChange={(item) => handleAutocompleteChange('project_id', item)} placeholder="Busque o projeto" />
                </div>
                
                <DialogFooter className="col-span-1 md:col-span-2">
                    <Button type="button" onClick={onClose} variant="outline">Cancelar</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2"/> : null} Salvar
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}
