/**
 * CORS Headers para Edge Functions
 *
 * Use em todas as functions para permitir requisições do frontend
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

/**
 * Handler para requisições OPTIONS (CORS preflight)
 *
 * Use no início de cada Edge Function:
 *
 * @example
 * import { corsHeaders, handleCorsPreFlight } from '../_shared/cors.ts'
 *
 * serve(async (req) => {
 *   if (req.method === 'OPTIONS') {
 *     return handleCorsPreFlight()
 *   }
 *   // ... resto da lógica
 * })
 */
export function handleCorsPreFlight(): Response {
  return new Response('ok', {
    headers: corsHeaders,
    status: 200
  })
}
