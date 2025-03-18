from web3 import Web3
from eth_account.messages import encode_defunct
import json
import hashlib
from typing import Dict, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)

class BlockchainService:
    def __init__(self):
        self.provider_uri = os.environ.get("WEB3_PROVIDER_URI")
        self.chain_id = int(os.environ.get("CHAIN_ID", 1))
        self.contract_address = os.environ.get("CONTRACT_ADDRESS")
        self.web3 = None
        self.contract = None
        self.initialize_web3()
        
    def initialize_web3(self):
        """Initialize Web3 connection and contract"""
        try:
            if self.provider_uri:
                self.web3 = Web3(Web3.HTTPProvider(self.provider_uri))
                logger.info(f"Web3 connection established: {self.web3.is_connected()}")
                
                # In a real application, we would load the contract ABI and initialize it
                # For demo purposes, we'll simulate contract interactions
                if self.contract_address:
                    logger.info(f"Contract address configured: {self.contract_address}")
                else:
                    logger.warning("No contract address configured")
            else:
                logger.warning("No Web3 provider URI configured")
        except Exception as e:
            logger.error(f"Error initializing Web3: {e}")
            self.web3 = None
    
    def verify_signature(self, message: str, signature: str, address: str) -> bool:
        """Verify an Ethereum signature"""
        try:
            if not self.web3:
                logger.warning("Web3 not initialized")
                return False
                
            # Create the message hash that was signed
            message_hash = encode_defunct(text=message)
            
            # Recover the address from the signature
            recovered_address = self.web3.eth.account.recover_message(message_hash, signature=signature)
            
            # Check if the recovered address matches the expected address
            return recovered_address.lower() == address.lower()
        except Exception as e:
            logger.error(f"Error verifying signature: {e}")
            return False
    
    def store_diagnosis_hash(self, diagnosis_id: str, diagnosis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store a diagnosis hash on the blockchain"""
        try:
            if not self.web3:
                return {"success": False, "error": "Blockchain connection not available"}
            
            # Create a hash of the diagnosis data
            diagnosis_json = json.dumps(diagnosis_data, sort_keys=True)
            diagnosis_hash = hashlib.sha256(diagnosis_json.encode()).hexdigest()
            
            # In a real application, we would call the contract to store the hash
            # For demo purposes, we'll simulate the blockchain transaction
            
            # Simulate transaction hash
            tx_hash = "0x" + hashlib.sha256(f"{diagnosis_id}:{diagnosis_hash}".encode()).hexdigest()
            
            return {
                "success": True,
                "diagnosis_id": diagnosis_id,
                "diagnosis_hash": diagnosis_hash,
                "transaction_hash": tx_hash,
                "block_number": 12345678,  # Simulated block number
                "timestamp": self.web3.eth.get_block('latest').timestamp if self.web3.is_connected() else 0,
                "chain_id": self.chain_id
            }
        except Exception as e:
            logger.error(f"Error storing diagnosis hash: {e}")
            return {"success": False, "error": str(e)}
    
    def verify_diagnosis(self, diagnosis_id: str, diagnosis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify a diagnosis against the blockchain"""
        try:
            if not self.web3:
                return {"verified": False, "error": "Blockchain connection not available"}
            
            # Create a hash of the diagnosis data
            diagnosis_json = json.dumps(diagnosis_data, sort_keys=True)
            diagnosis_hash = hashlib.sha256(diagnosis_json.encode()).hexdigest()
            
            # In a real application, we would call the contract to verify the hash
            # For demo purposes, we'll simulate the verification
            
            # Simulate verification result (in a real app, this would check the blockchain)
            # For demo, we'll just return success
            return {
                "verified": True,
                "diagnosis_id": diagnosis_id,
                "diagnosis_hash": diagnosis_hash,
                "blockchain_hash": diagnosis_hash,  # In a real app, this would come from the blockchain
                "timestamp": self.web3.eth.get_block('latest').timestamp if self.web3.is_connected() else 0,
                "chain_id": self.chain_id
            }
        except Exception as e:
            logger.error(f"Error verifying diagnosis: {e}")
            return {"verified": False, "error": str(e)}
    
    def verify_medicine(self, medicine_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify medicine information against the blockchain"""
        try:
            if not self.web3:
                return {"verified": False, "error": "Blockchain connection not available"}
            
            medicine_id = medicine_data.get("_id")
            
            # Create a hash of the medicine data (excluding verification fields)
            # In a real app, we'd only hash the critical fields that shouldn't change
            verification_fields = ["blockchain_verification", "blockchain_status", "prices"]
            verification_data = {k: v for k, v in medicine_data.items() if k not in verification_fields}
            
            medicine_json = json.dumps(verification_data, sort_keys=True)
            medicine_hash = hashlib.sha256(medicine_json.encode()).hexdigest()
            
            # In a real application, we would call the contract to verify the hash
            # For demo purposes, we'll simulate the verification
            
            # Simulate verification result (in a real app, this would check the blockchain)
            return {
                "verified": True,
                "medicine_id": medicine_id,
                "medicine_hash": medicine_hash,
                "blockchain_hash": medicine_hash,  # In a real app, this would come from the blockchain
                "timestamp": self.web3.eth.get_block('latest').timestamp if self.web3.is_connected() else 0,
                "chain_id": self.chain_id
            }
        except Exception as e:
            logger.error(f"Error verifying medicine: {e}")
            return {"verified": False, "error": str(e)}
    
    def get_transaction_status(self, tx_hash: str) -> Dict[str, Any]:
        """Get the status of a blockchain transaction"""
        try:
            if not self.web3:
                return {"success": False, "error": "Blockchain connection not available"}
            
            # In a real application, we would check the actual transaction status
            # For demo purposes, we'll simulate a successful transaction
            
            return {
                "success": True,
                "transaction_hash": tx_hash,
                "status": "confirmed",
                "block_number": 12345678,
                "confirmations": 10,
                "timestamp": self.web3.eth.get_block('latest').timestamp if self.web3.is_connected() else 0
            }
        except Exception as e:
            logger.error(f"Error getting transaction status: {e}")
            return {"success": False, "error": str(e)}

# Create singleton instance
blockchain_service = BlockchainService()
