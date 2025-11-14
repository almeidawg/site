
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Search } from 'lucide-react';

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
    const { id, ...rest } = formData;
    const payload = { 
        ...rest, 
        empresa_id: empresa.id, 
        org_id: orgId, 
        currency: 'BRL',
        opening_balance: parseFloat(formData.opening_balance) || 0,
        current_balance: parseFloat(formData.opening_balance) || 0,
        is_archived: false,
    };

    if (!payload.name) {
        toast({ title: 'Erro de Validação', description: 'O nome da conta é obrigatório.', variant: 'destructive' });
        return;
    }
    
    const { error } = id
      ? await supabase.from('fin_accounts').update(payload).eq('id', id)
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
    const { id, ...rest } = formData;
    const payload = { ...rest, org_id: orgId };
    const { error } = id
      ? await supabase.from('empresas').update(payload).eq('id', id)
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

export default EmpresasGrupo;
