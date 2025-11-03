import { corsHeaders } from "./cors.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
// deno-lint-ignore-file no-explicit-any
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { url } = await req.json();
    if (!url || !URL.canParse(url)) {
      return new Response(JSON.stringify({
        error: 'URL inválida fornecida.'
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `Falha ao buscar a página. Status: ${response.status}`
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: response.status
      });
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    let productData;
    const jsonLdScript = $('script[type="application/ld+json"]');
    jsonLdScript.each((_, el)=>{
      try {
        const scriptContent = $(el).html();
        if (scriptContent) {
          const parsedData = JSON.parse(scriptContent);
          // Find the main product data in case of multiple ld+json blocks
          if (parsedData['@type'] === 'Product' || Array.isArray(parsedData['@graph']) && parsedData['@graph'].some((item)=>item['@type'] === 'Product')) {
            productData = parsedData;
            return false; // break the loop
          }
        }
      } catch (e) {
      // Ignore parsing errors for invalid JSON-LD blocks
      }
    });
    if (!productData) {
      return new Response(JSON.stringify({
        error: "Não foi possível encontrar os dados estruturados (JSON-LD) do produto na página."
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 404
      });
    }
    const productGraph = productData['@graph'];
    const productInfo = productGraph ? productGraph.find((item)=>item['@type'] === 'Product') : productData['@type'] === 'Product' ? productData : null;
    if (!productInfo) {
      return new Response(JSON.stringify({
        error: "Dados do produto não encontrados no JSON-LD."
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 404
      });
    }
    const description = productInfo.name || "Descrição não encontrada";
    const image = productInfo.image ? Array.isArray(productInfo.image) ? productInfo.image[0] : productInfo.image : null;
    let price = 0;
    if (productInfo.offers) {
      const offer = Array.isArray(productInfo.offers) ? productInfo.offers[0] : productInfo.offers;
      const priceString = offer.price || offer.lowPrice;
      if (priceString) {
        price = parseFloat(String(priceString).replace(',', '.')) || 0;
      }
    }
    const scrapedData = {
      description,
      price,
      image
    };
    return new Response(JSON.stringify(scrapedData), {
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
