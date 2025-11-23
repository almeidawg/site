import React from 'react';
import { getFinanceReport } from '../services/lancamentos';
import { brl } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Autocomplete from '@/components/shared/Autocomplete';
import { Loader2 } from 'lucide-react';

/**
 * @param {{
 *  open: boolean;
 *  onClose: () => void;
 * }} props
 */
export default function ReportDialog({ open, onClose }) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const now = today.toISOString().slice(0, 10);

  const [f, setF] = React.useState({
    dataIni: first,
    dataFim: now,
    tipo: '',
    status: '',
    centroCustoId: '',
    favorecidoId: '',
    categoria: '',
    isReembolso: '',
  });
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFinanceReport({
        dataIni: f.dataIni,
        dataFim: f.dataFim,
        tipo: f.tipo || undefined,
        status: f.status || undefined,
        centroCustoId: f.centroCustoId || undefined,
        favorecidoId: f.favorecidoId || undefined,
        categoria: f.categoria || undefined,
        isReembolso: f.isReembolso === '' ? undefined : f.isReembolso === 'true',
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  const total = React.useMemo(
    () => rows.reduce((acc, r) => acc + (r.total || 0), 0),
    [rows]
  );
  
  const handleAutocompleteChange = (field, item) => {
    setF(prev => ({...prev, [field]: item?.id || ''}));
  };

  const exportCSV = () => {
    const header = ['Data', 'Tipo', 'Status', 'Categoria', 'Descrição', 'Favorecido', 'Quantidade', 'Valor Unitário', 'Total'];
    const lines = rows.map(r => [
      r.data_pagamento,
      r.tipo,
      r.status,
      r.categoria ?? '',
      (r.descricao ?? '').replace(/[\n,"]/g, ' '),
      r.favorecido_nome ?? '',
      String(r.quantidade ?? 1),
      String(r.valor_unitario),
      String(r.total)
    ]);
    const csv = [header, ...lines].map(a => a.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_financeiro_${f.dataIni}_${f.dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
            <DialogHeader><DialogTitle>Relatório Financeiro</DialogTitle></DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label>Data Início</Label><Input type="date" value={f.dataIni} onChange={e => setF({ ...f, dataIni: e.target.value })} /></div>
              <div className="space-y-1"><Label>Data Fim</Label><Input type="date" value={f.dataFim} onChange={e => setF({ ...f, dataFim: e.target.value })} /></div>
              <div className="space-y-1"><Label>Tipo</Label><Select value={f.tipo} onValueChange={v => setF({ ...f, tipo: v === 'todos' ? '' : v })}><SelectTrigger><SelectValue placeholder="Todos"/></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="Receita">Receita</SelectItem><SelectItem value="Despesa">Despesa</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><Label>Status</Label><Select value={f.status} onValueChange={v => setF({ ...f, status: v === 'todos' ? '' : v })}><SelectTrigger><SelectValue placeholder="Todos"/></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="Pago">Pago</SelectItem><SelectItem value="Previsto">Previsto</SelectItem><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent></Select></div>
              <div className="space-y-1 col-span-2"><Label>Centro de Custo</Label><Autocomplete table="entities" displayColumn="nome_razao_social" filterColumn="tipo" filterValue="cliente" onChange={(item) => handleAutocompleteChange('centroCustoId', item)} placeholder="Busque o cliente"/></div>
              <div className="space-y-1 col-span-2"><Label>Favorecido</Label><Autocomplete table="entities" displayColumn="nome_razao_social" onChange={(item) => handleAutocompleteChange('favorecidoId', item)} placeholder="Busque o favorecido"/></div>
              <div className="space-y-1 col-span-2"><Label>Categoria (contém...)</Label><Input placeholder="Ex: Mão de obra" value={f.categoria} onChange={e => setF({ ...f, categoria: e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-5"><Switch id="isReembolso" checked={f.isReembolso === 'true'} onCheckedChange={c => setF({...f, isReembolso: c ? 'true' : ''})} /><Label htmlFor="isReembolso">Apenas Reembolso</Label></div>
            </div>

            <div className="flex gap-2 my-4">
              <Button onClick={load} disabled={loading}>{loading ? <Loader2 className="animate-spin mr-2"/> : null} Aplicar filtros</Button>
              <Button variant="outline" onClick={exportCSV} disabled={!rows.length}>Exportar CSV</Button>
            </div>

            <div className="flex-1 overflow-auto border rounded-xl">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10"><TableRow><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Categoria</TableHead><TableHead>Descrição</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading && <tr><TableCell colSpan={6} className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></TableCell></tr>}
                  {!loading && rows.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{r.tipo}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.categoria || ''}</TableCell>
                      <TableCell>{r.descricao || ''}</TableCell>
                      <TableCell className="text-right">{brl(r.total)}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && !rows.length && <tr><TableCell colSpan={6} className="p-4 text-center text-gray-500">Sem resultados para os filtros aplicados</TableCell></tr>}
                </TableBody>
                {rows.length > 0 && (<tfoot><TableRow className="border-t bg-gray-50 font-semibold"><TableCell colSpan={5}>Total</TableCell><TableCell className="p-2 text-right">{brl(total)}</TableCell></TableRow></tfoot>)}
              </Table>
            </div>
            
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Fechar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}