import os
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional, Dict, Any, List

# Load environment variables
load_dotenv()

class Settings(BaseModel):
    """Application settings"""
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "TeleMedChain"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-development-only")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "telemedchain")
    
    # AI/ML Services
    HUGGINGFACE_API_KEY: Optional[str] = os.getenv("HUGGINGFACE_API_KEY")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "google/flan-t5-small")
    
    # Blockchain settings
    WEB3_PROVIDER_URI: str = os.getenv("WEB3_PROVIDER_URI", "http://localhost:8545")
    CHAIN_ID: int = int(os.getenv("CHAIN_ID", "1337"))  # Default: local development chain
    CONTRACT_ADDRESS: Optional[str] = os.getenv("CONTRACT_ADDRESS")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    class Config:
        case_sensitive = True

# Create settings instance
settings = Settings()
