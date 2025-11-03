import { corsHeaders } from './cors.ts';
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { to, text } = await req.json();
    const metaToken = Deno.env.get('META_WABA_TOKEN');
    const phoneId = Deno.env.get('META_PHONE_ID');
    if (!metaToken || !phoneId) {
      return new Response(JSON.stringify({
        error: "Missing WhatsApp API credentials"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${metaToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: text
        }
      })
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error("WhatsApp API error:", errorBody);
      return new Response(JSON.stringify({
        error: errorBody
      }), {
        status: res.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    return new Response(JSON.stringify({
      ok: true
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
