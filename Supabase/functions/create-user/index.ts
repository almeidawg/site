import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.30.0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s)=>s.trim()).filter(Boolean);
const ROLE_ALLOWLIST = new Set([
  "admin",
  "gestor",
  "comercial",
  "operacional",
  "financeiro"
]);
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
  if (req.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers
  });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({
      error: "Server misconfigured: missing envs",
      stage: "env"
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
    const body = await req.json().catch(()=>({}));
    let { email, password, nome, telefone, role, autoConfirm = true, board } = body ?? {};
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: "Missing email or password",
        stage: "validate"
      }), {
        status: 400,
        headers
      });
    }
    if (!ROLE_ALLOWLIST.has(role)) role = "operacional";
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { data: { users } } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      email
    });
    if (users && users.length > 0) {
      return new Response(JSON.stringify({
        error: "Email already exists",
        stage: "auth.exists"
      }), {
        status: 409,
        headers
      });
    }
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: autoConfirm,
      user_metadata: {
        nome,
        telefone,
        role,
        board
      }
    });
    if (createErr || !created?.user) {
      const msg = createErr?.message ?? "Failed to create user";
      const code = /already|exists/i.test(msg) ? 409 : 400;
      return new Response(JSON.stringify({
        error: msg,
        stage: "auth.create"
      }), {
        status: code,
        headers
      });
    }
    const userId = created.user.id;
    const { error: profileErr } = await admin.from("user_profiles").insert({
      user_id: userId,
      nome: nome ?? null,
      telefone: telefone ?? null,
      role,
      ativo: true
    });
    if (profileErr) {
      let status = 500;
      let reason = `Profile insert failed: ${profileErr.message}`;
      if (profileErr.code === "23505") {
        status = 409;
        reason = "Profile insert failed: duplicate key";
      }
      if (profileErr.code === "23514") {
        status = 400;
        reason = "Profile insert failed: check constraint (role)";
      }
      if (profileErr.code === "23503") {
        status = 400;
        reason = "Profile insert failed: foreign key";
      }
      await admin.auth.admin.updateUserById(userId, {
        banned_until: "2999-01-01T00:00:00Z"
      }).catch(()=>null);
      return new Response(JSON.stringify({
        error: reason,
        stage: "profile.insert",
        code: profileErr.code
      }), {
        status,
        headers
      });
    }
    return new Response(JSON.stringify({
      ok: true,
      user_id: userId
    }), {
      status: 201,
      headers
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e.message ?? "Unhandled error",
      stage: "catch"
    }), {
      status: 500,
      headers
    });
  }
});
