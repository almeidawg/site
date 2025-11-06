import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, Edit, Search } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Generic CRUD component for settings tables
const CrudManager = ({ title, table, columns, orgId, orderColumn = 'name' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [actionCounter, setActionCounter] = useState(0);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*').eq('org_id', orgId).order(orderColumn, { ascending: true });
    if (error) {
      toast({ title: `Erro ao buscar ${title}`, description: error.message, variant: 'destructive' });
      console.error(`Error fetching ${table}:`, error);
    } else {
      setItems(data);
    }
    setLoading(false);
  }, [table, title, toast, orgId, orderColumn]);

  useEffect(() => {
    if (orgId) {
        fetchData();
    }
  }, [fetchData, actionCounter, orgId]);

  const handleSave = async (formData) => {
    const payload = { ...formData, org_id: orgId };
    
    // Basic validation
    const primaryColumn = columns.find(c => c.key === orderColumn);
    if (!payload[orderColumn]) {
        toast({ title: 'Erro de Validação', description: `O campo '${primaryColumn?.label || orderColumn}' é obrigatório.`, variant: 'destructive' });
        return;
    }

    const { error } = currentItem?.id
      ? await supabase.from(table).update(payload).eq('id', currentItem.id)
      : await supabase.from(table).insert(payload);

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `${title.slice(0, -1)} salvo com sucesso!` });
      setIsDialogOpen(false);
      setActionCounter(prev => prev + 1);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Item excluído com sucesso!' });
      setActionCounter(prev => prev + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Button onClick={() => { setCurrentItem(null); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin mx-auto" /></div> : (
          <Table>
            <TableHeader><TableRow>{columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}<TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  {columns.map(c => <TableCell key={c.key}>{item[c.key]}</TableCell>)}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentItem(item); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este item?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <CrudDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={currentItem}
          onSave={handleSave}
          columns={columns}
          title={`Gerenciar ${title.slice(0, -1)}`}
        />
      </CardContent>
    </Card>
  );
};

const CrudDialog = ({ open, onOpenChange, item, onSave, columns, title }) => {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    setFormData(item || columns.reduce((acc, col) => ({...acc, [col.key]: col.default || ''}), {}));
  }, [item, columns]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {columns.map(col => (
            <div key={col.key} className="space-y-2">
              <Label htmlFor={col.key}>{col.label}</Label>
              {col.type === 'select' ? (
                 <Select value={formData[col.key] || col.default} onValueChange={value => setFormData({ ...formData, [col.key]: value })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {col.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                 </Select>
              ) : (
                <Input id={col.key} type={col.type || 'text'} value={formData[col.key] || ''} onChange={e => setFormData({ ...formData, [col.key]: e.target.value })} />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EmpresasGrupo = ({ orgId }) => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpresaDialogOpen, setIsEmpresaDialogOpen] = useState(false);
  const [isContaDialogOpen, setIsContaDialogOpen] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [actionCounter, setActionCounter] = useState(0);
  const { toast } = useToast();

  const fetchEmpresas = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase.from('empresas').select('*').eq('org_id', orgId);
    if (error) toast({ title: 'Erro ao buscar empresas', description: error.message, variant: 'destructive' });
    else setEmpresas(data);
    setLoading(false);
  }, [orgId, toast]);

  useEffect(() => { 
    if (orgId) {
        fetchEmpresas(); 
    }
  }, [fetchEmpresas, actionCounter, orgId]);

  const handleSaveEmpresa = async (formData) => {
    const payload = { ...formData, org_id: orgId };
    const { error } = currentEmpresa?.id
      ? await supabase.from('empresas').update(payload).eq('id', currentEmpresa.id)
      : await supabase.from('empresas').insert(payload);
    if (error) toast({ title: 'Erro ao salvar empresa', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Empresa salva!' });
      setIsEmpresaDialogOpen(false);
      setActionCounter(p => p + 1);
    }
  };

  const handleOpenContas = (empresa) => {
    setCurrentEmpresa(empresa);
    setIsContaDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Empresas do Grupo</CardTitle>
          <Button onClick={() => { setCurrentEmpresa(null); setIsEmpresaDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Nova Empresa</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin mx-auto" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Razão Social</TableHead><TableHead>CNPJ</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {empresas.map(empresa => (
                <TableRow key={empresa.id}>
                  <TableCell>{empresa.razao_social}</TableCell>
                  <TableCell>{empresa.cnpj}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenContas(empresa)}>Gerenciar Contas</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <EmpresaDialog open={isEmpresaDialogOpen} onOpenChange={setIsEmpresaDialogOpen} onSave={handleSaveEmpresa} empresa={currentEmpresa} />
        {currentEmpresa && <ContasBancariasDialog open={isContaDialogOpen} onOpenChange={setIsContaDialogOpen} empresa={currentEmpresa} orgId={orgId} />}
      </CardContent>
    </Card>
  );
};

const EmpresaDialog = ({ open, onOpenChange, onSave, empresa }) => {
  const [formData, setFormData] = useState({});
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setFormData(empresa || {}); }, [empresa]);

  const handleCnpjSearch = async () => {
    const cnpj = formData.cnpj?.replace(/\D/g, '');
    if (cnpj?.length !== 14) return;
    setLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado ou inválido.');
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        razao_social: data.razao_social,
        // Populate other fields as needed
      }));
    } catch (error) {
      toast({ title: 'Busca de CNPJ falhou', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{empresa ? 'Editar' : 'Nova'} Empresa</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <div className="flex gap-2">
              <Input id="cnpj" value={formData.cnpj || ''} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} />
              <Button type="button" onClick={handleCnpjSearch} disabled={loadingCnpj}>{loadingCnpj ? <Loader2 className="animate-spin" /> : <Search />}</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão Social</Label>
            <Input id="razao_social" value={formData.razao_social || ''} onChange={e => setFormData({ ...formData, razao_social: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ContasBancariasDialog = ({ open, onOpenChange, empresa, orgId }) => {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentConta, setCurrentConta] = useState(null);
  const [actionCounter, setActionCounter] = useState(0);
  const { toast } = useToast();

  const fetchContas = useCallback(async () => {
    if (!empresa?.id) return;
    setLoading(true);
    const { data, error } = await supabase.from('fin_accounts').select('*').eq('empresa_id', empresa.id);
    if (error) toast({ title: 'Erro ao buscar contas', description: error.message, variant: 'destructive' });
    else setContas(data);
    setLoading(false);
  }, [empresa?.id, toast]);

  useEffect(() => { fetchContas(); }, [fetchContas, actionCounter]);

  const handleSaveConta = async (formData) => {
    const payload = { 
        ...formData, 
        empresa_id: empresa.id, 
        org_id: orgId, 
        currency: 'BRL',
        opening_balance: parseFloat(formData.opening_balance) || 0,
        current_balance: parseFloat(formData.opening_balance) || 0, // Assume initial balance is current balance
        is_archived: false,
    };

    if (!payload.name) {
        toast({ title: 'Erro de Validação', description: 'O nome da conta é obrigatório.', variant: 'destructive' });
        return;
    }
    
    const { error } = currentConta?.id
      ? await supabase.from('fin_accounts').update(payload).eq('id', currentConta.id)
      : await supabase.from('fin_accounts').insert(payload);
      
    if (error) {
        console.error("Save account error: ", error)
        toast({ title: 'Erro ao salvar conta', description: error.message, variant: 'destructive' });
    }
    else {
      toast({ title: 'Conta salva!' });
      setIsFormOpen(false);
      setActionCounter(p => p + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Contas Bancárias de {empresa.razao_social}</DialogTitle></DialogHeader>
        <Button onClick={() => { setCurrentConta(null); setIsFormOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Nova Conta</Button>
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin mx-auto" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Nome da Conta</TableHead><TableHead>Saldo Inicial</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {contas.map(conta => (
                <TableRow key={conta.id}>
                  <TableCell>{conta.name}</TableCell>
                  <TableCell>{conta.opening_balance}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentConta(conta); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <ContaFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSave={handleSaveConta} conta={currentConta} />
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ContaFormDialog = ({ open, onOpenChange, onSave, conta }) => {
  const [formData, setFormData] = useState({ name: '', opening_balance: 0 });
  useEffect(() => { 
      setFormData(conta || { name: '', opening_balance: 0 });
  }, [conta, open]);
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{conta ? 'Editar' : 'Nova'} Conta</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta</Label>
            <Input id="name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opening_balance">Saldo Inicial</Label>
            <Input id="opening_balance" type="number" step="0.01" value={formData.opening_balance || 0} onChange={e => setFormData({ ...formData, opening_balance: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Configuracoes = () => {
  const { orgId } = useAuth();
  if (!orgId) return <div className="p-6 flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /> <span className="ml-4 text-muted-foreground">Carregando organização...</span></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <Tabs defaultValue="empresas">
        <TabsList>
          <TabsTrigger value="empresas">Empresas do Grupo</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
        </TabsList>
        <TabsContent value="empresas" className="mt-4">
          <EmpresasGrupo orgId={orgId} />
        </TabsContent>
        <TabsContent value="financeiro" className="mt-4">
          <CrudManager 
            title="Categorias Financeiras" 
            table="fin_categories" 
            columns={[
                { key: 'name', label: 'Nome' }, 
                { key: 'kind', label: 'Tipo', type: 'select', default: 'expense', options: [{value: 'expense', label: 'Despesa'}, {value: 'income', label: 'Receita'}] }
            ]} 
            orgId={orgId} 
            orderColumn="name"
          />
        </TabsContent>
        <TabsContent value="comercial" className="mt-4 space-y-4">
          <CrudManager title="Setores" table="comercial_setores" columns={[{ key: 'nome', label: 'Nome' }]} orgId={orgId} orderColumn="nome" />
          <CrudManager title="Categorias de Cliente" table="comercial_categorias" columns={[{ key: 'nome', label: 'Nome' }]} orgId={orgId} orderColumn="nome" />
          <CrudManager title="Procedências" table="comercial_procedencias" columns={[{ key: 'nome', label: 'Nome' }]} orgId={orgId} orderColumn="nome" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;