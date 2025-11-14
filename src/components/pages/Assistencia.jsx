
import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { LifeBuoy, Plus, Wrench, Loader2, Send, Edit, Download, Trash2, Search, Share2, Eye } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { supabase } from '@/lib/customSupabaseClient';
    import { cn } from '@/lib/utils';
    import { Can } from '@/contexts/AbilityContext';
    import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { getWhatsAppLink } from '@/lib/whatsapp';

    const statusMap = {
        aberta: { label: 'Aberta', className: 'bg-gray-400 text-white' },
        agendado: { label: 'Agendado', className: 'bg-yellow-500 text-white' },
        em_atendimento: { label: 'Em Atendimento', className: 'bg-orange-500 text-white' },
        atendido: { label: 'Atendido', className: 'bg-green-500 text-white' },
        em_atraso: { label: 'Em Atraso', className: 'bg-red-600 text-white' },
    };

    const NovaAssistencia = ({ open, onOpenChange, onOSCreated, osToEdit, setOrdensServico }) => {
        const [entities, setEntities] = useState([]);
        const [clienteId, setClienteId] = useState('');
        const [selectedCliente, setSelectedCliente] = useState(null);
        const [descricao, setDescricao] = useState('');
        const [status, setStatus] = useState('aberta');
        const [isSaving, setIsSaving] = useState(false);
        const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
        const [pdfUrl, setPdfUrl] = useState(null);
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
                setPdfUrl(null);
            }
        }, [osToEdit, open, entities]);

        useEffect(() => {
            const fetchClientes = async () => {
                const { data, error } = await supabase
                    .from('entities')
                    .select('id, nome_razao_social, telefone')
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

        const handleGeneratePdfAndShare = async (osId, share = false) => {
            setIsGeneratingPdf(true);
            try {
                const { data, error } = await supabase.functions.invoke('assistencia-pdf', { body: { assistencia_id: osId } });
                if (error) throw error;
                setPdfUrl(data.url);
                toast({ title: 'PDF gerado com sucesso!' });
                if (share) {
                    const msg = `Olá! Sua solicitação de assistência foi registrada com sucesso. Acesse o PDF com os detalhes aqui: ${data.url}`;
                    const phone = selectedCliente?.telefone?.replace(/\D/g, '');
                    window.open(getWhatsAppLink(msg, phone), '_blank');
                    onOpenChange(false);
                } else {
                    window.open(data.url, '_blank');
                }
            } catch(pdfError) {
                toast({ title: 'Erro ao gerar PDF', description: pdfError.message, variant: 'destructive' });
            } finally {
                setIsGeneratingPdf(false);
            }
        };

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
                    .single();

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
                    .single();
        
                if (error) {
                    toast({ title: 'Erro ao criar O.S.', description: error.message, variant: 'destructive' });
                } else {
                    toast({ title: 'Ordem de Serviço Criada!', description: `A O.S. ${osCode} foi aberta.` });
                    onOSCreated(novaOS);
                    await handleGeneratePdfAndShare(novaOS.id, true);
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
                        <Button onClick={handleSubmit} disabled={isSaving || isGeneratingPdf}>
                            {isSaving || isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditing ? <Send className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
                            {isEditing ? 'Salvar Alterações' : 'Salvar e Enviar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const Assistencia = () => {
      const [ordensServico, setOrdensServico] = useState([]);
      const [loading, setLoading] = useState(true);
      const [generatingPdf, setGeneratingPdf] = useState(null);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [osToEdit, setOsToEdit] = useState(null);
      const { toast } = useToast();

      const fetchOS = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('assistencias').select('*').order('created_at', { ascending: false });
        if(error) {
            toast({ title: 'Erro ao buscar chamados', variant: 'destructive' });
        } else {
            setOrdensServico(data);
        }
        setLoading(false);
      }, [toast]);
      
      useEffect(() => {
        fetchOS();
      }, [fetchOS]);
      
      const handleOSCreated = useCallback((novaOS) => {
        setOrdensServico(prev => [novaOS, ...prev]);
      }, []);
      
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

      const handleGenerateAndShare = async (assistenciaId, cliente, shareType) => {
          setGeneratingPdf(assistenciaId);
          try {
            const { data, error } = await supabase.functions.invoke('assistencia-pdf', { body: { assistencia_id: assistenciaId }});
            if (error) throw error;
            
            if (shareType === 'view' || shareType === 'download') {
                window.open(data.url, '_blank');
            } else if (shareType === 'whatsapp') {
                const msg = `Olá! Segue a Ordem de Serviço de assistência para conferência: ${data.url}`;
                const phone = cliente?.telefone?.replace(/\D/g, '');
                window.open(getWhatsAppLink(msg, phone), '_blank');
            }

          } catch (err) {
            toast({ title: 'Erro ao gerar PDF', description: err.message, variant: 'destructive' });
          } finally {
            setGeneratingPdf(null);
          }
      };

      if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-wg-orange-base" />
            </div>
        );
      }

      return (
        <>
          <NovaAssistencia 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onOSCreated={handleOSCreated}
            osToEdit={osToEdit}
            setOrdensServico={setOrdensServico}
          />
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2"><Wrench />Assistência Técnica</h1>
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
                className="flex flex-col items-center justify-center h-[60vh] text-center bg-card border rounded-lg p-8"
              >
                <LifeBuoy className="w-24 h-24 text-muted-foreground/50 mb-6" strokeWidth={1.5} />
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
                    className="p-4 bg-card rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-4"
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
                            <Button variant="ghost" size="icon" onClick={() => handleGenerateAndShare(os.id, os, 'view')} disabled={generatingPdf === os.id}>
                                {generatingPdf === os.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleGenerateAndShare(os.id, os, 'download')} disabled={generatingPdf === os.id}>
                                {generatingPdf === os.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" onClick={() => handleGenerateAndShare(os.id, os, 'whatsapp')} disabled={generatingPdf === os.id}>
                                {generatingPdf === os.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Share2 className="h-4 w-4" />}
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
