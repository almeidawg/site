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
    const { entity_id } = await req.json();
    const supa = createClient(URL, SRK);
    const { data: ent, error } = await supa.from('entities').select('*').eq('id', entity_id).maybeSingle();
    if (error || !ent) throw new Error('Cadastro não encontrado');
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([
      595.28,
      841.89
    ]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    let y = 800;
    const draw = (k, v)=>{
      page.drawText(`${k}: ${v ?? ''}`, {
        x: 40,
        y,
        size: 11,
        font
      });
      y -= 16;
    };
    page.drawText('Ficha Cadastral', {
      x: 40,
      y,
      size: 16
    });
    y -= 28;
    draw('Nome/Razão Social', ent.nome_razao_social);
    draw('Tipo', ent.tipo);
    draw('CPF/CNPJ', ent.cpf_cnpj);
    draw('Telefone', ent.telefone);
    draw('Email', ent.email);
    const endereco = ent.endereco ? typeof ent.endereco === 'string' ? JSON.parse(ent.endereco) : ent.endereco : {};
    const enderecoStr = `${endereco.logradouro || ''}, ${endereco.numero || ''} - ${endereco.bairro || ''}, ${endereco.cidade || ''}/${endereco.uf || ''} - CEP: ${endereco.cep || ''}`;
    draw('Endereço', enderecoStr);
    const bytes = await pdf.save();
    return new Response(bytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf"
      }
    });
  } catch (e) {
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
