import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('contratos')
        .select(`
          *,
          cliente:entities(id, nome, nome_razao_social),
          proposta:propostas(id, numero)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setContracts(data || []);
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError(err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    refetch: fetchContracts,
  };
};
