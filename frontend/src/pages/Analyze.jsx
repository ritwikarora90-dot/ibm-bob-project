import { useState } from "react";
import CodeEditor from "../components/CodeEditor";
import { analyzeCode } from "../services/api";

function Analyze() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert("Please paste some code or a traceback to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const data = await analyzeCode(code);
      setResult(data);
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to connect to the backend server. Make sure FastAPI is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.hotfix) {
      navigator.clipboard.writeText(result.hotfix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page" style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Analyze Incident & Code</h2>
      <p>Enter the offending code snippet or traceback below to generate analysis and recommendations.</p>

      <CodeEditor code={code} setCode={setCode} />

      <button 
        onClick={handleAnalyze} 
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
        {loading ? "Analyzing..." : "Analyze & Generate Hotfix"}
      </button>

      {error && (
        <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: "1.5rem", background: "#1e1e1e", padding: "1.5rem", borderRadius: "8px", color: "#fff" }}>
          <h3>Analysis Results</h3>
          <p><strong>Complexity:</strong> {result.complexity}</p>
          <p><strong>Issues Found:</strong> {result.issues}</p>
          
          <h4>Suggestions:</h4>
          <ul>
            {result.suggestions && result.suggestions.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "0.25rem" }}>{item}</li>
            ))}
          </ul>

          {result.hotfix && (
            <div style={{ marginTop: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0 }}>Recommended Fix:</h4>
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
                  {copied ? "Copied!" : "Copy Fix"}
                </button>
              </div>
              <pre
                style={{
                  background: "#111827",
                  color: "#10b981",
                  padding: "12px",
                  borderRadius: "6px",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                  border: "1px solid #374151"
                }}
              >
                <code>{result.hotfix}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Analyze;