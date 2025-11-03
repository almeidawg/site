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
const LancamentosTab = ({
  onLancamentoAdded
}) => {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const fetchLancamentos = useCallback(async () => {
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from('lancamentos_view').select('*').order('data_gerada', {
      ascending: false
    });
    if (error) {
      console.error("Erro ao buscar lançamentos:", error);
      toast({
        title: "Erro ao buscar lançamentos",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setLancamentos(data);
    }
    setLoading(false);
  }, [toast]);
  useEffect(() => {
    fetchLancamentos();
  }, [fetchLancamentos, onLancamentoAdded]);
  const formatCurrency = value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  return <Card>
            <CardHeader>
                <CardTitle>Histórico de Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
                {lancamentos.length === 0 ? <p className="text-muted-foreground text-center py-8">
                        Nenhum lançamento registrado ainda. Clique em "Novo Lançamento" para começar.
                    </p> : <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SDP</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Centro de Custo</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Favorecido</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lancamentos.map(lancamento => <TableRow key={lancamento.id}>
                                        <TableCell className="font-medium">{lancamento.sdp || '-'}</TableCell>
                                        <TableCell>{new Date(lancamento.data_gerada).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${lancamento.tipo === 'Receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {lancamento.tipo}
                                            </span>
                                        </TableCell>
                                        <TableCell>{lancamento.centro_custo_cliente || 'N/A'}</TableCell>
                                        <TableCell>{lancamento.categoria || 'N/A'}</TableCell>
                                        <TableCell>{lancamento.favorecido_nome || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(lancamento.total)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${lancamento.status === 'Pago' ? 'bg-green-200 text-green-900' : lancamento.status === 'Previsto' ? 'bg-yellow-200 text-yellow-900' : 'bg-gray-200 text-gray-800'}`}>
                                                {lancamento.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>)}
                            </TableBody>
                        </Table>
                    </div>}
            </CardContent>
        </Card>;
};
const Financeiro = () => {
  const [totals, setTotals] = useState([]);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false);
  const [lancamentoAdded, setLancamentoAdded] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const {
    toast
  } = useToast();
  const fetchTotals = useCallback(async () => {
    setLoadingTotals(true);
    const {
      data,
      error
    } = await supabase.from('lancamentos_totais_mes').select('tipo, status, total');
    if (!error) {
      setTotals(data || []);
    } else {
      console.error("Erro ao buscar totais:", error);
      toast({
        title: "Erro ao buscar totais",
        description: "Não foi possível carregar o resumo financeiro.",
        variant: "destructive"
      });
    }
    setLoadingTotals(false);
  }, [toast]);
  useEffect(() => {
    fetchTotals();
  }, [fetchTotals, lancamentoAdded]);
  const handleNotImplemented = feature => {
    toast({
      title: `🚧 ${feature} em Breve!`,
      description: "Esta funcionalidade será implementada em breve. Você pode solicitar no próximo prompt!"
    });
  };
  const handleLancamentoSaved = () => {
    setIsNovoLancamentoOpen(false);
    setLancamentoAdded(prev => prev + 1);
  };
  const gerarRelatorioPDF = async (filtros = {}) => {
    setIsGeneratingReport(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('finance-report', {
        body: {
          filtros
        }
      });
      if (error) throw new Error(error?.context?.error || error.message);
      const blob = new Blob([data], {
        type: 'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-financeiro.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Relatório gerado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const formatCurrency = value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };
  const totalReceitas = totals.filter(l => l.tipo === 'Receita').reduce((acc, l) => acc + l.total, 0);
  const totalDespesas = totals.filter(l => l.tipo === 'Despesa').reduce((acc, l) => acc + l.total, 0);
  const saldo = totalReceitas - totalDespesas;
  const lucratividade = totalReceitas > 0 ? saldo / totalReceitas * 100 : 0;
  return <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Financeiro</h1>
                        <p className="text-muted-foreground mt-1">
                            Controle total sobre as finanças dos seus projetos e da empresa.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => gerarRelatorioPDF()} disabled={isGeneratingReport}>
                            {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                            Gerar Relatório
                        </Button>
                        <Button onClick={() => setIsNovoLancamentoOpen(true)}>
                            <Plus size={20} className="mr-2" />
                            Novo Lançamento
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loadingTotals ? <div className="col-span-4 flex justify-center p-8"><Loader2 className="animate-spin" /></div> : <>
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
                    <TabsContent value="lancamentos" className="mt-4">
                        <LancamentosTab onLancamentoAdded={lancamentoAdded} />
                    </TabsContent>
                    <TabsContent value="prazos" className="mt-4">
                        <PrazoCalculator />
                    </TabsContent>
                </Tabs>
            </div>
            <NovoLancamentoDialog open={isNovoLancamentoOpen} onOpenChange={setIsNovoLancamentoOpen} onSave={handleLancamentoSaved} />
        </>;
};
export default Financeiro;