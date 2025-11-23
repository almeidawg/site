import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// deno-lint-ignore-file no-explicit-any
function j(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders
    }
  });
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const authHeader = req.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!accessToken) return j({
      error: "Token ausente"
    }, 401);
    const url = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY");
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anon || !service) {
      return j({
        error: "Variáveis de ambiente do Supabase não configuradas."
      }, 500);
    }
    const client = createClient(url, anon);
    const admin = createClient(url, service);
    const { data: { user }, error: meErr } = await client.auth.getUser(accessToken);
    if (meErr || !user) return j({
      error: "Sessão inválida"
    }, 401);
    const { data: prof } = await admin.from("user_profiles").select("role, master, ativo").eq("user_id", user.id).maybeSingle();
    const isAllowed = !!prof?.ativo && (prof?.master || prof?.role === "admin" || prof?.role === "gestor");
    if (!isAllowed) return j({
      error: "Permissão negada"
    }, 403);
    const { email, password, nome, role = "operacional", ativo = true } = await req.json();
    if (!email || !password) return j({
      error: "Email e senha são obrigatórios"
    }, 400);
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: nome ?? email.split("@")[0]
      }
    });
    if (cErr) {
      return j({
        error: `Falha ao criar usuário no Auth: ${cErr.message}`
      }, 400);
    }
    if (!created || !created.user) {
      return j({
        error: "O usuário não foi retornado após a criação."
      }, 500);
    }
    const { error: profileErr } = await admin.from("user_profiles").upsert({
      user_id: created.user.id,
      nome: nome ?? email,
      role,
      ativo
    }, {
      onConflict: "user_id"
    });
    if (profileErr) {
      // Opcional: Tentar deletar o usuário do Auth se o perfil falhar
      await admin.auth.admin.deleteUser(created.user.id);
      return j({
        error: `Falha ao criar perfil: ${profileErr.message}`
      }, 500);
    }
    return j({
      ok: true,
      user_id: created.user.id
    });
  } catch (e) {
    return j({
      error: String(e)
    }, 500);
  }
});
