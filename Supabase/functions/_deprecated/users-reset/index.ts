import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from './cors.ts';
async function serve(req) {
  if (req.method === 'OPTIONS') return new Response('', {
    status: 204,
    headers: corsHeaders
  });
  try {
    const { email } = await req.json();
    if (!email) return json({
      error: 'email requerido'
    }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: Deno.env.get('INVITE_REDIRECT_URL')
    });
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
