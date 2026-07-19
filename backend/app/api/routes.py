from fastapi import APIRouter

router = APIRouter()


@router.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to AI-Powered DevOps Copilot 🚀"
    }

@router.get("/crash", tags=["Root"])
async def crash():
    raise Exception("Testing global exception handler")