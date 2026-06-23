import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi import FastAPI
from app.routes.match import router as match_router

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "FastAPI working"}

app.include_router(match_router)