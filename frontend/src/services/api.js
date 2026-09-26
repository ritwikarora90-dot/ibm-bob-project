const API_URL = "http://localhost:8001";

async function postData(endpoint, code) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request ${endpoint}`);
  }

  return response.json();
}

export function analyzeCode(code) {
  return postData("analyze", code);
}

export function optimizeCode(code) {
  return postData("optimize", code);
}

export function evaluatePerformance(code) {
  return postData("performance", code);
}

export function verifyCode(code) {
  return postData("verify", code);
}

export function patchSecurityCode(code) {
  return postData("security-patch", code);
}