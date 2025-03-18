from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from typing import Any, Dict, List
from app.services.blockchain_service import blockchain_service
from app.db.database import db
from bson import ObjectId
import logging

blockchain_bp = Blueprint('blockchain', __name__)
logger = logging.getLogger(__name__)

@blockchain_bp.route('/status', methods=['GET'])
async def get_blockchain_status():
    """
    Get the current status of the blockchain connection
    """
    status = await blockchain_service.get_connection_status()
    return jsonify(status)

@blockchain_bp.route('/verify-medicine/<medicine_id>', methods=['GET'])
async def verify_medicine_on_blockchain(medicine_id):
    """
    Verify a medicine's authenticity on the blockchain
    """
    # Get medicine data
    medicine = await db.medicines_collection().find_one({"_id": ObjectId(medicine_id)})
    
    if not medicine:
        return jsonify({"detail": "Medicine not found"}), 404
    
    # Convert ObjectId to string for JSON serialization
    medicine["_id"] = str(medicine["_id"])
    
    # Verify on blockchain
    verification_result = await blockchain_service.verify_medicine(
        medicine_id=medicine_id,
        medicine_data=medicine
    )
    
    return jsonify({
        "medicine_id": medicine_id,
        "medicine_name": medicine.get("name", "Unknown"),
        "verification_result": verification_result
    })

@blockchain_bp.route('/verify-diagnosis/<diagnosis_id>', methods=['GET'])
@jwt_required()
async def verify_diagnosis_on_blockchain(diagnosis_id):
    """
    Verify a diagnosis record on the blockchain
    """
    user_id = get_jwt_identity()
    
    # Get diagnosis data
    diagnosis = await db.diagnoses_collection().find_one({
        "_id": ObjectId(diagnosis_id),
        "user_id": user_id
    })
    
    if not diagnosis:
        return jsonify({"detail": "Diagnosis not found"}), 404
    
    # Convert ObjectId to string for JSON serialization
    diagnosis["_id"] = str(diagnosis["_id"])
    
    # Verify on blockchain
    verification_result = await blockchain_service.verify_diagnosis(
        diagnosis_id=diagnosis_id,
        diagnosis_data=diagnosis
    )
    
    return jsonify({
        "diagnosis_id": diagnosis_id,
        "verification_result": verification_result
    })

@blockchain_bp.route('/records', methods=['GET'])
@jwt_required()
async def get_blockchain_records():
    """
    Get all blockchain records associated with the current user
    """
    user_id = get_jwt_identity()
    
    # Get all verified diagnoses for this user
    cursor = db.diagnoses_collection().find({
        "user_id": user_id,
        "blockchain_verified": True
    })
    
    diagnoses = await cursor.to_list(length=100)
    
    # Convert ObjectId to string for JSON serialization
    for diagnosis in diagnoses:
        diagnosis["_id"] = str(diagnosis["_id"])
    
    # Get blockchain verification details for each diagnosis
    blockchain_records = []
    for diagnosis in diagnoses:
        verification = await blockchain_service.get_verification_details(
            record_id=str(diagnosis["_id"]),
            record_type="diagnosis"
        )
        
        blockchain_records.append({
            "record_id": str(diagnosis["_id"]),
            "record_type": "diagnosis",
            "condition": diagnosis.get("condition_name", "Unknown"),
            "created_at": diagnosis.get("created_at"),
            "blockchain_hash": diagnosis.get("blockchain_hash"),
            "verification_details": verification
        })
    
    return jsonify(blockchain_records)

@blockchain_bp.route('/transactions/<tx_hash>', methods=['GET'])
async def get_transaction_details(tx_hash):
    """
    Get details of a blockchain transaction by its hash
    """
    transaction = await blockchain_service.get_transaction_details(tx_hash)
    
    if not transaction:
        return jsonify({"detail": "Transaction not found"}), 404
    
    return jsonify(transaction)

@blockchain_bp.route('/records', methods=['GET'])
@jwt_required()
async def get_blockchain_records():
    """
    Get blockchain records associated with the current user
    """
    user_id = get_jwt_identity()
    
    query = {"user_id": user_id}
    
    cursor = db.blockchain_records_collection().find(query).sort("created_at", -1)
    records = await cursor.to_list(length=100)
    
    # Convert ObjectId to string for JSON serialization
    for record in records:
        record["_id"] = str(record["_id"])
    
    return jsonify(records)

