import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { corsHeaders } from "./cors.ts";
const URL = Deno.env.get("SUPABASE_URL");
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { filtros } = await req.json();
    const supa = createClient(URL, SRK);
    let query = supa.from('lancamentos_view').select(`
      data_pagamento, criado_em, tipo, categoria, favorecido_nome, descricao, total, status
    `);
    if (filtros?.tipo && filtros.tipo !== 'todos') query = query.eq('tipo', filtros.tipo);
    if (filtros?.categoria_id) query = query.eq('categoria_id', filtros.categoria_id);
    if (filtros?.centro_custo_cliente_id) query = query.eq('centro_custo_cliente_id', filtros.centro_custo_cliente_id);
    if (filtros?.favorecido_id) query = query.eq('favorecido_id', filtros.favorecido_id);
    if (filtros?.status && filtros.status !== 'todos') query = query.eq('status', filtros.status);
    if (filtros?.de) query = query.gte('data_pagamento', filtros.de);
    if (filtros?.ate) query = query.lte('data_pagamento', filtros.ate);
    if (filtros?.reembolsavel && filtros.reembolsavel !== 'todos') {
      query = query.eq('reembolsavel', filtros.reembolsavel === 'true');
    }
    const { data, error } = await query.order('data_pagamento', {
      ascending: false
    });
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([
      595.28,
      841.89
    ]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 40;
    let y = height - margin;
    page.drawText('Relatório Financeiro', {
      x: margin,
      y,
      font: boldFont,
      size: 18
    });
    y -= 30;
    const headers = [
      'Data Pag.',
      'Tipo',
      'Categoria',
      'Favorecido',
      'Descrição',
      'Total'
    ];
    const colWidths = [
      70,
      50,
      100,
      110,
      125,
      70
    ];
    let x = margin;
    headers.forEach((header, i)=>{
      page.drawText(header, {
        x,
        y,
        font: boldFont,
        size: 10
      });
      x += colWidths[i];
    });
    y -= 20;
    const formatDate = (dateStr)=>dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
    const formatCurrency = (value)=>(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    for (const item of data || []){
      if (y < margin + 20) {
        page = pdfDoc.addPage([
          595.28,
          841.89
        ]);
        y = height - margin;
        // Redesenha cabeçalho na nova página
        let headerX = margin;
        headers.forEach((header, i)=>{
          page.drawText(header, {
            x: headerX,
            y,
            font: boldFont,
            size: 10
          });
          headerX += colWidths[i];
        });
        y -= 20;
      }
      const rowData = [
        formatDate(item.data_pagamento),
        item.tipo || '-',
        (item.categoria || '-').substring(0, 18),
        (item.favorecido_nome || '-').substring(0, 18),
        (item.descricao || '-').substring(0, 22),
        formatCurrency(item.total)
      ];
      let currentX = margin;
      rowData.forEach((text, i)=>{
        page.drawText(text, {
          x: currentX,
          y,
          font,
          size: 9
        });
        currentX += colWidths[i];
      });
      y -= 15;
    }
    const pdfBytes = await pdfDoc.save();
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf'
      }
    });
  } catch (e) {
    console.error('Error generating PDF:', e);
    return new Response(JSON.stringify({
      error: e.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
