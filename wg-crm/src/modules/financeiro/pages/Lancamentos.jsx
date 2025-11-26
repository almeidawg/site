import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
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

const STATUS_OPTIONS = ['previsto', 'aprovado', 'recebido', 'pago', 'cancelado', 'vencido'];

const Lancamentos = () => {
  const { toast } = useToast();
  const [lancamentos, setLancamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('lancamentos_financeiros')
        .select('*, cliente:entities(nome_razao_social), plano:plano_contas(conta,codigo)')
        .order('data_vencimento', { ascending: false });

      if (searchTerm) {
        query = query.ilike('descricao', `%${searchTerm}%`);
      }

      const [lancRes, cliRes, catRes] = await Promise.all([
        query,
        supabase.from('entities').select('id, nome_razao_social').eq('ativo', true).eq('tipo', 'cliente'),
        supabase.from('plano_contas').select('id, conta, codigo'),
      ]);

      if (lancRes.error) throw lancRes.error;
      if (cliRes.error) throw cliRes.error;
      if (catRes.error) throw catRes.error;

      setLancamentos(lancRes.data || []);
      setClientes(cliRes.data || []);
      setCategorias(catRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [fetchData]);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('lancamentos_financeiros').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Lançamento excluído' });
      fetchData();
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setIsFormOpen(true);
  };

  return (
    <>
      <Helmet><title>Lançamentos - WG Almeida</title></Helmet>
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
            <Button onClick={() => { setEditing(null); setIsFormOpen(true); }} className="bg-[#F25C26] hover:bg-[#d94d1f] whitespace-nowrap"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {lancamentos.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="wg-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${t.tipo === 'receber' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.tipo === 'receber' ? <ArrowUpCircle className="text-green-600" /> : <ArrowDownCircle className="text-red-600" />}
                  </div>
                  <div>
                    <p className="font-bold">{t.descricao}</p>
                    <p className="text-sm text-gray-600">
                      {t.cliente?.nome_razao_social || 'Cliente não informado'} · {new Date(t.data_vencimento || t.data_emissao || new Date()).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.plano?.conta || 'Categoria'} {t.plano?.codigo ? `(${t.plano.codigo})` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-lg font-bold ${t.tipo === 'receber' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.tipo === 'pagar' ? '-' : ''} R$ {Number(t.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}
            {lancamentos.length === 0 && !loading && (
              <div className="text-center py-16 text-gray-500">
                <p>Nenhum lançamento encontrado.</p>
                <p className="text-sm">Tente ajustar sua busca ou adicione um novo lançamento.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <LancamentoForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          lancamento={editing}
          clientes={clientes}
          categorias={categorias}
          onSuccess={fetchData}
          formRef={formRef}
        />
      )}
    </>
  );
};

const LancamentoForm = ({ isOpen, setIsOpen, lancamento, clientes, categorias, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!lancamento;
  const [formData, setFormData] = useState({
    tipo: 'receber',
    descricao: '',
    valor: '',
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'previsto',
    cliente_id: null,
    categoria_id: null,
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        tipo: lancamento.tipo,
        descricao: lancamento.descricao || '',
        valor: lancamento.valor || '',
        data_emissao: lancamento.data_emissao || new Date().toISOString().split('T')[0],
        data_vencimento: lancamento.data_vencimento || new Date().toISOString().split('T')[0],
        status: lancamento.status || 'previsto',
        cliente_id: lancamento.cliente_id || null,
        categoria_id: lancamento.categoria_id || null,
      });
    } else {
      setFormData({
        tipo: 'receber',
        descricao: '',
        valor: '',
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        status: 'previsto',
        cliente_id: null,
        categoria_id: null,
      });
    }
  }, [lancamento, isEditing]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      valor: parseFloat(formData.valor) || 0,
    };

    let response;
    if (isEditing) {
      response = await supabase.from('lancamentos_financeiros').update(payload).eq('id', lancamento.id);
    } else {
      response = await supabase.from('lancamentos_financeiros').insert([payload]);
    }

    if (response.error) {
      toast({ variant: 'destructive', title: 'Erro', description: response.error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Lançamento ${isEditing ? 'atualizado' : 'adicionado'}.` });
      setIsOpen(false);
      onSuccess();
    }
  };

  const filteredCategorias = categorias || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          <DialogDescription>Preencha os detalhes da transação.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select value={formData.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="receber">Receber</SelectItem>
              <SelectItem value="pagar">Pagar</SelectItem>
            </SelectContent>
          </Select>
          <Input name="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleInputChange} />
          <Input name="valor" placeholder="Valor" type="number" value={formData.valor} onChange={handleInputChange} />
          <Input name="data_emissao" type="date" value={formData.data_emissao} onChange={handleInputChange} />
          <Input name="data_vencimento" type="date" value={formData.data_vencimento} onChange={handleInputChange} />
          <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={formData.cliente_id} onValueChange={(v) => handleSelectChange('cliente_id', v)}>
            <SelectTrigger><SelectValue placeholder="Cliente (opcional)" /></SelectTrigger>
            <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_razao_social}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={formData.categoria_id} onValueChange={(v) => handleSelectChange('categoria_id', v)}>
            <SelectTrigger><SelectValue placeholder="Categoria (plano de contas)" /></SelectTrigger>
            <SelectContent>{filteredCategorias.map(c => <SelectItem key={c.id} value={c.id}>{c.conta} {c.codigo && `(${c.codigo})`}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Lancamentos;
