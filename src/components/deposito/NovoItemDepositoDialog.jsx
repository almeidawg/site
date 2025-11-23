
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const NovoItemDepositoDialog = ({ open, onOpenChange, onSave, itemToEdit }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const getInitialState = () => ({ name: '', sku: '', description: '', quantity: 0, unit: 'un', location: '' });
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (open) {
            if (itemToEdit) {
                setIsEditing(true);
                setFormData(itemToEdit);
            } else {
                setIsEditing(false);
                setFormData(getInitialState());
            }
        }
    }, [itemToEdit, open]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast({ title: 'Campo obrigatório', description: 'O nome do item é obrigatório.', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from('storage_items').upsert(formData);
            if (error) throw error;
            toast({ title: 'Sucesso!', description: `Item ${isEditing ? 'atualizado' : 'criado'} com sucesso.` });
            onSave();
        } catch (error) {
            toast({ title: 'Erro ao salvar item', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader><DialogTitle>{isEditing ? 'Editar Item' : 'Novo Item no Depósito'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="name">Nome do Item</Label><Input id="name" value={formData.name} onChange={handleChange} required /></div>
                    <div className="space-y-2"><Label htmlFor="sku">SKU (Código de Barras)</Label><Input id="sku" value={formData.sku || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" value={formData.description || ''} onChange={handleChange} /></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2"><Label htmlFor="quantity">Quantidade</Label><Input id="quantity" type="number" value={formData.quantity} onChange={handleChange} /></div>
                        <div className="space-y-2"><Label htmlFor="unit">Unidade</Label><Input id="unit" value={formData.unit} onChange={handleChange} /></div>
                        <div className="space-y-2"><Label htmlFor="location">Localização</Label><Input id="location" value={formData.location || ''} onChange={handleChange} placeholder="Ex: Prateleira A-3" /></div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin mr-2"/> : null} Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NovoItemDepositoDialog;
