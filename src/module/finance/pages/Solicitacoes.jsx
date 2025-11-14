import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, FileText as FileTextIcon, Clock, CheckCircle, XCircle, Edit, Trash2, Share2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Solicitacoes = () => {
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [obras, setObras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSolicitacao, setEditingSolicitacao] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('solicitacoes_pagamento')
        .select(`*, obra:obras(nome), categoria:categorias_custo(nome)`);

      if (searchTerm) {
        query = query.or(`fornecedor.ilike.%${searchTerm}%,obra.nome.ilike.%${searchTerm}%`);
      }
      if (filtroStatus !== 'Todos') {
        query = query.eq('status', filtroStatus);
      }
      
      query = query.order('data_solicitacao', { ascending: false });


      const [solicitacoesRes, obrasRes, categoriasRes] = await Promise.all([
        query,
        supabase.from('obras').select('id, nome'),
        supabase.from('categorias_custo').select('id, nome'),
      ]);

      if (solicitacoesRes.error) throw solicitacoesRes.error;
      if (obrasRes.error) throw obrasRes.error;
      if (categoriasRes.error) throw categoriasRes.error;

      setSolicitacoes(solicitacoesRes.data);
      setObras(obrasRes.data);
      setCategorias(categoriasRes.data);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, filtroStatus]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const openFormForNew = () => {
    setEditingSolicitacao(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (solicitacao) => {
    setEditingSolicitacao(solicitacao);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (id) => {
    const { error } = await supabase.from('solicitacoes_pagamento').delete().match({ id });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Solicitação excluída.' });
      fetchData();
    }
  };
  
  const showNotImplementedToast = () => {
    toast({
      title: '🚧 Em construção!',
      description: 'Esta funcionalidade ainda não foi implementada. Peça no próximo prompt! 🚀',
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pendente': return <Clock className="text-yellow-600" size={20} />;
      case 'Aprovado': return <CheckCircle className="text-blue-600" size={20} />;
      case 'Pago': return <CheckCircle className="text-green-600" size={20} />;
      case 'Rejeitado': return <XCircle className="text-red-600" size={20} />;
      default: return <FileTextIcon className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-700';
      case 'Aprovado': return 'bg-blue-100 text-blue-700';
      case 'Pago': return 'bg-green-100 text-green-700';
      case 'Rejeitado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <Helmet><title>Solicitações - WG Almeida Gestão Financeira</title></Helmet>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitações de Pagamento</h1>
            <p className="text-gray-600 mt-1">Controle de aprovações e pagamentos</p>
          </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={openFormForNew} className="bg-[#F25C26] hover:bg-[#d94d1f] whitespace-nowrap">
              <Plus size={20} className="mr-2" />
              Nova
            </Button>
          </div>
        </div>

        <div className="wg-card p-4">
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Pendente', 'Aprovado', 'Pago', 'Rejeitado'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filtroStatus === status
                    ? 'bg-[#F25C26] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitacoes.map((sol, index) => (
              <motion.div
                key={sol.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="wg-card p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-100 rounded-lg mt-1 hidden sm:block">
                      {getStatusIcon(sol.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sol.status)}`}>
                          {sol.status}
                        </span>
                        <h3 className="font-bold text-gray-700 text-sm">SOL-{String(sol.id).substring(0, 4)}</h3>
                      </div>
                      <p className="font-bold text-lg text-gray-900">{sol.fornecedor}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-1">
                        <div><span className="text-gray-500">Obra: </span><span className="font-medium text-gray-800">{sol.obra?.nome}</span></div>
                        <div><span className="text-gray-500">Categoria: </span><span className="font-medium text-gray-800">{sol.categoria?.nome}</span></div>
                        <div><span className="text-gray-500">Data: </span><span className="font-medium text-gray-800">{new Date(sol.data_solicitacao).toLocaleDateString('pt-BR')}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2">
                    <p className="text-2xl font-bold text-[#2B4580]">
                      R$ {sol.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                     <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openFormForEdit(sol)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação excluirá permanentemente a solicitação.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sol.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="ghost" size="icon" onClick={showNotImplementedToast}><FileTextIcon className="h-4 w-4 text-gray-500" /></Button>
                        <Button variant="ghost" size="icon" onClick={showNotImplementedToast}><Share2 className="h-4 w-4 text-gray-500" /></Button>
                      </div>
                  </div>
                </div>
              </motion.div>
            ))}
             {solicitacoes.length === 0 && !loading && (
              <div className="text-center py-16 text-gray-500">
                <p>Nenhuma solicitação encontrada.</p>
                <p className="text-sm">Tente ajustar sua busca ou adicione uma nova solicitação.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <SolicitacaoForm 
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          solicitacao={editingSolicitacao}
          obras={obras}
          categorias={categorias}
          onSuccess={fetchData}
        />
      )}
    </>
  );
};


const SolicitacaoForm = ({ isOpen, setIsOpen, solicitacao, obras, categorias, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!solicitacao;
  const [formData, setFormData] = useState({
    obra_id: '',
    categoria_id: '',
    fornecedor: '',
    valor: '',
    data_solicitacao: new Date().toISOString().split('T')[0],
    status: 'Pendente',
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        obra_id: solicitacao.obra_id,
        categoria_id: solicitacao.categoria_id,
        fornecedor: solicitacao.fornecedor,
        valor: solicitacao.valor,
        data_solicitacao: new Date(solicitacao.data_solicitacao).toISOString().split('T')[0],
        status: solicitacao.status,
      });
    } else {
       setFormData({
        obra_id: '', categoria_id: '', fornecedor: '', valor: '',
        data_solicitacao: new Date().toISOString().split('T')[0], status: 'Pendente',
      });
    }
  }, [solicitacao, isOpen]);
  
  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    const { obra_id, categoria_id, valor, fornecedor } = formData;
    if (!obra_id || !categoria_id || !valor || !fornecedor) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: "Preencha todos os campos para continuar." });
      return;
    }
    
    const dataToSubmit = { ...formData, valor: parseFloat(valor) };

    let response;
    if (isEditing) {
      response = await supabase.from('solicitacoes_pagamento').update(dataToSubmit).match({ id: solicitacao.id });
    } else {
      response = await supabase.from('solicitacoes_pagamento').insert([dataToSubmit]);
    }

    if (response.error) {
      toast({ variant: 'destructive', title: 'Erro', description: response.error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Solicitação ${isEditing ? 'atualizada' : 'criada'}.` });
      setIsOpen(false);
      onSuccess();
    }
  };
  
  return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Solicitação" : "Nova Solicitação"}</DialogTitle>
            <DialogDescription>Preencha os detalhes da solicitação de pagamento.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <Select value={formData.obra_id} onValueChange={(value) => handleSelectChange('obra_id', value)}>
                <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={formData.categoria_id} onValueChange={(value) => handleSelectChange('categoria_id', value)}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>{categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Input name="fornecedor" placeholder="Fornecedor" value={formData.fornecedor} onChange={handleInputChange} />
              <Input name="valor" type="number" placeholder="Valor" value={formData.valor} onChange={handleInputChange} />
              <Input name="data_solicitacao" type="date" value={formData.data_solicitacao} onChange={handleInputChange} />
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                <SelectContent>
                   {['Pendente', 'Aprovado', 'Pago', 'Rejeitado'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};


export default Solicitacoes;