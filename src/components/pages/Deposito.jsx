
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Archive, PlusCircle, Loader2, PackageSearch } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import NovoItemDepositoDialog from '@/components/deposito/NovoItemDepositoDialog';
import ActionIcons from '@/components/shared/ActionIcons';
import { Helmet } from 'react-helmet';

const Deposito = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { toast } = useToast();

    const fetchItems = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('storage_items').select('*').order('name', { ascending: true });
        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
        }
        const { data, error } = await query;

        if (error) {
            toast({ title: 'Erro ao buscar itens', description: error.message, variant: 'destructive' });
        } else {
            setItems(data || []);
        }
        setLoading(false);
    }, [toast, searchTerm]);

    useEffect(() => {
        const debouncedFetch = setTimeout(() => {
            fetchItems();
        }, 300);
        return () => clearTimeout(debouncedFetch);
    }, [fetchItems]);

    const handleOpenDialog = (item = null) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        fetchItems();
        setIsDialogOpen(false);
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) return;
        const { error } = await supabase.from('storage_items').delete().eq('id', itemId);
        if (error) {
            toast({ title: 'Erro ao excluir item', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Item excluído com sucesso!' });
            fetchItems();
        }
    };

    return (
        <div className="p-6 space-y-6">
            <Helmet>
                <title>Depósito - Grupo WG Almeida</title>
                <meta name="description" content="Gerencie o estoque e os itens do seu depósito." />
            </Helmet>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2"><Archive /> Depósito</h1>
                    <p className="text-muted-foreground">Gerenciamento de estoque e materiais.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Novo Item</Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                 <Card><CardHeader><CardTitle>Itens Totais</CardTitle><CardDescription>Nº de SKUs únicos</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold">{items.length}</p></CardContent></Card>
                 <Card><CardHeader><CardTitle>Quantidade Total</CardTitle><CardDescription>Soma de todas as unidades</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold">{items.reduce((acc, item) => acc + (item.quantity || 0), 0)}</p></CardContent></Card>
                 <Card><CardHeader><CardTitle>Itens com Baixo Estoque</CardTitle><CardDescription>Itens que precisam de reposição</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">0</p></CardContent></Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-grow">
                        <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Buscar por nome ou SKU..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>SKU</TableHead><TableHead>Quantidade</TableHead><TableHead>Unidade</TableHead><TableHead>Localização</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {loading ? (<TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>)
                            : items.length === 0 ? (<TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum item encontrado.</TableCell></TableRow>)
                            : items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell className="text-right"><ActionIcons onEdit={() => handleOpenDialog(item)} onDelete={() => handleDelete(item.id)} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <NovoItemDepositoDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSave} itemToEdit={editingItem} />
        </div>
    );
};

export default Deposito;
