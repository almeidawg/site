import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEntities } from '@/hooks/useEntities';
import { Loader2, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NovoPcDialog = ({ open, onOpenChange, compraToEdit, setCompras, compras }) => {
  const [fornecedorId, setFornecedorId] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [siteFornecedor, setSiteFornecedor] = useState('');
  const [itens, setItens] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [link, setLink] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [isScraping, setIsScraping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const { toast } = useToast();

  const { entities: clientesSupabase, loading: loadingClientes } = useEntities('cliente');
  const { entities: fornecedoresSupabase, loading: loadingFornecedores } = useEntities('fornecedor');
  const [entitiesLocal] = useLocalStorage('crm_entities', []);

  const clientes = clientesSupabase.length > 0 ? clientesSupabase : entitiesLocal.filter(e => e.tipo === 'cliente');
  const fornecedores = fornecedoresSupabase.length > 0 ? fornecedoresSupabase : entitiesLocal.filter(e => e.tipo === 'fornecedor');

  useEffect(() => {
    if (compraToEdit) {
      setIsEditing(true);
      const [parsedQty, ...descParts] = compraToEdit.itens.split('x ');
      const qty = parseInt(parsedQty);

      setFornecedorId(compraToEdit.fornecedor_id || '');
      setFornecedorNome(compraToEdit.fornecedor || '');
      setSiteFornecedor(compraToEdit.fornecedor_site || '');
      setItens(descParts.join('x '));
      setValorTotal((compraToEdit.valor_total / (qty || 1)).toFixed(2));
      setLink(compraToEdit.link || '');
      setImagemUrl(compraToEdit.imagem_url || '');
      setQuantidade(qty || 1);
      setClienteId(compraToEdit.cliente_id || '');
    } else {
      setIsEditing(false);
      setFornecedorId('');
      setFornecedorNome('');
      setSiteFornecedor('');
      setItens('');
      setValorTotal('');
      setLink('');
      setImagemUrl('');
      setQuantidade(1);
      setClienteId('');
    }
  }, [compraToEdit, open]);

  const handleScrape = async () => {
    if (!link) {
      toast({
        variant: 'destructive',
        title: 'Informe o link',
        description: 'Cole o link do produto para tentar importar os dados.',
      });
      return;
    }
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-leroy', {
        body: { url: link },
      });

      if (error) throw error;

      if (data?.description) setItens(data.description);
      if (data?.price) setValorTotal((data.price || 0).toFixed(2));
      if (data?.image) setImagemUrl(data.image);

      toast({
        title: 'Dados importados!',
        description: 'Verifique os campos e ajuste manualmente se precisar.',
      });
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: 'Não conseguimos importar automaticamente',
        description: 'Preencha manualmente descrição, valor e imagem. O link já está salvo.',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalValorTotal = (parseFloat(valorTotal) || 0) * quantidade;

    if (!clienteId) {
      toast({
        variant: 'destructive',
        title: 'Selecione o cliente',
        description: 'O pedido de compra precisa estar vinculado a um cliente.',
      });
      return;
    }

    if (!itens || !finalValorTotal) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha Itens e Valor.',
      });
      return;
    }

    const clienteSelecionado = clientes.find((c) => c.id === clienteId);
    const fornecedorSelecionado = fornecedores.find((f) => f.id === fornecedorId);
    const fornecedorFinal = fornecedorSelecionado?.nome_razao_social || fornecedorNome || '';

    if (isEditing) {
      const pedidoAtualizado = {
        ...compraToEdit,
        fornecedor_id: fornecedorId || null,
        fornecedor: fornecedorFinal,
        fornecedor_site: siteFornecedor || null,
        itens: `${quantidade}x ${itens}`,
        valor_total: finalValorTotal,
        link,
        imagem_url: imagemUrl,
        cliente_id: clienteId,
        cliente_nome: clienteSelecionado?.nome_razao_social || clienteSelecionado?.nome || '',
      };
      setCompras((prev) => prev.map((c) => (c.id === compraToEdit.id ? pedidoAtualizado : c)));
      toast({ title: 'Pedido de Compra Atualizado!' });
    } else {
      const novoPedido = {
        id: `pc-${Date.now()}`,
        numero: (compras.length + 1).toString().padStart(4, '0'),
        fornecedor_id: fornecedorId || null,
        fornecedor: fornecedorFinal || 'Fornecedor não informado',
        fornecedor_site: siteFornecedor || null,
        itens: `${quantidade}x ${itens}`,
        valor_total: finalValorTotal,
        link,
        imagem_url: imagemUrl,
        status: 'pendente',
        data_entrega: new Date(new Date().setDate(new Date().getDate() + 7)),
        cliente_id: clienteId,
        cliente_nome: clienteSelecionado?.nome_razao_social || clienteSelecionado?.nome || '',
      };

      setCompras([...compras, novoPedido]);
      toast({
        title: 'Pedido de Compra Criado!',
        description: `O PC #${novoPedido.numero} foi registrado com sucesso.`,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pedido de Compra' : 'Novo Pedido de Compra'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite os detalhes do pedido.' : 'Cole qualquer link de produto para tentar importar dados ou preencha manualmente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Vincular ao Cliente *</Label>
              <Select onValueChange={setClienteId} value={clienteId} disabled={loadingClientes}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingClientes ? 'Carregando clientes...' : 'Selecione um cliente'} />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome_razao_social || cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor (opcional)</Label>
              <Select onValueChange={(v) => { setFornecedorId(v); const found = fornecedores.find(f => f.id === v); setFornecedorNome(found?.nome_razao_social || found?.nome || ''); }} value={fornecedorId} disabled={loadingFornecedores}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingFornecedores ? 'Carregando fornecedores...' : 'Selecione um fornecedor ou deixe em branco'} />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((forn) => (
                    <SelectItem key={forn.id} value={forn.id}>
                      {forn.nome_razao_social || forn.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="fornecedorNome"
                placeholder="Ou digite o fornecedor"
                value={fornecedorNome}
                onChange={(e) => { setFornecedorNome(e.target.value); setFornecedorId(''); }}
              />
              <Input
                id="siteFornecedor"
                placeholder="Site do fornecedor (opcional)"
                value={siteFornecedor}
                onChange={(e) => setSiteFornecedor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link do Produto</Label>
              <div className="flex gap-2">
                <Input id="link" placeholder="https://exemplo.com/produto/..." value={link} onChange={(e) => setLink(e.target.value)} />
                <Button type="button" size="icon" onClick={handleScrape} disabled={isScraping}>
                  {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {imagemUrl && (
              <div className="flex justify-center p-2 border rounded-md bg-gray-50">
                <img src={imagemUrl} alt="Produto importado" className="w-24 h-24 object-contain rounded-md" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="itens">Descrição do Item</Label>
              <Textarea id="itens" placeholder="Ex: Tinta Branca Acrílica" value={itens} onChange={(e) => setItens(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Unitário</Label>
                <Input id="valor" type="number" step="0.01" placeholder="250.50" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input id="quantidade" type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} />
              </div>
            </div>

            <div className="text-right font-bold text-lg">
              Total: {((parseFloat(valorTotal) || 0) * quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Pedido'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoPcDialog;
