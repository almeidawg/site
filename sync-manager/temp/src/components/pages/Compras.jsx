import React, { useState, useMemo, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Plus, Search, Receipt, ChevronDown, ChevronUp, Package, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import CompraCard from '@/components/compras/CompraCard';
    import NovoPcDialog from '@/components/compras/NovoPcDialog';
    import { useToast } from '@/components/ui/use-toast';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { supabase } from '@/lib/customSupabaseClient';
    import { getWhatsAppLink } from '@/lib/whatsapp';

    const PedidoConsolidadoActions = ({ pedidoId }) => {
        const [pdfUrl, setPdfUrl] = useState(null);
        const [loading, setLoading] = useState(false);
        const { toast } = useToast();

        const gerarPDF = async (openInNewTab = true) => {
            if (pdfUrl) {
                if (openInNewTab) window.open(pdfUrl, '_blank');
                return pdfUrl;
            }
            setLoading(true);
            try {
                const { data, error } = await supabase.functions.invoke('pedido-compra-pdf', { 
                    body: { pedido_id: pedidoId } 
                });
                if (error) throw error;
                setPdfUrl(data.url);
                if (openInNewTab) {
                    window.open(data.url, '_blank');
                    toast({ title: "PDF Gerado!", description: "O pedido de compra está pronto." });
                }
                return data.url;
            } catch(err) {
                toast({ title: "Erro ao gerar PDF", description: err.message, variant: "destructive" });
                return null;
            } finally {
                setLoading(false);
            }
        };

        const enviarWhats = async () => {
            const url = await gerarPDF(false);
            if (!url) {
                toast({ title: "Gere o PDF primeiro", description: "Não foi possível obter o link do PDF para compartilhar.", variant: "destructive" });
                return;
            };
            window.open(getWhatsAppLink(`Olá! Segue o pedido de compra para sua análise: ${url}`), '_blank');
        };

        return { gerarPDF, enviarWhats, loading };
    };

    const Compras = () => {
        const [compras, setCompras] = useState([]);
        const [loading, setLoading] = useState(true);
        const [isNovoPcOpen, setIsNovoPcOpen] = useState(false);
        const [compraToEdit, setCompraToEdit] = useState(null);
        const [expandedClient, setExpandedClient] = useState(null);
        const { toast } = useToast();

        const fetchCompras = useCallback(async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('v_purchase_orders_full')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                toast({ title: 'Erro ao buscar pedidos', description: error.message, variant: 'destructive' });
                setCompras([]);
            } else {
                const formattedData = data.map(p => ({
                    id: p.id,
                    codigo: p.codigo,
                    fornecedor_nome: p.fornecedor_nome || 'N/A',
                    itens_descricao: p.itens_descricao,
                    valor_total: p.valor_total || 0,
                    status: p.status,
                    data_entrega: p.updated_at,
                    cliente_id: p.cliente_id,
                    cliente_nome: p.cliente_nome || 'Sem Cliente',
                    imagem_url: p.imagem_url,
                    link_produto: p.link_produto,
                }));
                setCompras(formattedData);
            }
            setLoading(false);
        }, [toast]);
        
        useEffect(() => {
            fetchCompras();
        }, [fetchCompras]);

        const handleEdit = (compra) => {
            setCompraToEdit(compra);
            setIsNovoPcOpen(true);
        };

        const handleDelete = async (id) => {
            const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
            if (error) {
                toast({ title: 'Erro ao excluir pedido', variant: 'destructive' });
            } else {
                setCompras(prev => prev.filter(c => c.id !== id));
                toast({ title: 'Pedido Excluído!', variant: 'destructive' });
            }
        };

        const handleOpenNew = () => {
            setCompraToEdit(null);
            setIsNovoPcOpen(true);
        };

        const handleSave = () => {
            fetchCompras();
        };

        const comprasPorCliente = useMemo(() => {
            const groups = compras.reduce((acc, compra) => {
                const clienteNome = compra.cliente_nome || 'Sem Cliente Vinculado';
                if (!acc[clienteNome]) {
                    acc[clienteNome] = { pedidos: [], totalItens: 0, valorTotal: 0 };
                }
                acc[clienteNome].pedidos.push(compra);
                acc[clienteNome].totalItens += 1;
                acc[clienteNome].valorTotal += compra.valor_total;
                return acc;
            }, {});
            return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
        }, [compras]);

        const toggleClient = (clientName) => {
            setExpandedClient(expandedClient === clientName ? null : clientName);
        };

        if (loading) {
            return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-wg-orange-base" /></div>
        }

        return (
            <>
                <div className="space-y-8 p-4 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Compras</h1>
                            <p className="text-muted-foreground mt-1">Gestão de pedidos de compra e fornecedores</p>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => window.open('https://www.leroymerlin.com.br/', '_blank')}>
                                <Search size={16} className="mr-2" /> Buscar na Leroy
                            </Button>
                            <Button onClick={handleOpenNew}><Plus size={16} className="mr-2" /> Novo PC</Button>
                        </div>
                    </div>

                    {compras.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-effect rounded-2xl p-12 text-center">
                            <Receipt className="mx-auto h-24 w-24 text-gray-300 mb-4" />
                            <p className="text-xl font-semibold text-muted-foreground">Nenhum pedido de compra criado ainda.</p>
                            <p className="text-sm text-gray-500 mt-2">Clique em "Novo PC" para começar.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {comprasPorCliente.map(([clienteNome, data], idx) => (
                                <motion.div key={clienteNome} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                    <Card className="overflow-hidden">
                                        <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 p-4" onClick={() => toggleClient(clienteNome)}>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-purple-100 text-purple-700 rounded-lg p-3"><Package size={24} /></div>
                                                <div>
                                                    <CardTitle className="text-lg">{clienteNome}</CardTitle>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                                        <span>{data.totalItens} pedido(s)</span>
                                                        <span className="font-semibold">{data.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {expandedClient === clienteNome ? <ChevronUp /> : <ChevronDown />}
                                            </div>
                                        </CardHeader>
                                        {expandedClient === clienteNome && (
                                            <CardContent className="p-4 bg-gray-50/50">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                                    {data.pedidos.map((compra, index) => (
                                                        <CompraCard key={compra.id} compra={compra} index={index} onEdit={handleEdit} onDelete={handleDelete} />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
                <NovoPcDialog open={isNovoPcOpen} onOpenChange={setIsNovoPcOpen} compraToEdit={compraToEdit} onSave={handleSave} />
            </>
        );
    };

    export default Compras;