
import React, { useState, useEffect, useRef } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2, Save, Search, Upload } from 'lucide-react';
    import { useLocalStorage } from '@/hooks/useLocalStorage';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


    const NovoContratoDialog = ({ open, onOpenChange, setContratos, propostaBase, onContratoGerado }) => {
        const [targetId, setTargetId] = useState('');
        const [selectedCliente, setSelectedCliente] = useState(null);
        const [clientes, setClientes] = useState([]);
        const [tipoContrato, setTipoContrato] = useState('');
        const [modelos, setModelos] = useState([]);
        const [modeloSelecionado, setModeloSelecionado] = useState('none'); // Default to 'none'
        const [conteudo, setConteudo] = useState('');
        const [loading, setLoading] = useState(false);
        const [isComboboxOpen, setIsComboboxOpen] = useState(false);
        const { toast } = useToast();
        const fileInputRef = useRef(null);
        
        const [oportunidades, setOportunidades] = useLocalStorage('crm_oportunidades', []);

        const resetState = () => {
            setTargetId('');
            setSelectedCliente(null);
            setTipoContrato('');
            setModeloSelecionado('none'); // Reset to 'none'
            setConteudo('');
        };

        useEffect(() => {
            const fetchClientes = async () => {
                const { data, error } = await supabase
                    .from('entities')
                    .select('id, nome_razao_social')
                    .eq('tipo', 'cliente');
                if (error) {
                    toast({ title: 'Erro ao buscar clientes', variant: 'destructive' });
                } else {
                    setClientes(data || []);
                }
            };

            if (open) {
                fetchClientes();
                const storedModelos = JSON.parse(localStorage.getItem('crm_contratos_modelos') || '[]');
                setModelos(storedModelos);

                if (propostaBase) {
                    const clienteDaProposta = clientes.find(c => c.id === propostaBase.cliente_id);
                    setTargetId(clienteDaProposta?.id || '');
                    setSelectedCliente(clienteDaProposta || null);
                    
                    const valorFormatado = propostaBase.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    const itensProposta = propostaBase.itens?.length > 0
                        ? propostaBase.itens.map(item => `- ${item.descricao} (Qtd: ${item.quantidade}, Valor: ${item.valor_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`).join('\n')
                        : 'Nenhum item detalhado.';

                    const conteudoInicial = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS...\n\nBaseado na Proposta #${propostaBase.numero}\nCliente: ${propostaBase.cliente_nome}\n\nDescrição: ${propostaBase.descricao}\n\nItens Incluídos:\n${itensProposta}\n\nValor Total: ${valorFormatado}\n\n[... restante do corpo do contrato ...]`;
                    setConteudo(conteudoInicial);
                } else {
                    resetState();
                }
            }
        }, [propostaBase, open, toast, clientes]); // Adicionado 'clientes' como dependência

        useEffect(() => {
            if (modeloSelecionado && modeloSelecionado !== 'none') { // Verifica se não é 'none'
                const modelo = modelos.find(m => m.id === modeloSelecionado);
                if (modelo) {
                    setConteudo(modelo.conteudo);
                    setTipoContrato(modelo.tipo);
                }
            } else if (modeloSelecionado === 'none' && !propostaBase) { // Limpa se 'none' e não tem proposta base
                setConteudo('');
                setTipoContrato('');
            }
        }, [modeloSelecionado, modelos, propostaBase]);
        
        const handleBackgroundImageUpload = (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    localStorage.setItem('contrato_background_image', reader.result);
                    toast({ title: 'Imagem de fundo salva com sucesso!' });
                };
                reader.readAsDataURL(file);
            } else {
                toast({ title: 'Por favor, selecione um arquivo de imagem.', variant: 'destructive' });
            }
        };

        const handleSaveContrato = () => {
            if (!targetId || !tipoContrato) {
                toast({
                    title: 'Campos obrigatórios',
                    description: 'Selecione um cliente e o tipo de contrato.',
                    variant: 'destructive',
                });
                return;
            }

            setLoading(true);

            const newContrato = {
                id: `cont_${Date.now()}`,
                targetId: targetId,
                targetName: selectedCliente.nome_razao_social,
                tipoContrato,
                conteudo,
                status: 'Rascunho',
                propostaOrigemId: propostaBase ? propostaBase.id : null,
                dataCriacao: new Date().toISOString(),
            };

            setContratos(prev => [...prev, newContrato]);
            
            if (onContratoGerado) {
                onContratoGerado(newContrato);
            }
            
            if(propostaBase && propostaBase.oportunidade_id) {
                 const updatedOportunidades = oportunidades.map(op => {
                    if (op.id === propostaBase.oportunidade_id) {
                        const servicos = new Set(op.servicos_contratados || []);
                        servicos.add(tipoContrato);
                        return { ...op, servicos_contratados: Array.from(servicos), fase: 'ganha', status: 'ganha' };
                    }
                    return op;
                });
                setOportunidades(updatedOportunidades);
            }

            toast({
                title: 'Contrato Salvo!',
                description: 'O novo contrato foi salvo como rascunho.',
            });

            setLoading(false);
            onOpenChange(false);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="text-center" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '1.5rem' }}>Gerar Novo Contrato</DialogTitle>
                        <DialogDescription>
                            {propostaBase ? `Gerando contrato a partir da Proposta #${propostaBase.numero}.` : 'Selecione o cliente e preencha os detalhes.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cliente:</Label>
                                <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isComboboxOpen}
                                            className="w-full justify-between"
                                            disabled={!!propostaBase}
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
                                                {clientes.map((c) => (
                                                    <CommandItem
                                                        key={c.id}
                                                        value={c.nome_razao_social}
                                                        onSelect={() => {
                                                            setTargetId(c.id);
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
                                <Label>Usar Modelo:</Label>
                                <Select onValueChange={setModeloSelecionado} value={modeloSelecionado}>
                                    <SelectTrigger><SelectValue placeholder="Comece de um modelo..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum</SelectItem> {/* Adicionado valor "none" */}
                                        {modelos.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Tipo de Contrato:</Label>
                                <Select onValueChange={setTipoContrato} value={tipoContrato || 'none'}> {/* Default to 'none' */}
                                    <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Selecione...</SelectItem> {/* Adicionado valor "none" */}
                                        <SelectItem value="arquitetura">Projeto Arquitetônico</SelectItem>
                                        <SelectItem value="engenharia">Engenharia</SelectItem>
                                        <SelectItem value="marcenaria">Marcenaria</SelectItem>
                                        <SelectItem value="prestacao_servicos">Prestação de Serviços</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             
                            <div className="space-y-2">
                                <Label>Papel Timbrado (Fundo)</Label>
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Carregar Imagem de Fundo
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleBackgroundImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <p className="text-xs text-muted-foreground">Esta imagem será usada como fundo nos PDFs gerados.</p>
                            </div>

                        </div>

                        <div className="space-y-2">
                            <Label>Conteúdo do Contrato</Label>
                            <Textarea
                                value={conteudo}
                                onChange={(e) => setConteudo(e.target.value)}
                                placeholder="Digite ou cole o conteúdo do contrato aqui."
                                className="h-full min-h-[300px] text-sm leading-relaxed p-4"
                                style={{ textAlign: 'justify', whiteSpace: 'pre-wrap', fontFamily: "'Bahnschrift', sans-serif" }}
                            />
                            {propostaBase && <p className="text-xs text-muted-foreground">
                                 O conteúdo foi pré-preenchido com base na proposta. Ajuste conforme necessário.
                            </p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button onClick={handleSaveContrato} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Rascunho
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default NovoContratoDialog;
