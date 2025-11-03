import React, { useState, useRef, useEffect } from 'react';
import { createColumn } from '@/services/kanbanServices';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function AddColumnCard({ boardId, onCreated }) {
  const [adding, setAdding] = useState(false);
  const [nome, setNome] = useState('');
  const inputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (adding) {
      inputRef.current?.focus();
    }
  }, [adding]);

  const submit = async () => {
    if (!nome.trim()) {
        setAdding(false);
        return;
    }
    try {
        const col = await createColumn(boardId, nome.trim());
        onCreated(col);
        toast({ title: 'Coluna adicionada!' });
    } catch(error) {
        toast({ title: 'Erro ao criar coluna', description: error.message, variant: 'destructive' });
    } finally {
        setNome('');
        setAdding(false);
    }
  };

  if (!adding)
    return (
      <Button
        onClick={() => setAdding(true)}
        variant="outline"
        className="w-full h-[44px] rounded-lg border-dashed text-muted-foreground hover:bg-muted/50"
      >
        <Plus className="mr-2 h-4 w-4" /> Nova coluna
      </Button>
    );

  return (
    <div className="p-2 bg-muted rounded-lg border shadow-sm">
      <input
        ref={inputRef}
        className="w-full border rounded px-2 py-1 text-sm"
        placeholder="Título da coluna"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') { setNome(''); setAdding(false); }
        }}
        onBlur={submit}
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={submit} size="sm">Adicionar</Button>
        <Button onClick={() => { setNome(''); setAdding(false); }} size="sm" variant="ghost">Cancelar</Button>
      </div>
    </div>
  );
}