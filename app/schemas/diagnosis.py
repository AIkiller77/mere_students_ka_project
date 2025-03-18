from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class DiagnosisType(str, Enum):
    AI_GENERATED = "ai_generated"
    DOCTOR_PROVIDED = "doctor_provided"
    USER_REPORTED = "user_reported"

class DiagnosisStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    VERIFIED = "verified"  # Verified by a healthcare professional
    REJECTED = "rejected"  # Rejected as inaccurate

class DiagnosisBase(BaseModel):
    user_id: str
    symptoms: List[str]
    medical_history: Optional[str] = None
    diagnosis_type: DiagnosisType
    diagnosis_text: Optional[str] = None
    condition_name: Optional[str] = None
    confidence_score: Optional[float] = None  # For AI-generated diagnoses (0-1)
    recommended_action: Optional[str] = None
    recommended_medicines: Optional[List[str]] = []  # List of medicine IDs
    blockchain_verified: bool = False
    blockchain_hash: Optional[str] = None
    
class DiagnosisCreate(BaseModel):
    user_id: str
    symptoms: List[str]
    medical_history: Optional[str] = None
    diagnosis_type: DiagnosisType = DiagnosisType.AI_GENERATED
    
class DiagnosisUpdate(BaseModel):
    diagnosis_text: Optional[str] = None
    condition_name: Optional[str] = None
    confidence_score: Optional[float] = None
    status: Optional[DiagnosisStatus] = None
    recommended_action: Optional[str] = None
    recommended_medicines: Optional[List[str]] = None
    blockchain_verified: Optional[bool] = None
    blockchain_hash: Optional[str] = None
    
class DiagnosisInDB(DiagnosisBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    status: DiagnosisStatus = DiagnosisStatus.PENDING
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        
class Diagnosis(DiagnosisInDB):
    """Diagnosis model returned to clients"""
    pass

class DiagnosisRequest(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    current_medications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

class DiagnosisResponse(BaseModel):
    diagnosis: str
    confidence: float
    possible_conditions: List[Dict[str, Any]]
    recommended_medicines: List[Dict[str, Any]]
    recommended_actions: List[str]
    disclaimer: str = "This AI-generated diagnosis is for informational purposes only and is not a substitute for professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment."
