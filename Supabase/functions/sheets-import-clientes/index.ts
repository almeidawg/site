import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { JWT } from 'https://esm.sh/google-auth-library@9.14.1';
import { corsHeaders } from './cors.ts';
async function getSheetsClient(scopes = [
  'https://www.googleapis.com/auth/spreadsheets'
]) {
  const client = new JWT({
    email: Deno.env.get('GOOGLE_SERVICE_EMAIL'),
    key: (Deno.env.get('GOOGLE_SERVICE_KEY') || '').replaceAll('\\n', '\n'),
    scopes
  });
  const token = await client.authorize();
  const accessToken = token.access_token;
  if (!accessToken) {
    throw new Error('Failed to get access token from Google');
  }
  return {
    accessToken
  };
}
async function sheetsFetch(path, init) {
  const { accessToken } = await getSheetsClient();
  const url = `https://sheets.googleapis.com/v4/${path}`;
  return fetch(url, {
    ...init || {},
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init?.headers || {}
    }
  });
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const sheetId = Deno.env.get('SHEET_CLIENTES_ID');
    if (!sheetId) {
      throw new Error("Missing SHEET_CLIENTES_ID environment variable");
    }
    const res = await sheetsFetch(`spreadsheets/${sheetId}/values/Clientes!A2:F9999`);
    const json = await res.json();
    const values = json.values || [];
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const payload = values.filter((r)=>r.length >= 2 && r[0] && r[1]).map((r)=>({
        id: r[0],
        nome_razao_social: r[1],
        nome_fantasia: r[2] || null,
        email: r[3] || null,
        telefone: r[4] || null,
        cpf_cnpj: r[5] || null,
        tipo: 'cliente',
        ativo: true
      }));
    if (payload.length === 0) {
      return new Response(JSON.stringify({
        ok: true,
        rows: 0,
        message: "No new data to import."
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { error } = await supabase.from('entities').upsert(payload, {
      onConflict: 'id'
    });
    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(error.message);
    }
    return new Response(JSON.stringify({
      ok: true,
      rows: payload.length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (e) {
    console.error('Function error:', e);
    return new Response(JSON.stringify({
      error: e.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
