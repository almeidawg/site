import React, { useState, useEffect } from 'react';
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
import { Loader2, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const NovoPcDialog = ({ open, onOpenChange, compraToEdit, setCompras, compras }) => {
  const [fornecedor, setFornecedor] = useState('Leroy Merlin');
  const [itens, setItens] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [link, setLink] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [isScraping, setIsScraping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useLocalStorage('crm_clientes', []);
  const { toast } = useToast();

  useEffect(() => {
    if (compraToEdit) {
        setIsEditing(true);
        const [parsedQty, ...descParts] = compraToEdit.itens.split('x ');
        const qty = parseInt(parsedQty);

        setFornecedor(compraToEdit.fornecedor);
        setItens(descParts.join('x '));
        setValorTotal((compraToEdit.valor_total / qty).toFixed(2));
        setLink(compraToEdit.link || '');
        setImagemUrl(compraToEdit.imagem_url || '');
        setQuantidade(qty || 1);
        setClienteId(compraToEdit.cliente_id || '');
    } else {
        setIsEditing(false);
        setFornecedor('Leroy Merlin');
        setItens('');
        setValorTotal('');
        setLink('');
        setImagemUrl('');
        setQuantidade(1);
        setClienteId('');
    }
  }, [compraToEdit, open]);


  const handleScrape = async () => {
    if (!link || !link.startsWith('https://www.leroymerlin.com.br')) {
      toast({
        variant: 'destructive',
        title: 'Link inválido',
        description: 'Por favor, insira um link válido da Leroy Merlin.',
      });
      return;
    }
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-leroy', {
        body: { url: link },
      });

      if (error) throw error;
      
      setItens(data.description || '');
      setValorTotal(data.price ? data.price.toFixed(2) : '');
      setImagemUrl(data.image || '');
      toast({
        title: 'Dados Importados!',
        description: 'Produto importado com sucesso. Verifique e ajuste a quantidade.',
      });

    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        variant: 'destructive',
        title: 'Falha ao buscar dados',
        description: 'Não foi possível buscar as informações do produto. Tente novamente.',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalValorTotal = (parseFloat(valorTotal) || 0) * quantidade;

    if (!fornecedor || !itens || !finalValorTotal) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha Fornecedor, Itens e Valor.',
      });
      return;
    }

    const clienteSelecionado = clientes.find(c => c.id === clienteId);

    if (isEditing) {
        const pedidoAtualizado = {
            ...compraToEdit,
            fornecedor,
            itens: `${quantidade}x ${itens}`,
            valor_total: finalValorTotal,
            link,
            imagem_url: imagemUrl,
            cliente_id: clienteId,
            cliente_nome: clienteSelecionado?.nome || clienteSelecionado?.razao_social || '',
        };
        setCompras(prev => prev.map(c => c.id === compraToEdit.id ? pedidoAtualizado : c));
        toast({ title: 'Pedido de Compra Atualizado!' });
    } else {
        const novoPedido = {
          id: `pc-${Date.now()}`,
          numero: (compras.length + 1).toString().padStart(4, '0'),
          fornecedor,
          itens: `${quantidade}x ${itens}`,
          valor_total: finalValorTotal,
          link,
          imagem_url: imagemUrl,
          status: 'pendente',
          data_entrega: new Date(new Date().setDate(new Date().getDate() + 7)),
          cliente_id: clienteId,
          cliente_nome: clienteSelecionado?.nome || clienteSelecionado?.razao_social || '',
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
            {isEditing ? 'Edite os detalhes do pedido.' : 'Cole o link do produto da Leroy Merlin para importar os dados ou preencha manualmente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="cliente">Vincular ao Cliente</Label>
               <Select onValueChange={setClienteId} value={clienteId}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                    {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome || cliente.razao_social}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link do Produto (Leroy Merlin)</Label>
              <div className="flex gap-2">
                <Input
                  id="link"
                  placeholder="https://www.leroymerlin.com.br/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
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
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input id="fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} />
            </div>
            
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Pedido'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoPcDialog;