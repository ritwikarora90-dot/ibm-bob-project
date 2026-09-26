import { useState } from "react";
import CodeEditor from "../components/CodeEditor";
import { patchSecurityCode } from "../services/api";

function SecurityPatch() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const sampleSQL = `def get_user_profile(user_input):\n    query = f"SELECT * FROM users WHERE username = '{user_input}'"\n    return db.execute(query)`;
  const sampleEval = `def compute_formula(user_expression):\n    # Calculates dynamic arithmetic\n    return eval(user_expression)`;
  const sampleOS = `import os\ndef ping_host(host_ip):\n    # Executes network test\n    return os.system("ping -c 1 " + host_ip)`;

  const handleScanAndPatch = async () => {
    if (!code.trim()) {
      alert("Please paste some code to audit for security flaws.");
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const data = await patchSecurityCode(code);
      setResult(data);
    } catch (err) {
      console.error("Security scan error:", err);
      setError("Failed to reach backend service on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.patched_code) {
      navigator.clipboard.writeText(result.patched_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return { bg: "rgba(239, 68, 68, 0.2)", text: "#f87171", border: "rgba(239, 68, 68, 0.4)" };
      case "HIGH":
        return { bg: "rgba(249, 115, 22, 0.2)", text: "#fb923c", border: "rgba(249, 115, 22, 0.4)" };
      case "MEDIUM":
        return { bg: "rgba(234, 179, 8, 0.2)", text: "#facc15", border: "rgba(234, 179, 8, 0.4)" };
      default:
        return { bg: "rgba(100, 116, 139, 0.2)", text: "#94a3b8", border: "transparent" };
    }
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "1.8rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 0.5rem", letterSpacing: "-0.5px" }}>
          Security Patching & Remediation Engine
        </h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
          Scan code for dangerous execution vectors, SQL injection, and hardcoded secrets with instant automated hardening.
        </p>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setCode(sampleSQL)}
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Load SQLi Flaw
        </button>
        <button
          onClick={() => setCode(sampleEval)}
          style={{
            background: "rgba(249, 115, 22, 0.12)",
            color: "#fb923c",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Load Unsafe Eval Flaw
        </button>
        <button
          onClick={() => setCode(sampleOS)}
          style={{
            background: "rgba(234, 179, 8, 0.12)",
            color: "#facc15",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Load Command Injection Flaw
        </button>
      </div>

      <CodeEditor code={code} setCode={setCode} placeholder="Paste sensitive or potentially vulnerable code snippet here..." />

      <button
        onClick={handleScanAndPatch}
        disabled={loading}
        style={{
          marginTop: "1.25rem",
          padding: "11px 24px",
          background: "linear-gradient(135deg, #dc2626, #ea580c)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "0.95rem",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
          transition: "transform 0.15s ease"
        }}
      >
        {loading ? "Auditing Vulnerabilities..." : "Audit & Auto-Patch"}
      </button>

      {error && <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>}

      {result && (
        <div style={{
          marginTop: "2rem",
          background: "rgba(17, 24, 39, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "1.75rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}>
          {/* Header Metric */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "1.25rem"
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>
                Security Audit Findings:
              </h3>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.88rem" }}>
                {result.is_clean ? "No critical vulnerabilities found." : `Identified ${result.vulnerabilities_found} security hazard(s).`}
              </p>
            </div>
            <span style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "0.85rem",
              background: result.is_clean ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
              color: result.is_clean ? "#34d399" : "#f87171",
              border: `1px solid ${result.is_clean ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
            }}>
              {result.is_clean ? "SECURITY PASSED" : "VULNERABILITIES DETECTED"}
            </span>
          </div>

          {/* List of Detected Vulnerabilities */}
          {result.vulnerabilities.length > 0 && (
            <div style={{ margin: "1.5rem 0", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {result.vulnerabilities.map((v, i) => {
                const s = getSeverityStyle(v.severity);
                return (
                  <div
                    key={i}
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: `1px solid ${s.border}`,
                      borderLeft: `4px solid ${s.text}`,
                      padding: "1rem 1.25rem",
                      borderRadius: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.95rem" }}>
                        [{v.cwe}] {v.name}
                      </span>
                      <span style={{
                        background: s.bg,
                        color: s.text,
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "4px"
                      }}>
                        {v.severity}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1", fontSize: "0.88rem", lineHeight: "1.4" }}>
                      {v.description}
                    </p>
                    <p style={{ margin: 0, color: "#38bdf8", fontSize: "0.85rem" }}>
                      <strong>Remediation:</strong> {v.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hardened / Patched Code */}
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h4 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc" }}>Hardened Defensive Hotfix:</h4>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "#059669" : "#374151",
                  color: "#fff",
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: "500"
                }}
              >
                {copied ? "Copied!" : "Copy Patched Code"}
              </button>
            </div>
            <pre style={{
              background: "#0d1117",
              color: "#34d399",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              overflowX: "auto",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.9rem",
              lineHeight: "1.5",
              margin: 0
            }}>
              <code>{result.patched_code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityPatch;