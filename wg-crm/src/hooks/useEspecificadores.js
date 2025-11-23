import { supabase } from '@/lib/customSupabaseClient';
import { useQuery } from '@tanstack/react-query';

export function useEspecificadores() {

  return useQuery({
    queryKey: ['especificadores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('especificadores')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    }
  });
}

export function useEspecificador(id) {

  return useQuery({
    queryKey: ['especificador', id],
    queryFn: async () => {
      const { data, error} = await supabase
        .from('especificadores')
        .select(`
          *,
          especificador_comissao_niveis(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}
