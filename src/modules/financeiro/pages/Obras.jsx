import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Building2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Obras = () => {
  const { toast } = useToast();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newObra, setNewObra] = useState({
    nome: '',
    cliente: '',
    orcamento: '',
    prazo: '',
    status: 'Planejamento',
  });

  const fetchObras = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('obras')
      .select(`
        *,
        transacoes ( valor )
      `);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar obras',
        description: error.message,
      });
      setObras([]);
    } else {
      const obrasComGastos = data.map(obra => {
        const gasto = obra.transacoes.reduce((acc, t) => acc + (t.valor || 0), 0);
        const percentual = obra.orcamento > 0 ? (gasto / obra.orcamento) * 100 : 0;
        return { ...obra, gasto, percentual };
      });
      setObras(obrasComGastos);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewObra(prev => ({ ...prev, [name]: value }));
  };

  const handleAddObra = async () => {
    if (!newObra.nome || !newObra.orcamento) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Nome e Orçamento são obrigatórios.',
      });
      return;
    }

    const { error } = await supabase.from('obras').insert([
      {
        nome: newObra.nome,
        cliente: newObra.cliente,
        orcamento: parseFloat(newObra.orcamento),
        prazo: newObra.prazo || null,
        status: newObra.status,
      },
    ]);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar obra',
        description: error.message,
      });
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Nova obra adicionada.',
      });
      setIsDialogOpen(false);
      setNewObra({ nome: '', cliente: '', orcamento: '', prazo: '', status: 'Planejamento' });
      fetchObras();
    }
  };

  const filteredObras = obras.filter(obra =>
    obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (obra.cliente && obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em Andamento': return 'bg-blue-100 text-blue-700';
      case 'Finalizado': return 'bg-green-100 text-green-700';
      case 'Planejamento': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <Helmet>
        <title>Obras - WG Almeida Gestão Financeira</title>
        <meta name="description" content="Gestão de obras e centros de custo do Grupo WG Almeida" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Obras</h1>
            <p className="text-gray-600 mt-1">Controle de centros de custo e projetos</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-[#F25C26] hover:bg-[#d94d1f]">
            <Plus size={20} className="mr-2" />
            Nova Obra
          </Button>
        </div>

        <div className="wg-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Buscar por nome ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter size={20} />
              Filtros
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredObras.map((obra, index) => (
              <motion.div
                key={obra.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="wg-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#F25C26] to-[#2B4580] rounded-lg">
                      <Building2 className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{obra.nome}</h3>
                      <p className="text-sm text-gray-600">{obra.cliente}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(obra.status)}`}>
                    {obra.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orçamento:</span>
                    <span className="font-medium text-gray-900">R$ {obra.orcamento.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gasto:</span>
                    <span className="font-medium text-gray-900">R$ {obra.gasto.toLocaleString('pt-BR')}</span>
                  </div>
                  {obra.prazo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prazo:</span>
                      <span className="font-medium text-gray-900">{new Date(obra.prazo).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Execução Orçamentária</span>
                      <span className={`text-sm font-bold ${obra.percentual > 90 ? 'text-red-600' : 'text-green-600'}`}>
                        {obra.percentual.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${obra.percentual > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(obra.percentual, 100)}%` }}
                      />
                    </div>
                    {obra.percentual > 90 && (
                      <div className="flex items-center gap-1 mt-2 text-red-600">
                        <AlertTriangle size={14} />
                        <span className="text-xs">Atenção: Orçamento próximo do limite</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Obra</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para cadastrar uma nova obra.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome</Label>
              <Input id="nome" name="nome" value={newObra.nome} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cliente" className="text-right">Cliente</Label>
              <Input id="cliente" name="cliente" value={newObra.cliente} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orcamento" className="text-right">Orçamento</Label>
              <Input id="orcamento" name="orcamento" type="number" value={newObra.orcamento} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prazo" className="text-right">Prazo</Label>
              <Input id="prazo" name="prazo" type="date" value={newObra.prazo} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddObra} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar Obra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Obras;