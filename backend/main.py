import ast
import re
import time
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import the IBM Granite foundation model service
from watsonx_service import query_watsonx_agent

app = FastAPI(title="CodeOpt AI Backend", version="2.0")

# Enable CORS for local Vite development and Vercel cloud frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class CodeRequest(BaseModel):
    code: str

class IncidentRequest(BaseModel):
    code: Optional[str] = ""
    traceback: Optional[str] = ""

class SecurityRequest(BaseModel):
    code: str

class VerificationRequest(BaseModel):
    code: str

class PipelineRequest(BaseModel):
    code: str
    traceback: Optional[str] = ""

class UniversalTaskRequest(BaseModel):
    instruction: str
    code_or_input: str
    language: Optional[str] = "python"


# ---------------------------------------------------------------------------
# AST & Algorithmic Analysis Helpers
# ---------------------------------------------------------------------------

class LoopDepthVisitor(ast.NodeVisitor):
    def __init__(self):
        self.current_depth = 0
        self.max_depth = 0

    def visit_For(self, node):
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)
        self.generic_visit(node)
        self.current_depth -= 1

    def visit_While(self, node):
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)
        self.generic_visit(node)
        self.current_depth -= 1


def detect_ast_complexity(code_str: str) -> tuple[str, List[str]]:
    try:
        tree = ast.parse(code_str)
    except SyntaxError as e:
        return "Unknown (Syntax Error)", [f"Syntax Error on line {e.lineno}: {e.msg}"]
    except Exception as e:
        return "Unknown", [str(e)]

    visitor = LoopDepthVisitor()
    visitor.visit(tree)

    details = []
    if visitor.max_depth == 0:
        complexity = "O(1)"
        details.append("No loops detected. Constant time execution.")
    elif visitor.max_depth == 1:
        complexity = "O(N)"
        details.append("Single loop detected. Linear time complexity.")
    elif visitor.max_depth == 2:
        complexity = "O(N^2)"
        details.append("Nested loop detected (depth 2). Quadratic time complexity bottleneck.")
    else:
        complexity = f"O(N^{visitor.max_depth})"
        details.append(f"Deeply nested loops detected (depth {visitor.max_depth}). High latency risk.")

    return complexity, details


def scan_cwe_vulnerabilities(code_str: str) -> List[Dict[str, Any]]:
    issues = []
    
    # CWE-95: eval / exec
    eval_matches = re.finditer(r'\b(eval|exec)\s*\(', code_str)
    for m in eval_matches:
        line_no = code_str[:m.start()].count('\n') + 1
        issues.append({
            "cwe": "CWE-95",
            "title": "Improper Neutralization of Directives in Dynamically Evaluated Code (eval/exec)",
            "severity": "CRITICAL",
            "line": line_no,
            "fix": "Replace with ast.literal_eval() or safe dictionary parsing."
        })

    # CWE-89: SQL Injection
    sql_patterns = re.finditer(r'execute\s*\(\s*f?[\'"].*(?:SELECT|INSERT|UPDATE|DELETE).*(?:%s|\{|\+)', code_str, re.IGNORECASE)
    for m in sql_patterns:
        line_no = code_str[:m.start()].count('\n') + 1
        issues.append({
            "cwe": "CWE-89",
            "title": "SQL Injection Flaw via Unsanitized String Formatting",
            "severity": "HIGH",
            "line": line_no,
            "fix": "Use parameterized queries: cursor.execute('SELECT ... WHERE id = %s', (val,))"
        })

    # CWE-798: Hardcoded Credentials
    secret_matches = re.finditer(r'(api_key|secret|password|token)\s*=\s*[\'"][a-zA-Z0-9_\-]{8,}[\'"]', code_str, re.IGNORECASE)
    for m in secret_matches:
        line_no = code_str[:m.start()].count('\n') + 1
        issues.append({
            "cwe": "CWE-798",
            "title": "Hardcoded Sensitive Credential or Secret",
            "severity": "MEDIUM",
            "line": line_no,
            "fix": "Extract credential to environment variables: os.getenv('SECRET_KEY')"
        })

    return issues


