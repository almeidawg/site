import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const NovoTituloDialog = ({ open, onOpenChange, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState({ empresas: [], contas: [], planos: [], centros: [] });
    const [formData, setFormData] = useState({
        empresa_id: '',
        tipo: 'Pagar',
        favorecido_texto: '',
        documento: '',
        competencia: '',
        vencimento: '',
        valor: '',
        conta_financeira_id: '',
        plano_contas_id: '',
        centro_custo_id: '',
    });

    useEffect(() => {
        if (open) {
            fetchInitialData();
        }
    }, [open]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [empresasRes, contasRes, planosRes, centrosRes] = await Promise.all([
                supabase.from('empresas').select('id, razao_social'),
                supabase.from('contas_financeiras').select('id, apelido, empresa_id'),
                supabase.from('plano_contas').select('id, grupo, conta, empresa_id'),
                supabase.from('centros_custo').select('id, nome, empresa_id'),
            ]);

            setCollections({
                empresas: empresasRes.data || [],
                contas: contasRes.data || [],
                planos: planosRes.data || [],
                centros: centrosRes.data || [],
            });

        } catch (error) {
            toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (id === 'empresa_id') {
             setFormData(p => ({ ...p, conta_financeira_id: '', plano_contas_id: '', centro_custo_id: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const { valor, competencia, vencimento, ...rest } = formData;
        if (!valor || !competencia || !vencimento || !rest.empresa_id || !rest.tipo) {
            toast({ title: 'Campos obrigatórios faltando', variant: 'destructive' });
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('titulos_financeiros').insert([{
            ...rest,
            valor: parseFloat(valor),
            competencia: `${competencia}-01`,
            vencimento: vencimento,
            status: 'Previsto'
        }]);

        setLoading(false);
        if (error) {
            toast({ title: 'Erro ao salvar título', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Título salvo com sucesso!' });
            onSuccess();
            onOpenChange(false);
            setFormData({
                empresa_id: '', tipo: 'Pagar', favorecido_texto: '', documento: '',
                competencia: '', vencimento: '', valor: '', conta_financeira_id: '',
                plano_contas_id: '', centro_custo_id: '',
            });
        }
    };

    const filteredCollections = {
        contas: collections.contas.filter(c => c.empresa_id === formData.empresa_id),
        planos: collections.planos.filter(c => c.empresa_id === formData.empresa_id),
        centros: collections.centros.filter(c => c.empresa_id === formData.empresa_id),
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Novo Título Financeiro</DialogTitle>
                    <DialogDescription>Crie um novo título a pagar ou a receber.</DialogDescription>
                </DialogHeader>
                {loading && !collections.empresas.length ? <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div> :
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="empresa_id">Empresa *</Label>
                        <Select onValueChange={(v) => handleSelectChange('empresa_id', v)} value={formData.empresa_id}>
                            <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                            <SelectContent>{collections.empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select onValueChange={(v) => handleSelectChange('tipo', v)} value={formData.tipo}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pagar">A Pagar</SelectItem>
                                <SelectItem value="Receber">A Receber</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="favorecido_texto">Favorecido / Cliente</Label>
                        <Input id="favorecido_texto" value={formData.favorecido_texto} onChange={handleInputChange} placeholder="Nome do favorecido ou cliente" />
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="vencimento">Vencimento *</Label>
                        <Input id="vencimento" type="date" value={formData.vencimento} onChange={handleInputChange} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="valor">Valor (R$) *</Label>
                        <Input id="valor" type="number" step="0.01" value={formData.valor} onChange={handleInputChange} placeholder="1000.00" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="competencia">Competência (Mês/Ano) *</Label>
                        <Input id="competencia" type="month" value={formData.competencia} onChange={handleInputChange} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="documento">Documento</Label>
                        <Input id="documento" value={formData.documento} onChange={handleInputChange} placeholder="NF 12345" />
                    </div>

                    <div className="col-span-2 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="space-y-2">
                            <Label htmlFor="conta_financeira_id">Conta Financeira</Label>
                            <Select onValueChange={(v) => handleSelectChange('conta_financeira_id', v)} value={formData.conta_financeira_id} disabled={!formData.empresa_id}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>{filteredCollections.contas.map(c => <SelectItem key={c.id} value={c.id}>{c.apelido}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="plano_contas_id">Plano de Contas</Label>
                            <Select onValueChange={(v) => handleSelectChange('plano_contas_id', v)} value={formData.plano_contas_id} disabled={!formData.empresa_id}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>{filteredCollections.planos.map(p => <SelectItem key={p.id} value={p.id}>{`${p.grupo} > ${p.conta}`}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="centro_custo_id">Centro de Custo</Label>
                            <Select onValueChange={(v) => handleSelectChange('centro_custo_id', v)} value={formData.centro_custo_id} disabled={!formData.empresa_id}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>{filteredCollections.centros.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                
                    <DialogFooter className="col-span-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Título
                        </Button>
                    </DialogFooter>
                </form>
                }
            </DialogContent>
        </Dialog>
    );
};

export default NovoTituloDialog;