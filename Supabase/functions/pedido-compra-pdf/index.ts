import { corsHeaders } from "./cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0';
// @ts-ignore
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";
// Deno.serve(async (req) => {
export default (async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { pedido_id } = await req.json();
    if (!pedido_id) {
      return new Response(JSON.stringify({
        error: 'pedido_id é obrigatório'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Usando a view existente `purchase_orders` e `purchase_order_items`
    const { data: pedido, error: pedidoError } = await supabase.from('purchase_orders').select('codigo, entities!purchase_orders_fornecedor_id_fkey(nome_razao_social)').eq('id', pedido_id).single();
    if (pedidoError || !pedido) return new Response(JSON.stringify({
      error: 'Pedido não encontrado'
    }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    const { data: itens, error: itensError } = await supabase.from('purchase_order_items').select('*').eq('order_id', pedido_id);
    if (itensError) return new Response(JSON.stringify({
      error: 'Itens não encontrados'
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
    doc.fontSize(16).text('Pedido de Compra', {
      align: 'center'
    });
    doc.moveDown().fontSize(10).text(`Pedido: ${pedido.codigo} | Fornecedor: ${pedido.entities.nome_razao_social}`);
    doc.moveDown();
    (itens || []).forEach((it, i)=>{
      const total = it.quantidade * it.preco_unitario;
      doc.text(`${i + 1}. ${it.descricao} — ${it.quantidade} x ${it.preco_unitario.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })} = ${total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })}`);
    });
    doc.end();
    const pdfBytes = await done;
    const filename = `pedidos_compra/${pedido.codigo}.pdf`;
    const { error: upErr } = await supabase.storage.from('pdf').upload(filename, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true
    });
    if (upErr) return new Response(JSON.stringify({
      error: upErr.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
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
      error: String(e)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
