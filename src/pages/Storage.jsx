import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Package, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const Storage = () => {
  const { toast } = useToast();
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Form novo item
  const [novoItem, setNovoItem] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    unidade_medida: 'un',
    quantidade_inicial: 0,
  });

  // Form retirada
  const [retirada, setRetirada] = useState({
    item_id: '',
    quantidade: 0,
    cliente_id: '',
    obra_id: '',
    observacoes: '',
  });

  const carregarSaldo = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('storage_saldo')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setItens(data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao carregar Storage',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarSaldo();
  }, []);

  const handleNovoItemChange = (field, value) => {
    setNovoItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleRetiradaChange = (field, value) => {
    setRetirada((prev) => ({ ...prev, [field]: value }));
  };

  const salvarNovoItem = async () => {
    try {
      if (!novoItem.nome || !novoItem.quantidade_inicial) {
        toast({ title: 'Preencha nome e quantidade inicial.', variant: 'destructive' });
        return;
      }

      // 1) Cria item
      const { data: item, error: itemError } = await supabase
        .from('storage_items')
        .insert({
          nome: novoItem.nome,
          descricao: novoItem.descricao,
          categoria: novoItem.categoria,
          unidade_medida: novoItem.unidade_medida,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // 2) Cria movimentação de entrada
      const { error: movError } = await supabase
        .from('storage_movements')
        .insert({
          item_id: item.id,
          tipo: 'entrada',
          quantidade: novoItem.quantidade_inicial,
          observacoes: 'Entrada inicial via cadastro',
        });

      if (movError) throw movError;

      toast({ title: 'Item cadastrado com sucesso!' });
      setNovoItem({
        nome: '',
        descricao: '',
        categoria: '',
        unidade_medida: 'un',
        quantidade_inicial: 0,
      });
      carregarSaldo();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao salvar item',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const salvarRetirada = async () => {
    try {
      if (!retirada.item_id || !retirada.quantidade) {
        toast({ title: 'Selecione o item e a quantidade.', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('storage_movements').insert({
        item_id: retirada.item_id,
        tipo: 'saida',
        quantidade: retirada.quantidade,
        obra_id: retirada.obra_id || null,
        cliente_id: retirada.cliente_id || null,
        observacoes: retirada.observacoes,
      });

      if (error) throw error;

      toast({ title: 'Retirada registrada com sucesso!' });
      setRetirada({
        item_id: '',
        quantidade: 0,
        cliente_id: '',
        obra_id: '',
        observacoes: '',
      });
      carregarSaldo();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao registrar retirada',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const itensFiltrados = itens.filter((i) =>
    i.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (i.categoria || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Storage – Depósito de Obras</h1>
          <p className="text-sm text-muted-foreground">
            Controle de ferramentas e materiais com entrada e saída por obra/cliente.
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar novo item</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Nome do item"
                  value={novoItem.nome}
                  onChange={(e) => handleNovoItemChange('nome', e.target.value)}
                />
                <Input
                  placeholder="Descrição"
                  value={novoItem.descricao}
                  onChange={(e) => handleNovoItemChange('descricao', e.target.value)}
                />
                <Input
                  placeholder="Categoria (ex: Ferramentas, Elétrico, Hidráulico...)"
                  value={novoItem.categoria}
                  onChange={(e) => handleNovoItemChange('categoria', e.target.value)}
                />
                <Input
                  placeholder="Unidade (ex: un, m, m², kg)"
                  value={novoItem.unidade_medida}
                  onChange={(e) => handleNovoItemChange('unidade_medida', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Quantidade inicial"
                  value={novoItem.quantidade_inicial}
                  onChange={(e) =>
                    handleNovoItemChange('quantidade_inicial', Number(e.target.value))
                  }
                />
                <Button onClick={salvarNovoItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Salvar item
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Minus className="w-4 h-4 mr-2" />
                Registrar retirada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar retirada de item</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={retirada.item_id}
                  onChange={(e) => handleRetiradaChange('item_id', e.target.value)}
                >
                  <option value="">Selecione o item</option>
                  {itens.map((i) => (
                    <option key={i.item_id} value={i.item_id}>
                      {i.nome} {i.saldo_atual != null ? `- saldo: ${i.saldo_atual}` : ''}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={retirada.quantidade}
                  onChange={(e) =>
                    handleRetiradaChange('quantidade', Number(e.target.value))
                  }
                />

                <Input
                  placeholder="ID do cliente (futuramente combo)"
                  value={retirada.cliente_id}
                  onChange={(e) => handleRetiradaChange('cliente_id', e.target.value)}
                />

                <Input
                  placeholder="ID da obra (futuramente combo)"
                  value={retirada.obra_id}
                  onChange={(e) => handleRetiradaChange('obra_id', e.target.value)}
                />

                <Input
                  placeholder="Observações"
                  value={retirada.observacoes}
                  onChange={(e) => handleRetiradaChange('observacoes', e.target.value)}
                />

                <Button onClick={salvarRetirada} className="w-full" variant="destructive">
                  <Minus className="w-4 h-4 mr-2" />
                  Confirmar retirada
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Itens em estoque
          </CardTitle>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-60"
            />
          </div>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Carregando itens...
            </div>
          ) : itensFiltrados.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Nenhum item cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Nome</th>
                    <th className="text-left py-2">Categoria</th>
                    <th className="text-left py-2">Unidade</th>
                    <th className="text-right py-2">Saldo Atual</th>
                  </tr>
                </thead>
                <tbody>
                  {itensFiltrados.map((item) => (
                    <tr key={item.item_id} className="border-b hover:bg-muted/40">
                      <td className="py-2">{item.nome}</td>
                      <td className="py-2">{item.categoria}</td>
                      <td className="py-2">{item.unidade_medida}</td>
                      <td className="py-2 text-right">{item.saldo_atual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Storage;
