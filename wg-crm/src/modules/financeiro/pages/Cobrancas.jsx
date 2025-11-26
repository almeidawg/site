import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Cobrancas = () => {
    const { toast } = useToast();
    const [cobrancas, setCobrancas] = useState([]);
    const [obras, setObras] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCobranca, setNewCobranca] = useState({ cliente_id: '', obra_id: '', descricao: '', valor: '', vencimento: '', status: 'Pendente', forma_pagamento: 'boleto' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: cobrancasData, error: cobrancasError } = await supabase
          .from('cobrancas')
          .select('*, obra:obras(titulo), cliente:entities(nome_razao_social)')
          .order('vencimento', { ascending: true });

        const { data: obrasData, error: obrasError } = await supabase.from('obras').select('id, titulo');
        const { data: clientesData, error: clientesError } = await supabase.from('entities').select('id, nome_razao_social').eq('ativo', true).eq('tipo', 'cliente');

        if (cobrancasError || obrasError || clientesError) {
            toast({ variant: 'destructive', title: 'Erro', description: cobrancasError?.message || obrasError?.message || clientesError?.message });
        } else {
            setCobrancas(cobrancasData || []);
            setObras(obrasData || []);
            setClientes(clientesData || []);
        }
        setLoading(false);
    }, [toast]);
    
    useEffect(() => { fetchData() }, [fetchData]);

    const handleInputChange = (e) => setNewCobranca(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectChange = (name, value) => setNewCobranca(prev => ({...prev, [name]: value}));

    const handleAddCobranca = async () => {
        const payload = {
          ...newCobranca,
          valor: parseFloat(newCobranca.valor) || 0,
        };
        const { error } = await supabase.from('cobrancas').insert([payload]);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Cobrança adicionada.' });
            setIsDialogOpen(false);
            setNewCobranca({ cliente_id: '', obra_id: '', descricao: '', valor: '', vencimento: '', status: 'Pendente', forma_pagamento: 'boleto' });
            fetchData();
        }
    };
    
    const getStatusInfo = (status, vencimento) => {
        const isOverdue = new Date(vencimento) < new Date() && status === 'Pendente';
        if (isOverdue) return { color: 'bg-red-100 text-red-700', icon: <AlertTriangle size={16} />, text: 'Vencido' };
        if (status === 'Pago') return { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} />, text: 'Pago' };
        return { color: 'bg-yellow-100 text-yellow-700', icon: <CreditCard size={16} />, text: 'Pendente' };
    };

    return (
        <>
            <Helmet><title>Cobranças - WG Almeida</title></Helmet>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Gestão de Cobranças</h1>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-[#5E9B94] hover:bg-[#4a7c76]"><Plus className="mr-2" /> Nova Cobrança</Button>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E9B94]"></div>
                    </div>
                ) : (
                    <div className="wg-card overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b"><th className="p-4 text-left font-semibold">Cliente</th><th className="p-4 text-left font-semibold">Obra</th><th className="p-4 text-left font-semibold">Vencimento</th><th className="p-4 text-left font-semibold">Valor</th><th className="p-4 text-left font-semibold">Status</th></tr>
                            </thead>
                            <tbody>
                                {cobrancas.map(c => {
                                    const statusInfo = getStatusInfo(c.status, c.vencimento);
                                    return (
                                        <tr key={c.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4 font-medium">{c.cliente?.nome_razao_social || 'Cliente não informado'}</td>
                                            <td className="p-4">{c.obra?.titulo || '—'}</td>
                                            <td className="p-4">{new Date(c.vencimento).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 font-bold text-[#5E9B94]">R$ {Number(c.valor || 0).toLocaleString('pt-BR')}</td>
                                            <td className="p-4"><span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.icon} {statusInfo.text}</span></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Cobrança</DialogTitle>
                        <DialogDescription>Crie uma nova cobrança para um cliente.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Select onValueChange={v => handleSelectChange('cliente_id', v)}>
                          <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                          <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_razao_social}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select onValueChange={v => handleSelectChange('obra_id', v)}>
                          <SelectTrigger><SelectValue placeholder="Obra (opcional)" /></SelectTrigger>
                          <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.titulo}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input name="descricao" placeholder="Descrição" value={newCobranca.descricao} onChange={handleInputChange} />
                        <Input name="valor" type="number" placeholder="Valor" value={newCobranca.valor} onChange={handleInputChange} />
                        <Input name="vencimento" type="date" value={newCobranca.vencimento} onChange={handleInputChange} />
                        <Select onValueChange={v => handleSelectChange('forma_pagamento', v)} defaultValue="boleto">
                          <SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="cartao">Cartão</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter><Button onClick={handleAddCobranca} className="bg-[#5E9B94] hover:bg-[#4a7c76]">Salvar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Cobrancas;
