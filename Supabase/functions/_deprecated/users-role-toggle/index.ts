import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from './cors.ts';
async function serve(req) {
  if (req.method === 'OPTIONS') return new Response('', {
    status: 204,
    headers: corsHeaders
  });
  try {
    const { user_id, role, ativo } = await req.json();
    if (!user_id) return json({
      error: 'user_id é obrigatório'
    }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const updatePayload = {};
    if (role) updatePayload.role = role;
    if (typeof ativo === 'boolean') updatePayload.ativo = ativo;
    if (Object.keys(updatePayload).length === 0) {
      return json({
        error: 'Nenhum dado para atualizar (role ou ativo)'
      }, 400);
    }
    const { error } = await admin.from('user_profiles').update(updatePayload).eq('user_id', user_id);
    if (error) return json({
      error: error.message
    }, 500);
    return json({
      ok: true
    });
  } catch (e) {
    return json({
      error: String(e.message || e)
    }, 500);
  }
}
Deno.serve(serve);