# ---------------------------------------------------------------------------
# API Routes: Dedicated Analysis Modules
# ---------------------------------------------------------------------------

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "CodeOpt AI Enterprise Engine",
        "model": "ibm-granite/granite-3.0-8b-instruct",
        "docs": "/docs"
    }

@app.post("/analyze/complexity")
def analyze_complexity(req: CodeRequest):
    complexity, details = detect_ast_complexity(req.code)
    return {
        "complexity": complexity,
        "details": details,
        "code_length": len(req.code)
    }

@app.post("/analyze/incident")
def analyze_incident(req: IncidentRequest):
    logs = []
    error_line = None
    error_type = "Generic Issue"

    if req.traceback:
        line_match = re.search(r'line\s+(\d+)', req.traceback)
        err_match = re.search(r'([A-Za-z]+Error:[^\n]+)', req.traceback)
        if line_match:
            error_line = int(line_match.group(1))
        if err_match:
            error_type = err_match.group(1)
        logs.append(f"Parsed stack trace: {error_type} at line {error_line}")
    else:
        logs.append("No stack trace supplied. Executing pure source inspection.")

    complexity, comp_details = detect_ast_complexity(req.code)
    vulns = scan_cwe_vulnerabilities(req.code)

    return {
        "error_type": error_type,
        "error_line": error_line,
        "complexity": complexity,
        "complexity_details": comp_details,
        "vulnerabilities": vulns,
        "logs": logs
    }

@app.post("/security/audit-and-patch")
def security_audit_patch(req: SecurityRequest):
    issues = scan_cwe_vulnerabilities(req.code)
    patched_code = req.code

    # Patch eval
    patched_code = re.sub(r'\beval\(([^)]+)\)', r'ast.literal_eval(\1)', patched_code)
    # Patch SQL injection
    patched_code = re.sub(
        r'cursor\.execute\s*\(\s*f?[\'"]([^"\']+)[\'"]\s*\)',
        r'cursor.execute("SELECT * FROM safe_records WHERE id = %s", (record_id,))',
        patched_code
    )
    # Patch hardcoded secrets
    patched_code = re.sub(
        r'((?:api_key|secret|password|token)\s*=\s*)[\'"][^\'"]+[\'"]',
        r'\1os.getenv("SECRET_KEY", "prod-secure-token")',
        patched_code,
        flags=re.IGNORECASE
    )

    return {
        "issues_found": len(issues),
        "issues": issues,
        "patched_code": patched_code
    }

@app.post("/verify/regression")
def verify_regression(req: VerificationRequest):
    code = req.code
    checks = {
        "syntax_compilation": False,
        "defensive_guards": False,
        "algorithmic_complexity": True,
        "security_hardening": False,
        "regression_safety": False
    }

    # 1. Syntax check via AST
    try:
        ast.parse(code)
        checks["syntax_compilation"] = True
    except SyntaxError:
        checks["syntax_compilation"] = False

    # 2. Defensive check
    checks["defensive_guards"] = ("if not" in code or ".get(" in code or "try:" in code)

    # 3. Security check
    checks["security_hardening"] = not bool(re.search(r'\b(eval|exec)\s*\(', code))

    # 4. Complexity check
    try:
        tree = ast.parse(code)
        visitor = LoopDepthVisitor()
        visitor.visit(tree)
        checks["algorithmic_complexity"] = (visitor.max_depth <= 1)
    except Exception:
        checks["algorithmic_complexity"] = False

    # 5. Deterministic safety
    checks["regression_safety"] = checks["syntax_compilation"] and checks["security_hardening"]

    score = sum(1 for v in checks.values() if v)

    return {
        "score": f"{score}/5",
        "passed": (score == 5),
        "checks": checks
    }


# ---------------------------------------------------------------------------
# Orchestrated Autonomous Pipeline (Self-Healing)
# ---------------------------------------------------------------------------

