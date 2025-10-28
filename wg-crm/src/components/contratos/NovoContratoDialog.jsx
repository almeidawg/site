
    import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const NovoContratoDialog = ({ open, onOpenChange, setContratos, propostaBase, onContratoGerado }) => {
    const [targetId, setTargetId] = useState('');
    const [targetName, setTargetName] = useState('');
    const [targets, setTargets] = useState([]);
    const [tipoContrato, setTipoContrato] = useState('');
    const [modelos, setModelos] = useState([]);
    const [modeloSelecionado, setModeloSelecionado] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    const [entities] = useLocalStorage('crm_entities', []);
    const [oportunidades, setOportunidades] = useLocalStorage('crm_oportunidades', []);

    const resetState = () => {
        setTargetId('');
        setTargetName('');
        setTipoContrato('');
        setModeloSelecionado('');
        setConteudo('');
    };

    useEffect(() => {
        if (open) {
            const clientes = entities.filter(e => e.tipo === 'cliente');
            setTargets(clientes);

            if (propostaBase) {
                const clienteDaProposta = clientes.find(c => c.id === propostaBase.cliente_id);
                setTargetId(clienteDaProposta?.id || '');
                setTargetName(propostaBase.cliente_nome || '');
                
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
    }, [propostaBase, open, entities]);
    
    useEffect(() => {
        const storedModelos = JSON.parse(localStorage.getItem('crm_contratos_modelos') || '[]');
        setModelos(storedModelos);
    }, [open]);

    useEffect(() => {
        if (modeloSelecionado) {
            const modelo = modelos.find(m => m.id === modeloSelecionado);
            if (modelo) {
                setConteudo(modelo.conteudo);
                setTipoContrato(modelo.tipo);
            }
        }
    }, [modeloSelecionado, modelos]);

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
            targetName: targetName,
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
                            <Select 
                                onValueChange={(value) => {
                                    const selected = targets.find(t => t.id === value);
                                    setTargetId(value);
                                    setTargetName(selected?.nome_razao_social || '');
                                }} 
                                value={targetId}
                                disabled={!!propostaBase}
                            >
                                <SelectTrigger><SelectValue placeholder={propostaBase ? propostaBase.cliente_nome : `Selecione o cliente...`} /></SelectTrigger>
                                <SelectContent>
                                    {targets.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.nome_razao_social}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Usar Modelo:</Label>
                            <Select onValueChange={setModeloSelecionado} value={modeloSelecionado}>
                                <SelectTrigger><SelectValue placeholder="Comece de um modelo..." /></SelectTrigger>
                                <SelectContent>
                                    {modelos.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Tipo de Contrato:</Label>
                            <Select onValueChange={setTipoContrato} value={tipoContrato}>
                                <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="arquitetura">Projeto Arquitetônico</SelectItem>
                                    <SelectItem value="engenharia">Engenharia</SelectItem>
                                    <SelectItem value="marcenaria">Marcenaria</SelectItem>
                                    <SelectItem value="prestacao_servicos">Prestação de Serviços</SelectItem>
                                </SelectContent>
                            </Select>
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
  