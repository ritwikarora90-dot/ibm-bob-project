function CodeEditor({ code, setCode, placeholder = "Paste code snippet or traceback here..." }) {
  return (
    <div style={{
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      overflow: "hidden",
      backgroundColor: "#0d1117",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
    }}>
      {/* Code Editor Header Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        backgroundColor: "rgba(22, 27, 34, 0.8)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
        </div>
        <span style={{ fontSize: "0.78rem", color: "#64748b", fontFamily: "JetBrains Mono, monospace" }}>
          python-env • UTF-8
        </span>
      </div>

      {/* Editor Surface */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={placeholder}
        rows={10}
        spellCheck="false"
        style={{
          width: "100%",
          padding: "16px",
          backgroundColor: "transparent",
          color: "#e2e8f0",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.95rem",
          lineHeight: "1.6",
          border: "none",
          outline: "none",
          resize: "vertical"
        }}
      />
    </div>
  );
}

export default CodeEditor;