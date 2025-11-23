// src/modules/auth/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAutenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <p>Carregando sessão...</p>;
  }

  if (!isAutenticado) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
