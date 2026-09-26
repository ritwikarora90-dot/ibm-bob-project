import { useState } from "react";
import CodeEditor from "../components/CodeEditor";
import { optimizeCode } from "../services/api";

function Optimization() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!code.trim()) {
      alert("Please paste some code to optimize.");
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const data = await optimizeCode(code);
      setResult(data);
    } catch (err) {
      console.error("Optimization error:", err);
      setError("Failed to connect to the backend server. Make sure FastAPI is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.optimized_code) {
      navigator.clipboard.writeText(result.optimized_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page" style={{ padding: "2rem", maxWidth: "950px", margin: "0 auto" }}>
      <h2>Code Optimization Engine</h2>
      <p>Submit unoptimized code to detect algorithmic bottlenecks and generate efficient alternatives.</p>

      <CodeEditor code={code} setCode={setCode} />

      <button
        onClick={handleOptimize}
        disabled={loading}
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Optimizing..." : "Analyze & Optimize"}
      </button>

      {error && (
        <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: "1.5rem", background: "#1e1e1e", padding: "1.5rem", borderRadius: "8px", color: "#fff" }}>
          <h3>Optimization Analysis</h3>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
            <p><strong>Original Complexity:</strong> <span style={{ color: "#f87171" }}>{result.original_complexity}</span></p>
            <p><strong>Optimized Complexity:</strong> <span style={{ color: "#34d399" }}>{result.optimized_complexity}</span></p>
          </div>

          <h4>Recommendations:</h4>
          <ul>
            {result.recommendations && result.recommendations.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: "0.25rem" }}>{rec}</li>
            ))}
          </ul>

          {result.optimized_code && (
            <div style={{ marginTop: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0 }}>Optimized Code:</h4>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? "#059669" : "#374151",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <pre
                style={{
                  background: "#111827",
                  color: "#10b981",
                  padding: "14px",
                  borderRadius: "6px",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                  border: "1px solid #374151"
                }}
              >
                <code>{result.optimized_code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Optimization;