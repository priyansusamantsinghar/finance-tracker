import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ChatBot from "./ChatBot.jsx";
const NAV_ITEMS = [
  {
    path: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: "/transactions",
    label: "Transactions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12H3M3 6h18M3 18h12" />
      </svg>
    ),
  },
  {
    path: "/budget",
    label: "Budget",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ---- SIDEBAR ---- */}
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1rem",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2.5rem", paddingLeft: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--accent-green)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#050d07">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "1rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              FinTrack
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "0.6rem 0.75rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: isActive ? "500" : "400",
                color: isActive ? "var(--accent-green)" : "var(--text-secondary)",
                background: isActive ? "rgba(61, 220, 112, 0.08)" : "transparent",
                border: isActive ? "1px solid rgba(61, 220, 112, 0.15)" : "1px solid transparent",
                transition: "all 0.15s ease",
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section at bottom */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1rem",
            marginTop: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem", paddingLeft: "0.25rem" }}>
            {/* Avatar with initials */}
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "var(--accent-green-dim)",
                border: "1px solid rgba(61, 220, 112, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.72rem",
                fontWeight: "700",
                color: "var(--accent-green)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ width: "100%", fontSize: "0.83rem", padding: "0.5rem 0.75rem" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main style={{ flex: 1, overflow: "auto", background: "var(--bg-primary)" }}>
        <Outlet />
      </main>

      {/* ---- AI CHATBOT ---- */}
      <ChatBot />
    </div>
  );
}
