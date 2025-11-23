import { corsHeaders } from "./cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0';
// @ts-ignore
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";
export default (async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { assistencia_id } = await req.json();
    const { data: a, error } = await supabase.from('assistencias').select('*, cliente:cliente_id(nome_razao_social)').eq('id', assistencia_id).single();
    if (error || !a) return new Response(JSON.stringify({
      error: 'Assistência não encontrada'
    }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    const doc = new PDFDocument({
      size: 'A4',
      margin: 36
    });
    const chunks = [];
    doc.on('data', (c)=>chunks.push(c));
    const done = new Promise((res)=>doc.on('end', ()=>res(new Uint8Array(Buffer.concat(chunks)))));
    doc.fontSize(14).text('Solicitação de Assistência', {
      align: 'center'
    });
    doc.moveDown();
    doc.fontSize(10).text(`Cliente: ${a.cliente.nome_razao_social}`);
    doc.text(`Descrição: ${a.descricao}`);
    doc.text(`Status: ${a.status}`);
    doc.text(`Criado em: ${new Date(a.created_at).toLocaleString('pt-BR')}`);
    doc.end();
    const pdf = await done;
    const filename = `assistencias/${a.id}.pdf`;
    await supabase.storage.from('pdf').upload(filename, pdf, {
      contentType: 'application/pdf',
      upsert: true
    });
    const { data: pub } = supabase.storage.from('pdf').getPublicUrl(filename);
    return new Response(JSON.stringify({
      url: pub.publicUrl
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (e) {
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
