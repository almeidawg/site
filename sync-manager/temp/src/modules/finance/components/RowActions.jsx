
import React from 'react';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { softDeleteLancamento } from '../services/lancamentos';
import { useToast } from '@/components/ui/use-toast';
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
import { Button } from '@/components/ui/button';

/**
 * @param {{
 *   row: import('../types').Lancamento;
 *   onEdit: (row: import('../types').Lancamento) => void;
 *   onDuplicate: (row: import('../types').Lancamento) => void;
 *   onActionComplete: () => void;
 * }} props
 */
export default function RowActions({ row, onEdit, onDuplicate, onActionComplete }) {
  const [pending, setPending] = React.useState(false);
  const { toast } = useToast();

  const doDelete = async () => {
    setPending(true);
    try {
      await softDeleteLancamento(row.id);
      toast({ title: 'Lançamento excluído!' });
      onActionComplete?.();
    } catch(e) {
        toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-50"
        title="Editar"
        onClick={() => onEdit(row)}
        disabled={pending}
      >
        <Pencil size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-50"
        title="Duplicar"
        onClick={() => onDuplicate(row)}
        disabled={pending}
      >
        <Copy size={16} />
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 rounded-xl hover:bg-red-50 text-red-600 disabled:opacity-50"
            title="Excluir"
            disabled={pending}
          >
            <Trash2 size={16} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação marcará o lançamento como excluído e ele não aparecerá mais nas listagens ativas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={pending} className="bg-destructive hover:bg-destructive/90">
              {pending ? 'Excluindo...' : 'Sim, excluir lançamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
