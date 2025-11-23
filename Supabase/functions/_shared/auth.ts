/**
 * Auth Helpers para Edge Functions
 *
 * Funções auxiliares para autenticação e autorização
 */

import { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

/**
 * Extrai token JWT do header Authorization
 *
 * @param req - Request object
 * @returns Token JWT ou null
 */
export function getTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  // Bearer <token>
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}

/**
 * Verifica se usuário está autenticado
 *
 * @param supabase - Cliente Supabase
 * @param token - Token JWT
 * @returns User object ou null
 */
export async function getAuthenticatedUser(
  supabase: SupabaseClient,
  token: string
) {
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Middleware para verificar autenticação
 *
 * Retorna erro 401 se não autenticado
 */
export async function requireAuth(
  req: Request,
  supabase: SupabaseClient
): Promise<{ user: any; error?: Response }> {
  const token = getTokenFromHeader(req)

  if (!token) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  const user = await getAuthenticatedUser(supabase, token)

  if (!user) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return { user }
}
