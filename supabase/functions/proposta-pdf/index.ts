import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0';
import { corsHeaders } from './cors.ts';
async function loadTimbradoConfig(supabase) {
  const { data } = await supabase.from('config_sistema').select('valor').eq('chave', 'timbrado_a4').single();
  return data?.valor || {};
}
async function fetchAsUint8(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to fetch image: ${url}, status: ${res.status}`);
      return null;
    }
    const ab = await res.arrayBuffer();
    return new Uint8Array(ab);
  } catch (e) {
    console.error(`Error fetching image ${url}:`, e);
    return null;
  }
}
async function applyTimbrado(doc, cfg) {
  const [header, footer, bg] = await Promise.all([
    fetchAsUint8(cfg.header_url),
    fetchAsUint8(cfg.footer_url),
    fetchAsUint8(cfg.bg_url)
  ]);
  const m = cfg.margins || {
    top: 80,
    bottom: 80,
    left: 40,
    right: 40
  };
  doc.page.margins = {
    ...doc.page.margins,
    ...m
  };
  doc.y = m.top;
  const paint = ()=>{
    const { width, height, margins } = doc.page;
    if (bg) doc.image(bg, 0, 0, {
      width,
      height
    });
    if (header) {
      const imgWidth = width - margins.left - margins.right;
      doc.image(header, margins.left, 10, {
        width: imgWidth
      });
    }
    if (footer) {
      const imgWidth = width - margins.left - margins.right;
      const footerHeight = 60;
      doc.image(footer, margins.left, height - footerHeight - 10, {
        width: imgWidth
      });
    }
  };
  paint();
  doc.on('pageAdded', paint);
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { proposta_id } = await req.json();
    const { data: proposta, error } = await supabase.from('propostas_view').select('*').eq('id', proposta_id).single();
    if (error || !proposta) return new Response(JSON.stringify({
      error: 'Proposta não encontrada'
    }), {
      status: 404,
      headers: corsHeaders
    });
    const { data: itens } = await supabase.from('propostas_itens').select('nome, quantidade, valor_unitario, valor_total').eq('proposta_id', proposta_id).order('nome');
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });
    const timbradoCfg = await loadTimbradoConfig(supabase);
    await applyTimbrado(doc, timbradoCfg);
    const chunks = [];
    doc.on('data', (c)=>chunks.push(c));
    const done = new Promise((res)=>doc.on('end', ()=>res(new Uint8Array(Buffer.concat(chunks)))));
    doc.moveDown(2).fontSize(16).text('PROPOSTA COMERCIAL', {
      align: 'center'
    });
    doc.moveDown().fontSize(10).text(`Proposta Nº ${proposta.numero} — ${new Date(proposta.data_criacao).toLocaleDateString('pt-BR')}`);
    doc.moveDown().fontSize(10).text(`Cliente: ${proposta.cliente_nome}`);
    if (proposta.cliente_telefone || proposta.cliente_email) doc.text(`Contato: ${proposta.cliente_telefone || ''} / ${proposta.cliente_email || ''}`);
    if (proposta.descricao) {
      doc.moveDown().fontSize(10).text(proposta.descricao, {
        align: 'justify'
      });
    }
    if (itens && itens.length) {
      doc.moveDown().fontSize(11).text('Itens', {
        underline: true
      });
      itens.forEach((it, i)=>{
        doc.fontSize(10).text(`${i + 1}. ${it.nome} — ${Number(it.quantidade).toFixed(2)} x ${Number(it.valor_unitario).toFixed(2)} = ${Number(it.valor_total).toFixed(2)}`);
      });
    }
    doc.moveDown().fontSize(11).text(`Valor Total: ${Number(proposta.valor_total || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })}`, {
      align: 'right'
    });
    if (proposta.validade) doc.text(`Validade: ${new Date(proposta.validade).toLocaleDateString('pt-BR')}`, {
      align: 'right'
    });
    doc.moveDown(3).fontSize(10).text('Atenciosamente,');
    doc.text('Grupo WG Almeida — Arquitetura | Engenharia | Marcenaria');
    doc.end();
    const pdf = await done;
    const filename = `propostas/${proposta.numero}.pdf`;
    const { error: upErr } = await supabase.storage.from('pdf').upload(filename, pdf, {
      contentType: 'application/pdf',
      upsert: true
    });
    if (upErr) throw upErr;
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
      headers: corsHeaders
    });
  }
});
