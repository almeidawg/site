// hooks/useClientes.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente } from '@/types/wgeasy';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar clientes', error);
      } else {
        setClientes(data as Cliente[]);
      }
      setLoading(false);
    };

    fetchClientes();
  }, []);

  return { clientes, loading };
}
