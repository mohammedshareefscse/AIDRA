cd ~/Documents/projects
source .venv/bin/activate

cat > backend/app/main.py <<'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.auth import router as auth_router
from backend.app.api.incidents import router as incident_router
from backend.app.api.sos import router as sos_router
from backend.app.api.dashboard import router as dashboard_router


app = FastAPI(
    title="AIDRA API",
    description="AI-Powered Disaster & Emergency Response Platform",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(sos_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "project": "AIDRA",
        "message": "AI Disaster Response & Emergency Platform",
        "version": "0.1.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "AIDRA API",
    }
EOF