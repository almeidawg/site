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
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: rows, error } = await supabase.from('lancamentos_view').select('*').order('criado_em');
    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const values = [
      [
        'ID',
        'SDP',
        'Criado Em',
        'Tipo',
        'Conta',
        'Centro de Custo',
        'Categoria',
        'Total',
        'Status'
      ]
    ];
    for (const r of rows || []){
      values.push([
        r.id,
        r.sdp || '',
        r.criado_em,
        r.tipo,
        r.conta_banco || '',
        r.centro_custo_cliente || '',
        r.categoria || '',
        r.total,
        r.status
      ]);
    }
    const sheetId = Deno.env.get('SHEET_LANCAMENTOS_ID');
    if (!sheetId) {
      throw new Error("Missing SHEET_LANCAMENTOS_ID environment variable");
    }
    const range = 'Lançamentos!A1';
    const response = await sheetsFetch(`spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW&includeValuesInResponse=false`, {
      method: 'PUT',
      body: JSON.stringify({
        range: range,
        majorDimension: 'ROWS',
        values
      })
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Google Sheets API error:', errorBody);
      throw new Error(`Google Sheets API request failed: ${errorBody}`);
    }
    return new Response(JSON.stringify({
      ok: true,
      rows: values.length - 1
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
