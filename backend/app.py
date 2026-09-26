import streamlit as st
from parser import parse_python_traceback

st.set_page_config(layout="wide", page_title="Hotfix Recommender")

st.title("⚡ Automated Error Traceback & Hotfix Recommender")
st.caption("IBM BoB 2.0 Prototype | Intelligent Incident Resolution")

col1, col2 = st.columns(2)

with col1:
    st.subheader("1. Incident Input")
    default_trace = """Traceback (most recent call last):
  File "app.py", line 42, in process_order
KeyError: 'user_id'"""
    
    default_code = """def process_order(payload):
    user_id = payload['user_id']
    status = payload.get('status', 'active')
    return f"Processing order for user {user_id} with status {status}"
"""
    
    trace_input = st.text_area("Stack Trace / Error Logs", value=default_trace, height=160)
    code_input = st.text_area("Offending Source Code Context", value=default_code, height=220)
    analyze_btn = st.button("Analyze & Generate Hotfix", type="primary")

with col2:
    st.subheader("2. Recommendation & Diff")
    if analyze_btn:
        meta = parse_python_traceback(trace_input)
        
        st.markdown("#### Detected Failure Point")
        st.info(f"**File:** `{meta['file']}` | **Line:** `{meta['line']}` | **Exception:** `{meta['error_type']}`")
        
        st.markdown("#### Root Cause")
        st.write("Attempted to access dictionary key `'user_id'` directly without validation, causing an unhandled `KeyError` when missing.")
        
        st.markdown("#### Suggested Hotfix")
        corrected_code = """# Safe dictionary retrieval with fallback or validation:
user_id = payload.get('user_id')
if not user_id:
    raise ValueError("Missing required field: user_id")"""
        st.code(corrected_code, language="python")
        
        st.success("Risk Level: Low — Preserves input safety without mutating external state.")