// src/modules/auth/pages/LoginPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { supabase } from "../../../config/supabaseClient";
import { resolveLoginEmailFromCpf } from "@/lib/cpf";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ cpf: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Se não tiver "from", vai para a raiz "/", onde está o Dashboard
  const from = location.state?.from?.pathname || "/";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const email = resolveLoginEmailFromCpf(form.cpf);
      if (!email) {
        alert("Informe um CPF válido com 11 dígitos.");
        setLoading(false);
        return;
      }
      await login(email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Login inválido. Verifique CPF e senha.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (err) {
      console.error("Erro no login com Google:", err);
      alert("Não foi possível entrar com Google.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #020617, #111827)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 16,
          padding: 24,
          backgroundColor: "#0b1120",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          color: "#e5e7eb"
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>WGEasy</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Acesso restrito – Grupo WG Almeida
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={label}>CPF (sem pontos ou traços)</label>
          <input
            name="cpf"
            type="text"
            value={form.cpf}
            onChange={handleChange}
            style={input}
            placeholder="00000000000"
            required
          />
        </div>
        <div>
          <label style={label}>Senha</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              style={input}
              required
            />
          </div>
          <button type="submit" style={btn} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={googleBtn}
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}

const label = {
  display: "block",
  fontSize: 12,
  marginBottom: 4
};

const input = {
  width: "100%",
  padding: 8,
  borderRadius: 8,
  border: "1px solid #374151",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  fontSize: 13
};

const btn = {
  marginTop: 8,
  padding: 10,
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
  color: "#f9fafb",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
  width: "100%"
};

const googleBtn = {
  marginTop: 12,
  width: "100%",
  padding: 10,
  borderRadius: 999,
  border: "none",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14
};
