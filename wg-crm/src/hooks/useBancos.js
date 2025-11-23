import { supabase } from '@/lib/customSupabaseClient';
import { useQuery } from '@tanstack/react-query';

export function useBancos() {

  return useQuery({
    queryKey: ['bancos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bancos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    }
  });
}