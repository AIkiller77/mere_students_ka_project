from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MedicineType(str, Enum):
    TABLET = "tablet"
    CAPSULE = "capsule"
    SYRUP = "syrup"
    INJECTION = "injection"
    TOPICAL = "topical"
    OTHER = "other"

class MedicineBase(BaseModel):
    name: str
    generic_name: str
    description: Optional[str] = None
    dosage_form: MedicineType
    active_ingredients: List[str]
    indications: List[str]
    contraindications: Optional[List[str]] = []
    side_effects: Optional[List[str]] = []
    usage_instructions: Optional[str] = None
    manufacturer: Optional[str] = None
    popularity_score: Optional[float] = 0.0  # 0-10 scale
    verified_on_blockchain: Optional[bool] = False
    blockchain_id: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    description: Optional[str] = None
    dosage_form: Optional[MedicineType] = None
    active_ingredients: Optional[List[str]] = None
    indications: Optional[List[str]] = None
    contraindications: Optional[List[str]] = None
    side_effects: Optional[List[str]] = None
    usage_instructions: Optional[str] = None
    manufacturer: Optional[str] = None
    popularity_score: Optional[float] = None
    verified_on_blockchain: Optional[bool] = None
    blockchain_id: Optional[str] = None

class MedicineInDB(MedicineBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class Medicine(MedicineInDB):
    """Medicine model returned to clients"""
    pass

class MedicinePrice(BaseModel):
    medicine_id: str
    location: str
    price: float
    currency: str = "USD"
    last_updated: datetime
    
    class Config:
        orm_mode = True

class MedicineSearchParams(BaseModel):
    diagnosis: Optional[str] = None
    location: Optional[str] = None
    active_ingredient: Optional[str] = None
    name_query: Optional[str] = None
    sort_by: Optional[str] = "popularity_score"  # popularity_score, price_asc, price_desc
    limit: int = 10
    skip: int = 0

class MedicineWithPrice(Medicine):
    prices: List[MedicinePrice]
