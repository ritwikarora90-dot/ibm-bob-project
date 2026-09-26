import { useState } from "react";
import CodeEditor from "../components/CodeEditor";
import { verifyCode } from "../services/api";

function Verification() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleBrokenCode = `for x in list_a\n    for y in list_b:\n        print(x)`;
  const sampleCleanCode = `def search_records(dataset, user_id):\n    if not dataset or user_id is None:\n        return None\n    return dataset.get(user_id, None)`;

  const handleVerify = async () => {
    if (!code.trim()) {
      alert("Please paste code or test suite to verify.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await verifyCode(code);
      setResult(data);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to connect to backend on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PASSED":
        return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", text: "#34d399", label: "✓ PASSED" };
      case "FAILED":
        return { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", text: "#f87171", label: "✕ FAILED" };
      case "WARNING":
        return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", text: "#fbbf24", label: "⚠ WARNING" };
      default:
        return { bg: "rgba(100, 116, 139, 0.2)", border: "transparent", text: "#94a3b8", label: status };
    }
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.8rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 0.5rem", letterSpacing: "-0.5px" }}>
          Solution Verification & Regression
        </h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
          Automated multi-layer sanity checks, defensive boundaries, and compile-level AST inspection.
        </p>
      </div>

      {/* Quick Sample Action Pills */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setCode(sampleBrokenCode)}
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
          Load Syntax-Error Sample
        </button>
        <button
          onClick={() => setCode(sampleCleanCode)}
          style={{
            background: "rgba(56, 189, 248, 0.12)",
            color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Load Production-Safe Sample
        </button>
      </div>

      <CodeEditor code={code} setCode={setCode} />

      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          marginTop: "1.25rem",
          padding: "11px 24px",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "0.95rem",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
          transition: "transform 0.15s ease"
        }}
      >
        {loading ? "Running Verification..." : "Run Test Suite"}
      </button>

      {error && <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>}

      {/* Results Container */}
      {result && (
        <div style={{
          marginTop: "2rem",
          background: "rgba(17, 24, 39, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "1.75rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}>
          {/* Top Banner Stats */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "1.25rem"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>Validation Verdict:</h3>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  background: result.status === "Verified Safe" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: result.status === "Verified Safe" ? "#34d399" : "#f87171",
                  border: `1px solid ${result.status === "Verified Safe" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                }}>
                  {result.status}
                </span>
              </div>
              <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.88rem" }}>
                Regression Risk Score: <strong style={{ color: result.regression_risk === "Low" ? "#34d399" : "#f87171" }}>{result.regression_risk}</strong>
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#38bdf8", fontFamily: "JetBrains Mono, monospace" }}>
                {result.test_cases_passed}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Passing Assertions</span>
            </div>
          </div>

          <h4 style={{ margin: "1.5rem 0 1rem", fontSize: "1rem", color: "#cbd5e1" }}>
            Step-by-Step Test Breakdown:
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {result.detailed_steps && result.detailed_steps.map((test) => {
              const badge = getStatusBadge(test.status);
              return (
                <div
                  key={test.step}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: `1px solid rgba(255, 255, 255, 0.05)`,
                    borderLeft: `4px solid ${badge.text}`,
                    padding: "1rem 1.25rem",
                    borderRadius: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontWeight: "600", fontSize: "0.95rem", color: "#f8fafc" }}>
                      Step {test.step}: {test.name}
                    </span>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        padding: "3px 9px",
                        borderRadius: "5px"
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8", lineHeight: "1.45" }}>
                    {test.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Verification;