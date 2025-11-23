// sheets-import-clientes/index.ts
// Função mínima só para validar deploy e conexão.
// Depois podemos trocar a lógica interna para fazer o import real da planilha.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Aqui futuramente entra a lógica de:
    // - ler Google Sheets
    // - sincronizar com tabela de clientes no Supabase
    // Por enquanto, apenas confirmamos que a função está operacional.

    const body = {
      ok: true,
      function: "sheets-import-clientes",
      message: "Função publicada e respondendo com sucesso.",
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const body = {
      ok: false,
      function: "sheets-import-clientes",
      error: String(error),
    };

    return new Response(JSON.stringify(body), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
