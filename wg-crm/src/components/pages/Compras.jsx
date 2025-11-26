import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import CompraCard from '@/components/compras/CompraCard';
import NovoPcDialog from '@/components/compras/NovoPcDialog';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Compras = () => {
  const [compras, setCompras] = useLocalStorage('crm_compras', []);
  const [isNovoPcOpen, setIsNovoPcOpen] = useState(false);
  const [compraToEdit, setCompraToEdit] = useState(null);
  const [expandedClient, setExpandedClient] = useState(null);
  const { toast } = useToast();

  const handleEdit = (compra) => {
    setCompraToEdit(compra);
    setIsNovoPcOpen(true);
  };

  const handleDelete = (id) => {
    setCompras((prev) => prev.filter((c) => c.id !== id));
    toast({
      title: 'Pedido Excluído!',
      description: 'O pedido de compra foi removido.',
      variant: 'destructive',
    });
  };

  const handleOpenNew = () => {
    setCompraToEdit(null);
    setIsNovoPcOpen(true);
  };

  const comprasPorCliente = useMemo(() => {
    const groups = compras.reduce((acc, compra) => {
      const clienteNome = compra.cliente_nome || 'Sem Cliente Vinculado';
      if (!acc[clienteNome]) {
        acc[clienteNome] = {
          pedidos: [],
          totalItens: 0,
          valorTotal: 0,
        };
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

  const handleNotImplemented = () => {
    toast({
      title: 'Em breve!',
      description: 'Esta funcionalidade será implementada em breve.',
    });
  };

  const initials = (name) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0] || '')
      .join('')
      .toUpperCase();

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1>Compras</h1>
            <p className="text-muted-foreground mt-1">Gestão de pedidos de compra e fornecedores</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleOpenNew}>
              <Plus size={20} className="mr-2" />
              Novo PC
            </Button>
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
                      <Avatar className="h-10 w-10 bg-purple-100 text-purple-700 border border-purple-200">
                        <AvatarFallback>{initials(clienteNome)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package size={20} className="text-purple-600" />
                          {clienteNome}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                          <span>{data.totalItens} item(ns)</span>
                          <span className="font-semibold">
                            {data.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleNotImplemented(); }}>
                        <Receipt className="mr-2 h-4 w-4" />
                        Consolidar
                      </Button>
                      {expandedClient === clienteNome ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </CardHeader>
                  {expandedClient === clienteNome && (
                    <CardContent className="p-4 bg-gray-50/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-4">
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
      <NovoPcDialog
        open={isNovoPcOpen}
        onOpenChange={setIsNovoPcOpen}
        compraToEdit={compraToEdit}
        setCompras={setCompras}
        compras={compras}
      />
    </>
  );
};

export default Compras;
