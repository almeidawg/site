import { supabase } from '@/lib/customSupabaseClient';

/**
 * Cria uma nova coluna no kanban
 * Usa a função SQL api_criar_coluna_kanban
 */
export async function createColumn(boardId, nome, cor) {
  const { data, error } = await supabase.rpc('api_criar_coluna_kanban', {
    p_board_id: boardId,
    p_nome: nome.trim(),
    p_cor: cor ?? '#E5E7EB'
  });

  if (error) throw error;

  // A função retorna o ID, buscar dados completos
  const { data: colData } = await supabase
    .from('kanban_colunas')
    .select('id, nome, pos, cor')
    .eq('id', data)
    .maybeSingle();

  return colData;
}

/**
 * Renomeia uma coluna existente
 * Usa a função SQL api_renomear_coluna_kanban
 */
export async function renameColumn(columnId, nome) {
  const { data, error } = await supabase.rpc('api_renomear_coluna_kanban', {
    p_coluna_id: columnId,
    p_novo_nome: nome.trim()
  });

  if (error) throw error;

  // A função retorna o ID, buscar dados completos
  const { data: colData } = await supabase
    .from('kanban_colunas')
    .select('id, nome, pos, cor')
    .eq('id', data)
    .maybeSingle();

  return colData;
}

/**
 * Move um card para outra coluna ou posição
 * Usa a função SQL api_mover_card_kanban
 */
export async function moveCard(cardId, novaColunaId, novaOrdem) {
  const { data, error } = await supabase.rpc('api_mover_card_kanban', {
    p_card_id: cardId,
    p_nova_coluna_id: novaColunaId,
    p_nova_ordem: novaOrdem
  });

  if (error) throw error;
  return data;
}

/**
 * Atualiza dados de um card
 * Usa a função SQL api_atualizar_card_kanban
 */
export async function updateCard(cardId, dados) {
  const { data, error } = await supabase.rpc('api_atualizar_card_kanban', {
    p_card_id: cardId,
    p_dados: dados
  });

  if (error) throw error;
  return data;
}

/**
 * Deleta um card (soft delete)
 * Usa a função SQL api_deletar_card_kanban
 */
export async function deleteCard(cardId) {
  const { data, error } = await supabase.rpc('api_deletar_card_kanban', {
    p_card_id: cardId
  });

  if (error) throw error;
  return data;
}