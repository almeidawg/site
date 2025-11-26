import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const LOGIN_DOMAIN = "cpf.wgeasy.local";
const VALID_ROLES = new Set(["admin", "gestor", "comercial", "operacional", "financeiro", "vendedor", "readonly"]);
const MODULE_KEYS = ["colaboradores", "fornecedores", "especificadores", "area_cliente"];

const normalizeCpf = (cpf: string | null | undefined) =>
  (cpf || "").replace(/\D/g, "");

const buildLoginEmail = (cpfDigits: string) => `${cpfDigits}@${LOGIN_DOMAIN}`;

const buildModuleFlags = (input: Record<string, boolean> | string[] | undefined) => {
  const normalizedInput = Array.isArray(input) ? Object.fromEntries(input.map((value) => [value, true])) : input || {};
  return MODULE_KEYS.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = !!normalizedInput[key];
    return acc;
  }, {});
};

const generatePassword = (length = 12) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_=+";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((value) => alphabet[value % alphabet.length])
    .join("");
};

const badRequest = (message: string) =>
  new Response(JSON.stringify({ ok: false, message }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

const unauthorized = (message: string) =>
  new Response(JSON.stringify({ ok: false, message }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

const forbidden = (message: string) =>
  new Response(JSON.stringify({ ok: false, message }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

const methodNotAllowed = (method: string) =>
  new Response(
    JSON.stringify({
      ok: false,
      message: `${method} não é permitido. Use POST para criar usuários.`
    }),
    {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return methodNotAllowed(req.method);
  }

  const authHeader = req.headers.get("authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!accessToken) {
    return unauthorized("Token de acesso ausente.");
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Variáveis do Supabase não estão configuradas."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  const publicClient = createClient(url, anonKey);
  const adminClient = createClient(url, serviceKey);

  const { data: sessionData, error: sessionError } = await publicClient.auth.getUser(accessToken);
  if (sessionError || !sessionData.user) {
    return unauthorized("Sessão inválida ou expirou.");
  }

  const { data: perfilData, error: perfilError } = await adminClient
    .from("usuarios_perfis")
    .select("perfil")
    .eq("user_id", sessionData.user.id)
    .maybeSingle();

  if (perfilError) {
    return new Response(
      JSON.stringify({ ok: false, message: "Não foi possível validar permissões do solicitante." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!perfilData || !["admin", "gestor"].includes(perfilData.perfil)) {
    return forbidden("Apenas administradores ou gestores podem criar novos acessos.");
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch (_err) {
    return badRequest("Payload inválido.");
  }

  const nome = String(payload.nome || "").trim();
  const cpfRaw = String(payload.cpf || "").trim();
  const telefone = payload.telefone ? String(payload.telefone).trim() : null;
  const role = String(payload.role || "operacional").trim().toLowerCase();
  const cargo = payload.cargo ? String(payload.cargo).trim() : role;
  const modulesInput = payload.modules as Record<string, boolean> | string[] | undefined;

  if (!nome) {
    return badRequest("É necessário informar o nome completo.");
  }

  const normalizedCpf = normalizeCpf(cpfRaw);
  if (!normalizedCpf || normalizedCpf.length !== 11) {
    return badRequest("CPF inválido. Informe os 11 dígitos.");
  }

  if (!VALID_ROLES.has(role)) {
    return badRequest("Perfil inválido. Escolha entre admin, gestor, comercial, operacional, financeiro, vendedor ou readonly.");
  }

  const modules = buildModuleFlags(modulesInput);

  const { data: existingCpf } = await adminClient
    .from("user_profiles")
    .select("user_id")
    .eq("cpf_normalized", normalizedCpf)
    .maybeSingle();

  if (existingCpf) {
    return new Response(
      JSON.stringify({ ok: false, message: "Já existe um usuário cadastrado com esse CPF." }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  const loginEmail = buildLoginEmail(normalizedCpf);
  const password = generatePassword(12);

  const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
    email: loginEmail,
    password,
    email_confirm: true,
    user_metadata: {
      nome,
      cpf: normalizedCpf,
      modules
    }
  });

  if (createError || !createdUser?.user) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: `Falha ao criar usuário no Auth: ${createError?.message || "resposta inválida"}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  const profilePayload = {
    user_id: createdUser.user.id,
    nome,
    cpf: normalizedCpf,
    cpf_normalized: normalizedCpf,
    telefone,
    cargo,
    ativo: true
  };

  const { error: profileError } = await adminClient
    .from("user_profiles")
    .upsert(profilePayload, { onConflict: "user_id" });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    return new Response(
      JSON.stringify({ ok: false, message: `Não foi possível salvar o perfil: ${profileError.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const permissionsPayload = {
    user_id: createdUser.user.id,
    perfil: role,
    permissoes: {
      modules,
      needsPasswordChange: true,
      created_by: sessionData.user.id,
      created_at: new Date().toISOString()
    }
  };

  const { error: permsError } = await adminClient
    .from("usuarios_perfis")
    .upsert(permissionsPayload, { onConflict: "user_id" });

  if (permsError) {
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    await adminClient.from("user_profiles").delete().eq("user_id", createdUser.user.id);
    return new Response(
      JSON.stringify({ ok: false, message: `Não foi possível configurar permissões: ${permsError.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      user_id: createdUser.user.id,
      login_email: loginEmail,
      cpf: normalizedCpf,
      password,
      modules,
      perfil: role,
      message: "Usuário criado com CPF e módulos configurados."
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
});
