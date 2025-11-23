import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function LayoutShell({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <main style={{ padding: "16px 24px", backgroundColor: "#f5f5f7", flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
