
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2, Edit, Building, Search, Banknote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const GenericConfigManager = ({ tableName, title, description, columnName = 'name', kindFilter = null }) => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { orgId } = useAuth();

    const fetchItems = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        let query = supabase.from(tableName).select('*').eq('org_id', orgId).order(columnName);
        if (kindFilter) {
            query = query.eq('kind', kindFilter);
        }
        const { data, error } = await query;
        if (error) {
            toast({ title: `Erro ao buscar ${title}`, description: error.message, variant: 'destructive' });
        } else {
            setItems(data);
        }
        setLoading(false);
    }, [toast, tableName, title, columnName, orgId, kindFilter]);

    useEffect(() => {
        if(orgId) fetchItems();
    }, [fetchItems, orgId]);

    const handleAddItem = async () => {
        if (!newItem.trim() || !orgId) return;
        const insertData = { [columnName]: newItem.trim(), org_id: orgId };
        if (kindFilter) {
            insertData.kind = kindFilter;
        }
        const { error } = await supabase.from(tableName).insert(insertData);
        if (error) {
            toast({ title: `Erro ao adicionar item`, description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Item adicionado!' });
            setNewItem('');
            fetchItems();
        }
    };

    const handleDeleteItem = async (id) => {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
            toast({ title: 'Erro ao remover item', description: "Verifique se o item não está em uso.", variant: 'destructive' });
        } else {
            toast({ title: 'Item removido!' });
            fetchItems();
        }
    }

    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={`Nome do novo item`} />
                    <Button onClick={handleAddItem}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button>
                </div>
                {loading ? <Loader2 className="animate-spin" /> : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead className="text-right">Ação</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item[columnName]}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

const GerenciarContasFinanceiras = ({ empresaId, open, onOpenChange }) => {
    const { toast } = useToast();
    const { orgId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [contas, setContas] = useState([]);
    const [currentConta, setCurrentConta] = useState(null);
    const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const fetchContas = useCallback(async () => {
        if (!empresaId) return;
        setLoading(true);
        const { data, error } = await supabase.from('fin_accounts').select('*').eq('empresa_id', empresaId).order('name');
        if (error) toast({ title: "Erro ao buscar contas", description: error.message, variant: "destructive" });
        else setContas(data || []);
        setLoading(false);
    }, [toast, empresaId]);

    useEffect(() => {
        if (open) {
            fetchContas();
        }
    }, [fetchContas, open]);

    const handleOpenSubDialog = (conta = null) => {
        if (conta) {
            setCurrentConta(conta);
            setIsEditing(true);
        } else {
            setCurrentConta({ name: '', opening_balance: 0, currency: 'BRL', empresa_id: empresaId, current_balance: 0, is_archived: false });
            setIsEditing(false);
        }
        setIsSubDialogOpen(true);
    };

    const handleSaveConta = async () => {
        if (!currentConta.name || !orgId) {
            toast({ title: 'Erro de Validação', description: 'Nome da conta é obrigatório.', variant: 'destructive' });
            return;
        }

        const payload = { ...currentConta, org_id: orgId };
        
        try {
            const { error } = isEditing
                ? await supabase.from('fin_accounts').update(payload).eq('id', currentConta.id)
                : await supabase.from('fin_accounts').insert(payload);

            if (error) throw error;
            toast({ title: `Conta ${isEditing ? 'atualizada' : 'criada'} com sucesso!` });
            setIsSubDialogOpen(false);
            setCurrentConta(null);
            fetchContas();
        } catch (error) {
            toast({ title: "Erro ao salvar conta", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteConta = async (id) => {
        if (!window.confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;
        const { error } = await supabase.from('fin_accounts').delete().eq('id', id);
        if (error) toast({ title: "Erro ao excluir conta", description: "Verifique se não há lançamentos associados a ela.", variant: 'destructive' });
        else {
            toast({ title: 'Conta excluída!' });
            fetchContas();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Contas Bancárias da Empresa</DialogTitle>
                    <DialogDescription>Gerencie as contas financeiras associadas a esta empresa.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Button onClick={() => handleOpenSubDialog()}><PlusCircle className="mr-2 h-4 w-4"/> Nova Conta</Button>
                </div>
                {loading ? <Loader2 className="animate-spin" /> : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Nome da Conta</TableHead><TableHead>Saldo Inicial</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {contas.map(conta => (
                                <TableRow key={conta.id}>
                                    <TableCell>{conta.name}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.opening_balance)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenSubDialog(conta)}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteConta(conta.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
            
             <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditing ? 'Editar' : 'Nova'} Conta</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Conta</Label>
                            <Input id="name" value={currentConta?.name || ''} onChange={(e) => setCurrentConta(c => ({ ...c, name: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="opening_balance">Saldo Inicial</Label>
                            <Input id="opening_balance" type="number" value={currentConta?.opening_balance || 0} onChange={(e) => setCurrentConta(c => ({ ...c, opening_balance: parseFloat(e.target.value) || 0 }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveConta}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

const GerenciarEmpresas = () => {
    const { toast } = useToast();
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentEmpresa, setCurrentEmpresa] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [cnpjSearch, setCnpjSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    const [isContasOpen, setIsContasOpen] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);

    const fetchEmpresas = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('empresas').select('*');
        if (error) {
            toast({ title: 'Erro ao buscar empresas', description: error.message, variant: 'destructive' });
        } else {
            setEmpresas(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchEmpresas();
    }, [fetchEmpresas]);

    const handleSearchCnpj = async () => {
        const cnpj = cnpjSearch.replace(/\D/g, '');
        if (cnpj.length !== 14) {
            toast({ title: 'CNPJ inválido', variant: 'destructive' });
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado.');
            const data = await response.json();
            setCurrentEmpresa({ razao_social: data.razao_social || '', cnpj: data.cnpj || '' });
        } catch (error) {
            toast({ title: 'Erro ao buscar CNPJ', description: error.message, variant: 'destructive' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleOpenDialog = (empresa = null) => {
        if (empresa) {
            setCurrentEmpresa(empresa);
            setIsEditing(true);
        } else {
            setCurrentEmpresa({ razao_social: '', cnpj: '' });
            setCnpjSearch('');
            setIsEditing(false);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        const { error } = isEditing
            ? await supabase.from('empresas').update(currentEmpresa).eq('id', currentEmpresa.id)
            : await supabase.from('empresas').insert(currentEmpresa);

        if (error) {
            toast({ title: 'Erro ao salvar empresa', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `Empresa ${isEditing ? 'atualizada' : 'criada'}!` });
            setIsDialogOpen(false);
            fetchEmpresas();
        }
    };
    
    const handleOpenContasDialog = (empresaId) => {
        setSelectedEmpresaId(empresaId);
        setIsContasOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Empresas do Grupo</CardTitle>
                        <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4"/> Nova Empresa</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? <Loader2 className="animate-spin"/> : (
                        <div className="space-y-4">
                            {empresas.map(empresa => (
                                <Card key={empresa.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <Building className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="font-bold">{empresa.razao_social}</p>
                                            <p className="text-sm text-muted-foreground">{empresa.cnpj}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenContasDialog(empresa.id)}>
                                            <Banknote className="mr-2 h-4 w-4"/>Gerenciar Contas
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(empresa)}><Edit className="h-4 w-4"/></Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>{isEditing ? 'Editar' : 'Nova'} Empresa</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        {!isEditing && (
                            <div className="flex gap-2 items-end">
                                <div className="flex-grow space-y-2">
                                    <Label htmlFor="cnpj-search">Buscar por CNPJ</Label>
                                    <Input id="cnpj-search" value={cnpjSearch} onChange={e => setCnpjSearch(e.target.value)} placeholder="00.000.000/0000-00"/>
                                </div>
                                <Button onClick={handleSearchCnpj} disabled={isSearching}>{isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}</Button>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Razão Social</Label>
                            <Input value={currentEmpresa?.razao_social || ''} onChange={e => setCurrentEmpresa(c => ({...c, razao_social: e.target.value}))}/>
                        </div>
                        <div className="space-y-2">
                            <Label>CNPJ</Label>
                            <Input value={currentEmpresa?.cnpj || ''} onChange={e => setCurrentEmpresa(c => ({...c, cnpj: e.target.value}))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!currentEmpresa}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {selectedEmpresaId && <GerenciarContasFinanceiras empresaId={selectedEmpresaId} open={isContasOpen} onOpenChange={setIsContasOpen} />}
        </>
    );
};


const Configuracoes = () => {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Configurações</h1>
            <Tabs defaultValue="empresas" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="geral">Geral</TabsTrigger>
                    <TabsTrigger value="comercial">Comercial</TabsTrigger>
                    <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                    <TabsTrigger value="empresas">Empresas</TabsTrigger>
                    <TabsTrigger value="loja">WG Store</TabsTrigger>
                </TabsList>
                <TabsContent value="geral" className="mt-4 space-y-4">
                    <GenericConfigManager tableName="pricelist" title="Tabela de Preços (Price List)" description="Gerencie os produtos, serviços e seus custos/preços." columnName="description" />
                </TabsContent>
                <TabsContent value="comercial" className="mt-4 space-y-4">
                    <GenericConfigManager tableName="comercial_setores" title="Setores" description="Gerencie os setores para seus clientes." />
                    <GenericConfigManager tableName="comercial_categorias" title="Categorias de Cliente" description="Gerencie as categorias para seus clientes." />
                    <GenericConfigManager tableName="comercial_procedencias" title="Procedências" description="Gerencie as origens/procedências de seus clientes." />
                </TabsContent>
                <TabsContent value="financeiro" className="mt-4 space-y-4">
                    <GenericConfigManager tableName="fin_categories" title="Categorias de Receita" description="Gerencie as categorias para suas receitas." kindFilter="income" />
                    <GenericConfigManager tableName="fin_categories" title="Categorias de Despesa" description="Gerencie as categorias para suas despesas." kindFilter="expense" />
                </TabsContent>
                <TabsContent value="empresas" className="mt-4">
                    <GerenciarEmpresas />
                </TabsContent>
                <TabsContent value="loja" className="mt-4">
                     <GenericConfigManager tableName="produtos_servicos" title="Editor da Loja WG Store" description="Gerencie os produtos que aparecem na sua loja online." columnName="nome" />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Configuracoes;
