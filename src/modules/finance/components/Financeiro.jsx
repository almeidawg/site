
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp, Loader2, FileDown, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
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

// Finance Module specific imports
import NovoLancamentoDialog from '@/modules/finance/components/NovoLancamentoDialog';
import EditLancamentoDialog from '@/modules/finance/components/EditLancamentoDialog';
import RelatorioFinanceiroDialog from '@/modules/finance/components/RelatorioFinanceiroDialog';
import RowActions from '@/modules/finance/components/RowActions';
import { listLancamentos, deleteAllLancamentos, duplicateLancamento } from '@/modules/finance/services/lancamentos';
import { brl } from '@/modules/finance/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const LancamentosTab = ({ lancamentos, loading, onEdit, onDuplicate, onActionComplete }) => {
    const formatDate = (value) => value ? new Date(value+'T00:00:00').toLocaleDateString('pt-BR') : '-';

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <Card>
            <CardHeader><CardTitle>Histórico de Lançamentos</CardTitle></CardHeader>
            <CardContent>
                {lancamentos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Nenhum lançamento registrado.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Favorecido</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="text-right w-[120px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lancamentos.map(lanc => (
                                    <TableRow key={lanc.id}>
                                        <TableCell>{formatDate(lanc.occurred_at)}</TableCell>
                                        <TableCell><span className={`px-2 py-1 text-xs rounded-full ${lanc.type === 'income' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'}`}>{lanc.type === 'income' ? 'Receita' : 'Despesa'}</span></TableCell>
                                        <TableCell className="max-w-xs truncate">{lanc.description}</TableCell>
                                        <TableCell>{lanc.category_name || 'N/A'}</TableCell>
                                        <TableCell>{lanc.party_name || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-semibold">{brl(lanc.amount)}</TableCell>
                                        <TableCell className="text-right">
                                            <RowActions
                                                row={lanc}
                                                onEdit={onEdit}
                                                onDuplicate={onDuplicate}
                                                onActionComplete={onActionComplete}
                                            />
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
    const { orgId } = useAuth();
    const [dashboardData, setDashboardData] = useState({ total_receitas: 0, total_despesas: 0, saldo_atual: 0, lucratividade: 0 });
    const [loading, setLoading] = useState(true);
    const [lancamentos, setLancamentos] = useState([]);
    const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false);
    const [isEditLancamentoOpen, setIsEditLancamentoOpen] = useState(false);
    const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
    const [lancamentoToProcess, setLancamentoToProcess] = useState(null);
    const [actionCounter, setActionCounter] = useState(0);
    const { toast } = useToast();
    
    const triggerRefresh = () => setActionCounter(prev => prev + 1);

    const fetchAllData = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const [dashResult, lancs] = await Promise.all([
                supabase.rpc('get_finance_dashboard_data'),
                listLancamentos()
            ]);

            const { data: dashData, error: dashError } = dashResult;

            if (dashError) {
                console.error("Could not fetch dashboard data:", dashError);
                toast({ title: "Erro ao buscar totais", description: "Não foi possível carregar os dados do painel.", variant: "destructive" });
                setDashboardData({ total_receitas: 0, total_despesas: 0, saldo_atual: 0, lucratividade: 0 });
            } else {
                setDashboardData(dashData[0] || { total_receitas: 0, total_despesas: 0, saldo_atual: 0, lucratividade: 0 });
            }
            setLancamentos(lancs);

        } catch (error) {
            toast({ title: "Erro ao carregar dados financeiros", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast, orgId]);


    useEffect(() => {
        if (orgId) {
            fetchAllData();
        }
    }, [fetchAllData, actionCounter, orgId]);

    const handleEdit = (lanc) => {
        setLancamentoToProcess(lanc);
        setIsEditLancamentoOpen(true);
    };

    const handleDuplicate = async (lanc) => {
        try {
            await duplicateLancamento(lanc.id);
            toast({ title: "Lançamento duplicado com sucesso!" });
            triggerRefresh();
        } catch (error) {
            toast({ title: "Erro ao duplicar", description: error.message, variant: "destructive" });
        }
    };
    
    const handleCloseAndRefresh = () => {
        setIsNovoLancamentoOpen(false);
        setIsEditLancamentoOpen(false);
        setLancamentoToProcess(null);
        triggerRefresh();
    };

    const handleClearHistory = async () => {
        if (!orgId) return;
        try {
            await deleteAllLancamentos();
            toast({ title: "Histórico de lançamentos foi limpo!" });
            triggerRefresh();
        } catch (error) {
            toast({ title: "Erro ao limpar histórico", description: error.message, variant: "destructive" });
        }
    };

    if (!orgId) {
        return <div className="p-6 flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /> <span className="ml-4 text-muted-foreground">Carregando organização...</span></div>;
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Financeiro</h1>
                        <p className="text-muted-foreground mt-1">Controle total sobre as finanças da sua empresa.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Limpar Histórico</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Atenção! Ação Irreversível!</AlertDialogTitle><AlertDialogDescription>Você tem certeza que deseja excluir PERMANENTEMENTE todos os lançamentos financeiros? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">Sim, excluir tudo</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" onClick={() => setIsRelatorioOpen(true)}><FileDown className="mr-2 h-4 w-4" /> Gerar Relatório</Button>
                        <Button onClick={() => { setLancamentoToProcess(null); setIsNovoLancamentoOpen(true); }}><Plus size={20} className="mr-2" />Novo Lançamento</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? <div className="col-span-4 flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div> : <>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Receitas</CardTitle><ArrowUpCircle className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{brl(dashboardData.total_receitas)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Despesas</CardTitle><ArrowDownCircle className="h-4 w-4 text-rose-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{brl(dashboardData.total_despesas)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Saldo Atual</CardTitle><DollarSign className={`h-4 w-4 ${dashboardData.saldo_atual >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} /></CardHeader><CardContent><div className="text-2xl font-bold">{brl(dashboardData.saldo_atual)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lucratividade</CardTitle><TrendingUp className="h-4 w-4 text-sky-500" /></CardHeader><CardContent><div className={`text-2xl font-bold ${dashboardData.lucratividade >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{dashboardData.lucratividade.toFixed(1)}%</div></CardContent></Card>
                    </>}
                </div>
                
                <LancamentosTab onEdit={handleEdit} onDuplicate={handleDuplicate} onActionComplete={triggerRefresh} lancamentos={lancamentos} loading={loading} />
            </div>

            <NovoLancamentoDialog open={isNovoLancamentoOpen} onOpenChange={setIsNovoLancamentoOpen} onSave={handleCloseAndRefresh} />
            <EditLancamentoDialog open={isEditLancamentoOpen} onClose={handleCloseAndRefresh} lanc={lancamentoToProcess} onSaved={handleCloseAndRefresh} />
            <RelatorioFinanceiroDialog open={isRelatorioOpen} onOpenChange={setIsRelatorioOpen} />
        </>
    );
};

export default Financeiro;
