/**
 * Edge Function: hello-world
 *
 * Exemplo de Edge Function usando:
 * - CORS helpers (_shared/cors.ts)
 * - Database helpers (_shared/database.ts)
 * - Sistema de URL dinâmica (get_api_url)
 * - Response types (_shared/types.ts)
 *
 * Teste local:
 * curl -X POST http://localhost:54321/functions/v1/hello-world \
 *   -H "Authorization: Bearer <ANON_KEY>" \
 *   -H "Content-Type: application/json" \
 *   -d '{"name": "Valdair"}'
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCorsPreFlight } from '../../_shared/cors.ts'
import { createSupabaseClient, getApiUrl, isLocalEnvironment } from '../../_shared/database.ts'
import { createSuccessResponse, createErrorResponse } from '../../_shared/types.ts'

// Interface para o body da requisição
interface RequestBody {
  name?: string
}

serve(async (req) => {
  // ==========================================
  // 1. CORS Preflight
  // ==========================================
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight()
  }

  try {
    // ==========================================
    // 2. Criar cliente Supabase
    // ==========================================
    const supabase = createSupabaseClient()

    // ==========================================
    // 3. Buscar URL dinâmica (detecta LOCAL/LIVE)
    // ==========================================
    const apiUrl = await getApiUrl(supabase)
    const isLocal = await isLocalEnvironment(supabase)

    // ==========================================
    // 4. Parse do body
    // ==========================================
    let body: RequestBody = {}
    try {
      body = await req.json()
    } catch {
      // Body vazio ou inválido - não é erro
    }

    // ==========================================
    // 5. Lógica da função
    // ==========================================
    const name = body.name || 'World'
    const message = `Hello, ${name}!`

    // Exemplo: Query no banco de dados
    const { data: configData } = await supabase
      .from('app_config')
      .select('key, value')
      .limit(3)

    // ==========================================
    // 6. Montar response
    // ==========================================
    const responseData = {
      message,
      environment: isLocal ? 'LOCAL (Docker)' : 'LIVE (Cloud)',
      api_url: apiUrl,
      timestamp: new Date().toISOString(),
      config_sample: configData || []
    }

    // Log no console (visível em supabase logs)
    console.log('hello-world executed:', {
      environment: isLocal ? 'local' : 'live',
      apiUrl
    })

    // ==========================================
    // 7. Retornar response de sucesso
    // ==========================================
    return new Response(
      JSON.stringify(createSuccessResponse(responseData, message)),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    )

  } catch (error) {
    // ==========================================
    // 8. Tratamento de erros
    // ==========================================
    console.error('Erro em hello-world:', error.message)

    return new Response(
      JSON.stringify(createErrorResponse(
        'Erro ao processar requisição',
        { message: error.message }
      )),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
