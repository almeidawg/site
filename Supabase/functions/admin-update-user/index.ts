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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
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
    const { data: invokerProfile } = await supabaseAdmin.from('user_profiles').select('master').eq('user_id', invokerUser.id).single();
    if (!invokerProfile?.master) {
      return new Response(JSON.stringify({
        error: 'Permission denied: not a master user'
      }), {
        status: 403,
        headers
      });
    }
    const { target_user_id, email, password } = await req.json();
    if (!target_user_id) {
      return new Response(JSON.stringify({
        error: "Target user ID is required"
      }), {
        status: 400,
        headers
      });
    }
    const updatePayload = {};
    if (email) updatePayload.email = email;
    if (password) updatePayload.password = password;
    if (Object.keys(updatePayload).length === 0) {
      return new Response(JSON.stringify({
        error: "Nothing to update. Provide email or password."
      }), {
        status: 400,
        headers
      });
    }
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(target_user_id, updatePayload);
    if (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 400,
        headers
      });
    }
    return new Response(JSON.stringify({
      ok: true,
      user: data.user
    }), {
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
