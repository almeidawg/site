import { supabase } from '@/lib/customSupabaseClient';

export async function buscarProfissionais(term) {
  if (!term || term.length < 2) return [];
  const { data, error } = await supabase
    .from('entities')
    .select('id, nome_razao_social, tipo')
    .in('tipo', ['colaborador', 'fornecedor'])
    .ilike('nome_razao_social', `%${term}%`);
    
  if (error) {
    console.error('Erro buscando profissionais:', error);
    throw error;
  }
  return data || [];
}

export async function buscarClientes(term) {
  if (!term || term.length < 2) return [];
  const { data, error } = await supabase
    .from('entities')
    .select('id, nome_razao_social')
    .eq('tipo', 'cliente')
    .ilike('nome_razao_social', `%${term}%`);

  if (error) {
    console.error('Erro buscando clientes:', error);
    throw error;
  }
  return data || [];
}

export async function listarCategorias() {
  const { data, error } = await supabase
    .from('registro_categorias')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome');
  if (error) throw error;
  return data || [];
}

function sanitizeUUIDFields(obj) {
  const clean = { ...obj };
  for (const k in clean) {
    if (k.endsWith('_id') && typeof clean[k] === 'string' && clean[k].trim() === '') {
      clean[k] = null;
    }
  }
  return clean;
}

export async function criarRegistro(payload) {
  const cleanPayload = sanitizeUUIDFields(payload);
  const { data, error } = await supabase.from('registros_trabalho').insert([{
    ...cleanPayload,
    quantidade: cleanPayload.quantidade ?? 1
  }]).select('id').single();
  if (error) throw error;
  return data;
}

export async function listarRegistros({ from, to, profissional_id, cliente_id }) {
  let q = supabase.from('v_registros_trabalho').select('*').order('data', { ascending: false }).limit(30);
  if (from) q = q.gte('data', from);
  if (to) q = q.lte('data', to);
  if (profissional_id) q = q.eq('profissional_id', profissional_id);
  if (cliente_id) q = q.eq('cliente_id', cliente_id);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function listarPropostasDoCliente(clienteId) {
  if (!clienteId) return [];
  const { data, error } = await supabase
    .from('propostas')
    .select('id,codigo')
    .eq('cliente_id', clienteId)
    .order('codigo');
  if (error) throw error;
  return data || [];
}

export async function listarObrasDoCliente(clienteId) {
  if (!clienteId) return [];
  const { data, error } = await supabase
    .from('obras')
    .select('id,titulo')
    .eq('cliente_id', clienteId)
    .order('titulo');
  if (error) throw error;
  return data || [];
}

export async function uploadAnexos(registroId, files) {
  const results = [];
  for (const f of files) {
    const path = `${registroId}/${Date.now()}_${f.name}`;
    const { error } = await supabase.storage.from('registros').upload(path, f, { upsert: false });
    if (error) throw error;
    results.push(path);
  }
  
  const { error: upErr } = await supabase
    .from('registros_trabalho')
    .update({ anexos: results })
    .eq('id', registroId);
  if (upErr) throw upErr;
  return results;
}

export async function aprovarEGerarLancamento(registroId, aprovado, gerar) {
  const { data, error } = await supabase
    .from('registros_trabalho')
    .update({ aprovado, gerar_lancamento: gerar })
    .eq('id', registroId)
    .select('lancamento_id')
    .single();
  if (error) throw error;
  return data?.lancamento_id || null;
}