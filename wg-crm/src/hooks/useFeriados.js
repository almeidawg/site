import { supabase } from '@/lib/customSupabaseClient';
import { useQuery } from '@tanstack/react-query';

export function useFeriados(ano) {

  return useQuery({
    queryKey: ['feriados', ano],
    queryFn: async () => {
      let query = supabase
        .from('feriados')
        .select('*')
        .order('data');

      if (ano) {
        query = query.gte('data', `${ano}-01-01`).lte('data', `${ano}-12-31`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }
  });
}
