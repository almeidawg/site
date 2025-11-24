import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
// Simulação de PDF para contornar limitações do ambiente Deno Deploy
async function generatePdfFromHtml(htmlContent) {
  const { PDFDocument, rgb, StandardFonts } = await import("https://cdn.skypack.dev/pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText('--- PDF Gerado via Edge Function ---', {
    x: 50,
    y: height - 50,
    font,
    size: 18,
    color: rgb(0.1, 0.1, 0.1)
  });
  // Limpa tags HTML para uma visualização de texto simples no PDF
  const cleanText = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s\s+/g, ' ').trim();
  page.drawText(cleanText.substring(0, 4000), {
    x: 50,
    y: height - 100,
    font,
    size: 10,
    color: rgb(0, 0, 0),
    maxWidth: width - 100,
    lineHeight: 14
  });
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { html, path } = await req.json();
    if (!html || !path) {
      return new Response(JSON.stringify({
        error: "Parâmetros 'html' e 'path' são obrigatórios."
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const pdf = await generatePdfFromHtml(html);
    const { error: uploadError } = await supabaseAdmin.storage.from("pdfs").upload(path, pdf, {
      contentType: "application/pdf",
      upsert: true
    });
    if (uploadError) {
      console.error("Erro no upload do PDF:", uploadError);
      throw uploadError;
    }
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage.from("pdfs").createSignedUrl(path, 60 * 60); // URL válida por 1 hora
    if (signedUrlError) {
      console.error("Erro ao gerar URL assinada:", signedUrlError);
      throw signedUrlError;
    }
    return new Response(JSON.stringify({
      url: signedUrlData?.signedUrl
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (e) {
    console.error("Erro fatal na função 'pdf-generate':", e);
    return new Response(JSON.stringify({
      error: e.message || 'Erro interno do servidor.'
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
