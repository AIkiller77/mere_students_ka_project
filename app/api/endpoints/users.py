from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from typing import Any, Dict
from app.utils.security import (
    verify_eth_signature,
    create_authentication_message
)
from app.db.database import db
from datetime import datetime, timedelta
from app.core.config import settings
from bson import ObjectId
import logging

users_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

# Helper functions
async def get_user_by_email(email: str):
    return await db.users_collection().find_one({"email": email})

async def get_user_by_id(user_id: str):
    return await db.users_collection().find_one({"_id": ObjectId(user_id)})

async def get_user_by_wallet(wallet_address: str):
    return await db.users_collection().find_one({"wallet_address": wallet_address})

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return False
    if not check_password_hash(user.get("hashed_password", ""), password):
        return False
    return user

# Endpoints
@users_bp.route('/register', methods=['POST'])
async def register_user():
    """
    Register a new user
    """
    user_data = request.json
    
    # Check if user already exists
    user = await get_user_by_email(user_data.get('email'))
    if user:
        return jsonify({"detail": "Email already registered"}), 400
    
    # Create new user
    hashed_password = generate_password_hash(user_data.get('password'))
    user_data.pop('password', None)
    user_data["hashed_password"] = hashed_password
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    
    result = await db.users_collection().insert_one(user_data)
    
    # Get the created user
    created_user = await get_user_by_id(str(result.inserted_id))
    created_user["_id"] = str(created_user["_id"])
    
    # Remove sensitive fields
    created_user.pop('hashed_password', None)
    
    return jsonify(created_user), 201

@users_bp.route('/login', methods=['POST'])
async def login():
    """
    Login to get an access token for future requests
    """
    data = request.json
    user = await authenticate_user(data.get('email'), data.get('password'))
    if not user:
        return jsonify({"detail": "Incorrect email or password"}), 401
    
    # Create access token
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        identity=str(user["_id"]), 
        expires_delta=expires_delta
    )
    
    return jsonify({
        "access_token": access_token,
        "token_type": "bearer"
    })

@users_bp.route('/web3-login', methods=['POST'])
async def web3_login():
    """
    Web3 wallet-based authentication
    """
    data = request.json
    
    # Verify signature
    is_valid = verify_eth_signature(
        message=data.get('message'),
        signature=data.get('signature'),
        wallet_address=data.get('wallet_address')
    )
    
    if not is_valid:
        return jsonify({"detail": "Invalid signature"}), 401
    
    # Get user by wallet address
    user = await get_user_by_wallet(data.get('wallet_address'))
    
    if not user:
        # In a production app, you might want to create a new user here
        # or require registration first
        return jsonify({"detail": "Wallet address not registered"}), 404
    
    # Create access token
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        identity=str(user["_id"]),
        expires_delta=expires_delta
    )
    
    return jsonify({
        "access_token": access_token,
        "token_type": "bearer"
    })

@users_bp.route('/me', methods=['GET'])
@jwt_required()
async def get_me():
    """
    Get current user information
    """
    user_id = get_jwt_identity()
    user = await get_user_by_id(user_id)
    
    if not user:
        return jsonify({"detail": "User not found"}), 404
    
    user["_id"] = str(user["_id"])
    # Remove sensitive fields
    user.pop('hashed_password', None)
    
    return jsonify(user)

@users_bp.route('/me', methods=['PUT'])
@jwt_required()
async def update_user():
    """
    Update current user information
    """
    user_id = get_jwt_identity()
    user_data = request.json
    
    # Filter out None values
    update_data = {k: v for k, v in user_data.items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update user
    await db.users_collection().update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await get_user_by_id(user_id)
    updated_user["_id"] = str(updated_user["_id"])
    updated_user.pop('hashed_password', None)
    
    return jsonify(updated_user)
