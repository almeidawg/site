
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Autocomplete from '@/components/shared/Autocomplete';

const NovaTarefaDialog = ({ open, onOpenChange, onSave, tarefaToEdit }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const getInitialState = () => ({
        titulo: '',
        descricao: '',
        data_inicio: new Date().toISOString().slice(0, 10),
        data_fim: '',
        status: 'pendente',
        responsavel: null,
        projeto_id: null,
        progresso: 0,
        dependencia: null,
    });
    
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (open) {
            if (tarefaToEdit) {
                setIsEditing(true);
                setFormData({
                    ...tarefaToEdit,
                    data_inicio: tarefaToEdit.data_inicio ? new Date(tarefaToEdit.data_inicio).toISOString().slice(0, 10) : '',
                    data_fim: tarefaToEdit.data_fim ? new Date(tarefaToEdit.data_fim).toISOString().slice(0, 10) : '',
                });
            } else {
                setIsEditing(false);
                setFormData(getInitialState());
            }
        }
    }, [tarefaToEdit, open]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleAutocompleteChange = (id, item) => {
        setFormData(prev => ({ ...prev, [id]: item ? item.id : null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.titulo || !formData.data_inicio) {
            toast({ title: 'Campos obrigatórios', description: 'Título e Data de Início são obrigatórios.', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from('cronograma_tarefas').upsert(formData);
            if (error) throw error;
            toast({ title: 'Sucesso!', description: `Tarefa ${isEditing ? 'atualizada' : 'criada'} com sucesso.` });
            onSave();
        } catch (error) {
            toast({ title: 'Erro ao salvar tarefa', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                    <div className="space-y-2"><Label htmlFor="titulo">Título da Tarefa</Label><Input id="titulo" value={formData.titulo} onChange={handleChange} required /></div>
                    <div className="space-y-2"><Label htmlFor="descricao">Descrição</Label><Textarea id="descricao" value={formData.descricao || ''} onChange={handleChange} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="data_inicio">Data de Início</Label><Input id="data_inicio" type="date" value={formData.data_inicio} onChange={handleChange} required /></div>
                        <div className="space-y-2"><Label htmlFor="data_fim">Data de Fim</Label><Input id="data_fim" type="date" value={formData.data_fim} onChange={handleChange} /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Projeto</Label><Autocomplete table="projects" displayColumn="name" value={formData.projeto_id} onChange={(item) => handleAutocompleteChange('projeto_id', item)} placeholder="Selecione um projeto" /></div>
                        <div className="space-y-2"><Label>Responsável</Label><Autocomplete table="user_profiles" displayColumn="nome" value={formData.responsavel} onChange={(item) => handleAutocompleteChange('responsavel', item)} placeholder="Selecione um responsável" /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="em_andamento">Em Andamento</SelectItem><SelectItem value="concluido">Concluído</SelectItem><SelectItem value="atrasado">Atrasado</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Progresso ({formData.progresso || 0}%)</Label><Slider defaultValue={[0]} value={[formData.progresso || 0]} max={100} step={1} onValueChange={(v) => setFormData(p => ({...p, progresso: v[0]}))} /></div>
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

export default NovaTarefaDialog;
