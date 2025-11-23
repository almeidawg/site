// src/config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

/**
 * Resolve a configuração do Supabase usando:
 * 1) Variáveis de ambiente do Vite (.env)
 * 2) Fallback via window.__WGEASY_SUPABASE__ (HTML)
 */
function resolveSupabaseConfig() {
  let url = import.meta.env.VITE_SUPABASE_URL;
  let anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fallback via script injetado no HTML
  if ((!url || !anonKey) && typeof window !== "undefined") {
    const globalCfg = window.__WGEASY_SUPABASE__;
    if (globalCfg?.url && globalCfg?.anonKey) {
      url = globalCfg.url;
      anonKey = globalCfg.anonKey;
    }
  }

  // Se ainda estiver faltando algo, erro direto
  if (!url || !anonKey) {
    throw new Error(
      "Configuração do Supabase ausente. Defina .env ou window.__WGEASY_SUPABASE__."
    );
  }

  return { url, anonKey };
}

// Resolve configuração final
const { url, anonKey } = resolveSupabaseConfig();

// Exporta o client oficial
export const supabase = createClient(url, anonKey);