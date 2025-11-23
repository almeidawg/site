/**
 * @typedef {'income' | 'expense'} TipoLancamento
 */

/**
 * @typedef {object} Lancamento
 * @property {string} id
 * @property {string} org_id
 * @property {string} account_id
 * @property {string | null} category_id
 * @property {string | null} party_id
 * @property {TipoLancamento} type
 * @property {number} amount
 * @property {string} currency
 * @property {string | null} description
 * @property {string | null} notes
 * @property {string} occurred_at - 'YYYY-MM-DD'
 * @property {boolean} cleared
 * @property {string | null} cleared_at
 * @property {string} recurrence
 * @property {string | null} recurrence_ref
 * @property {string | null} external_ref
 * @property {string} created_by
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} deleted_at
 * @property {string | null} project_id
 * @property {string[] | null} tags
 * @property {number | null} quantity
 * @property {string | null} unit
 * @property {number | null} unit_price
 * 
 * // Campos de JOIN
 * @property {string | null} [party_name]
 * @property {string | null} [category_name]
 * @property {string | null} [account_name]
 * @property {string | null} [project_name]
 */

/**
 * Formats a number into BRL currency format.
 * @param {number} n The number to format.
 * @returns {string} The formatted currency string.
 */
export function brl(n) {
  return (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}