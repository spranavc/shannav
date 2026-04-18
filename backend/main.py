from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import trips, users

app = FastAPI(title="Shannav", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(trips.router, prefix="/trips", tags=["trips"])


@app.get("/health")
def health():
    return {"status": "ok"}
