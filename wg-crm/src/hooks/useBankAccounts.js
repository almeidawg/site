import { supabase } from '@/lib/customSupabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useBankAccounts(entityId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['bank_accounts', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('entity_id', entityId)
        .order('is_principal', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!entityId
  });

  const addAccount = useMutation({
    mutationFn: async (newAccount) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({ ...newAccount, entity_id: entityId })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_accounts', entityId] });
    }
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_accounts', entityId] });
    }
  });

  const deleteAccount = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_accounts', entityId] });
    }
  });

  return {
    ...query,
    addAccount,
    updateAccount,
    deleteAccount
  };
}
