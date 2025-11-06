import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import Autocomplete from '@/components/shared/Autocomplete';
import { createLancamento } from '@/modules/finance/services/lancamentos';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const NovoLancamentoDialog = ({ open, onOpenChange, onSave }) => {
    const { toast } = useToast();
    const { orgId } = useAuth();
    const [loading, setLoading] = useState(false);

    const getInitialFormData = useCallback(() => ({
        type: 'expense',
        occurred_at: new Date().toISOString().slice(0, 10),
        amount: 0,
        description: '',
        account_id: null,
        category_id: null,
        party_id: null,
        project_id: null,
        quantity: 1,
        unit_price: 0,
        org_id: orgId
    }), [orgId]);
    
    const [formData, setFormData] = useState(getInitialFormData());
    const [selectedItems, setSelectedItems] = useState({ 
        account_id: null, 
        party_id: null, 
        project_id: null, 
        category_id: null 
    });

    useEffect(() => {
        if (open) {
            setFormData(getInitialFormData());
            setSelectedItems({ account_id: null, party_id: null, project_id: null, category_id: null });
        }
    }, [open, getInitialFormData]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    
    const handleAutocompleteChange = (field, item) => {
        handleChange(field, item ? item.id : null);
        setSelectedItems(prev => ({ ...prev, [field]: item }));
    };

    const handleNumericChange = useCallback((field, value) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            setFormData(prev => ({ ...prev, [field]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: '' }));
        }
    }, []);

    useEffect(() => {
        const { quantity, unit_price } = formData;
        const total = (quantity || 0) * (unit_price || 0);
        if (total !== formData.amount) {
            handleChange('amount', total);
        }
    }, [formData.quantity, formData.unit_price, formData.amount]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.occurred_at || formData.amount <= 0 || !formData.account_id) {
            toast({ title: 'Dados inválidos', description: 'Data, Valor (maior que zero) e Conta são obrigatórios.', variant: 'destructive'});
            setLoading(false);
            return;
        }

        try {
            await createLancamento(formData);
            toast({ title: `Lançamento criado com sucesso!` });
            onSave();
        } catch (error) {
            console.error("Erro ao criar lançamento:", error);
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="space-y-2 md:col-span-1"><Label>Tipo</Label><Select value={formData.type} onValueChange={v => handleChange('type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Despesa</SelectItem><SelectItem value="income">Receita</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2 md:col-span-2"><Label>Data</Label><Input type="date" value={formData.occurred_at || ''} onChange={e => handleChange('occurred_at', e.target.value)} required /></div>
                        
                        <div className="space-y-2 md:col-span-3"><Label>Descrição</Label><Textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} /></div>
                        
                        <div className="space-y-2"><Label>Quantidade</Label><Input type="number" value={formData.quantity} onChange={e => handleNumericChange('quantity', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Valor Unitário</Label><Input type="number" step="0.01" value={formData.unit_price} onChange={e => handleNumericChange('unit_price', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Valor Total</Label><Input type="number" step="0.01" value={formData.amount || ''} readOnly className="font-bold bg-muted" /></div>

                        <div className="space-y-2 md:col-span-3"><Label>Conta <span className="text-destructive">*</span></Label><Autocomplete table="fin_accounts" displayColumn="name" value={selectedItems.account_id} onChange={(item) => handleAutocompleteChange('account_id', item)} placeholder="Busque a conta" /></div>
                        <div className="space-y-2 md:col-span-3"><Label>Categoria Financeira</Label><Autocomplete table="fin_categories" displayColumn="name" filterColumn="kind" filterValue={formData.type} value={selectedItems.category_id} onChange={(item) => handleAutocompleteChange('category_id', item)} placeholder="Busque a categoria" /></div>
                        <div className="space-y-2 md:col-span-3"><Label>Favorecido (Fornecedor/Colaborador)</Label><Autocomplete table="parties" displayColumn="name" value={selectedItems.party_id} onChange={(item) => handleAutocompleteChange('party_id', item)} placeholder="Busque o favorecido" /></div>
                        <div className="space-y-2 md:col-span-3"><Label>Projeto (Centro de Custo)</Label><Autocomplete table="entities" displayColumn="nome_razao_social" value={selectedItems.project_id} onChange={(item) => handleAutocompleteChange('project_id', item)} placeholder="Busque o projeto/cliente" /></div>
                        
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading && <Loader2 className="animate-spin mr-2" />} Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NovoLancamentoDialog;