import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from jose import jwt
from flask_jwt_extended import create_access_token as flask_create_access_token
from eth_account.messages import encode_defunct
from eth_account import Account
import secrets
import logging

logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = os.environ.get("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"

def create_authentication_message(wallet_address: str) -> str:
    """
    Create a message for Web3 authentication
    """
    timestamp = datetime.utcnow().isoformat()
    return f"Sign this message to authenticate with TeleMedChain: {wallet_address} at {timestamp}"

def verify_eth_signature(message: str, signature: str, wallet_address: str) -> bool:
    """
    Verify an Ethereum signature
    """
    try:
        message_hash = encode_defunct(text=message)
        recovered_address = Account.recover_message(message_hash, signature=signature)
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        logger.error(f"Error verifying Ethereum signature: {e}")
        return False

def create_access_token(identity: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    return flask_create_access_token(
        identity=identity,
        expires_delta=expires_delta
    )

def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode a JWT token
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception as e:
        logger.error(f"Error decoding token: {e}")
        return {}
