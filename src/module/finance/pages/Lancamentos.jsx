import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, ArrowUpCircle, ArrowDownCircle, Edit, Trash2, FileText, Share2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

<Button onClick={() => setOcrModalOpen(true)}>
  Lançar por Nota (OCR)
</Button>

const response = await fetch('/api/ocr/processar-documento', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileUrl, tipoLancamento: 'despesa' }),
});
const data = await response.json();
// data -> preencher form de lançamento


const Lancamentos = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [obras, setObras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('fin_transactions')
        .select('*, project:obras(nome), category:fin_categories(name), party:parties(name)')
        .order('occurred_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }

      const [transRes, obrasRes, catRes, partiesRes] = await Promise.all([
        query,
        supabase.from('obras').select('id, nome'),
        supabase.from('fin_categories').select('id, name, kind'),
        supabase.from('parties').select('id, name')
      ]);

      if (transRes.error) throw transRes.error;
      if (obrasRes.error) throw obrasRes.error;
      if (catRes.error) throw catRes.error;
      if (partiesRes.error) throw partiesRes.error;

      setTransactions(transRes.data);
      setObras(obrasRes.data);
      setCategorias(catRes.data);
      setParties(partiesRes.data);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const openFormForNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('fin_transactions').delete().match({ id });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Lançamento excluído.' });
      fetchData();
    }
  };
  
  const showNotImplementedToast = () => {
    toast({
      title: '🚧 Em construção!',
      description: 'Esta funcionalidade ainda não foi implementada. Peça no próximo prompt! 🚀',
    });
  };

  return (
    <>
      <Helmet><title>Lançamentos - WG Almeida Gestão Financeira</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Lançamentos Financeiros</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Buscar por descrição..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={openFormForNew} className="bg-[#F25C26] hover:bg-[#d94d1f]"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="wg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.type === 'income' ? <ArrowUpCircle className="text-green-600" /> : <ArrowDownCircle className="text-red-600" />}
                  </div>
                  <div>
                    <p className="font-bold">{t.description}</p>
                    <p className="text-sm text-gray-600">
                      {t.project?.nome || 'Geral'} • {new Date(t.occurred_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-lg font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'expense' && '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openFormForEdit(t)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o lançamento.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="ghost" size="icon" onClick={showNotImplementedToast}><FileText className="h-4 w-4 text-gray-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={showNotImplementedToast}><Share2 className="h-4 w-4 text-gray-500" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
             {transactions.length === 0 && !loading && (
              <div className="text-center py-16 text-gray-500">
                <p>Nenhum lançamento encontrado.</p>
                <p className="text-sm">Tente ajustar sua busca ou adicione um novo lançamento.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isFormOpen && (
        <TransactionForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          transaction={editingTransaction}
          obras={obras}
          categorias={categorias}
          parties={parties}
          onSuccess={fetchData}
        />
      )}
    </>
  );
};

const TransactionForm = ({ isOpen, setIsOpen, transaction, obras, categorias, parties, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!transaction;
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: '',
    occurred_at: new Date().toISOString().split('T')[0],
    project_id: null,
    category_id: null,
    party_id: null,
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        occurred_at: new Date(transaction.occurred_at).toISOString().split('T')[0],
        project_id: transaction.project_id,
        category_id: transaction.category_id,
        party_id: transaction.party_id,
      });
    } else {
      setFormData({
        type: 'expense', description: '', amount: '', occurred_at: new Date().toISOString().split('T')[0],
        project_id: null, category_id: null, party_id: null,
      });
    }
  }, [transaction, isOpen]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    const dataToSubmit = {
      ...formData,
      amount: parseFloat(formData.amount),
      currency: 'BRL',
      cleared: true,
    };

    let response;
    if (isEditing) {
      response = await supabase.from('fin_transactions').update(dataToSubmit).match({ id: transaction.id });
    } else {
      response = await supabase.from('fin_transactions').insert([dataToSubmit]);
    }

    if (response.error) {
      toast({ variant: 'destructive', title: 'Erro', description: response.error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Lançamento ${isEditing ? 'atualizado' : 'adicionado'}.` });
      setIsOpen(false);
      onSuccess();
    }
  };

  const filteredCategories = categorias.filter(c => c.kind === formData.type);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          <DialogDescription>Preencha os detalhes da transação.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Tabs value={formData.type} onValueChange={(v) => handleSelectChange('type', v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Despesa</TabsTrigger>
              <TabsTrigger value="income">Receita</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input name="description" placeholder="Descrição" value={formData.description} onChange={handleInputChange} />
          <Input name="amount" placeholder="Valor" type="number" value={formData.amount} onChange={handleInputChange} />
          <Input name="occurred_at" type="date" value={formData.occurred_at} onChange={handleInputChange} />
          <Select value={formData.project_id} onValueChange={(v) => handleSelectChange('project_id', v)}><SelectTrigger><SelectValue placeholder="Selecione a Obra (Opcional)" /></SelectTrigger><SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent></Select>
          <Select value={formData.category_id} onValueChange={(v) => handleSelectChange('category_id', v)}><SelectTrigger><SelectValue placeholder="Selecione a Categoria" /></SelectTrigger><SelectContent>{filteredCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Select value={formData.party_id} onValueChange={(v) => handleSelectChange('party_id', v)}><SelectTrigger><SelectValue placeholder="Cliente/Fornecedor (Opcional)" /></SelectTrigger><SelectContent>{parties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Lancamentos;