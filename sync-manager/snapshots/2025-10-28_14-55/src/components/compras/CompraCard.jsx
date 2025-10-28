import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { DollarSign, Package, Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import ActionIcons from '@/components/shared/ActionIcons';
    import { supabase } from '@/lib/customSupabaseClient';
    import { getWhatsAppLink } from '@/lib/whatsapp';

    const CompraCard = ({ compra, index, onEdit, onDelete }) => {
        const { toast } = useToast();
        const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

        const statusMap = {
            aberto: { label: 'Aberto', color: 'bg-yellow-100 text-yellow-800' },
            fechado: { label: 'Fechado', color: 'bg-green-100 text-green-800' },
            cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
        };

        const statusInfo = statusMap[compra.status] || { label: 'Pendente', color: 'bg-gray-100' };

        const generatePdf = async (openInNewTab = true) => {
            setIsGeneratingPdf(true);
            try {
                const { data, error } = await supabase.functions.invoke('pedido-compra-pdf', { 
                    body: { pedido_id: compra.id } 
                });
                if (error) throw error;
                if (openInNewTab) {
                    window.open(data.url, '_blank');
                    toast({ title: "PDF Gerado!", description: "O pedido de compra está pronto." });
                }
                return data.url;
            } catch(err) {
                toast({ title: "Erro ao gerar PDF", description: err.message, variant: "destructive" });
                return null;
            } finally {
                setIsGeneratingPdf(false);
            }
        };

        const handleShareWhats = async () => {
            const url = await generatePdf(false);
            if (!url) {
                toast({ title: "Gere o PDF primeiro", description: "Não foi possível obter o link do PDF para compartilhar.", variant: "destructive" });
                return;
            };
            window.open(getWhatsAppLink(`Olá! Segue o pedido de compra para sua análise: ${url}`), '_blank');
        };

        const firstItem = Array.isArray(compra.itens_descricao) ? compra.itens_descricao[0] : compra.itens_descricao;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass-effect rounded-xl border border-purple-200/50 hover:shadow-lg transition-all flex flex-col"
            >
                <div className="h-32 overflow-hidden rounded-t-xl relative group">
                    {compra.imagem_url ? (
                        <img src={compra.imagem_url} alt={firstItem} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white">
                             <Package size={32} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                </div>
                
                <div className="p-3 flex-grow flex flex-col">
                    <div className="flex-grow">
                        <h3 className="font-semibold text-sm truncate">PC #{compra.codigo} - {compra.fornecedor_nome}</h3>
                        <p className="text-xs text-muted-foreground clamp-2-lines h-8">{firstItem}</p>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <DollarSign size={12} /> Valor
                            </span>
                            <span className="font-bold text-sm">
                                {compra.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-purple-200/20 flex justify-end">
                        {isGeneratingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <ActionIcons 
                                onEdit={() => onEdit(compra)}
                                onDelete={() => onDelete(compra.id)}
                                onView={compra.link_produto ? () => window.open(compra.link_produto, '_blank') : null}
                                onPdf={generatePdf}
                                onWhats={handleShareWhats}
                            />
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    export default CompraCard;