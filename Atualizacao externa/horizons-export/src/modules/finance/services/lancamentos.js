import { supabase } from '@/lib/customSupabaseClient';

const TABLE = 'fin_transactions';

/**
 * @returns {Promise<import('../types').Lancamento[]>}
 */
export async function listLancamentos() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      party:party_id ( name ),
      category:category_id ( name ),
      account:account_id ( name ),
      project:project_id ( nome_razao_social )
    `)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(item => ({
    ...item,
    party_name: item.party?.name,
    category_name: item.category?.name,
    account_name: item.account?.name,
    project_name: item.project?.nome_razao_social,
  }));
}

/**
 * @param {string} id
 * @returns {Promise<import('../types').Lancamento>}
 */
export async function duplicateLancamento(id) {
    const { data, error } = await supabase.rpc('fin_txn_duplicate', { p_id: id });
    if (error) throw error;
    return data;
}

/**
 * @param {string} id
 * @param {Partial<import('../types').Lancamento>} patch
 * @returns {Promise<import('../types').Lancamento>}
 */
export async function updateLancamento(id, patch) {
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  const { data, error } = await supabase.from(TABLE).update(clean).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function softDeleteLancamento(id) {
    const { error } = await supabase.rpc('fin_txn_soft_delete', { p_id: id });
    if (error) throw error;
}

/**
 * @returns {Promise<void>}
 */
export async function deleteAllLancamentos() {
    const { error } = await supabase.from(TABLE).delete().not('id', 'is', null);
    if (error) throw error;
}


/**
 * @param {Partial<import('../types').Lancamento>} payload
 * @returns {Promise<import('../types').Lancamento>}
 */
export async function createLancamento(payload) {
    const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
    const { data, error } = await supabase.from(TABLE).insert(clean).select().single();
    if (error) throw error;
    return data;
}