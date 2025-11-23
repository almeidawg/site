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
    const { cliente_id } = await req.json();
    const { data: c, error: clientError } = await supabase.from('entities').select(`
        *,
        bank_accounts(*)
    `).eq('id', cliente_id).single();
    if (clientError || !c) return new Response(JSON.stringify({
      error: 'Cliente não encontrado'
    }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    const principalAccount = c.bank_accounts.find((acc)=>acc.is_principal) || c.bank_accounts[0];
    const doc = new PDFDocument({
      size: 'A4',
      margin: 36
    });
    const chunks = [];
    doc.on('data', (chunk)=>chunks.push(chunk));
    const done = new Promise((res)=>doc.on('end', ()=>res(new Uint8Array(Buffer.concat(chunks)))));
    doc.fontSize(14).text('Ficha Cadastral do Cliente', {
      align: 'center'
    });
    doc.moveDown();
    doc.fontSize(10).text(`Nome: ${c.nome_razao_social}`);
    doc.text(`Telefone: ${c.telefone || 'N/A'}`);
    doc.text(`E-mail: ${c.email || 'N/A'}`);
    doc.text(`CPF/CNPJ: ${c.cpf_cnpj || 'N/A'}`);
    if (principalAccount) {
      doc.text(`Banco: ${principalAccount.banco || 'N/A'} Agência: ${principalAccount.agencia || 'N/A'} Conta: ${principalAccount.conta || 'N/A'}`);
      doc.text(`Chave PIX: ${principalAccount.pix_chave || 'N/A'}`);
    }
    doc.end();
    const pdf = await done;
    const filename = `fichas/${c.id}.pdf`;
    const { error: uploadError } = await supabase.storage.from('pdf').upload(filename, pdf, {
      contentType: 'application/pdf',
      upsert: true
    });
    if (uploadError) throw uploadError;
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
