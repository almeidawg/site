// src/components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/" },
    { label: "Kanban", path: "/kanban" },
    { label: "Marcenaria", path: "/marcenaria" },
    { label: "Financeiro", path: "/financeiro/lancamentos" }
  ];

  return (
    <aside
      style={{
        width: 220,
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 20,
          letterSpacing: 1
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
              padding: "10px 12px",
              borderRadius: 8,
              background: active ? "#1e293b" : "transparent",
              color: active ? "#fff" : "#cbd5e1",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: active ? 600 : 400
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
