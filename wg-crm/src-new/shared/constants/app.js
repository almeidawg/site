/**
 * Application-wide Constants
 */

// App metadata
export const APP_NAME = 'CRM Grupo WG Almeida';
export const APP_DESCRIPTION = 'Sistema CRM completo para gestão de obras, marcenaria e loja online do Grupo WG Almeida';

// Logo
export const LOGO_URL = 'https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png';

// Date formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Currency
export const DEFAULT_CURRENCY = 'BRL';
export const CURRENCY_SYMBOL = 'R$';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Status colors
export const STATUS_COLORS = {
  SUCCESS: 'green',
  WARNING: 'yellow',
  ERROR: 'red',
  INFO: 'blue',
  PENDING: 'orange',
};

// Kanban columns (Oportunidades)
export const KANBAN_COLUMNS = {
  LEAD: 'lead',
  QUALIFICACAO: 'qualificacao',
  PROPOSTA: 'proposta',
  NEGOCIACAO: 'negociacao',
  GANHO: 'ganho',
  PERDIDO: 'perdido',
};

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
