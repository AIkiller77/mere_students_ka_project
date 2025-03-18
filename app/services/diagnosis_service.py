from typing import Dict, Any, List, Optional
import logging
import requests
import os
import json
import random
from datetime import datetime
from app.db.database import db
from app.services.blockchain_service import blockchain_service

logger = logging.getLogger(__name__)

class DiagnosisService:
    def __init__(self):
        self.huggingface_api_key = os.environ.get("HUGGINGFACE_API_KEY")
        self.huggingface_api_url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
        self.headers = {"Authorization": f"Bearer {self.huggingface_api_key}"}
    
    def generate_diagnosis(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a diagnosis based on symptoms using AI
        Falls back to rule-based approach if AI model is unavailable
        """
        try:
            symptoms = request_data.get("symptoms", [])
            medical_history = request_data.get("medical_history", "")
            
            # If we have a Hugging Face API key, use the model
            if self.huggingface_api_key:
                diagnosis = self._generate_ai_diagnosis(symptoms, medical_history)
            else:
                # Fall back to rule-based approach
                diagnosis = self._generate_rule_based_diagnosis(symptoms)
            
            # Add blockchain verification if requested
            if request_data.get("verify_on_blockchain", False):
                blockchain_verification = self._verify_diagnosis_on_blockchain(
                    diagnosis=diagnosis,
                    user_id=request_data.get("user_id")
                )
                diagnosis["blockchain_verification"] = blockchain_verification
            
            return diagnosis
        except Exception as e:
            logger.error(f"Error generating diagnosis: {e}")
            return {
                "diagnosis": "Unable to generate diagnosis",
                "confidence": 0,
                "error": str(e)
            }
    
    def _generate_ai_diagnosis(self, symptoms: List[str], medical_history: str) -> Dict[str, Any]:
        """
        Generate diagnosis using Hugging Face model
        """
        try:
            # Prepare input for the model
            symptoms_text = ", ".join(symptoms)
            input_text = f"Patient symptoms: {symptoms_text}. "
            if medical_history:
                input_text += f"Medical history: {medical_history}."
            
            # Define possible conditions for classification
            candidate_conditions = [
                "Common Cold", "Influenza", "COVID-19", "Allergic Rhinitis",
                "Bronchitis", "Pneumonia", "Asthma", "Sinusitis",
                "Gastroenteritis", "Migraine", "Tension Headache",
                "Hypertension", "Diabetes Type 2", "Urinary Tract Infection"
            ]
            
            # Prepare payload for the model
            payload = {
                "inputs": input_text,
                "parameters": {"candidate_labels": candidate_conditions},
                "options": {"wait_for_model": True}
            }
            
            # Call Hugging Face API
            response = requests.post(self.huggingface_api_url, headers=self.headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                # Get the highest scoring label
                top_label_index = result["scores"].index(max(result["scores"]))
                diagnosis = result["labels"][top_label_index]
                confidence = result["scores"][top_label_index] * 100  # Convert to percentage
                
                return {
                    "diagnosis": diagnosis,
                    "confidence": confidence,
                    "differential_diagnoses": [
                        {"condition": result["labels"][i], "probability": result["scores"][i] * 100}
                        for i in range(len(result["labels"]))
                        if i != top_label_index and result["scores"][i] > 0.1  # Only include significant alternatives
                    ]
                }
            else:
                logger.warning(f"Hugging Face API error: {response.text}")
                # Fall back to rule-based approach
                return self._generate_rule_based_diagnosis(symptoms)
                
        except Exception as e:
            logger.error(f"Error in AI diagnosis: {e}")
            return self._generate_rule_based_diagnosis(symptoms)
    
    def _generate_rule_based_diagnosis(self, symptoms: List[str]) -> Dict[str, Any]:
        """
        Generate diagnosis using a simple rule-based approach
        This is a fallback when the AI model is unavailable
        """
        # Simple mapping of symptoms to conditions
        symptom_to_condition = {
            "fever": ["Common Cold", "Influenza", "COVID-19"],
            "cough": ["Common Cold", "Influenza", "COVID-19", "Bronchitis"],
            "headache": ["Common Cold", "Influenza", "Migraine", "Tension Headache"],
            "fatigue": ["Common Cold", "Influenza", "COVID-19"],
            "sore throat": ["Common Cold", "Influenza", "Strep Throat"],
            "runny nose": ["Common Cold", "Allergic Rhinitis"],
            "shortness of breath": ["Asthma", "COVID-19", "Pneumonia"],
            "chest pain": ["Pneumonia", "Bronchitis", "Anxiety"],
            "nausea": ["Gastroenteritis", "Migraine", "Food Poisoning"],
            "vomiting": ["Gastroenteritis", "Food Poisoning"],
            "diarrhea": ["Gastroenteritis", "Food Poisoning"],
            "abdominal pain": ["Gastroenteritis", "Appendicitis", "Food Poisoning"],
            "rash": ["Allergic Reaction", "Eczema", "Psoriasis"],
            "joint pain": ["Arthritis", "Influenza", "Lyme Disease"],
            "dizziness": ["Vertigo", "Migraine", "Hypertension"],
            "ear pain": ["Ear Infection", "Sinusitis"],
            "sinus pressure": ["Sinusitis", "Common Cold"],
            "frequent urination": ["Urinary Tract Infection", "Diabetes Type 2"],
            "burning urination": ["Urinary Tract Infection"]
        }
        
        # Count occurrences of each condition
        condition_counts = {}
        
        for symptom in symptoms:
            symptom = symptom.lower()
            if symptom in symptom_to_condition:
                for condition in symptom_to_condition[symptom]:
                    condition_counts[condition] = condition_counts.get(condition, 0) + 1
        
        # If no matches found, provide a generic response
        if not condition_counts:
            return {
                "diagnosis": "Unspecified condition",
                "confidence": 30,
                "note": "Insufficient symptoms for a specific diagnosis. Please consult a healthcare professional."
            }
        
        # Find the condition with the highest count
        max_count = max(condition_counts.values())
        top_conditions = [c for c, count in condition_counts.items() if count == max_count]
        
        # If there's a tie, choose randomly
        diagnosis = random.choice(top_conditions)
        
        # Calculate confidence based on number of matching symptoms
        confidence = min(max_count * 20, 90)  # Cap at 90%
        
        # Create differential diagnoses
        differential = [
            {"condition": cond, "probability": (count / max_count) * confidence}
            for cond, count in condition_counts.items()
            if cond != diagnosis and count > 0
        ]
        
        return {
            "diagnosis": diagnosis,
            "confidence": confidence,
            "differential_diagnoses": differential
        }
    
    def _verify_diagnosis_on_blockchain(self, diagnosis: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Verify diagnosis on blockchain
        """
        try:
            # Prepare data for blockchain storage (exclude sensitive fields)
            blockchain_data = {
                "diagnosis": diagnosis.get("diagnosis"),
                "confidence": diagnosis.get("confidence"),
                "timestamp": datetime.utcnow().isoformat(),
                "user_id_hash": hash(user_id)  # Use hash to protect user identity
            }
            
            # Store hash on blockchain
            result = blockchain_service.store_diagnosis_hash(
                diagnosis_id=f"diagnosis_{datetime.utcnow().timestamp()}",
                diagnosis_data=blockchain_data
            )
            
            return result
        except Exception as e:
            logger.error(f"Error verifying diagnosis on blockchain: {e}")
            return {
                "error": "Blockchain verification failed",
                "details": str(e)
            }
    
    def get_diagnosis_by_id(self, diagnosis_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a diagnosis by ID
        """
        try:
            diagnosis = db.diagnoses_collection().find_one({"_id": diagnosis_id})
            return diagnosis
        except Exception as e:
            logger.error(f"Error getting diagnosis: {e}")
            return None
    
    def get_user_diagnoses(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get diagnoses for a specific user
        """
        try:
            cursor = db.diagnoses_collection().find({"user_id": user_id}).sort("created_at", -1).limit(limit)
            return list(cursor)
        except Exception as e:
            logger.error(f"Error getting user diagnoses: {e}")
            return []

# Create singleton instance
diagnosis_service = DiagnosisService()
