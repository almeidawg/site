import { corsHeaders } from "./cors.ts";
const API_URL = "https://brasilapi.com.br/api/feriados/v1/";
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { ano, uf, municipio } = await req.json();
    if (!ano) {
      return new Response(JSON.stringify({
        error: "O ano é obrigatório."
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    const response = await fetch(`${API_URL}${ano}`);
    if (!response.ok) {
      throw new Error("Falha ao buscar feriados nacionais.");
    }
    const feriados = await response.json();
    const feriadosFormatados = feriados.map((f)=>({
        data: f.date,
        nome: f.name,
        tipo: 'nacional'
      }));
    // Simulação para feriados estaduais/municipais, já que a API não suporta diretamente
    // Em um caso real, conectaríamos a outras fontes ou a uma tabela no Supabase
    const feriadosLocaisSimulados = [];
    if (uf === 'SP') {
      feriadosLocaisSimulados.push({
        data: `${ano}-07-09`,
        nome: 'Revolução Constitucionalista',
        tipo: 'estadual'
      });
      if (municipio.toLowerCase() === 'sao paulo') {
        feriadosLocaisSimulados.push({
          data: `${ano}-01-25`,
          nome: 'Aniversário de São Paulo',
          tipo: 'municipal'
        });
        feriadosLocaisSimulados.push({
          data: `${ano}-11-20`,
          nome: 'Dia da Consciência Negra',
          tipo: 'municipal'
        });
      }
    }
    const todosFeriados = [
      ...feriadosFormatados,
      ...feriadosLocaisSimulados
    ];
    return new Response(JSON.stringify({
      ok: true,
      feriados: todosFeriados
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
