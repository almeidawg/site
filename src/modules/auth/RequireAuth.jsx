// src/modules/auth/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Protege rotas internas do WGEasy.
 * Se não houver usuário autenticado, redireciona para /login,
 * guardando a rota original para retorno após login.
 */
export default function RequireAuth() {
  const { user } = useAuth() || {};
  const location = useLocation();

  // Se não estiver logado → manda pro login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Se estiver logado → libera o conteúdo interno
  return <Outlet />;
}

