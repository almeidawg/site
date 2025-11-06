export const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    export function json(body: any, status = 200, headers: Record<string, string> = {}) {
      return new Response(JSON.stringify(body), {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...headers,
        },
      });
    }