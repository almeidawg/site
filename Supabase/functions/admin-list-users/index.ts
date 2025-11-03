import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.30.0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s)=>s.trim()).filter(Boolean);
function matchesWildcard(origin, pattern) {
  try {
    const o = new URL(origin);
    const marker = "SUBDOMAIN.";
    const withMarker = pattern.replace("*.", marker);
    const p = new URL(withMarker);
    if (pattern.includes("*.")) {
      const hostSuffix = p.host.replace(marker, "");
      return o.protocol === p.protocol && o.host.endsWith(hostSuffix);
    }
    return origin === pattern;
  } catch  {
    return false;
  }
}
function isOriginAllowed(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes("*")) return true;
  return ALLOWED_ORIGINS.some((p)=>matchesWildcard(origin, p));
}
const corsHeaders = (origin)=>({
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Content-Type": "application/json; charset=utf-8"
  });
serve(async (req)=>{
  const origin = req.headers.get("origin") ?? "";
  const allow = isOriginAllowed(origin);
  const headers = corsHeaders(allow ? origin : "*");
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({
      error: "Server misconfigured: missing envs"
    }), {
      status: 500,
      headers
    });
  }
  if (!allow) {
    return new Response(JSON.stringify({
      error: "Origin not allowed",
      origin
    }), {
      status: 403,
      headers
    });
  }
  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const userJwt = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!userJwt) {
      return new Response(JSON.stringify({
        error: 'Missing authorization'
      }), {
        status: 401,
        headers
      });
    }
    const { data: { user: invokerUser }, error: invokerError } = await createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${userJwt}`
        }
      }
    }).auth.getUser();
    if (invokerError || !invokerUser) {
      return new Response(JSON.stringify({
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers
      });
    }
    const { data: invokerProfile } = await supabaseAdmin.from('user_profiles').select('role, master').eq('user_id', invokerUser.id).single();
    if (!invokerProfile?.master && ![
      'admin',
      'gestor'
    ].includes(invokerProfile?.role)) {
      return new Response(JSON.stringify({
        error: 'Permission denied'
      }), {
        status: 403,
        headers
      });
    }
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    });
    if (authError) {
      throw authError;
    }
    return new Response(JSON.stringify(authUsers), {
      status: 200,
      headers
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e.message
    }), {
      status: 500,
      headers
    });
  }
});
