import { useState } from "react";
import CodeEditor from "../components/CodeEditor";
import { evaluatePerformance } from "../services/api";

function Performance() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBenchmark = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const data = await evaluatePerformance(code);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Performance Benchmarking</h2>
      <CodeEditor code={code} setCode={setCode} />
      <button 
        onClick={handleBenchmark} 
        style={{ marginTop: "1rem", padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
      >
        {loading ? "Benchmarking..." : "Run Benchmark"}
      </button>

      {result && (
        <div style={{ marginTop: "1.5rem", background: "#1e1e1e", padding: "1.5rem", borderRadius: "8px", color: "#fff" }}>
          <p><strong>Execution Time:</strong> {result.execution_time_estimate}</p>
          <p><strong>Memory Footprint:</strong> {result.memory_footprint}</p>
          <p><strong>CPU Cycles:</strong> {result.cpu_cycles}</p>
          <h4>Bottlenecks Detected:</h4>
          <ul>
            {result.bottlenecks.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Performance;