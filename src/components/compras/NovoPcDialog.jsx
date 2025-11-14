
import React, { useState, useEffect, useRef } from 'react';
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
import { Loader2, Zap, Upload, Search, Link as LinkIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const FornecedorCombobox = ({ onSelect, selectedValue }) => {
    const [open, setOpen] = useState(false);
    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        const fetchFornecedores = async () => {
            const { data, error } = await supabase.from('entities').select('id, nome_razao_social, drive_link').eq('tipo', 'fornecedor');
            if (!error) {
                setFornecedores(data);
            }
            setLoading(false);
        };
        fetchFornecedores();
    }, [open]);

    const selectedFornecedor = fornecedores.find(f => f.id === selectedValue);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedFornecedor ? selectedFornecedor.nome_razao_social : "Selecione um fornecedor"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Procurar fornecedor..." />
                    <CommandEmpty>{loading ? 'Carregando...' : 'Nenhum fornecedor encontrado.'}</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                        {fornecedores.map((fornecedor) => (
                            <CommandItem key={fornecedor.id} value={fornecedor.nome_razao_social} onSelect={() => { onSelect(fornecedor); setOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", selectedValue === fornecedor.id ? "opacity-100" : "opacity-0")} />
                                {fornecedor.nome_razao_social}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


const NovoPcDialog = ({ open, onOpenChange, compraToEdit, onSave }) => {
  const [fornecedor, setFornecedor] = useState('');
  const [fornecedorId, setFornecedorId] = useState(null);
  const [itens, setItens] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [link, setLink] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clienteId, setClienteId] = useState('none'); // Default to 'none'
  const [clientes, setClientes] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientes = async () => {
        const { data, error } = await supabase.from('entities').select('id, nome_razao_social').eq('tipo', 'cliente');
        if (error) {
            toast({ title: 'Erro ao buscar clientes', variant: 'destructive'});
        } else {
            setClientes(data);
        }
    };
    if (open) {
        fetchClientes();
    }
  }, [open, toast]);

  useEffect(() => {
    const loadEditData = async () => {
      if (compraToEdit && open) {
          setIsEditing(true);
          setClienteId(compraToEdit.cliente_id || 'none');
          
          const { data: itemData, error: itemError } = await supabase
            .from('purchase_order_items')
            .select('*')
            .eq('order_id', compraToEdit.id)
            .limit(1)
            .single();

          if (itemError) {
              setItens(compraToEdit.itens_descricao ? compraToEdit.itens_descricao[0] : 'Item não encontrado');
              setValorTotal(compraToEdit.valor_total || '0');
              setQuantidade(1);
          } else if (itemData) {
              setItens(itemData.descricao || '');
              setValorTotal(itemData.preco_unitario ? itemData.preco_unitario.toFixed(2) : '0');
              setQuantidade(itemData.quantidade || 1);
              setLink(itemData.link_produto || '');
              setImagemUrl(itemData.imagem_url || '');
          }
          if (compraToEdit.fornecedor_id) {
            setFornecedorId(compraToEdit.fornecedor_id);
            setFornecedor(compraToEdit.fornecedor_nome || 'Fornecedor não encontrado');
          }

      } else {
          setIsEditing(false);
          setFornecedor('');
          setFornecedorId(null);
          setItens('');
          setValorTotal('');
          setLink('');
          setImagemUrl('');
          setQuantidade(1);
          setClienteId('none');
          setImageFile(null);
      }
    };
    
    loadEditData();

  }, [compraToEdit, open, toast]);


  const handleScrape = async () => {
    if (!link) {
      toast({ variant: 'destructive', title: 'Link inválido', description: 'Por favor, insira um link de produto.' });
      return;
    }
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-leroy', { body: { url: link } });
      if (error) throw error;
      setItens(data.description || '');
      setValorTotal(data.price ? data.price.toFixed(2) : '');
      setImagemUrl(data.image || '');
      toast({ title: 'Dados Importados!', description: 'Produto importado com sucesso. Verifique e ajuste a quantidade.' });
    } catch (error) {
      console.error('Scraping error:', error);
      toast({ variant: 'destructive', title: 'Falha ao buscar dados', description: 'Não foi possível buscar as informações do produto. Tente novamente.' });
    } finally {
      setIsScraping(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const path = `itens/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('compras').upload(path, file, { upsert: true });
    if (error) {
        toast({ title: 'Erro no upload da imagem', description: error.message, variant: 'destructive' });
        return null;
    }
    const { data: pub } = supabase.storage.from('compras').getPublicUrl(path);
    return pub.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!clienteId || clienteId === 'none') {
        toast({ variant: 'destructive', title: 'Cliente obrigatório', description: 'Por favor, selecione um cliente para o pedido.' });
        setIsSaving(false);
        return;
    }
    
    if (!fornecedorId || !itens) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha Fornecedor e Descrição.' });
      setIsSaving(false);
      return;
    }

    try {
        let uploadedImageUrl = imagemUrl;
        if (imageFile) {
            uploadedImageUrl = await handleImageUpload(imageFile);
            if (!uploadedImageUrl) {
                setIsSaving(false);
                return;
            }
        }

        const itensPayload = [{
            descricao: itens,
            quantidade: Number(quantidade || 1),
            preco_unitario: Number(valorTotal || 0),
            unidade: 'un',
            link_produto: link,
            imagem_url: uploadedImageUrl
        }];
        
        const { data: orderId, error } = await supabase.rpc('purchase_order_create', {
            p_entity_id: clienteId,
            p_fornecedor_id: fornecedorId,
            p_itens: itensPayload
        });

        if (error) throw error;
        if (!orderId) throw new Error("A criação do pedido não retornou um ID.");

        toast({ title: `Pedido criado com sucesso!` });
        onSave();
        onOpenChange(false);

    } catch (error) {
        console.error("Detailed error:", error);
        toast({ title: 'Erro ao salvar pedido', description: error.message, variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSelectFornecedor = (fornecedorObj) => {
    setFornecedorId(fornecedorObj.id);
    setFornecedor(fornecedorObj.nome_razao_social);
    if(fornecedorObj.drive_link) {
      setLink(fornecedorObj.drive_link);
      toast({title: 'Link do fornecedor inserido!', description: 'O link principal do fornecedor foi adicionado ao pedido.'});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pedido de Compra' : 'Novo Pedido de Compra'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite os detalhes do pedido.' : 'Selecione um fornecedor ou insira um link para importar dados.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="cliente">Vincular ao Cliente (Obrigatório)</Label>
               <Select onValueChange={(value) => setClienteId(value)} value={clienteId}> {/* Removido 'none' ? '' : value */}
                <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clientes.map(cliente => (<SelectItem key={cliente.id} value={cliente.id}>{cliente.nome_razao_social}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <FornecedorCombobox onSelect={handleSelectFornecedor} selectedValue={fornecedorId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link do Produto</Label>
              <div className="flex gap-2">
                <Input id="link" placeholder="https://www.sitedoproduto.com/..." value={link} onChange={(e) => setLink(e.target.value)} />
                <Button type="button" size="icon" onClick={handleScrape} disabled={isScraping || !link.toLowerCase().includes('leroymerlin')}>
                    <Zap className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <div className="flex items-center gap-2">
                    {(imagemUrl || imageFile) && <img src={imageFile ? URL.createObjectURL(imageFile) : imagemUrl} alt="Produto" className="w-16 h-16 object-contain rounded-md border" />}
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2"/>Carregar</Button>
                    <Input type="file" ref={fileInputRef} onChange={(e) => setImageFile(e.target.files[0])} className="hidden" accept="image/*" />
                </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itens">Descrição do Item</Label>
              <Textarea id="itens" placeholder="Ex: Tinta Branca Acrílica" value={itens} onChange={(e) => setItens(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="valor">Valor Unitário</Label><Input id="valor" type="number" step="0.01" placeholder="Ex: 250.50" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="quantidade">Quantidade</Label><Input id="quantidade" type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} /></div>
            </div>

            <div className="text-right font-bold text-lg">Total: {((parseFloat(valorTotal) || 0) * quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving || isScraping}>{isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}{isEditing ? 'Salvar Alterações' : 'Criar Pedido'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoPcDialog;
