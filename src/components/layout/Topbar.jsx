// src/components/layout/Topbar.jsx
import { useAuth } from "../../modules/auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header
      style={{
        height: 60,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px"
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
        Painel WG Almeida
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#475569" }}>
          {user?.email || "Usuário"}
        </span>

        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            fontSize: 13,
            borderRadius: 6,
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
