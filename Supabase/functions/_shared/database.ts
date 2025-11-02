/**
 * Database Helpers para Edge Functions
 *
 * Funções auxiliares para operações comuns de banco de dados
 */

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2'

/**
 * Cria cliente Supabase para Edge Function
 *
 * Usa Service Role Key para ter permissões completas
 */
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Busca URL da API baseado no ambiente (LOCAL ou LIVE)
 *
 * Usa função SQL get_api_url() para detectar automaticamente
 *
 * @returns URL da API (ex: http://127.0.0.1:54321 ou https://...)
 */
export async function getApiUrl(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc('get_api_url')

  if (error) {
    console.error('Erro ao buscar API URL:', error)
    // Fallback para LIVE se erro
    return 'https://vyxscnevgeubfgfstmtf.supabase.co'
  }

  return data as string
}

/**
 * Verifica se ambiente é LOCAL ou LIVE
 */
export async function isLocalEnvironment(supabase: SupabaseClient): Promise<boolean> {
  const url = await getApiUrl(supabase)
  return url.includes('127.0.0.1') || url.includes('localhost')
}
