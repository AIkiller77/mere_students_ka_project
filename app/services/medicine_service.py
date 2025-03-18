import logging
import random
from typing import Dict, Any, List, Optional
from bson import ObjectId
from app.db.database import db

logger = logging.getLogger(__name__)

class MedicineService:
    def __init__(self):
        pass
    
    def search_medicines(self, diagnosis: Optional[str] = None, 
                         location: Optional[str] = None,
                         name: Optional[str] = None,
                         ingredients: Optional[str] = None,
                         limit: int = 10,
                         skip: int = 0) -> List[Dict[str, Any]]:
        """
        Search for medicines based on various criteria
        """
        try:
            # Build query
            query = {}
            
            if diagnosis:
                query["conditions"] = {"$regex": diagnosis, "$options": "i"}
            
            if name:
                query["name"] = {"$regex": name, "$options": "i"}
            
            if ingredients:
                if isinstance(ingredients, str):
                    ingredients_list = [i.strip() for i in ingredients.split(',')]
                else:
                    ingredients_list = ingredients
                query["ingredients"] = {"$in": ingredients_list}
            
            # Execute query
            cursor = db.medicines_collection().find(query).skip(skip).limit(limit)
            medicines = list(cursor)
            
            # Convert ObjectId to string for JSON serialization
            for medicine in medicines:
                medicine["_id"] = str(medicine["_id"])
                
                # Filter prices by location if provided
                if location and "prices" in medicine:
                    medicine["prices"] = [
                        price for price in medicine["prices"] 
                        if price.get("location", "").lower() == location.lower()
                    ]
            
            return medicines
        except Exception as e:
            logger.error(f"Error searching medicines: {e}")
            return []
    
    def get_medicines_by_diagnosis(self, diagnosis: str, 
                                  location: Optional[str] = None,
                                  limit: int = 10,
                                  skip: int = 0) -> List[Dict[str, Any]]:
        """
        Get medicines recommended for a specific diagnosis
        """
        try:
            # Find medicines that treat this condition
            query = {"conditions": {"$regex": diagnosis, "$options": "i"}}
            
            cursor = db.medicines_collection().find(query).skip(skip).limit(limit)
            medicines = list(cursor)
            
            # Convert ObjectId to string for JSON serialization
            for medicine in medicines:
                medicine["_id"] = str(medicine["_id"])
                
                # Filter prices by location if provided
                if location and "prices" in medicine:
                    medicine["prices"] = [
                        price for price in medicine["prices"] 
                        if price.get("location", "").lower() == location.lower()
                    ]
            
            return medicines
        except Exception as e:
            logger.error(f"Error getting medicines by diagnosis: {e}")
            return []
    
    def get_medicine_by_id(self, medicine_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific medicine
        """
        try:
            medicine = db.medicines_collection().find_one({"_id": ObjectId(medicine_id)})
            
            if medicine:
                medicine["_id"] = str(medicine["_id"])
            
            return medicine
        except Exception as e:
            logger.error(f"Error getting medicine by ID: {e}")
            return None
    
    def get_medicine_popularity(self, medicine_id: str) -> Dict[str, Any]:
        """
        Get popularity metrics for a medicine
        """
        try:
            medicine = db.medicines_collection().find_one({"_id": ObjectId(medicine_id)})
            
            if not medicine:
                return {"error": "Medicine not found"}
            
            # In a real app, this would query analytics data
            # For now, we'll return simulated data
            return {
                "medicine_id": str(medicine["_id"]),
                "name": medicine.get("name", "Unknown"),
                "popularity_score": medicine.get("popularity_score", random.randint(1, 100)),
                "prescription_count": random.randint(100, 10000),
                "user_rating": round(random.uniform(3.0, 5.0), 1),
                "trending": random.choice([True, False])
            }
        except Exception as e:
            logger.error(f"Error getting medicine popularity: {e}")
            return {"error": str(e)}
    
    def get_popular_medicines(self, limit: int = 10, location: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get a list of popular medicines
        """
        try:
            # Sort by popularity score
            cursor = db.medicines_collection().find().sort("popularity_score", -1).limit(limit)
            medicines = list(cursor)
            
            # Convert ObjectId to string for JSON serialization
            for medicine in medicines:
                medicine["_id"] = str(medicine["_id"])
                
                # Filter prices by location if provided
                if location and "prices" in medicine:
                    medicine["prices"] = [
                        price for price in medicine["prices"] 
                        if price.get("location", "").lower() == location.lower()
                    ]
            
            return medicines
        except Exception as e:
            logger.error(f"Error getting popular medicines: {e}")
            return []
    
    def get_medicines_by_ingredients(self, ingredients: List[str], 
                                    limit: int = 10,
                                    skip: int = 0) -> List[Dict[str, Any]]:
        """
        Get medicines containing specific ingredients
        """
        try:
            query = {"ingredients": {"$in": ingredients}}
            
            cursor = db.medicines_collection().find(query).skip(skip).limit(limit)
            medicines = list(cursor)
            
            # Convert ObjectId to string for JSON serialization
            for medicine in medicines:
                medicine["_id"] = str(medicine["_id"])
            
            return medicines
        except Exception as e:
            logger.error(f"Error getting medicines by ingredients: {e}")
            return []
    
    def get_medicine_alternatives(self, medicine_id: str, 
                                 medicine_data: Dict[str, Any] = None,
                                 location: Optional[str] = None,
                                 limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get alternative medicines for a specific medicine
        """
        try:
            # If medicine data not provided, fetch it
            if not medicine_data:
                medicine_data = self.get_medicine_by_id(medicine_id)
            
            if not medicine_data:
                return []
            
            # Find medicines with similar active ingredients or that treat the same conditions
            active_ingredients = medicine_data.get("active_ingredients", [])
            conditions = medicine_data.get("conditions", [])
            
            query = {
                "_id": {"$ne": ObjectId(medicine_id)},  # Exclude the original medicine
                "$or": [
                    {"active_ingredients": {"$in": active_ingredients}},
                    {"conditions": {"$in": conditions}}
                ]
            }
            
            cursor = db.medicines_collection().find(query).limit(limit)
            alternatives = list(cursor)
            
            # Convert ObjectId to string for JSON serialization
            for alt in alternatives:
                alt["_id"] = str(alt["_id"])
                
                # Filter prices by location if provided
                if location and "prices" in alt:
                    alt["prices"] = [
                        price for price in alt["prices"] 
                        if price.get("location", "").lower() == location.lower()
                    ]
                
                # Add similarity score (in a real app, this would be more sophisticated)
                alt["similarity_score"] = self._calculate_similarity(medicine_data, alt)
            
            # Sort by similarity score
            alternatives.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)
            
            return alternatives
        except Exception as e:
            logger.error(f"Error getting medicine alternatives: {e}")
            return []
    
    def _calculate_similarity(self, medicine1: Dict[str, Any], medicine2: Dict[str, Any]) -> float:
        """
        Calculate similarity score between two medicines
        """
        score = 0.0
        
        # Check active ingredients
        ingredients1 = set(medicine1.get("active_ingredients", []))
        ingredients2 = set(medicine2.get("active_ingredients", []))
        
        if ingredients1 and ingredients2:
            common_ingredients = ingredients1.intersection(ingredients2)
            score += len(common_ingredients) / max(len(ingredients1), 1) * 0.6
        
        # Check conditions
        conditions1 = set(medicine1.get("conditions", []))
        conditions2 = set(medicine2.get("conditions", []))
        
        if conditions1 and conditions2:
            common_conditions = conditions1.intersection(conditions2)
            score += len(common_conditions) / max(len(conditions1), 1) * 0.4
        
        return min(score, 1.0)  # Cap at 1.0

# Create singleton instance
medicine_service = MedicineService()
