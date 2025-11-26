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
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Autocomplete from '@/components/shared/Autocomplete';

const STATUS_OPCOES = [
  { value: 'nao_previsto', label: 'Não previsto' },
  { value: 'em_negociacao', label: 'Em negociação' },
  { value: 'confirmado', label: 'Confirmado' },
];

const NovaOportunidadeDialog = ({ open, onOpenChange, onSaveSuccess, onSave: onSaveProp, columnId: initialColumnId, boardId, columns, cardToEdit = null }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const getInitialState = useCallback(() => ({
        titulo: '',
        cliente_id: null,
        cliente_nome: '',
        descricao: '',
        coluna_id: initialColumnId || columns?.[0]?.id || '',
        payload: {
            arquitetura: 'nao_previsto',
            engenharia: 'nao_previsto',
            marcenaria: 'nao_previsto',
        },
        valor_proposta: '',
        proposta_id: null,
        responsavel_id: null,
    }), [initialColumnId, columns]);

    const [formData, setFormData] = useState(getInitialState());
    const [propostasCliente, setPropostasCliente] = useState([]);
    const [responsaveis, setResponsaveis] = useState([]);
    
    const onSave = onSaveSuccess || onSaveProp;

    useEffect(() => {
        if (open) {
            if (cardToEdit) {
                 const normalizeStatus = (val) => {
                    if (val === true) return 'confirmado';
                    if (val === false || val === undefined || val === null) return 'nao_previsto';
                    return val;
                 };
                 setFormData({
                    id: cardToEdit.id,
                    titulo: cardToEdit.titulo || '',
                    cliente_id: cardToEdit.cliente_id || null,
                    cliente_nome: cardToEdit.cliente_nome || '',
                    descricao: cardToEdit.descricao || '',
                    coluna_id: cardToEdit.coluna_id || initialColumnId || '',
                    valor_proposta: cardToEdit.valor || cardToEdit.valor_proposta || '',
                    payload: {
                        arquitetura: normalizeStatus(cardToEdit.payload?.arquitetura),
                        engenharia: normalizeStatus(cardToEdit.payload?.engenharia),
                        marcenaria: normalizeStatus(cardToEdit.payload?.marcenaria),
                    },
                    proposta_id: cardToEdit.proposta_id || null,
                    responsavel_id: cardToEdit.responsavel_id || null,
                    servicos_contratados: cardToEdit.servicos_contratados || [],
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

    useEffect(() => {
        const fetchResponsaveis = async () => {
            const { data, error } = await supabase.from('user_profiles').select('user_id, nome').eq('ativo', true);
            if (!error && data) setResponsaveis(data);
        };
        fetchResponsaveis();
    }, []);

    const handlePropostaChange = (propostaId) => {
        const proposta = propostasCliente.find(p => p.id === propostaId);
        setFormData(prev => ({
            ...prev,
            proposta_id: propostaId === 'none' ? null : propostaId,
            valor_proposta: proposta ? proposta.valor_total : prev.valor_proposta,
        }));
    };

    const fetchClienteNome = async (clienteId) => {
        if (!clienteId) return null;
        const { data } = await supabase.from('entities').select('nome_razao_social').eq('id', clienteId).maybeSingle();
        return data?.nome_razao_social || '';
    };

    const handleServiceStatusChange = (id, value) => {
        setFormData(prev => ({
            ...prev,
            payload: { ...prev.payload, [id]: value }
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
            proposta_id: dataToSave.proposta_id === 'none' ? null : dataToSave.proposta_id,
        };

        const servicos = [];
        if (payload.payload?.arquitetura && payload.payload.arquitetura !== 'nao_previsto') servicos.push('arquitetura');
        if (payload.payload?.engenharia && payload.payload.engenharia !== 'nao_previsto') servicos.push('engenharia');
        if (payload.payload?.marcenaria && payload.payload.marcenaria !== 'nao_previsto') servicos.push('marcenaria');

        const clienteNome = payload.cliente_nome || await fetchClienteNome(payload.cliente_id);

        const cardSave = {
            nome: payload.titulo,
            titulo: payload.titulo, // compat com view
            descricao: payload.descricao,
            coluna_id: payload.coluna_id,
            board_id: payload.board_id,
            entity_id: payload.cliente_id,
            cliente_nome: clienteNome,
            valor_previsto: payload.valor_proposta,
            proposta_id: payload.proposta_id,
            responsavel_id: payload.responsavel_id,
            servicos_contratados: servicos,
            payload: payload.payload || {},
        };

        const isEditing = !!id;
        let error = null;
        if (isEditing) {
            ({ error } = await supabase.from('kanban_cards').update(cardSave).eq('id', id));
        } else {
            const cardsToInsert = (servicos.length > 1)
              ? servicos.map(s => ({ ...cardSave, titulo: `${cardSave.titulo} - ${s}`, nome: `${cardSave.titulo} - ${s}`, servicos_contratados: [s] }))
              : [{ ...cardSave }];
            ({ error } = await supabase.from('kanban_cards').insert(cardsToInsert));
        }

        if (error) {
            console.error("Erro ao salvar card:", error);
            toast({ title: 'Erro ao salvar oportunidade', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Sucesso!', description: `Oportunidade ${isEditing ? 'atualizada' : 'criada'}.` });
            onSave();
            onOpenChange(false);
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
                            onChange={(opt) => setFormData(prev => ({...prev, cliente_id: opt ? opt.id : null, proposta_id: null}))}
                            placeholder="Buscar cliente..."
                            filterColumn="tipo"
                            filterValue="cliente"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Responsável</Label>
                        <Select
                          value={formData.responsavel_id || 'none'}
                          onValueChange={(val) => setFormData(prev => ({ ...prev, responsavel_id: val === 'none' ? null : val }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Selecione um responsável" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {responsaveis.map(r => (
                              <SelectItem key={r.user_id} value={r.user_id}>{r.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Proposta Vinculada</Label>
                        <Select onValueChange={handlePropostaChange} value={formData.proposta_id || 'none'} disabled={!formData.cliente_id || propostasCliente.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Vincular a uma proposta..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label>Arquitetura</Label>
                            <Select
                              value={formData.payload?.arquitetura || 'nao_previsto'}
                              onValueChange={(val) => handleServiceStatusChange('arquitetura', val)}
                            >
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {STATUS_OPCOES.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Engenharia</Label>
                            <Select
                              value={formData.payload?.engenharia || 'nao_previsto'}
                              onValueChange={(val) => handleServiceStatusChange('engenharia', val)}
                            >
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {STATUS_OPCOES.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Marcenaria</Label>
                            <Select
                              value={formData.payload?.marcenaria || 'nao_previsto'}
                              onValueChange={(val) => handleServiceStatusChange('marcenaria', val)}
                            >
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {STATUS_OPCOES.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
