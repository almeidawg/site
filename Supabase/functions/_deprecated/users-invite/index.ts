import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from './cors.ts';
async function serve(req) {
  if (req.method === 'OPTIONS') return new Response('', {
    status: 204,
    headers: corsHeaders
  });
  try {
    const { email, nome, role = 'operacional', sendEmail = true } = await req.json();
    if (!email) return json({
      error: 'email requerido'
    }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: nome,
        nome: nome,
        role: role
      }
    });
    if (error) {
      if (error.message.includes('User already registered')) {
        return json({
          error: 'Este e-mail já está cadastrado no sistema.'
        }, 409);
      }
      return json({
        error: error.message
      }, 500);
    }
    const userId = created.user.id;
    const { error: profileError } = await admin.from('user_profiles').upsert({
      user_id: userId,
      nome,
      role
    }, {
      onConflict: 'user_id'
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(userId);
      return json({
        error: `Falha ao criar perfil: ${profileError.message}`
      }, 500);
    }
    if (sendEmail) {
      const { error: linkError } = await admin.auth.admin.generateLink({
        type: 'invite',
        email
      });
      if (linkError) {
        return json({
          error: `Usuário criado, mas falha ao enviar convite: ${linkError.message}`
        }, 500);
      }
    }
    return json({
      ok: true,
      user_id: userId
    });
  } catch (e) {
    return json({
      error: String(e.message || e)
    }, 500);
  }
}
Deno.serve(serve);
