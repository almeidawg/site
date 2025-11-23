/**
 * API Configuration Constants
 */

// E-commerce API
export const ECOMMERCE_API_URL = "https://api-ecommerce.hostinger.com";
export const ECOMMERCE_STORE_ID = "store_01K7MR4A0XQDCXV5HWF92HNWHX";

// Supabase Configuration
// Note: These should be moved to environment variables in production
export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  // Add more endpoints as needed
};

// API Request Timeout
export const API_TIMEOUT = 30000; // 30 seconds
