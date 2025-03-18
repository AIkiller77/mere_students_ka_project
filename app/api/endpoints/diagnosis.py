from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from typing import Any, Dict, List
from app.services.diagnosis_service import diagnosis_service
from app.services.medicine_service import medicine_service
from app.db.database import db
from datetime import datetime
from bson import ObjectId
import logging
import hashlib

diagnosis_bp = Blueprint('diagnosis', __name__)
logger = logging.getLogger(__name__)

@diagnosis_bp.route('/analyze', methods=['POST'])
@jwt_required()
async def analyze_symptoms():
    """
    Analyze symptoms using AI and suggest possible diagnoses and medicines
    This is a supplementary tool and not a replacement for professional medical advice
    """
    user_id = get_jwt_identity()
    request_data = request.json
    
    # Prepare request data including user information
    request_data["user_id"] = user_id
    
    # Generate diagnosis using AI service
    diagnosis_result = await diagnosis_service.generate_diagnosis(request_data)
    
    # Save the diagnosis to the database
    diagnosis_data = {
        "user_id": user_id,
        "symptoms": request_data.get("symptoms", []),
        "medical_history": request_data.get("medical_history", ""),
        "diagnosis_type": "ai_generated",
        "diagnosis_text": diagnosis_result.get("diagnosis"),
        "condition_name": diagnosis_result.get("diagnosis"),
        "confidence_score": diagnosis_result.get("confidence", 0) / 100.0,  # Convert to 0-1 scale
        "status": "completed",
        "recommended_medicines": [],  # Will be populated after getting medicine IDs
        "blockchain_verified": "blockchain_verification" in diagnosis_result,
        "blockchain_hash": diagnosis_result.get("blockchain_verification", {}).get("hash"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert diagnosis record
    result = await db.diagnoses_collection().insert_one(diagnosis_data)
    diagnosis_id = str(result.inserted_id)
    
    # Update the user's medical history to include this diagnosis
    await db.users_collection().update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"medical_history": diagnosis_id}}
    )
    
    return jsonify(diagnosis_result)

@diagnosis_bp.route('/history', methods=['GET'])
@jwt_required()
async def get_diagnosis_history():
    """
    Get the user's diagnosis history
    """
    user_id = get_jwt_identity()
    
    cursor = db.diagnoses_collection().find(
        {"user_id": user_id}
    ).sort("created_at", -1)
    
    diagnoses = await cursor.to_list(length=100)
    
    # Convert ObjectId to string for JSON serialization
    for diagnosis in diagnoses:
        diagnosis["_id"] = str(diagnosis["_id"])
    
    return jsonify(diagnoses)

@diagnosis_bp.route('/<diagnosis_id>', methods=['GET'])
@jwt_required()
async def get_diagnosis_by_id(diagnosis_id):
    """
    Get a specific diagnosis by ID
    """
    user_id = get_jwt_identity()
    
    diagnosis = await db.diagnoses_collection().find_one({
        "_id": ObjectId(diagnosis_id),
        "user_id": user_id
    })
    
    if not diagnosis:
        return jsonify({"detail": "Diagnosis not found"}), 404
    
    # Convert ObjectId to string for JSON serialization
    diagnosis["_id"] = str(diagnosis["_id"])
    
    return jsonify(diagnosis)

@diagnosis_bp.route('/<diagnosis_id>/verify', methods=['POST'])
@jwt_required()
async def verify_diagnosis_on_blockchain(diagnosis_id):
    """
    Verify a diagnosis on the blockchain
    This creates a tamper-proof record of the diagnosis
    """
    user_id = get_jwt_identity()
    
    # Get the diagnosis
    diagnosis = await db.diagnoses_collection().find_one({
        "_id": ObjectId(diagnosis_id),
        "user_id": user_id
    })
    
    if not diagnosis:
        return jsonify({"detail": "Diagnosis not found"}), 404
    
    # Call blockchain service to store diagnosis hash
    from app.services.blockchain_service import blockchain_service
    
    # Prepare data for blockchain storage (exclude sensitive fields)
    blockchain_data = {
        "diagnosis_id": str(diagnosis["_id"]),
        "condition": diagnosis.get("condition_name"),
        "confidence_score": diagnosis.get("confidence_score"),
        "timestamp": diagnosis.get("created_at").isoformat(),
        "user_id_hash": hashlib.sha256(str(diagnosis["user_id"]).encode()).hexdigest()
    }
    
    result = await blockchain_service.store_diagnosis_hash(
        str(diagnosis["_id"]),
        blockchain_data
    )
    
    # Update diagnosis record with blockchain verification
    if result.get("stored") or result.get("ready_for_storage"):
        update_data = {
            "blockchain_verified": True,
            "blockchain_hash": result.get("hash"),
            "updated_at": datetime.utcnow()
        }
        
        await db.diagnoses_collection().update_one(
            {"_id": ObjectId(diagnosis_id)},
            {"$set": update_data}
        )
    
    return jsonify({
        "diagnosis_id": diagnosis_id,
        "blockchain_result": result,
        "message": "Diagnosis verification processed"
    })

@diagnosis_bp.route('/<diagnosis_id>/recommended-medicines', methods=['GET'])
@jwt_required()
async def get_recommended_medicines(diagnosis_id):
    """
    Get medicines recommended for a specific diagnosis
    """
    user_id = get_jwt_identity()
    location = request.args.get('location')
    
    # Get the diagnosis
    diagnosis = await db.diagnoses_collection().find_one({
        "_id": ObjectId(diagnosis_id),
        "user_id": user_id
    })
    
    if not diagnosis:
        return jsonify({"detail": "Diagnosis not found"}), 404
    
    condition = diagnosis.get("condition_name")
    if not condition:
        return jsonify({"detail": "Diagnosis has no condition name"}), 400
    
    # Get medicines for this condition
    medicines = await medicine_service.get_medicines_by_diagnosis(
        diagnosis=condition,
        location=location,
        limit=10,
        skip=0
    )
    
    return jsonify(medicines)
