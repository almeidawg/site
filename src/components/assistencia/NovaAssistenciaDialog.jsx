
import React, { useState, useEffect } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Loader2, Save, Search } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

    const NovaAssistenciaDialog = ({ open, onOpenChange, onSave, assistenciaToEdit }) => {
        const { toast } = useToast();
        const [isSaving, setIsSaving] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [formData, setFormData] = useState({
            cliente_id: '',
            contrato_id: '',
            setor: '',
            descricao: '',
            status: 'aberta',
            data_solicitacao: new Date().toISOString().substring(0, 10),
            valor: 0,
            responsavel_id: null,
        });
        const [clientes, setClientes] = useState([]);
        const [profissionais, setProfissionais] = useState([]);
        const [contratos, setContratos] = useState([]);
        const [isClienteComboboxOpen, setIsClienteComboboxOpen] = useState(false);
        const [isResponsavelComboboxOpen, setIsResponsavelComboboxOpen] = useState(false);

        useEffect(() => {
            const fetchData = async () => {
                const { data: clientesData } = await supabase.from('entities').select('id, nome_razao_social').eq('tipo', 'cliente');
                if (clientesData) setClientes(clientesData);

                const { data: profissionaisData } = await supabase.from('entities').select('id, nome_razao_social').in('tipo', ['colaborador', 'fornecedor']);
                if (profissionaisData) setProfissionais(profissionaisData);
            };
            
            if(open) fetchData();

            if (assistenciaToEdit) {
                setIsEditing(true);
                const editData = {
                    ...assistenciaToEdit,
                    cliente_id: assistenciaToEdit.entity_id,
                    descricao: assistenciaToEdit.solicitacao,
                    data_solicitacao: assistenciaToEdit.created_at ? new Date(assistenciaToEdit.created_at).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
                    valor: assistenciaToEdit.valor || 0,
                    responsavel_id: assistenciaToEdit.responsavel_id || null,
                };
                setFormData(editData);
                if(assistenciaToEdit.entity_id) fetchContratos(assistenciaToEdit.entity_id);
            } else {
                setIsEditing(false);
                setFormData({
                    cliente_id: '',
                    contrato_id: '',
                    setor: '',
                    descricao: '',
                    status: 'aberta',
                    data_solicitacao: new Date().toISOString().substring(0, 10),
                    valor: 0,
                    responsavel_id: null,
                });
            }
        }, [assistenciaToEdit, open]);

        const fetchContratos = async (clienteId) => {
            if (!clienteId) {
                setContratos([]);
                setFormData(prev => ({...prev, contrato_id: ''}));
                return;
            }
            const { data, error } = await supabase.from('contratos').select('id, numero, objeto').eq('cliente_id', clienteId);
            if (!error) setContratos(data);
        };
        
        const handleClientChange = (value) => {
            setFormData(prev => ({...prev, cliente_id: value}));
            fetchContratos(value);
            setIsClienteComboboxOpen(false);
        };

        const handleResponsavelChange = (value) => {
            setFormData(prev => ({...prev, responsavel_id: value}));
            setIsResponsavelComboboxOpen(false);
        };
        
        const handleInputChange = (e) => {
            const { id, value } = e.target;
            setFormData(prev => ({...prev, [id]: value}));
        };

        const handleSelectChange = (id, value) => {
            setFormData(prev => ({...prev, [id]: value}));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSaving(true);
            
            const { id, created_at, updated_at, cliente_nome, ...saveData } = formData;
            const finalData = { 
                ...saveData, 
                valor: parseFloat(saveData.valor) || 0,
                entity_id: saveData.cliente_id,
                solicitacao: saveData.descricao,
                responsavel_id: saveData.responsavel_id || null,
            };
            
            delete finalData.cliente_id;
            delete finalData.descricao;

            let response;
            if (isEditing) {
                response = await supabase.from('service_orders').update(finalData).eq('id', id);
            } else {
                const osCodigo = `OS-${Date.now().toString().slice(-6)}`;
                response = await supabase.from('service_orders').insert([{ 
                    ...finalData, 
                    os_codigo: osCodigo,
                }]);
            }
            
            if (response.error) {
                toast({ title: 'Erro ao salvar', description: response.error.message, variant: 'destructive' });
            } else {
                toast({ title: 'Sucesso!', description: `Ordem de Serviço ${isEditing ? 'atualizada' : 'criada'} com sucesso.` });
                onSave();
                onOpenChange(false);
            }

            setIsSaving(false);
        };
        
        const selectedClienteNome = clientes.find(c => c.id === formData.cliente_id)?.nome_razao_social || "Selecione um cliente";
        const selectedResponsavelNome = profissionais.find(p => p.id === formData.responsavel_id)?.nome_razao_social || "Selecione um profissional";

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
                        <DialogDescription>Preencha os detalhes para abrir uma nova solicitação de assistência.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="col-span-2">
                                <Label>Cliente</Label>
                                <Popover open={isClienteComboboxOpen} onOpenChange={setIsClienteComboboxOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {selectedClienteNome}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar cliente..." />
                                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {clientes.map(c => <CommandItem key={c.id} value={c.nome_razao_social} onSelect={() => handleClientChange(c.id)}>{c.nome_razao_social}</CommandItem>)}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="col-span-2">
                                <Label>Contrato</Label>
                                <Select onValueChange={(val) => handleSelectChange('contrato_id', val)} value={formData.contrato_id || 'none'}>
                                    <SelectTrigger><SelectValue placeholder="Selecione um contrato (opcional)" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum</SelectItem> {/* Adicionado valor "none" */}
                                        {contratos.map(c => <SelectItem key={c.id} value={c.id}>{c.numero || c.objeto}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Setor</Label>
                                <Select onValueChange={(val) => handleSelectChange('setor', val)} value={formData.setor}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="arquitetura">Arquitetura</SelectItem>
                                        <SelectItem value="engenharia">Engenharia</SelectItem>
                                        <SelectItem value="marcenaria">Marcenaria</SelectItem>
                                        <SelectItem value="outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="valor">Valor do Serviço</Label>
                                <Input id="valor" type="number" value={formData.valor} onChange={handleInputChange} placeholder="0.00"/>
                            </div>
                            <div className="col-span-2">
                                <Label>Profissional Responsável</Label>
                                <Popover open={isResponsavelComboboxOpen} onOpenChange={setIsResponsavelComboboxOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {selectedResponsavelNome}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar profissional..." />
                                            <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {profissionais.map(p => <CommandItem key={p.id} value={p.nome_razao_social} onSelect={() => handleResponsavelChange(p.id)}>{p.nome_razao_social}</CommandItem>)}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="descricao">Descrição do Problema</Label>
                                <Textarea id="descricao" value={formData.descricao} onChange={handleInputChange} placeholder="Detalhe o problema ou a solicitação..." />
                            </div>
                             <div className="col-span-2">
                                <Label>Status</Label>
                                <Select onValueChange={(val) => handleSelectChange('status', val)} value={formData.status}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aberta">Aberta</SelectItem>
                                        <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                                        <SelectItem value="concluida">Concluída</SelectItem>
                                        <SelectItem value="cancelada">Cancelada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    export default NovaAssistenciaDialog;
