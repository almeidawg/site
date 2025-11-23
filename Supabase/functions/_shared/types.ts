/**
 * Types compartilhados entre Edge Functions
 *
 * Defina aqui types/interfaces usados em múltiplas functions
 */

/**
 * Response padrão de sucesso
 */
export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

/**
 * Response padrão de erro
 */
export interface ErrorResponse {
  success: false
  error: string
  details?: any
}

/**
 * Response genérico (sucesso ou erro)
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

/**
 * Helper para criar response de sucesso
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  }
}

/**
 * Helper para criar response de erro
 */
export function createErrorResponse(
  error: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error,
    ...(details && { details })
  }
}
