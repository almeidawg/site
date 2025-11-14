
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import Autocomplete from '@/components/shared/Autocomplete';

const NovoReembolsoDialog = ({ open, onOpenChange, onSave }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [obras, setObras] = useState([]);
    const [categorias, setCategorias] = useState([]);
    
    const getInitialState = () => ({
        valor: '',
        data: new Date().toISOString().slice(0, 10),
        obra_id: null,
        categoria_id: 'none', // Default to 'none'
        descricao: '',
        comprovante: null,
    });
    
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (!open) return;
        setFormData(getInitialState());

        const fetchRelatedData = async () => {
            const { data: obrasData } = await supabase.from('obras').select('id, nome');
            setObras(obrasData || []);
            const { data: catData } = await supabase.from('categorias_custo').select('id, nome').eq('tipo', 'reembolso');
            setCategorias(catData || []);
        };
        fetchRelatedData();
    }, [open]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.valor || !formData.descricao || formData.categoria_id === 'none') { // Check for 'none'
            toast({ title: 'Campos obrigatórios', description: 'Descrição, valor e categoria são obrigatórios.', variant: 'destructive' });
            return;
        }
        
        setLoading(true);
        try {
            let comprovanteUrl = null;
            if (formData.comprovante) {
                const file = formData.comprovante;
                const path = `reembolsos/${user.id}/${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage.from('comprovantes').upload(path, file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('comprovantes').getPublicUrl(path);
                comprovanteUrl = urlData.publicUrl;
            }

            const { valor, comprovante, ...dbData } = formData;
            const payload = {
                ...dbData,
                valor: parseFloat(valor),
                comprovante_url: comprovanteUrl,
                colaborador_id: user.id,
                status: 'pendente',
                categoria_id: formData.categoria_id === 'none' ? null : formData.categoria_id, // Ensure null for 'none'
            };

            const { error } = await supabase.from('reembolsos').insert(payload);
            if (error) throw error;
            
            toast({ title: 'Reembolso solicitado com sucesso!' });
            onSave();
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Erro ao solicitar reembolso', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova Solicitação de Reembolso</DialogTitle>
                    <DialogDescription>Preencha os detalhes para solicitar um novo reembolso.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Textarea id="descricao" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor (R$) *</Label>
                            <Input id="valor" type="number" step="0.01" value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="data">Data da Despesa</Label>
                            <Input id="data" type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Obra/Centro de Custo</Label>
                        <Autocomplete 
                            table="obras"
                            displayColumn="nome"
                            value={formData.obra_id}
                            onChange={(item) => setFormData({ ...formData, obra_id: item?.id })}
                            placeholder="Buscar obra..."
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select onValueChange={value => setFormData({ ...formData, categoria_id: value })} value={formData.categoria_id}>
                            <SelectTrigger><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Selecione uma categoria...</SelectItem> {/* Adicionado valor "none" */}
                                {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comprovante">Comprovante</Label>
                        <Input id="comprovante" type="file" onChange={e => setFormData({ ...formData, comprovante: e.target.files[0] })} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Solicitar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NovoReembolsoDialog;
