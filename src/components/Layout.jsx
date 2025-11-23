import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui" }}>
      
      {/* MENU LATERAL */}
      <nav style={{
        width: "240px",
        background: "#111",
        color: "white",
        padding: "24px"
      }}>
        <h2 style={{ marginBottom: "32px" }}>WGEasy</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: "12px" }}>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>Obras</Link>
          </li>
          <li style={{ marginBottom: "12px" }}>
            <Link to="/financeiro" style={{ color: "white", textDecoration: "none" }}>Financeiro</Link>
          </li>
          <li style={{ marginBottom: "12px" }}>
            <Link to="/kanban" style={{ color: "white", textDecoration: "none" }}>Kanban</Link>
          </li>
          <li style={{ marginBottom: "12px" }}>
            <Link to="/marcenaria" style={{ color: "white", textDecoration: "none" }}>Marcenaria</Link>
          </li>
        </ul>
      </nav>

      {/* CONTEÚDO */}
      <main style={{ flex: 1, padding: "32px" }}>
        {children}
      </main>

    </div>
  );
}
