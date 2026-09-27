from fastapi import FastAPI

app = FastAPI(
    title="AIDRA API",
    description="AI-Powered Disaster & Emergency Response Platform",
    version="0.1.0"
)

@app.get("/")
def root():
    return {
        "project": "AIDRA",
        "message": "AI-Powered Disaster & Emergency Response Platform",
        "version": "0.1.0"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "AIDRA API"
    }
