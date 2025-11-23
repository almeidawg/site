// src/modules/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { login as loginService, logout as logoutService } from "./services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarSessao() {
      setCarregando(true);
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Erro ao carregar sessão:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarSessao();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const data = await loginService({ email, password });
    setUser(data.user);
    return data;
  }

  async function logout() {
    await logoutService();
    setUser(null);
  }

  const value = {
    user,
    carregando,
    isAutenticado: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
