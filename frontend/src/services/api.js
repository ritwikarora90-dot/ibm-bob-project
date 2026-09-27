const API_URL = import.meta.env.VITE_API_URL || "https://ibm-bob-project.onrender.com";

// Core helper for standard POST requests
async function postData(endpoint, bodyData) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    throw new Error(`Failed to request ${endpoint} (Status: ${response.status})`);
  }

  return response.json();
}

// Existing individual modular endpoints
export function analyzeCode(code) {
  return postData("analyze", { code });
}

export function optimizeCode(code) {
  return postData("optimize", { code });
}

export function evaluatePerformance(code) {
  return postData("performance", { code });
}

export function verifyCode(code) {
  return postData("verify", { code });
}

export function patchSecurityCode(code) {
  return postData("security-patch", { code });
}

// ==========================================
// UNIFIED & AUTOMATED PIPELINE ENDPOINTS
// ==========================================

// Master single-trigger multi-agent automated self-healing pipeline
export function runAutoPipeline(code, traceback = "") {
  return postData("pipeline/auto-heal", { code, traceback });
}

// Universal Omni-Agent interface powered by IBM Granite 3.0
export function runOmniAgent(instruction, codeOrInput, language = "python") {
  return postData("api/omni-agent", {
    instruction: instruction,
    code_or_input: codeOrInput,
    language: language,
  });
}