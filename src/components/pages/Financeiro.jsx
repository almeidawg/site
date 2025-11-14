
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp, CalendarDays, AlertTriangle, Loader2, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useBusinessDays } from '@/hooks/useBusinessDays';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import NovoLancamentoDialog from '@/components/financeiro/NovoLancamentoDialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PrazoCalculator = () => {
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0, 10));
  const [prazoDias, setPrazoDias] = useState(5);
  const [dataVencimento, setDataVencimento] = useState('');
  const [diasUteisRestantes, setDiasUteisRestantes] = useState(0);
  const {
    loading,
    addBusinessDays,
    getBusinessDaysDiff,
    formatDate
  } = useBusinessDays('SP', 'Sao Paulo');

  useEffect(() => {
    if (!loading && dataEmissao && prazoDias >= 0) {
      const baseDate = new Date(dataEmissao + 'T00:00:00');
      const vencimento = addBusinessDays(baseDate, parseInt(prazoDias, 10));
      if (vencimento) {
        setDataVencimento(formatDate(vencimento));
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
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
  return <Card>
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
                        <Input type="date" id="dtVenc" value={dataVencimento} readOnly className="font-bold bg-muted" />
                    </div>
                </div>
                {dataVencimento && <div className={cn("flex items-center gap-2 p-3 rounded-md text-sm font-semibold", getSlaColor().replace('text-', 'bg-').replace('-600', '/10'))}>
                        <AlertTriangle className={cn("h-5 w-5", getSlaColor())} />
                        <span className={getSlaColor()}>
                            {diasUteisRestantes > 0 ? `Vencimento em ${diasUteisRestantes} dia(s) útil(eis).` : `Vencido ou vence hoje.`}
                        </span>
                    </div>}
            </CardContent>
        </Card>;
};

const LancamentosTab = ({ orgId, onLancamentoAdded }) => {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchLancamentos = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
        .from('view_financeiro_summary')
        .select('*')
        .eq('org_id', orgId)
        .order('occurred_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar lançamentos:", error);
      toast({ title: "Erro ao buscar lançamentos", description: error.message, variant: "destructive" });
    } else {
      setLancamentos(data);
    }
    setLoading(false);
  }, [orgId, toast]);

  useEffect(() => {
    fetchLancamentos();
  }, [fetchLancamentos, onLancamentoAdded]);
  
  const formatCurrency = value => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return <Card>
            <CardHeader><CardTitle>Histórico de Lançamentos</CardTitle></CardHeader>
            <CardContent>
                {lancamentos.length === 0 ? <p className="text-muted-foreground text-center py-8">Nenhum lançamento registrado.</p> : 
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Conta</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lancamentos.map(lancamento => (
                                    <TableRow key={lancamento.transaction_id}>
                                        <TableCell>{new Date(lancamento.occurred_at).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell><span className={`px-2 py-1 text-xs rounded-full ${lancamento.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{lancamento.type === 'income' ? 'Receita' : 'Despesa'}</span></TableCell>
                                        <TableCell className="font-medium">{lancamento.description}</TableCell>
                                        <TableCell>{lancamento.category_name || 'N/A'}</TableCell>
                                        <TableCell>{lancamento.account_name || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(lancamento.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>}
            </CardContent>
        </Card>;
};

const Financeiro = () => {
    const { orgId } = useAuth();
    const { toast } = useToast();
    const [totals, setTotals] = useState({ receita: 0, despesa: 0 });
    const [loadingTotals, setLoadingTotals] = useState(true);
    const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false);
    const [lancamentoCounter, setLancamentoCounter] = useState(0);

    const fetchTotals = useCallback(async () => {
        if (!orgId) return;
        setLoadingTotals(true);
        const { data, error } = await supabase.rpc('fn_dre', { org: orgId, d1: '2000-01-01', d2: '2999-12-31' });
        if (error) {
            toast({ title: "Erro ao buscar totais", variant: "destructive" });
        } else if (data && data.length > 0) {
            setTotals({ receita: data[0].total_receitas, despesa: data[0].total_despesas });
        }
        setLoadingTotals(false);
    }, [orgId, toast]);

    useEffect(() => { fetchTotals(); }, [fetchTotals, lancamentoCounter]);

    const handleLancamentoSaved = () => {
        setIsNovoLancamentoOpen(false);
        setLancamentoCounter(prev => prev + 1);
    };

    const handleNotImplemented = (feature) => toast({ title: `🚧 ${feature} em Breve!`, description: "Esta funcionalidade ainda não foi implementada." });

    const formatCurrency = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const saldo = totals.receita - totals.despesa;
    const lucratividade = totals.receita > 0 ? (saldo / totals.receita * 100) : 0;
  
    return (
        <div className="p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Financeiro</h1>
                        <p className="text-muted-foreground mt-1">Controle total sobre as finanças dos seus projetos e da empresa.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => handleNotImplemented('Relatório PDF')}><FileDown className="mr-2 h-4 w-4" /> Gerar Relatório</Button>
                        <Button onClick={() => setIsNovoLancamentoOpen(true)}><Plus size={20} className="mr-2" /> Novo Lançamento</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loadingTotals ? <div className="col-span-4 flex justify-center p-8"><Loader2 className="animate-spin" /></div> : <>
                        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Receitas</CardTitle><ArrowUpCircle className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totals.receita)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Despesas</CardTitle><ArrowDownCircle className="h-4 w-4 text-rose-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totals.despesa)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Saldo Atual</CardTitle><DollarSign className={`h-4 w-4 ${saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(saldo)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Lucratividade</CardTitle><TrendingUp className="h-4 w-4 text-sky-500" /></CardHeader><CardContent><div className={`text-2xl font-bold ${lucratividade >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{lucratividade.toFixed(1)}%</div><p className="text-xs text-muted-foreground">Sobre o faturamento</p></CardContent></Card>
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
                    <TabsContent value="lancamentos" className="mt-4"><LancamentosTab orgId={orgId} onLancamentoAdded={lancamentoCounter} /></TabsContent>
                    <TabsContent value="prazos" className="mt-4"><PrazoCalculator /></TabsContent>
                </Tabs>
            </div>
            <NovoLancamentoDialog open={isNovoLancamentoOpen} onOpenChange={setIsNovoLancamentoOpen} onSave={handleLancamentoSaved} />
        </div>
    );
};
export default Financeiro;
