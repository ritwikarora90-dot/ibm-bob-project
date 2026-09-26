import re

def parse_python_traceback(traceback_text: str):
    matches = list(re.finditer(r'File "([^"]+)", line (\d+)(?:, in (.+))?', traceback_text))
    error_lines = [line.strip() for line in traceback_text.strip().splitlines() if line.strip()]
    final_error = error_lines[-1] if error_lines else "Unknown Error"

    if matches:
        last_match = matches[-1]
        return {
            "file": last_match.group(1),
            "line": int(last_match.group(2)),
            "function": last_match.group(3) or "module level",
            "error_type": final_error
        }
    return {
        "file": "Unknown",
        "line": None,
        "function": "Unknown",
        "error_type": final_error
    }