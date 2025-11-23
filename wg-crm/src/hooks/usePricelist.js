import { supabase } from '@/lib/customSupabaseClient';
import { useQuery } from '@tanstack/react-query';

export function usePricelist(produtoServicoId) {

  return useQuery({
    queryKey: ['pricelist', produtoServicoId],
    queryFn: async () => {
      let query = supabase
        .from('pricelist')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (produtoServicoId) {
        query = query.eq('produto_servico_id', produtoServicoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }
  });
}

export function useCurrentPrice(produtoServicoId) {
  const hoje = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['current_price', produtoServicoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricelist')
        .select('*')
        .eq('produto_servico_id', produtoServicoId)
        .eq('ativo', true)
        .lte('validade_inicio', hoje)
        .or(`validade_fim.is.null,validade_fim.gte.${hoje}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!produtoServicoId
  });
}
