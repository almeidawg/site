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
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCobranca, setNewCobranca] = useState({ cliente: '', obra_id: '', valor: '', vencimento: '', status: 'Pendente', tipo: 'Boleto' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: cobrancasData, error: cobrancasError } = await supabase.from('cobrancas').select('*, obras(nome)');
        const { data: obrasData, error: obrasError } = await supabase.from('obras').select('id, nome');
        if (cobrancasError || obrasError) {
            toast({ variant: 'destructive', title: 'Erro', description: cobrancasError?.message || obrasError?.message });
        } else {
            setCobrancas(cobrancasData);
            setObras(obrasData);
        }
        setLoading(false);
    }, [toast]);
    
    useEffect(() => { fetchData() }, [fetchData]);

    const handleInputChange = (e) => setNewCobranca(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectChange = (name, value) => setNewCobranca(prev => ({...prev, [name]: value}));

    const handleAddCobranca = async () => {
        const { error } = await supabase.from('cobrancas').insert([{...newCobranca, valor: parseFloat(newCobranca.valor)}]);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Cobrança adicionada.' });
            setIsDialogOpen(false);
            setNewCobranca({ cliente: '', obra_id: '', valor: '', vencimento: '', status: 'Pendente', tipo: 'Boleto' });
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
                                            <td className="p-4 font-medium">{c.cliente}</td>
                                            <td className="p-4">{c.obras?.nome}</td>
                                            <td className="p-4">{new Date(c.vencimento).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 font-bold text-[#5E9B94]">R$ {c.valor.toLocaleString('pt-BR')}</td>
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
                        <Input name="cliente" placeholder="Nome do Cliente" value={newCobranca.cliente} onChange={handleInputChange} />
                        <Select onValueChange={v => handleSelectChange('obra_id', v)}><SelectTrigger><SelectValue placeholder="Obra" /></SelectTrigger><SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent></Select>
                        <Input name="valor" type="number" placeholder="Valor" value={newCobranca.valor} onChange={handleInputChange} />
                        <Input name="vencimento" type="date" value={newCobranca.vencimento} onChange={handleInputChange} />
                        <Select onValueChange={v => handleSelectChange('tipo', v)} defaultValue="Boleto"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Boleto">Boleto</SelectItem><SelectItem value="Pix">PIX</SelectItem><SelectItem value="Cartão">Cartão</SelectItem></SelectContent></Select>
                    </div>
                    <DialogFooter><Button onClick={handleAddCobranca} className="bg-[#5E9B94] hover:bg-[#4a7c76]">Salvar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Cobrancas;