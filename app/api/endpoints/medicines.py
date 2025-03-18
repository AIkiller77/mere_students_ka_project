from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from typing import Any, List, Dict, Optional
from app.services.medicine_service import medicine_service
from app.services.blockchain_service import blockchain_service
from app.db.database import db
import logging

medicines_bp = Blueprint('medicines', __name__)
logger = logging.getLogger(__name__)

@medicines_bp.route('/search', methods=['GET'])
async def search_medicines():
    """
    Search for medicines based on various criteria
    """
    # Extract query parameters
    diagnosis = request.args.get('diagnosis')
    location = request.args.get('location')
    name = request.args.get('name')
    ingredients = request.args.get('ingredients')
    limit = request.args.get('limit', default=10, type=int)
    skip = request.args.get('skip', default=0, type=int)
    
    # Get medicines based on search criteria
    medicines = await medicine_service.search_medicines(
        diagnosis=diagnosis,
        location=location,
        name=name,
        ingredients=ingredients,
        limit=limit,
        skip=skip
    )
    
    return jsonify(medicines)

@medicines_bp.route('/by-diagnosis/<diagnosis>', methods=['GET'])
async def get_medicines_by_diagnosis(diagnosis):
    """
    Get medicines recommended for a specific diagnosis
    """
    location = request.args.get('location')
    limit = request.args.get('limit', default=10, type=int)
    skip = request.args.get('skip', default=0, type=int)
    
    medicines = await medicine_service.get_medicines_by_diagnosis(
        diagnosis=diagnosis,
        location=location,
        limit=limit,
        skip=skip
    )
    
    return jsonify(medicines)

@medicines_bp.route('/<medicine_id>', methods=['GET'])
async def get_medicine_by_id(medicine_id):
    """
    Get detailed information about a specific medicine
    """
    medicine = await medicine_service.get_medicine_by_id(medicine_id)
    
    if not medicine:
        return jsonify({"detail": "Medicine not found"}), 404
    
    return jsonify(medicine)

@medicines_bp.route('/<medicine_id>/popularity', methods=['GET'])
async def get_medicine_popularity(medicine_id):
    """
    Get popularity metrics for a medicine
    """
    popularity = await medicine_service.get_medicine_popularity(medicine_id)
    
    if "error" in popularity:
        return jsonify({"detail": popularity["error"]}), 404
    
    return jsonify(popularity)

@medicines_bp.route('/<medicine_id>/prices', methods=['GET'])
async def get_medicine_prices(medicine_id):
    """
    Get pricing information for a medicine
    Optionally filter by location
    """
    medicine = await medicine_service.get_medicine_by_id(medicine_id)
    
    if not medicine:
        return jsonify({"detail": "Medicine not found"}), 404
    
    # Filter prices by location if provided
    location = request.args.get('location')
    if location and "prices" in medicine:
        prices = [price for price in medicine["prices"] if price.get("location") == location]
    elif "prices" in medicine:
        prices = medicine["prices"]
    else:
        prices = []
    
    return jsonify(prices)
