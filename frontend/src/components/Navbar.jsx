import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Auto-Pipeline", path: "/pipeline", highlight: true },
    { name: "Incident Analysis", path: "/analyze" },
    { name: "Optimization", path: "/optimization" },
    { name: "Security Patching", path: "/security" },
    { name: "Verification", path: "/verification" },
    { name: "Performance", path: "/performance" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.9rem 3rem",
        backgroundColor: "rgba(11, 15, 25, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          textDecoration: "none",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "1.15rem",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)",
          }}
        >
          ⚡
        </div>
        <span>CodeOpt AI</span>
      </Link>

      {/* Navigation Items */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: link.highlight || isActive ? "600" : "400",
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                color: link.highlight
                  ? "#38bdf8"
                  : isActive
                  ? "#ffffff"
                  : "#94a3b8",
                backgroundColor: link.highlight
                  ? "rgba(56, 189, 248, 0.12)"
                  : isActive
                  ? "rgba(255, 255, 255, 0.08)"
                  : "transparent",
                border: link.highlight
                  ? "1px solid rgba(56, 189, 248, 0.3)"
                  : "1px solid transparent",
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}