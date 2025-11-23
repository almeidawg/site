// src/components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/" },
    { label: "Kanban", path: "/kanban" },
    { label: "Obras", path: "/obras" },
    { label: "Marcenaria", path: "/marcenaria" },
    { label: "Financeiro", path: "/financeiro" },
    { label: "Cronograma", path: "/cronograma" },
    { label: "Contratos", path: "/contratos" },
  ];

  return (
    <aside
      style={{
        width: 240,
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 24,
          letterSpacing: 1,
          color: "#fff",
        }}
      >
        WGEasy
      </div>

      {menu.map((item) => {
        const active = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: active ? "#1e293b" : "transparent",
              color: active ? "#fff" : "#cbd5e1",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.target.style.background = "#1e293b50";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.target.style.background = "transparent";
              }
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
