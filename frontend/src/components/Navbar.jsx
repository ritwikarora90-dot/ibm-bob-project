import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Incident Analysis", path: "/analyze" },
    { name: "Optimization", path: "/optimization" },
    { name: "Security Patching", path: "/security" },
    { name: "Verification", path: "/verification" },
    { name: "Performance", path: "/performance" },
  ];

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.9rem 3rem",
      backgroundColor: "rgba(11, 15, 25, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)"
        }}>
          <span style={{ fontSize: "1.1rem", color: "#fff" }}>⚡</span>
        </div>
        <span style={{
          fontSize: "1.25rem",
          fontWeight: "800",
          background: "linear-gradient(90deg, #f8fafc 30%, #38bdf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.5px"
        }}>
          CodeOpt AI
        </span>
      </Link>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: isActive ? "#38bdf8" : "#94a3b8",
                textDecoration: "none",
                fontWeight: isActive ? "600" : "500",
                fontSize: "0.9rem",
                padding: "8px 14px",
                borderRadius: "8px",
                backgroundColor: isActive ? "rgba(56, 189, 248, 0.1)" : "transparent",
                border: isActive ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid transparent",
                transition: "all 0.18s ease-in-out"
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

export default Navbar;