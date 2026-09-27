import React, { useState } from "react";
import { runAutoPipeline } from "../services/api";

export default function AutoPipeline() {
  const [code, setCode] = useState(
`def sync_orders(orders):
    # Performance bottleneck and unsafe eval
    token = "secret-token-key-992"
    cleared = []
    for i in orders:
        for j in orders:
            if i["id"] == j["id"]:
                eval("cleared.append(j)")
    return cleared`
  );
  const [traceback, setTraceback] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const data = await runAutoPipeline(code, traceback);
      setOutput(data);
    } catch (err) {
      alert("Pipeline connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1.5rem", color: "#f8fafc" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700" }}>Autonomous Multi-Agent Pipeline</h1>
        <p style={{ color: "#94a3b8" }}>
          Single-trigger workflow: Incident Parse → AST Loop Refactor → CWE Vulnerability Neutralization → 5-Point Regression.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Input Card */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "1.2rem" }}>
          <label style={{ display: "block", color: "#38bdf8", fontWeight: "600", marginBottom: "0.5rem" }}>Source Code</label>
          <textarea
            rows={10}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ width: "100%", background: "#020617", color: "#e2e8f0", fontFamily: "monospace", padding: "0.8rem", borderRadius: "8px", border: "1px solid #334155", boxSizing: "border-box" }}
          />

          <label style={{ display: "block", color: "#f43f5e", fontWeight: "600", margin: "1rem 0 0.5rem" }}>Traceback / Error Stack (Optional)</label>
          <textarea
            rows={3}
            value={traceback}
            onChange={(e) => setTraceback(e.target.value)}
            placeholder="Paste crash trace here (e.g. IndexError, KeyError)..."
            style={{ width: "100%", background: "#020617", color: "#e2e8f0", fontFamily: "monospace", padding: "0.8rem", borderRadius: "8px", border: "1px solid #334155", boxSizing: "border-box" }}
          />

          <button
            onClick={handleExecute}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "1.2rem",
              padding: "0.9rem",
              background: loading ? "#475569" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Running Multi-Agent Orchestrator..." : "Run Autonomous Self-Healing"}
          </button>
        </div>

        {/* Output Card */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <label style={{ color: "#4ade80", fontWeight: "600" }}>Healed & Optimized Output</label>
            {output && (
              <span style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "700" }}>
                Score: {output.score} ({output.execution_time_ms}ms)
              </span>
            )}
          </div>
          <textarea
            readOnly
            rows={10}
            value={output ? output.healed_code : "Awaiting pipeline execution..."}
            style={{ width: "100%", background: "#020617", color: "#38bdf8", fontFamily: "monospace", padding: "0.8rem", borderRadius: "8px", border: "1px solid #334155", boxSizing: "border-box" }}
          />

          <label style={{ display: "block", color: "#fbbf24", fontWeight: "600", margin: "1rem 0 0.5rem" }}>Agent Orchestration Telemetry</label>
          <div style={{ background: "#020617", padding: "0.8rem", borderRadius: "8px", height: "100px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.8rem", color: "#94a3b8", border: "1px solid #334155" }}>
            {output && output.logs
              ? output.logs.map((log, idx) => <div key={idx}>{log}</div>)
              : "No logs yet. Trigger pipeline above to view live agent hand-offs."}
          </div>
        </div>
      </div>
    </div>
  );
}