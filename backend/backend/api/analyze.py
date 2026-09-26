from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class CodeRequest(BaseModel):
    code: str
    language: str


@router.post("/analyze")
def analyze_code(request: CodeRequest):

    return {
        "language": request.language,
        "message": "Code received successfully",
        "code_length": len(request.code)
    }
