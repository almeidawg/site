import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export function ColumnHeader({
  column,
  onRenamed,
  count,
  badgeColor,
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(column.nome);
  const inputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = async () => {
    const newName = value.trim();
    if (!newName || newName === column.nome) {
      setEditing(false);
      setValue(column.nome);
      return;
    }
    try {
      // Usar função api_renomear_coluna_kanban
      const { data, error } = await supabase.rpc('api_renomear_coluna_kanban', {
        p_coluna_id: column.id,
        p_novo_nome: newName
      });

      if (error) throw error;

      // A função retorna boolean, buscar dados atualizados usando column.id
      const { data: updated } = await supabase
        .from('kanban_colunas')
        .select('id, nome, pos, cor')
        .eq('id', column.id)
        .maybeSingle();

      if (updated) {
        onRenamed(updated);
        toast({ title: 'Coluna renomeada!' });
      }
    } catch(error) {
      toast({ title: 'Erro ao renomear', description: error.message, variant: 'destructive' });
      setValue(column.nome);
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      {editing ? (
        <input
          ref={inputRef}
          className="border rounded px-2 py-1 text-sm w-full font-semibold bg-white dark:bg-gray-900"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setValue(column.nome); setEditing(false); }
          }}
        />
      ) : (
        <button
          className="font-semibold text-left hover:underline text-gray-800 dark:text-gray-200"
          title="Renomear coluna"
          onClick={() => setEditing(true)}
        >
          {column.nome}
        </button>
      )}

      <span
        className="text-xs px-2 py-0.5 rounded-full select-none"
        style={{ background: badgeColor ?? '#eee', color: '#1f2937' }}
        title="Quantidade de cards"
      >
        {count}
      </span>
    </div>
  );
}