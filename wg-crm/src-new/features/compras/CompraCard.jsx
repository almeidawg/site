import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Edit, Package, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CompraCard = ({ compra, index, onEdit, onDelete }) => {
    const { toast } = useToast();

    const statusMap = {
        pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        aprovado: { label: 'Aprovado', color: 'bg-blue-100 text-blue-800' },
        entregue: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
        cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[compra.status] || { label: 'Pendente', color: 'bg-gray-100' };

    const handleNotImplemented = () => {
        toast({
            title: '🚧 Em breve!',
            description: "Esta funcionalidade será implementada em breve. Fique de olho!",
        });
    }

    const openLink = () => {
        if(compra.link) {
            window.open(compra.link, '_blank', 'noopener,noreferrer');
        } else {
            toast({
                title: 'Link não disponível',
                description: 'Não há link de produto associado a este pedido de compra.',
                variant: 'destructive',
            });
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-xl border border-purple-200/50 hover:shadow-lg transition-all flex flex-col"
        >
            {compra.imagem_url && (
                <div className="h-40 overflow-hidden rounded-t-xl relative">
                    <img src={compra.imagem_url} alt={compra.itens} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                </div>
            )}
            
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex-grow">
                    {!compra.imagem_url && (
                        <div className="flex justify-between items-start mb-2">
                             <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white">
                                <Package size={20} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    )}
                    <h3 className="font-semibold text-lg">PC #{compra.numero} - {compra.fornecedor}</h3>
                    <p className="text-sm text-muted-foreground clamp-2-lines">{compra.itens}</p>
                    {compra.cliente_nome && <p className="text-sm font-semibold text-purple-700 mt-1">Cliente: {compra.cliente_nome}</p>}
                </div>
                
                <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <DollarSign size={14} /> Valor Total
                        </span>
                        <span className="font-bold text-lg">
                            {compra.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Calendar size={14} /> Entrega Prevista
                        </span>
                        <span>{new Date(compra.data_entrega).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-purple-200/20 flex gap-2">
                    {compra.link && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={openLink}>
                            <Zap size={14} className="mr-2"/>Ver Produto
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(compra)}>
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete(compra.id)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default CompraCard;