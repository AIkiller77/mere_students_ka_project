from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class BlockchainRecordType(str, Enum):
    MEDICAL_RECORD = "medical_record"
    DIAGNOSIS = "diagnosis"
    MEDICINE_VERIFICATION = "medicine_verification"
    PRESCRIPTION = "prescription"
    USER_CONSENT = "user_consent"
    TRANSACTION = "transaction"

class BlockchainBase(BaseModel):
    user_id: str
    record_type: BlockchainRecordType
    data_hash: str  # Hash of the data being stored
    transaction_hash: Optional[str] = None  # Blockchain transaction hash
    smart_contract_address: Optional[str] = None
    chain_id: int  # Which blockchain network
    metadata: Optional[Dict[str, Any]] = {}
    status: str = "pending"  # pending, confirmed, failed

class BlockchainCreate(BlockchainBase):
    pass

class BlockchainUpdate(BaseModel):
    transaction_hash: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class BlockchainInDB(BlockchainBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class BlockchainRecord(BlockchainInDB):
    """Blockchain record returned to clients"""
    pass

class TokenData(BaseModel):
    token_name: str = "MedToken"
    token_symbol: str = "MED"
    token_address: str
    user_balance: float = 0.0
    total_supply: float

class TokenTransaction(BaseModel):
    from_address: str
    to_address: str
    amount: float
    transaction_hash: Optional[str] = None
    status: str = "pending"
    timestamp: Optional[datetime] = None

class SmartContractInteraction(BaseModel):
    contract_address: str
    contract_name: str
    function_name: str
    parameters: Dict[str, Any]
    value: Optional[float] = 0  # Ether value to send
    estimated_gas: Optional[int] = None
    transaction_hash: Optional[str] = None
    
class Web3ConnectionStatus(BaseModel):
    connected: bool
    network_name: str
    chain_id: int
    latest_block: int
    gas_price: str
