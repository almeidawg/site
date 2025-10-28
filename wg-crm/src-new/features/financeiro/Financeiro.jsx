
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp, CalendarDays, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useBusinessDays } from '@/hooks/useBusinessDays';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const PrazoCalculator = () => {
    const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0, 10));
    const [prazoDias, setPrazoDias] = useState(5);
    const [dataVencimento, setDataVencimento] = useState('');
    const [diasUteisRestantes, setDiasUteisRestantes] = useState(0);

    const { loading, addBusinessDays, getBusinessDaysDiff, formatDate } = useBusinessDays('SP', 'Sao Paulo');

    useEffect(() => {
        if (!loading && dataEmissao && prazoDias >= 0) {
            const baseDate = new Date(dataEmissao + 'T00:00:00');
            const vencimento = addBusinessDays(baseDate, parseInt(prazoDias, 10));
            if (vencimento) {
                setDataVencimento(formatDate(vencimento));
                
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                const diff = getBusinessDaysDiff(hoje, vencimento);
                setDiasUteisRestantes(diff);
            }
        }
    }, [dataEmissao, prazoDias, loading, addBusinessDays, getBusinessDaysDiff, formatDate]);

    const getSlaColor = () => {
        if (diasUteisRestantes <= 1) return 'text-red-600';
        if (diasUteisRestantes <= 3) return 'text-amber-600';
        return 'text-green-600';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays /> Calculadora de Prazos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dtEmissao">Data Emissão</Label>
                        <Input type="date" id="dtEmissao" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prazoDU">Prazo (dias úteis)</Label>
                        <Input type="number" id="prazoDU" min="0" value={prazoDias} onChange={e => setPrazoDias(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dtVenc">Vencimento (calculado)</Label>
                        <Input type="date" id="dtVenc" value={dataVencimento} readOnly className="font-bold bg-gray-100" />
                    </div>
                </div>
                {dataVencimento && (
                    <div className={cn("flex items-center gap-2 p-3 rounded-md text-sm font-semibold", getSlaColor().replace('text-', 'bg-').replace('-600', '/10'))}>
                        <AlertTriangle className={cn("h-5 w-5", getSlaColor())} />
                        <span className={getSlaColor()}>
                            {diasUteisRestantes > 0 
                                ? `Vencimento em ${diasUteisRestantes} dia(s) útil(eis).`
                                : `Vencido ou vence hoje.`
                            }
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const LancamentosTab = () => {
    const [lancamentos, setLancamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchLancamentos = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('lancamentos')
                .select(`
                    *,
                    centro_custo:centro_custo_cliente_id ( nome_razao_social ),
                    categoria:categoria_id ( nome )
                `)
                .order('criado_em', { ascending: false });

            if (error) {
                toast({ title: "Erro ao buscar lançamentos", description: error.message, variant: "destructive" });
            } else {
                setLancamentos(data);
            }
            setLoading(false);
        };
        fetchLancamentos();
    }, [toast]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
                {lancamentos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        Nenhum lançamento registrado ainda. Clique em "Novo Lançamento" para começar.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SDP</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Centro de Custo</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lancamentos.map(lancamento => (
                                    <TableRow key={lancamento.id}>
                                        <TableCell className="font-medium">{lancamento.sdp || '-'}</TableCell>
                                        <TableCell>{new Date(lancamento.criado_em).toLocaleString('pt-BR')}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${lancamento.tipo === 'receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {lancamento.tipo}
                                            </span>
                                        </TableCell>
                                        <TableCell>{lancamento.centro_custo?.nome_razao_social || 'N/A'}</TableCell>
                                        <TableCell>{lancamento.categoria?.nome || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(lancamento.total)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                lancamento.status === 'Pago' ? 'bg-green-200 text-green-900' :
                                                lancamento.status === 'Previsto' ? 'bg-yellow-200 text-yellow-900' :
                                                'bg-gray-200 text-gray-800'
                                            }`}>
                                                {lancamento.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const Financeiro = () => {
    const [lancamentos, setLancamentos] = useState([]);
    const [loadingLancamentos, setLoadingLancamentos] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        const fetchTotals = async () => {
            const { data, error } = await supabase.from('lancamentos').select('tipo, total');
            if (!error) setLancamentos(data);
            setLoadingLancamentos(false);
        }
        fetchTotals();
    }, []);

    const handleNotImplemented = (feature) => {
        toast({
            title: `🚧 ${feature} em Breve!`,
            description: "Esta funcionalidade será implementada em breve.",
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const totalReceitas = lancamentos.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.total, 0);
    const totalDespesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.total, 0);
    const saldo = totalReceitas - totalDespesas;
    const lucratividade = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1>Módulo Financeiro</h1>
                    <p className="text-muted-foreground mt-1">
                        Controle total sobre as finanças dos seus projetos e da empresa.
                    </p>
                </div>
                <Button
                    onClick={() => handleNotImplemented('Novo Lançamento')}
                >
                    <Plus size={20} className="mr-2" />
                    Novo Lançamento
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingLancamentos ? <Loader2 className="animate-spin" /> : <>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalReceitas)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalDespesas)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <DollarSign className={`h-4 w-4 ${saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(saldo)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucratividade</CardTitle>
                        <TrendingUp className="h-4 w-4 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${lucratividade >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{lucratividade.toFixed(1)}%</div>
                         <p className="text-xs text-muted-foreground">Sobre o faturamento</p>
                    </CardContent>
                </Card>
                </>}
            </div>

            <Tabs defaultValue="lancamentos">
                <TabsList>
                    <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
                    <TabsTrigger value="prazos">Calculadora de Prazos</TabsTrigger>
                    <TabsTrigger value="centros_custo" onClick={() => handleNotImplemented('Centros de Custo')}>Centros de Custo</TabsTrigger>
                    <TabsTrigger value="fluxo_caixa" onClick={() => handleNotImplemented('Fluxo de Caixa')}>Fluxo de Caixa</TabsTrigger>
                    <TabsTrigger value="relatorios" onClick={() => handleNotImplemented('Relatórios')}>Relatórios</TabsTrigger>
                </TabsList>
                 <TabsContent value="lancamentos">
                    <LancamentosTab />
                </TabsContent>
                <TabsContent value="prazos">
                    <PrazoCalculator />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Financeiro;
