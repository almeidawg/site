import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0';
import { corsHeaders } from './cors.ts';
// Helper function to fetch images as Uint8Array
async function fetchImage(url) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${url}, status: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (e) {
    console.error(`Error fetching image ${url}:`, e);
    return null;
  }
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { html, contrato_id, contrato_numero, contrato_codigo, path: customPath } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    let contrato = null;
    if (contrato_id || contrato_numero || contrato_codigo) {
      let query = supabase.from("contratos_view").select("*").limit(1);
      if (contrato_id) query = query.eq("id", contrato_id);
      else if (contrato_numero) query = query.eq("numero", contrato_numero);
      else if (contrato_codigo) query = query.eq("codigo", contrato_codigo);
      const { data: contractData, error: contractError } = await query.single();
      if (contractError || !contractData) {
        return new Response(JSON.stringify({
          error: "Contrato não encontrado"
        }), {
          status: 404,
          headers: corsHeaders
        });
      }
      contrato = contractData;
    }
    const path = customPath || (contrato ? `contratos/${contrato.numero || contrato.codigo || contrato.id}.pdf` : null);
    if (!path) {
      return new Response(JSON.stringify({
        error: "Parâmetro 'path' é obrigatório quando nenhum contrato é informado."
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // PDF Generation with PDFKit
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    // --- PDF Content ---
    doc.fontSize(18).text('Contrato de Prestação de Serviço', {
      align: 'center'
    });
    doc.moveDown();
    if (contrato) {
      doc.fontSize(12).text(`Contrato Nº: ${contrato.numero || 'N/A'}`);
      doc.text(`Cliente: ${contrato.cliente_nome || 'N/A'}`);
      doc.text(`CPF/CNPJ: ${contrato.cpf_cnpj || 'N/A'}`);
      doc.moveDown();
    }
    if (html) {
      // Basic HTML to text conversion (replace with a more robust parser if needed)
      const textContent = html.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n').trim();
      doc.fontSize(10).text(textContent, {
        align: 'justify'
      });
    } else {
      doc.fontSize(10).text('O conteúdo do contrato (parâmetro "html") não foi fornecido.', {
        align: 'center'
      });
    }
    doc.end();
    const pdfPromise = new Promise((resolve)=>{
      doc.on('end', ()=>{
        const pdfData = new Uint8Array(Buffer.concat(buffers));
        resolve(pdfData);
      });
    });
    const pdfBytes = await pdfPromise;
    const { error: uploadError } = await supabase.storage.from("pdfs").upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true
    });
    if (uploadError) {
      return new Response(JSON.stringify({
        error: `Falha no upload do PDF: ${uploadError.message}`
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from("pdfs").createSignedUrl(path, 3600); // 1 hour
    if (signedUrlError) {
      return new Response(JSON.stringify({
        error: `Falha ao assinar URL: ${signedUrlError.message}`
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    return new Response(JSON.stringify({
      url: signedUrlData.signedUrl,
      path
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e.toString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
