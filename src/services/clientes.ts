// services/clientes.ts
import { supabase } from '@/lib/supabaseClient';
import type { Cliente } from '@/types/wgeasy';

export async function criarCliente(payload: Omit<Cliente, 'id'>) {
  const { data, error } = await supabase
    .from('clientes')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Cliente;
}
