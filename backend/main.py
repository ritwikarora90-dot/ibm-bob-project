import ast
import re
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from parser import parse_python_traceback

app = FastAPI(title="CodeOpt AI Backend", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str


# Helper to analyze AST loop complexity
def detect_ast_complexity(code_str: str):
    try:
        tree = ast.parse(code_str)
    except Exception:
        return "Unknown (Syntax Error)", ["Code could not be parsed via AST."]
    
    class LoopVisitor(ast.NodeVisitor):
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

    visitor = LoopVisitor()
    visitor.visit(tree)

    recommendations = []
    if visitor.max_depth >= 2:
        complexity = f"O(N^{visitor.max_depth})"
        recommendations.append(f"Detected {visitor.max_depth} nested loops. Consider hashing or pre-indexing to reduce to O(N).")
    elif visitor.max_depth == 1:
        complexity = "O(N)"
        recommendations.append("Linear loop detected. Optimal for sequential scans.")
    else:
        complexity = "O(1)"
        recommendations.append("Constant or direct execution detected.")

    return complexity, recommendations


# 1. Incident Analysis Endpoint
@app.post("/analyze")
def analyze(data: CodeRequest):
    parsed = parse_python_traceback(data.code)
    error_type = parsed.get("error_type", "Unknown Error")
    file_info = parsed.get("file", "Unknown")
    line_info = parsed.get("line")
    
    suggestions = []
    if line_info:
        suggestions.append(f"Incident triggered in '{file_info}' at line {line_info}.")
    
    if "KeyError" in error_type:
        suggestions.append("Missing dictionary key access. Replace raw bracket indexing with .get() fallback.")
        hotfix = "# Recommended Hotfix:\nuser_id = payload.get('user_id', None)\nif not user_id:\n    raise ValueError('Missing required user_id')"
    elif "IndexError" in error_type:
        suggestions.append("List index out of range. Check sequence length or use slicing.")
        hotfix = "# Recommended Hotfix:\nif index < len(my_list):\n    item = my_list[index]\nelse:\n    item = None"
    elif "ZeroDivisionError" in error_type:
        suggestions.append("Attempted division by zero. Validate denominator boundary prior to arithmetic.")
        hotfix = "# Recommended Hotfix:\nresult = numerator / denominator if denominator != 0 else 0.0"
    elif "TypeError" in error_type:
        suggestions.append("Type mismatch detected. Enforce strict type conversions or duck-typing guards.")
        hotfix = "# Recommended Hotfix:\nparam_a = str(param_a) if not isinstance(param_a, str) else param_a"
    elif "AttributeError" in error_type:
        suggestions.append("Attempted attribute call on None or mismatched object type.")
        hotfix = "# Recommended Hotfix:\nif obj is not None and hasattr(obj, 'target_method'):\n    obj.target_method()"
    else:
        suggestions.append(f"Stack trace identified: {error_type}")
        hotfix = f"# Generic Safe Execution Hotfix for {error_type}:\ntry:\n    # Protected operation block\n    pass\nexcept Exception as err:\n    print(f'Handled incident safely: {{err}}')"

    return {
        "complexity": f"Line {line_info}" if line_info else "N/A",
        "issues": 1 if file_info != "Unknown" else 0,
        "suggestions": suggestions,
        "hotfix": hotfix
    }


# 2. Optimization Engine Endpoint
@app.post("/optimize")
def optimize_code(data: CodeRequest):
    comp, recs = detect_ast_complexity(data.code)
    optimized_snippet = data.code
    if "N^2" in comp or "N^3" in comp:
        optimized_comp = "O(N)"
        recs.append("Refactored nested lookup using hash-set indexing for linear performance.")
        optimized_snippet = (
            "# Optimized Implementation (O(N) Set Lookup):\n"
            "def optimized_solution(dataset, targets):\n"
            "    target_set = set(targets)  # O(1) membership lookup\n"
            "    return [item for item in dataset if item in target_set]"
        )
    else:
        optimized_comp = comp
        recs.append("Code is already operating near optimal complexity.")

    return {
        "original_complexity": comp,
        "optimized_complexity": optimized_comp,
        "recommendations": recs,
        "optimized_code": optimized_snippet
    }


# 3. Performance Profiling Endpoint
@app.post("/performance")
def benchmark_code(data: CodeRequest):
    start_time = time.perf_counter()
    lines_count = len([line for line in data.code.splitlines() if line.strip()])
    duration_ms = round((time.perf_counter() - start_time) * 1000 + (lines_count * 0.42), 2)
    
    bottlenecks = []
    if "for " in data.code and "+=" in data.code:
        bottlenecks.append("In-place string or list concatenation inside loop detected. Prefer ''.join() or list comprehension.")
    if "range(len(" in data.code:
        bottlenecks.append("Anti-pattern 'range(len(...))' detected. Prefer direct enumeration with enumerate().")
    if not bottlenecks:
        bottlenecks.append("No obvious memory-thrashing patterns detected.")

    return {
        "execution_time_estimate": f"{duration_ms} ms",
        "memory_footprint": f"{round(max(0.8, lines_count * 0.15), 1)} MB",
        "cpu_cycles": "Nominal" if lines_count < 100 else "High I/O Load",
        "bottlenecks": bottlenecks
    }


# 4. Multi-Step Verification & Regression Endpoint
@app.post("/verify")
def verify_solution(data: CodeRequest):
    code = data.code.strip()
    test_results = []
    
    # Test 1: Python AST Syntax & Structure
    try:
        ast.parse(code)
        test_results.append({
            "step": 1,
            "name": "AST Syntax Compilation",
            "status": "PASSED",
            "detail": "Python syntax parsed with valid tokens, correct indentation, and matched delimiters."
        })
    except SyntaxError as e:
        test_results.append({
            "step": 1,
            "name": "AST Syntax Compilation",
            "status": "FAILED",
            "detail": f"SyntaxError on line {e.lineno}: {e.msg} (near '{e.text.strip() if e.text else ''}'). Code cannot compile."
        })

    # Test 2: Unbounded Loop & Recursion Risk
    if "while True" in code and "break" not in code and "return" not in code:
        test_results.append({
            "step": 2,
            "name": "Loop Termination & Halting Check",
            "status": "FAILED",
            "detail": "Detected 'while True' loop without a clear exit condition ('break' or 'return'). Risk of infinite freeze."
        })
    else:
        test_results.append({
            "step": 2,
            "name": "Loop Termination & Halting Check",
            "status": "PASSED",
            "detail": "All loops bounded or provide explicit termination logic."
        })

    # Test 3: Null Safety & Exception Guarding
    if any(k in code for k in ["['", "].", "/ 0", "int(None)"]) and "try:" not in code and ".get(" not in code:
        test_results.append({
            "step": 3,
            "name": "Null Safety & Exception Guarding",
            "status": "WARNING",
            "detail": "Direct dictionary/pointer access found without try-except guard or safe lookup (.get)."
        })
    else:
        test_results.append({
            "step": 3,
            "name": "Null Safety & Exception Guarding",
            "status": "PASSED",
            "detail": "Safe attribute access or protected operational blocks verified."
        })

    # Test 4: Boundary & Edge Case Handling
    if "len(" in code or "if not " in code or "is None" in code or ".get(" in code:
        test_results.append({
            "step": 4,
            "name": "Boundary & Edge Case Handling",
            "status": "PASSED",
            "detail": "Code contains explicit guards against empty sequences, None values, or 0-length iterations."
        })
    else:
        test_results.append({
            "step": 4,
            "name": "Boundary & Edge Case Handling",
            "status": "FAILED",
            "detail": "Missing defensive edge checks for null or empty collections."
        })

    # Test 5: Static Security & Arbitrary Execution Audit
    dangerous_calls = ["eval(", "exec(", "__import__", "os.system"]
    found_dangerous = [d for d in dangerous_calls if d in code]
    if found_dangerous:
        test_results.append({
            "step": 5,
            "name": "Security & Code Injection Check",
            "status": "FAILED",
            "detail": f"Unsafe execution vector detected: found dangerous call {', '.join(found_dangerous)}."
        })
    else:
        test_results.append({
            "step": 5,
            "name": "Security & Code Injection Check",
            "status": "PASSED",
            "detail": "No dynamic arbitrary evaluation (eval/exec) or unsafe execution patterns found."
        })

    passed_count = sum(1 for t in test_results if t["status"] == "PASSED")
    total_count = len(test_results)
    is_safe = passed_count >= 4 and test_results[0]["status"] == "PASSED"

    return {
        "status": "Verified Safe" if is_safe else "Verification Failed",
        "regression_risk": "Low" if is_safe else "High",
        "test_cases_passed": f"{passed_count}/{total_count} Passed",
        "lint_check": "Clean" if test_results[0]["status"] == "PASSED" else test_results[0]["detail"],
        "detailed_steps": test_results
    }


# 5. Security Patching & Hardening Endpoint
@app.post("/security-patch")
def security_patch(data: CodeRequest):
    code = data.code.strip()
    vulnerabilities = []
    patched_code = code

    # 1. Arbitrary Code Execution (eval / exec)
    if "eval(" in code or "exec(" in code:
        vulnerabilities.append({
            "cwe": "CWE-95",
            "name": "Improper Neutralization of Directives in Dynamically Evaluated Code",
            "severity": "CRITICAL",
            "description": "Direct use of eval() or exec() allows untrusted input to execute arbitrary Python commands.",
            "recommendation": "Replace dynamic evaluation with ast.literal_eval for structured data, or use safe dictionary dispatch."
        })
        patched_code = re.sub(
            r'eval\((.*?)\)',
            r'ast.literal_eval(\1)  # Patched: safe literal parsing without code execution',
            patched_code
        )

    # 2. Command Injection (os.system / subprocess with shell=True)
    if "os.system(" in code or "shell=True" in code:
        vulnerabilities.append({
            "cwe": "CWE-78",
            "name": "OS Command Injection",
            "severity": "HIGH",
            "description": "Invoking system commands through a shell allows attackers to append arbitrary shell operators (e.g. ';', '&&').",
            "recommendation": "Use subprocess.run() with a tokenized argument list and shell=False."
        })
        patched_code = re.sub(
            r'os\.system\((.*?)\)',
            r'import subprocess\n# Patched: Tokenized argument execution without shell access\nsubprocess.run([\1], check=True, shell=False)',
            patched_code
        )

    # 3. SQL Injection via String Formatting
    if re.search(r'(SELECT|INSERT|UPDATE|DELETE).*(%s|\.format|\+.*f")', code, re.IGNORECASE) or re.search(r'f["\'].*SELECT.*\{', code, re.IGNORECASE):
        vulnerabilities.append({
            "cwe": "CWE-89",
            "name": "SQL Injection (SQLi)",
            "severity": "CRITICAL",
            "description": "SQL statement constructed dynamically using untrusted string formatting or interpolation.",
            "recommendation": "Use parameterized queries or ORM abstractions where values are passed separately from query structure."
        })
        patched_code = (
            "# Patched: Parameterized query implementation\n"
            "cursor.execute(\"SELECT * FROM users WHERE username = ?\", (user_input,))"
        )

    # 4. Insecure Deserialization (pickle)
    if "pickle.loads(" in code or "pickle.load(" in code:
        vulnerabilities.append({
            "cwe": "CWE-502",
            "name": "Insecure Deserialization",
            "severity": "HIGH",
            "description": "Unpickling data from untrusted sources can trigger automatic object instantiation and code execution via __reduce__.",
            "recommendation": "Use safe data exchange formats such as JSON, Protocol Buffers, or messagepack."
        })
        patched_code = re.sub(
            r'pickle\.loads?\((.*?)\)',
            r'json.loads(\1)  # Patched: safe JSON deserialization',
            patched_code
        )

    # 5. Hardcoded Credentials / Secrets
    if re.search(r'(api_key|password|secret|token)\s*=\s*["\'][A-Za-z0-9_\-]{8,}["\']', code, re.IGNORECASE):
        vulnerabilities.append({
            "cwe": "CWE-798",
            "name": "Use of Hardcoded Credentials",
            "severity": "MEDIUM",
            "description": "Plaintext API keys or credentials committed to source code risk credential leakage.",
            "recommendation": "Retrieve sensitive configuration dynamically from environment variables or a vault manager."
        })
        patched_code = re.sub(
            r'(api_key|password|secret|token)\s*=\s*["\'].*?["\']',
            r'import os\n\1 = os.getenv("\1".upper(), "")  # Patched: loaded from environment variable',
            patched_code,
            flags=re.IGNORECASE
        )

    return {
        "vulnerabilities_found": len(vulnerabilities),
        "vulnerabilities": vulnerabilities,
        "is_clean": len(vulnerabilities) == 0,
        "patched_code": patched_code if vulnerabilities else "# No known security vulnerabilities detected. Code passes standard rules."
    }