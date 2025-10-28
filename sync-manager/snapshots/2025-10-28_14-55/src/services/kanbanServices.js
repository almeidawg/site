import { supabase } from '@/lib/customSupabaseClient';

export async function createColumn(boardId, nome, cor) {
  const payload = { board_id: boardId, nome: nome.trim(), cor: cor ?? '#E5E7EB' };
  const { data, error } = await supabase.from('kanban_colunas').insert(payload).select('id,nome,pos,cor').single();
  if (error) throw error;
  return data;
}

export async function renameColumn(columnId, nome) {
  const { data, error } = await supabase.from('kanban_colunas').update({ nome: nome.trim() }).eq('id', columnId).select('id,nome,pos,cor').single();
  if (error) throw error;
  return data;
}