import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente ao invés de hardcoded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vyxscnevgeubfgfstmtf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eHNjbmV2Z2V1YmZnZnN0bXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjg4NDAsImV4cCI6MjA0MzkwNDg0MH0.vASLp5xGGmW3KpD6C2xCGrW1X9R7gJKvM_4vK4YPpRU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);