import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "12345",
  "password",
  "qwerty",
  "abc123",
  "senha",
  "111111",
  "123123",
  "iloveyou",
  "admin",
  "welcome",
  "dragon",
  "monkey",
  "letmein",
  "football"
]);
function hasLower(s) {
  return /[a-z]/.test(s);
}
function hasUpper(s) {
  return /[A-Z]/.test(s);
}
function hasNumber(s) {
  return /[0-9]/.test(s);
}
function hasSymbol(s) {
  return /[^A-Za-z0-9]/.test(s);
}
function isTrivial(email, name, pwd) {
  const base = (email.split("@")[0] || "").toLowerCase();
  const n = (name ?? "").toLowerCase();
  const p = (pwd ?? "").toLowerCase();
  return p.includes(base) || !!n && p.includes(n);
}
async function sha1Hex(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hash)).map((b)=>b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
async function isPwned(pwd) {
  try {
    const sha1 = await sha1Hex(pwd);
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "Add-Padding": "true"
      }
    });
    if (!resp.ok) return false;
    const text = await resp.text();
    return text.split("\n").some((line)=>{
      const [suf, count] = line.trim().split(":");
      return suf === suffix && Number(count) > 0;
    });
  } catch (e) {
    console.warn("Could not check pwned passwords:", e.message);
    return false; // Don't block signup on network failure
  }
}
Deno.serve(async (req)=>{
  const requestHeaders = corsHeaders(ALLOWED_ORIGIN);
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: requestHeaders
    });
  }
  try {
    const { email, password, name, role, ativo } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Email e senha são obrigatórios."
      }), {
        status: 400,
        headers: requestHeaders
      });
    }
    if (password.length < 8) {
      return new Response(JSON.stringify({
        ok: false,
        message: `A senha deve ter pelo menos 8 caracteres.`
      }), {
        status: 400,
        headers: requestHeaders
      });
    }
    if (!(hasLower(password) && hasUpper(password) && hasNumber(password) && hasSymbol(password))) {
      return new Response(JSON.stringify({
        ok: false,
        message: "A senha deve conter letras maiúsculas, minúsculas, números e um símbolo."
      }), {
        status: 400,
        headers: requestHeaders
      });
    }
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Senha muito comum. Por favor, escolha outra."
      }), {
        status: 400,
        headers: requestHeaders
      });
    }
    if (isTrivial(email, name, password)) {
      return new Response(JSON.stringify({
        ok: false,
        message: "A senha não pode conter seu nome ou parte do seu email."
      }), {
        status: 400,
        headers: requestHeaders
      });
    }
    const pwned = await isPwned(password);
    if (pwned) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Esta senha já apareceu em vazamentos de dados públicos. Por favor, escolha outra."
      }), {
        status: 400,
        headers: requestHeaders
      });
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome: name,
        role: role,
        ativo: ativo
      }
    });
    if (error) {
      let friendlyMessage = error.message;
      if (error.message.includes("User already registered")) {
        friendlyMessage = "Este endereço de e-mail já está em uso.";
      }
      return new Response(JSON.stringify({
        ok: false,
        message: friendlyMessage
      }), {
        status: 400,
        headers: requestHeaders
      });
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        nome: name,
        role: role || 'operacional',
        ativo: ativo !== false
      });
      if (profileError) {
        // Rollback user creation if profile insert fails
        await supabase.auth.admin.deleteUser(data.user.id);
        return new Response(JSON.stringify({
          ok: false,
          message: `Erro ao criar perfil: ${profileError.message}`
        }), {
          status: 500,
          headers: requestHeaders
        });
      }
    }
    return new Response(JSON.stringify({
      ok: true,
      user_id: data.user.id
    }), {
      status: 201,
      headers: requestHeaders
    });
  } catch (e) {
    console.error("secure-signup error:", e);
    return new Response(JSON.stringify({
      ok: false,
      message: e?.message ?? "Erro interno do servidor."
    }), {
      status: 500,
      headers: requestHeaders
    });
  }
});
