import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    const { data, error } = await supabase.from('lancamentos').select('sdp, criado_em, periodo_fim, total, status').eq('status', 'Previsto').gte('periodo_fim', today.toISOString().split('T')[0]).lte('periodo_fim', threeDaysFromNow.toISOString().split('T')[0]);
    if (error) {
      console.error("Supabase error fetching due payments:", error.message);
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
    if ((data || []).length > 0) {
      const linhas = data.map((l)=>`SDP ${l.sdp} — Venc: ${new Date(l.periodo_fim).toLocaleDateString('pt-BR')} — Total: ${Number(l.total).toFixed(2)}`).join('<br/>');
      const emailPayload = {
        assunto: 'Vencimentos nos próximos 3 dias',
        conteudo: `<p>${linhas}</p>`,
        to: 'financeiro@wgalmeida.com.br' // Replace with actual email
      };
      // Invoke the notify-email function
      const { error: emailError } = await supabase.functions.invoke('notify-email', {
        body: JSON.stringify(emailPayload)
      });
      if (emailError) {
        console.error("Error invoking notify-email function:", emailError.message);
      }
    }
    return new Response(JSON.stringify({
      ok: true,
      count: (data || []).length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error("Function error:", err.message);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
