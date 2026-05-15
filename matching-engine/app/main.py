from fastapi import FastAPI
from app.routes.match import router as match_router

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "FastAPI working"}

app.include_router(match_router)