@blockchain_bp.route('/verify-medicine', methods=['POST'])
@jwt_required()
async def verify_medicine_on_blockchain():
    """
    Verify a medicine's information on the blockchain
    This creates a tamper-proof record of the medicine details
    """
    user_id = get_jwt_identity()
    medicine_id = request.json.get("medicine_id")
    
    # Check if medicine exists
    medicine = await db.medicines_collection().find_one({"_id": ObjectId(medicine_id)})
    
    if not medicine:
        return jsonify({"detail": "Medicine not found"}), 404
    
    # Convert ObjectId to string for JSON serialization and blockchain storage
    medicine["_id"] = str(medicine["_id"])
    
    # Verify medicine on blockchain
    result = await blockchain_service.verify_medicine(medicine)
    
    # Create a blockchain record
    record_data = {
        "user_id": user_id,
        "record_type": "medicine_verification",
        "data_hash": result.get("hash"),
        "transaction_hash": result.get("transaction_hash"),
        "smart_contract_address": blockchain_service.contract_address,
        "chain_id": blockchain_service.chain_id,
        "metadata": {
            "medicine_id": medicine_id,
            "medicine_name": medicine.get("name"),
            "verification_result": result
        },
        "status": "confirmed" if result.get("verified") else "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.blockchain_records_collection().insert_one(record_data)
    
    # Update medicine verification status if verified
    if result.get("verified") and not medicine.get("verified_on_blockchain"):
        await db.medicines_collection().update_one(
            {"_id": ObjectId(medicine_id)},
            {"$set": {
                "verified_on_blockchain": True,
                "blockchain_id": result.get("hash"),
                "updated_at": datetime.utcnow()
            }}
        )
    
    return jsonify({
        "medicine_id": medicine_id,
        "verification_result": result,
        "message": "Medicine verification processed"
    })

@blockchain_bp.route('/store-medical-record', methods=['POST'])
@jwt_required()
async def store_medical_record_hash():
    """
    Store a hash of medical record data on the blockchain
    Only the hash is stored, preserving privacy
    """
    user_id = get_jwt_identity()
    record_data = request.json
    
    # Generate a hash of the medical record data
    record_str = str(record_data)
    data_hash = hashlib.sha256(record_str.encode()).hexdigest()
    
    # Create blockchain record
    blockchain_data = {
        "user_id": user_id,
        "record_type": "medical_record",
        "data_hash": data_hash,
        "chain_id": blockchain_service.chain_id,
        "metadata": {
            "record_type": record_data.get("record_type", "general"),
            "timestamp": datetime.utcnow().isoformat()
        },
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert record
    result = await db.blockchain_records_collection().insert_one(blockchain_data)
    record_id = str(result.inserted_id)
    
    # In a real application, this would initiate a blockchain transaction
    # For now, we'll just simulate the process
    
    return jsonify({
        "record_id": record_id,
        "data_hash": data_hash,
        "status": "pending",
        "message": "Medical record hash prepared for blockchain storage"
    })

@blockchain_bp.route('/token-info', methods=['GET'])
@jwt_required()
async def get_token_info():
    """
    Get information about the platform's utility token
    Including user balance if available
    """
    user_id = get_jwt_identity()
    
    # Check if user has a wallet address
    wallet_address = await db.users_collection().find_one({"_id": ObjectId(user_id)}, {"wallet_address": 1})
    user_balance = 0.0
    
    if wallet_address and wallet_address.get("wallet_address"):
        # In a real app, we'd query the token contract for balance
        # For demo purposes, we'll generate a random balance
        import random
        user_balance = round(random.uniform(0, 100), 2)
    
    return jsonify({
        "token_name": "MedToken",
        "token_symbol": "MED",
        "token_address": "0x1234567890123456789012345678901234567890",  # Simulated address
        "user_balance": user_balance,
        "total_supply": 1000000.0
    })

@blockchain_bp.route('/mint-reward', methods=['POST'])
@jwt_required()
async def mint_reward_tokens():
    """
    Mint reward tokens for user actions like completing a diagnosis
    or verifying medicine information
    """
    user_id = get_jwt_identity()
    action_type = request.json.get("action_type")
    
    wallet_address = await db.users_collection().find_one({"_id": ObjectId(user_id)}, {"wallet_address": 1})
    
    if not wallet_address or not wallet_address.get("wallet_address"):
        return jsonify({"detail": "User does not have a registered wallet address"}), 400
    
    # Determine reward amount based on action type
    reward_amounts = {
        "diagnosis": 5.0,
        "medicine_verification": 2.0,
        "profile_completion": 1.0,
        "referral": 10.0
    }
    
    amount = reward_amounts.get(action_type, 1.0)
    
    # In a real app, we'd call the token contract to mint tokens
    # For demo purposes, we'll simulate the transaction
    
    transaction = {
        "from_address": "0x0000000000000000000000000000000000000000",  # Zero address for minting
        "to_address": wallet_address.get("wallet_address"),
        "amount": amount,
        "transaction_hash": f"0x{hashlib.sha256(f'{wallet_address.get("wallet_address")}{datetime.utcnow().isoformat()}'.encode()).hexdigest()}",
        "status": "pending",
        "timestamp": datetime.utcnow()
    }
    
    # Record transaction in database
    await db.blockchain_records_collection().insert_one({
        "user_id": user_id,
        "record_type": "transaction",
        "data_hash": transaction["transaction_hash"],
        "transaction_hash": transaction["transaction_hash"],
        "chain_id": blockchain_service.chain_id,
        "metadata": {
            "transaction_type": "mint",
            "action_type": action_type,
            "amount": amount,
            "wallet_address": wallet_address.get("wallet_address")
        },
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    return jsonify(transaction)
