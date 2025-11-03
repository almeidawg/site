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

const NovaOportunidadeDialog = ({ open, onOpenChange, onSaveSuccess, onSave: onSaveProp, columnId: initialColumnId, boardId, columns, cardToEdit = null }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    
    // Estado inicial para um novo card. Usado para criar ou resetar o formulário.
    const getInitialState = useCallback(() => ({
        titulo: '',
        cliente_id: '',
        descricao: '',
        coluna_id: initialColumnId || columns?.[0]?.id || '',
        payload: {
            arquitetura: false,
            engenharia: false,
            marcenaria: false,
        },
        valor_proposta: '',
    }), [initialColumnId, columns]);

    const [formData, setFormData] = useState(getInitialState());
    
    // Alias para a função de callback de sucesso
    const onSave = onSaveSuccess || onSaveProp;

    // Busca os clientes quando o dialog é aberto
    useEffect(() => {
        if (open) {
            const fetchClientes = async () => {
                const { data, error } = await supabase.from('entities').select('id, nome_razao_social').eq('tipo', 'cliente').order('nome_razao_social');
                if (error) {
                    toast({ title: "Erro ao buscar clientes", description: error.message, variant: "destructive" });
                } else {
                    setClientes(data || []);
                }
            };
            fetchClientes();
        }
    }, [open, toast]);
    
    // Popula o formulário se estiver editando ou reseta se for um novo card
    useEffect(() => {
        if (open) {
            if (cardToEdit) {
                 setFormData({
                    id: cardToEdit.id,
                    titulo: cardToEdit.titulo || '',
                    cliente_id: cardToEdit.cliente_id || '',
                    descricao: cardToEdit.descricao || '',
                    coluna_id: cardToEdit.coluna_id || initialColumnId || '',
                    valor_proposta: cardToEdit.valor_proposta || '',
                    payload: cardToEdit.payload || { arquitetura: false, engenharia: false, marcenaria: false },
                });
            } else {
                // Reseta para o estado inicial para um novo card
                setFormData(getInitialState());
            }
        }
    }, [open, cardToEdit, getInitialState]);


    // Handlers para mudança nos campos do formulário
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id) => {
        setFormData(prev => ({
            ...prev,
            payload: { ...prev.payload, [id]: !prev.payload[id] }
        }));
    };
    
    // Função para salvar o card (criar ou editar)
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
                        <Input id="titulo" value={formData.titulo} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cliente_id">Cliente</Label>
                        <Select onValueChange={(value) => handleSelectChange('cliente_id', value)} value={formData.cliente_id} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clientes.map(cliente => (
                                    <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome_razao_social}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valor_proposta">Valor Estimado da Proposta</Label>
                        <Input id="valor_proposta" type="number" step="0.01" value={formData.valor_proposta} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea id="descricao" value={formData.descricao} onChange={handleChange} />
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