
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Autocomplete from '@/components/shared/Autocomplete';

const NovaOportunidadeDialog = ({ open, onOpenChange, onSaveSuccess, onSave: onSaveProp, columnId: initialColumnId, boardId, columns, cardToEdit = null }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const getInitialState = useCallback(() => ({
        titulo: '',
        cliente_id: null,
        descricao: '',
        coluna_id: initialColumnId || columns?.[0]?.id || '',
        payload: {
            arquitetura: false,
            engenharia: false,
            marcenaria: false,
        },
        valor_proposta: '',
        proposta_id: 'none', // Default to 'none'
    }), [initialColumnId, columns]);

    const [formData, setFormData] = useState(getInitialState());
    const [propostasCliente, setPropostasCliente] = useState([]);
    
    const onSave = onSaveSuccess || onSaveProp;

    useEffect(() => {
        if (open) {
            if (cardToEdit) {
                 setFormData({
                    id: cardToEdit.id,
                    titulo: cardToEdit.titulo || '',
                    cliente_id: cardToEdit.cliente_id || null,
                    descricao: cardToEdit.descricao || '',
                    coluna_id: cardToEdit.coluna_id || initialColumnId || '',
                    valor_proposta: cardToEdit.valor_proposta || '',
                    payload: cardToEdit.payload || { arquitetura: false, engenharia: false, marcenaria: false },
                    proposta_id: cardToEdit.proposta_id || 'none', // Default to 'none'
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [open, cardToEdit, getInitialState]);

    useEffect(() => {
        const fetchPropostas = async () => {
            if (formData.cliente_id) {
                const { data, error } = await supabase
                    .from('propostas')
                    .select('id, codigo, valor_total')
                    .eq('cliente_id', formData.cliente_id);
                if (error) {
                    toast({ title: "Erro ao buscar propostas do cliente", variant: "destructive" });
                } else {
                    setPropostasCliente(data);
                }
            } else {
                setPropostasCliente([]);
            }
        };
        fetchPropostas();
    }, [formData.cliente_id, toast]);

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handlePropostaChange = (propostaId) => {
        const proposta = propostasCliente.find(p => p.id === propostaId);
        setFormData(prev => ({
            ...prev,
            proposta_id: propostaId === 'none' ? null : propostaId, // Handle 'none'
            valor_proposta: proposta ? proposta.valor_total : prev.valor_proposta,
        }));
    };

    const handleCheckboxChange = (id) => {
        setFormData(prev => ({
            ...prev,
            payload: { ...prev.payload, [id]: !prev.payload[id] }
        }));
    };
    
    const handleSalvarCard = async (e) => {
        e.preventDefault();
        if (!formData.titulo || !formData.cliente_id) {
            toast({ title: 'Campos obrigatórios', description: 'Título e cliente são obrigatórios.', variant: 'destructive'});
            return;
        }
        setLoading(true);

        const { id, ...dataToSave } = formData;
        const payload = {
            ...dataToSave,
            board_id: boardId,
            modulo: 'oportunidades',
            created_by: user.id,
            valor_proposta: parseFloat(dataToSave.valor_proposta) || 0,
            coluna_id: dataToSave.coluna_id || columns?.[0]?.id,
            proposta_id: dataToSave.proposta_id === 'none' ? null : dataToSave.proposta_id, // Ensure null for 'none'
        };

        const isEditing = !!id;
        const { error } = isEditing 
            ? await supabase.from('kanban_cards').update(payload).eq('id', id)
            : await supabase.from('kanban_cards').insert(payload);

        if (error) {
            console.error("Erro ao salvar card:", error);
            toast({ title: 'Erro ao salvar oportunidade', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Sucesso!', description: `Oportunidade ${isEditing ? 'atualizada' : 'criada'}.` });
            onSave();
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{cardToEdit ? 'Editar Oportunidade' : 'Nova Oportunidade'}</DialogTitle>
                    <DialogDescription>
                        Preencha as informações para {cardToEdit ? 'editar a' : 'criar uma nova'} oportunidade de negócio.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSalvarCard} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título da Oportunidade</Label>
                        <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Autocomplete
                            table="entities"
                            displayColumn="nome_razao_social"
                            value={formData.cliente_id}
                            onChange={(opt) => setFormData(prev => ({...prev, cliente_id: opt ? opt.id : null, proposta_id: 'none'}))} // Reset proposta_id to 'none'
                            placeholder="Buscar cliente..."
                            filterColumn="tipo"
                            filterValue="cliente"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Proposta Vinculada</Label>
                        <Select onValueChange={handlePropostaChange} value={formData.proposta_id || 'none'} disabled={!formData.cliente_id || propostasCliente.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Vincular a uma proposta..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem> {/* Adicionado valor "none" */}
                                {propostasCliente.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.codigo} - {p.valor_total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valor_proposta">Valor Estimado da Proposta</Label>
                        <Input id="valor_proposta" type="number" step="0.01" value={formData.valor_proposta} onChange={(e) => setFormData(prev => ({...prev, valor_proposta: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Módulos de Interesse</Label>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="arquitetura" checked={formData.payload?.arquitetura} onCheckedChange={() => handleCheckboxChange('arquitetura')} />
                                <Label htmlFor="arquitetura">Arquitetura</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="engenharia" checked={formData.payload?.engenharia} onCheckedChange={() => handleCheckboxChange('engenharia')} />
                                <Label htmlFor="engenharia">Engenharia</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="marcenaria" checked={formData.payload?.marcenaria} onCheckedChange={() => handleCheckboxChange('marcenaria')} />
                                <Label htmlFor="marcenaria">Marcenaria</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {cardToEdit ? 'Salvar Alterações' : 'Criar Oportunidade'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NovaOportunidadeDialog;