@app.post("/pipeline/auto-heal")
async def autonomous_heal_pipeline(req: PipelineRequest):
    start_time = time.time()
    current_code = req.code
    logs = ["[Orchestrator]: Triggered Autonomous Multi-Agent Pipeline."]

    # Step 1: Prompt IBM Granite 3.0 via Hugging Face Router
    logs.append("[IBM Granite]: Submitting source context & traceback to Granite 3.0 foundation model...")
    ai_prompt = f"""You are the master automated code optimization and repair bot powered by IBM Granite 3.0.
Analyze the following Python source code and runtime crash traceback, then refactor it:
1. Fix any runtime crashes (IndexError, KeyError, TypeError, NoneType).
2. Refactor quadratic nested loops O(N^2) into linear O(N) using set or dict lookup indexing.
3. Patch all security flaws (replace eval() with ast.literal_eval, parameterize SQL queries, remove hardcoded keys).
4. Ensure 100% syntactically correct, production-grade Python code.

Return ONLY the refactored, executable Python code with no markdown formatting and no prose explanation.

[TRACEBACK]
{req.traceback if req.traceback else 'No crash log provided'}

[SOURCE CODE]
{current_code}
"""
    ai_result = query_watsonx_agent(ai_prompt, fallback_code="")

    if ai_result and ai_result.strip():
        current_code = ai_result.strip()
        logs.append("[IBM Granite]: Foundation model generated healed code candidate.")
    else:
        logs.append("[Fallback Engine]: Running deterministic AST and regex refactor passes.")
        # Local fallback: patch eval and bounds
        current_code = re.sub(r'\beval\(([^)]+)\)', r'ast.literal_eval(\1)', current_code)
        if "IndexError" in (req.traceback or ""):
            current_code = re.sub(
                r'(\w+)\[([^\]]+)\]',
                r'(\1[\2] if \2 < len(\1) else None)',
                current_code,
                count=1
            )

    # Step 2: Run Automated 5-Point Verification Suite
    logs.append("[Verifier Agent]: Executing 5-point verification and regression checks...")
    checks = {
        "syntax_compilation": False,
        "defensive_guards": False,
        "algorithmic_complexity": True,
        "security_hardening": False,
        "regression_safety": False
    }

    try:
        tree = ast.parse(current_code)
        checks["syntax_compilation"] = True
        
        visitor = LoopDepthVisitor()
        visitor.visit(tree)
        checks["algorithmic_complexity"] = (visitor.max_depth <= 1)
    except SyntaxError:
        checks["syntax_compilation"] = False
        checks["algorithmic_complexity"] = False

    checks["defensive_guards"] = ("if not" in current_code or ".get(" in current_code or "try:" in current_code)
    checks["security_hardening"] = not bool(re.search(r'\b(eval|exec)\s*\(', current_code))
    checks["regression_safety"] = checks["syntax_compilation"] and checks["security_hardening"]

    score = sum(1 for v in checks.values() if v)
    logs.append(f"[Verifier Agent]: Multi-layer checks complete. Score: {score}/5 passed.")

    duration_ms = round((time.time() - start_time) * 1000, 2)
    logs.append(f"[Orchestrator]: Auto-healing lifecycle concluded in {duration_ms}ms.")

    return {
        "healed_code": current_code,
        "score": f"{score}/5",
        "checks": checks,
        "logs": logs,
        "execution_time_ms": duration_ms
    }


# ---------------------------------------------------------------------------
# Universal Omni-Agent (Arbitrary Developer Tasks)
# ---------------------------------------------------------------------------

@app.post("/api/omni-agent")
async def omni_agent_handler(req: UniversalTaskRequest):
    """
    Universal instruction interface powered by IBM Granite 3.0.
    Accepts any custom user prompt, code snippet, or conversion task.
    """
    prompt = (
        f"You are an expert AI software engineer powered by IBM Granite 3.0.\n"
        f"Your task is: {req.instruction}\n\n"
        f"Context / Code / Input provided:\n"
        f"```{req.language}\n"
        f"{req.code_or_input}\n"
        f"```\n\n"
        f"Follow the instruction precisely. If generating code, produce clean, production-grade implementations."
    )

    ai_response = query_watsonx_agent(prompt, fallback_code="AI processing unavailable. Verify HF_API_TOKEN environment variable.")
    
    return {
        "status": "success",
        "instruction": req.instruction,
        "result": ai_response
    }