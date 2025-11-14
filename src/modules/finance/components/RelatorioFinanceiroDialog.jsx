
import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import Autocomplete from '@/components/shared/Autocomplete';

const RelatorioFinanceiroDialog = ({ open, onOpenChange }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        p_data_ini: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
        p_data_fim: new Date().toISOString().slice(0, 10),
        p_tipo: null,
        p_centro_custo: null,
        p_categoria_id: null,
        p_favorecido: null,
    });
    
    const [selectedItems, setSelectedItems] = useState({ p_centro_custo: null, p_categoria_id: null, p_favorecido: null });

    const handleFilterChange = (field, value) => {
        let finalValue = value === 'todos' || value === '' ? null : value;
        setFilters(prev => ({ ...prev, [field]: finalValue }));
    };
    
    const handleAutocompleteChange = (field, item) => {
        handleFilterChange(field, item ? item.id : null);
        setSelectedItems(prev => ({ ...prev, [field]: item }));
    };

    const generateHtmlReport = (reportData) => {
        const { data, totals } = reportData;
        const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
        const formatDate = (value) => {
            if (!value) return '-';
            const date = new Date(value);
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() + tzoffset);
            return localDate.toLocaleDateString('pt-BR');
        };

        return `
            <html>
                <head>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #333; }
                        h1 { color: #111; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f9f9f9; }
                        .total-row td { font-weight: bold; background-color: #f0f0f0; }
                        .currency { text-align: right; }
                        .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
                        .summary-item { text-align: center; }
                        .summary-item h3 { margin: 0 0 5px 0; font-size: 14px; color: #555; }
                        .summary-item p { margin: 0; font-size: 16px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Relatório Financeiro</h1>
                    <p>Período de ${formatDate(filters.p_data_ini)} a ${formatDate(filters.p_data_fim)}</p>
                    
                    <div class="summary">
                        <div class="summary-item"><h3>Total Receitas</h3><p style="color: green;">${formatCurrency(totals.receitas)}</p></div>
                        <div class="summary-item"><h3>Total Despesas</h3><p style="color: red;">${formatCurrency(totals.despesas)}</p></div>
                        <div class="summary-item"><h3>Saldo</h3><p style="color: ${totals.saldo >= 0 ? 'green' : 'red'};">${formatCurrency(totals.saldo)}</p></div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Favorecido</th>
                                <th class="currency">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => `
                                <tr>
                                    <td>${formatDate(item.occurred_at)}</td>
                                    <td>${item.type === 'income' ? 'Receita' : 'Despesa'}</td>
                                    <td>${item.description || ''}</td>
                                    <td>${item.category_name || 'N/A'}</td>
                                    <td>${item.party_name || 'N/A'}</td>
                                    <td class="currency" style="color: ${item.type === 'income' ? 'green' : 'red'};">${formatCurrency(item.amount)}</td>
                                </tr>
                            `).join('')}
                             ${data.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nenhum resultado encontrado para os filtros selecionados.</td></tr>' : ''}
                            <tr class="total-row">
                                <td colspan="5">Saldo do Período</td>
                                <td class="currency">${formatCurrency(totals.saldo)}</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            </html>
        `;
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const { data, error: rpcError } = await supabase.rpc('finance_report', { ...filters });
            
            if (rpcError) throw rpcError;

            const partyIds = data.map(d => d.party_id).filter(Boolean);
            const categoryIds = data.map(d => d.category_id).filter(Boolean);

            const [parties, categories] = await Promise.all([
                 partyIds.length > 0 ? supabase.from('parties').select('id, name').in('id', partyIds) : Promise.resolve({ data: [] }),
                 categoryIds.length > 0 ? supabase.from('fin_categories').select('id, name').in('id', categoryIds) : Promise.resolve({ data: [] }),
            ]);
            
            const dataWithNames = data.map(d => ({
                ...d,
                party_name: parties.data?.find(f => f.id === d.party_id)?.name || 'N/A',
                category_name: categories.data?.find(c => c.id === d.category_id)?.name || 'N/A',
            }));

            const totalReceitas = dataWithNames.filter(d => d.type === 'income').reduce((acc, cur) => acc + cur.amount, 0);
            const totalDespesas = dataWithNames.filter(d => d.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0);
            const saldo = totalReceitas - totalDespesas;

            const reportHtml = generateHtmlReport({ data: dataWithNames, totals: { receitas: totalReceitas, despesas: totalDespesas, saldo } });
            
            const { data: functionData, error: functionError } = await supabase.functions.invoke('pdf-generate', {
                body: { html: reportHtml },
            });
            
            if (functionError) throw new Error(functionError.message);
            if (functionData.error) throw new Error(functionData.error);

            // A função agora retorna uma URL pré-assinada
            const { data: publicUrlData } = supabase.storage.from('pdf').getPublicUrl(functionData.path);

            if (!publicUrlData) {
                throw new Error("Não foi possível obter a URL pública do relatório.");
            }
            
            window.open(publicUrlData.publicUrl, '_blank');
            toast({ title: "Relatório gerado com sucesso!" });
            onOpenChange(false);

        } catch (error) {
            console.error("Erro completo:", error);
            toast({ title: 'Erro ao gerar relatório', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Gerar Relatório Financeiro</DialogTitle><DialogDescription>Selecione os filtros para gerar o seu relatório em PDF.</DialogDescription></DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2"><Label>Data Início</Label><Input type="date" value={filters.p_data_ini || ''} onChange={e => handleFilterChange('p_data_ini', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Data Fim</Label><Input type="date" value={filters.p_data_fim || ''} onChange={e => handleFilterChange('p_data_fim', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Tipo</Label><Select value={filters.p_tipo || 'todos'} onValueChange={v => handleFilterChange('p_tipo', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="income">Receita</SelectItem><SelectItem value="expense">Despesa</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Projeto (Centro de Custo)</Label><Autocomplete table="entities" displayColumn="nome_razao_social" value={selectedItems.p_centro_custo} onChange={(item) => handleAutocompleteChange('p_centro_custo', item)} placeholder="Todos"/></div>
                    <div className="space-y-2"><Label>Categoria</Label><Autocomplete table="fin_categories" displayColumn="name" value={selectedItems.p_categoria_id} onChange={(item) => handleAutocompleteChange('p_categoria_id', item)} placeholder="Todas"/></div>
                    <div className="space-y-2"><Label>Favorecido/Cliente</Label><Autocomplete table="parties" displayColumn="name" value={selectedItems.p_favorecido} onChange={(item) => handleAutocompleteChange('p_favorecido', item)} placeholder="Todos"/></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleGenerateReport} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Gerar PDF</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RelatorioFinanceiroDialog;
