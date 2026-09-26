import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Incident & Traceback Analysis",
      desc: "Paste Python error traces to auto-locate failure line, extract error details, and generate instant hotfixes.",
      path: "/analyze",
      tag: "Self-Healing",
      accent: "#38bdf8",
      borderGlow: "rgba(56, 189, 248, 0.4)",
      icon: "🔍"
    },
    {
      title: "Code Optimization Engine",
      desc: "Detect nested loop bottlenecks and convert quadratic O(N²) code into efficient linear O(N) structures.",
      path: "/optimization",
      tag: "Performance",
      accent: "#34d399",
      borderGlow: "rgba(52, 211, 153, 0.4)",
      icon: "⚡"
    },
    {
      title: "Security Patching & Hardening",
      desc: "Audit SQL injection, unsafe eval, and command execution vectors with automated production hardening.",
      path: "/security",
      tag: "Security Guard",
      accent: "#f87171",
      borderGlow: "rgba(248, 113, 113, 0.4)",
      icon: "🛡️"
    },
    {
      title: "Automated Verification",
      desc: "Validate remediation patches step-by-step against regression risk, lint specifications, and syntax sanity checks.",
      path: "/verification",
      tag: "Quality Guard",
      accent: "#a78bfa",
      borderGlow: "rgba(167, 139, 250, 0.4)",
      icon: "🧪"
    },
    {
      title: "Performance Benchmarking",
      desc: "Profile estimated execution cycles, memory overhead, and resource consumption bottlenecks.",
      path: "/performance",
      tag: "Diagnostics",
      accent: "#facc15",
      borderGlow: "rgba(250, 204, 21, 0.4)",
      icon: "📊"
    },
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3.5rem 1.5rem" }}>
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 16px",
          background: "rgba(56, 189, 248, 0.12)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "30px",
          marginBottom: "1.2rem",
          color: "#38bdf8",
          fontSize: "0.85rem",
          fontWeight: "600"
        }}>
          <span>✦</span> Production Engineering Automation Suite
        </div>

        <h1 style={{
          fontSize: "3rem",
          fontWeight: "800",
          color: "#f8fafc",
          marginBottom: "1.2rem",
          lineHeight: "1.2",
          letterSpacing: "-0.5px"
        }}>
          AI-Driven Code Optimization &{" "}
          <span style={{
            background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Incident Auto-Fix
          </span>
        </h1>

        <p style={{
          fontSize: "1.15rem",
          color: "#cbd5e1",
          maxWidth: "720px",
          margin: "0 auto 2.2rem",
          lineHeight: "1.6"
        }}>
          Root-cause detection, AST algorithmic refactoring, CWE security remediation, and step-by-step verification for mission-critical codebases.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/analyze")}
            style={{
              padding: "13px 30px",
              background: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: "700",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 0 25px rgba(56, 189, 248, 0.45)",
              transition: "transform 0.15s ease"
            }}
          >
            Launch Incident Analyzer →
          </button>
          <button
            onClick={() => navigate("/security")}
            style={{
              padding: "13px 26px",
              background: "rgba(30, 41, 59, 0.8)",
              color: "#f87171",
              fontSize: "1rem",
              fontWeight: "600",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Audit Security Flaws 🛡️
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem"
      }}>
        {features.map((feat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(feat.path)}
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "1.75rem",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = feat.borderGlow;
              e.currentTarget.style.boxShadow = `0 12px 25px -5px ${feat.borderGlow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.75rem" }}>{feat.icon}</span>
              <span style={{
                background: `rgba(255, 255, 255, 0.05)`,
                color: feat.accent,
                border: `1px solid ${feat.borderGlow}`,
                fontSize: "0.75rem",
                fontWeight: "700",
                padding: "4px 10px",
                borderRadius: "20px"
              }}>
                {feat.tag}
              </span>
            </div>

            <h3 style={{ margin: "0 0 0.6rem", color: "#f8fafc", fontSize: "1.25rem", fontWeight: "700" }}>
              {feat.title}
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.93rem", lineHeight: "1.55" }}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;