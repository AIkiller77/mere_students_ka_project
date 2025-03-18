from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import medicines, diagnosis, users, blockchain
from app.core.config import settings

app = FastAPI(
    title="TeleMedChain",
    description="A telemedicine platform with AI diagnostics and Web3.0 integration",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(diagnosis.router, prefix="/api/diagnosis", tags=["diagnosis"])
app.include_router(medicines.router, prefix="/api/medicines", tags=["medicines"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])

# Serve static files for frontend
try:
    app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")
except RuntimeError:
    # Handling the case when frontend build directory doesn't exist yet
    pass

@app.get("/api/health", tags=["health"])
async def health_check():
    """
    Health check endpoint to verify the API is running
    """
    return {"status": "ok", "message": "TeleMedChain API is running"}
