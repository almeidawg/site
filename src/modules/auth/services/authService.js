// src/modules/auth/services/authService.js
import { supabase } from "../../../config/supabaseClient";

/**
 * Login com email e senha
 */
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Erro no login:", error);
    throw error;
  }

  return data;
}

/**
 * Logout
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro no logout:", error);
    throw error;
  }
}

/**
 * Retorna usuário atual (sessão)
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Erro ao buscar usuário atual:", error);
    throw error;
  }

  return user;
}

/**
 * Cria usuário (admin inicial, por exemplo)
 * Só usar em script isolado ou admin screen.
 */
export async function criarUsuario({ email, password, nome, role = "admin" }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
        role
      }
    }
  });

  if (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }

  return data;
}
