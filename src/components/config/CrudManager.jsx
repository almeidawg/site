
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CrudDialog = ({ open, onOpenChange, item, onSave, columns, title }) => {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    if (open) {
        setFormData(item || columns.reduce((acc, col) => ({...acc, [col.key]: col.default || ''}), {}));
    }
  }, [item, columns, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {columns.map(col => (
            <div key={col.key} className="space-y-2">
              <Label htmlFor={col.key}>{col.label}</Label>
              {col.type === 'select' ? (
                 <Select value={formData[col.key] || col.default} onValueChange={value => setFormData({ ...formData, [col.key]: value })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {col.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                 </Select>
              ) : col.type === 'textarea' ? (
                <Textarea id={col.key} value={formData[col.key] || ''} onChange={e => setFormData({ ...formData, [col.key]: e.target.value })} />
              ) : (
                <Input id={col.key} type={col.type || 'text'} value={formData[col.key] || ''} onChange={e => setFormData({ ...formData, [col.key]: e.target.value })} />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const CrudManager = ({ title, table, columns, orgId, orderColumn = 'name' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [actionCounter, setActionCounter] = useState(0);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*').eq('org_id', orgId).order(orderColumn, { ascending: true });
    if (error) {
      toast({ title: `Erro ao buscar ${title}`, description: error.message, variant: 'destructive' });
      console.error(`Error fetching ${table}:`, error);
    } else {
      setItems(data);
    }
    setLoading(false);
  }, [table, title, toast, orgId, orderColumn]);

  useEffect(() => {
    if (orgId) {
        fetchData();
    }
  }, [fetchData, actionCounter, orgId]);

  const handleSave = async (formData) => {
    const { id, ...rest } = formData;
    const payload = { ...rest, org_id: orgId };
    
    const primaryColumnKey = columns.find(c => c.key === 'nome' || c.key === 'name')?.key;
    if (!primaryColumnKey || !payload[primaryColumnKey]) {
        toast({ title: 'Erro de Validação', description: `O campo 'Nome' é obrigatório.`, variant: 'destructive' });
        return;
    }

    const { error } = id
      ? await supabase.from(table).update(payload).eq('id', id)
      : await supabase.from(table).insert(payload);

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `${title.slice(0, -1)} salvo com sucesso!` });
      setIsDialogOpen(false);
      setActionCounter(prev => prev + 1);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Item excluído com sucesso!' });
      setActionCounter(prev => prev + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Button onClick={() => { setCurrentItem(null); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin mx-auto" /></div> : (
          <Table>
            <TableHeader><TableRow>{columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}<TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  {columns.map(c => <TableCell key={c.key}>{item[c.key]}</TableCell>)}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentItem(item); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este item?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <CrudDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={currentItem}
          onSave={handleSave}
          columns={columns}
          title={`Gerenciar ${title.slice(0, -1)}`}
        />
      </CardContent>
    </Card>
  );
};

export default CrudManager;
