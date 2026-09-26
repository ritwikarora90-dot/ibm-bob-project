from fastapi import FastAPI
from api.analyze import router as analyze_router

app = FastAPI(title="CodeOpt AI")

# This connects analyze.py to your server
app.include_router(analyze_router)

@app.get("/")
def home():
    return {
        "message": "CodeOpt AI Backend is running!"
    }