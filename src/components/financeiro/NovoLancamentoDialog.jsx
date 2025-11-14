
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import Autocomplete from '@/components/shared/Autocomplete';
import { createLancamento } from '@/modules/finance/services/lancamentos';

const NovoLancamentoDialog = ({ open, onOpenChange, onSave }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const getInitialFormData = () => ({
        type: 'expense',
        occurred_at: new Date().toISOString().slice(0, 10),
        amount: '',
        description: '',
        account_id: null,
        category_id: null,
        party_id: null,
        project_id: null,
    });
    
    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (open) {
            setFormData(getInitialFormData());
        }
    }, [open]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    
    const handleAutocompleteChange = (field, item) => {
        handleChange(field, item ? item.id : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            amount: parseFloat(String(formData.amount).replace(',', '.')) || 0,
        };

        if (!payload.occurred_at || !payload.amount || !payload.account_id) {
            toast({ title: 'Campos obrigatórios', description: 'Data, Valor e Conta são obrigatórios.', variant: 'destructive'});
            setLoading(false);
            return;
        }

        try {
            await createLancamento(payload);
            toast({ title: `Lançamento criado com sucesso!` });
            onSave();
        } catch (error) {
            toast({ title: 'Erro ao salvar lançamento', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="space-y-2"><Label>Tipo</Label><Select value={formData.type} onValueChange={v => handleChange('type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Despesa</SelectItem><SelectItem value="income">Receita</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Data</Label><Input type="date" value={formData.occurred_at || ''} onChange={e => handleChange('occurred_at', e.target.value)} required /></div>
                        
                        <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} /></div>
                        
                        <div className="space-y-2 md:col-span-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={formData.amount || ''} onChange={e => handleChange('amount', e.target.value)} required /></div>

                        <div className="space-y-2"><Label>Conta</Label><Autocomplete table="fin_accounts" displayColumn="name" value={formData.account_id} onChange={(item) => handleAutocompleteChange('account_id', item)} placeholder="Busque a conta" /></div>
                        <div className="space-y-2"><Label>Categoria Financeira</Label><Autocomplete table="fin_categories" displayColumn="name" filterColumn="kind" filterValue={formData.type} value={formData.category_id} onChange={(item) => handleAutocompleteChange('category_id', item)} placeholder="Busque a categoria" /></div>
                        <div className="space-y-2"><Label>Favorecido (Fornecedor/Cliente)</Label><Autocomplete table="parties" displayColumn="name" value={formData.party_id} onChange={(item) => handleAutocompleteChange('party_id', item)} placeholder="Busque o favorecido" /></div>
                        <div className="space-y-2"><Label>Projeto (Centro de Custo)</Label><Autocomplete table="obras" displayColumn="nome" value={formData.project_id} onChange={(item) => handleAutocompleteChange('project_id', item)} placeholder="Busque o projeto" /></div>
                        
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading && <Loader2 className="animate-spin mr-2" />} Salvar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NovoLancamentoDialog;
