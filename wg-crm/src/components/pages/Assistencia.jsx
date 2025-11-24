
import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { LifeBuoy, Plus, Wrench, Loader2, Send, Edit, Download, Trash2, Search } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { supabase } from '@/lib/customSupabaseClient';
    import { cn } from '@/lib/utils';
    import { Can } from '@/contexts/SupabaseAuthContext';
    import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


    const statusMap = {
        aberta: { label: 'Aberta', className: 'bg-gray-400 text-white' },
        agendado: { label: 'Agendado', className: 'bg-yellow-500 text-white' }, // #eab308
        em_atendimento: { label: 'Em Atendimento', className: 'bg-orange-500 text-white' }, // #f97316
        atendido: { label: 'Atendido', className: 'bg-green-500 text-white' }, // #22c55e
        em_atraso: { label: 'Em Atraso', className: 'bg-red-600 text-white' }, // #dc2626
    };

    const NovaOSDialog = ({ open, onOpenChange, onOSCreated, osToEdit, setOrdensServico }) => {
        const [entities, setEntities] = useState([]);
        const [clienteId, setClienteId] = useState('');
        const [selectedCliente, setSelectedCliente] = useState(null);
        const [descricao, setDescricao] = useState('');
        const [status, setStatus] = useState('aberta');
        const [isSaving, setIsSaving] = useState(false);
        const [isComboboxOpen, setIsComboboxOpen] = useState(false);
        const { toast } = useToast();
        const isEditing = !!osToEdit;

        useEffect(() => {
            if(osToEdit) {
                setClienteId(osToEdit.cliente_id);
                setDescricao(osToEdit.descricao);
                setStatus(osToEdit.status);
                const cliente = entities.find(e => e.id === osToEdit.cliente_id);
                if(cliente) setSelectedCliente(cliente);
            } else {
                setClienteId('');
                setSelectedCliente(null);
                setDescricao('');
                setStatus('aberta');
            }
        }, [osToEdit, open, entities]);

        useEffect(() => {
            const fetchClientes = async () => {
                const { data, error } = await supabase
                    .from('entities')
                    .select('id, nome_razao_social')
                    .eq('tipo', 'cliente')
                    .order('nome_razao_social');
                if (error) {
                    toast({ title: 'Erro ao buscar clientes', variant: 'destructive' });
                } else {
                    setEntities(data);
                }
            };
            if(open) fetchClientes();
        }, [toast, open]);

        const handleSubmit = async () => {
            if (!clienteId || !descricao) {
                toast({ title: 'Campos obrigatórios', description: 'Selecione um cliente e preencha a descrição.', variant: 'destructive' });
                return;
            }
            setIsSaving(true);
            
            const cliente = entities.find(c => c.id === clienteId);

            if (isEditing) {
                const { data: updatedOS, error } = await supabase
                    .from('assistencias')
                    .update({ cliente_id: clienteId, cliente_nome: cliente.nome_razao_social, descricao, status })
                    .eq('id', osToEdit.id)
                    .select()
                    .maybeSingle();

                if (error) {
                    toast({ title: 'Erro ao atualizar O.S.', description: error.message, variant: 'destructive' });
                } else {
                    toast({ title: 'Ordem de Serviço Atualizada!' });
                    setOrdensServico(prev => prev.map(os => os.id === updatedOS.id ? updatedOS : os));
                    onOpenChange(false);
                }

            } else {
                const today = new Date();
                const osCode = `AST-${today.getFullYear()}-${String(Date.now()).slice(-6)}`;
        
                const { data: novaOS, error } = await supabase
                    .from('assistencias')
                    .insert({
                        codigo: osCode,
                        cliente_id: clienteId,
                        cliente_nome: cliente.nome_razao_social,
                        descricao,
                        status: 'aberta',
                        data_solicitacao: new Date().toISOString(),
                    })
                    .select()
                    .maybeSingle();
        
                if (error) {
                    toast({ title: 'Erro ao criar O.S.', description: error.message, variant: 'destructive' });
                } else {
                    toast({ title: 'Ordem de Serviço Criada!', description: `A O.S. ${osCode} foi aberta.` });
                    onOSCreated(novaOS);
                    onOpenChange(false);
                }
            }
            setIsSaving(false);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
                        <DialogDescription>{isEditing ? 'Atualize os detalhes do chamado.' : 'Abra um novo chamado de assistência técnica.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="cliente">Cliente</Label>
                             <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isComboboxOpen}
                                        className="w-full justify-between"
                                        disabled={isEditing}
                                    >
                                        {selectedCliente ? selectedCliente.nome_razao_social : "Selecione o cliente"}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cliente..." />
                                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {entities.map((c) => (
                                                <CommandItem
                                                    key={c.id}
                                                    value={c.nome_razao_social}
                                                    onSelect={() => {
                                                        setClienteId(c.id);
                                                        setSelectedCliente(c);
                                                        setIsComboboxOpen(false);
                                                    }}
                                                >
                                                    {c.nome_razao_social}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição da Solicitação</Label>
                            <Textarea id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhe o problema ou a necessidade do cliente..." />
                        </div>
                        {isEditing && (
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select onValueChange={setStatus} value={status}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(statusMap).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {isEditing ? 'Salvar Alterações' : 'Abrir Chamado'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const Assistencia = () => {
      const [ordensServico, setOrdensServico] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [osToEdit, setOsToEdit] = useState(null);
      const { toast } = useToast();

      const fetchOS = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('assistencias').select('*').order('created_at', { ascending: false });
        if(error) {
            toast({ title: 'Erro ao buscar chamados', variant: 'destructive' });
        } else {
            setOrdensServico(data);
        }
        setLoading(false);
      };
      
      useEffect(() => {
        fetchOS();
      }, []);

      const handleNotImplemented = (action) => {
        toast({
          title: "🚧 Em breve!",
          description: `A funcionalidade de ${action} será implementada em breve.`,
        });
      };
      
      const handleOSCreated = (novaOS) => {
        setOrdensServico(prev => [novaOS, ...prev]);
      };
      
      const handleOpenDialog = (os = null) => {
        setOsToEdit(os);
        setIsDialogOpen(true);
      }

      const handleDelete = async (osId) => {
          const { error } = await supabase.from('assistencias').delete().eq('id', osId);
          if (error) {
              toast({ title: 'Erro ao excluir O.S.', description: error.message, variant: 'destructive' });
          } else {
              toast({ title: 'Chamado excluído!' });
              setOrdensServico(prev => prev.filter(os => os.id !== osId));
          }
      }

      if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-wg-orange-base" />
            </div>
        );
      }

      return (
        <>
          <NovaOSDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onOSCreated={handleOSCreated}
            osToEdit={osToEdit}
            setOrdensServico={setOrdensServico}
          />
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1><Wrench className="inline-block mr-2" /> Assistência Técnica</h1>
                <p className="text-muted-foreground mt-1">
                  Gestão de chamados de assistência e pós-obra.
                </p>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus size={20} className="mr-2" />
                Solicitar Assistência
              </Button>
            </div>
            
            {ordensServico.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center glass-effect rounded-2xl"
              >
                <LifeBuoy className="w-24 h-24 text-wg-orange-base/30 mb-6" strokeWidth={1.5} />
                <h2 className="text-2xl font-bold mb-2">
                  Nenhum chamado aberto
                </h2>
                <p className="text-lg text-muted-foreground max-w-md">
                  Clique em "Solicitar Assistência" para criar uma nova Ordem de Serviço.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {ordensServico.map((os, index) => (
                  <motion.div
                    key={os.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-white/50 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <span className={cn('px-3 py-1 text-xs font-semibold rounded-full', statusMap[os.status]?.className || 'bg-gray-400 text-white')}>
                            {statusMap[os.status]?.label || os.status}
                        </span>
                        <p className="font-bold text-lg">{os.codigo} - {os.cliente_nome}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{os.descricao}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-row sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto">
                        <p className="text-xs text-muted-foreground mb-2 sm:text-right">Criado em: {new Date(os.created_at).toLocaleDateString()}</p>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(os)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleNotImplemented('geração de PDF')}>
                                <Download className="h-4 w-4" />
                            </Button>
                            <Can I="delete" a="assistencia">
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(os.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Can>
                        </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    };

    export default Assistencia;
