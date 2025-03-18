import os
from pymongo import MongoClient
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.mongodb_url = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
        self.db_name = os.environ.get("MONGODB_DB_NAME", "telemedical")
        self.initialize()
    
    def initialize(self):
        """Initialize the database connection"""
        try:
            self.client = MongoClient(self.mongodb_url)
            self.db = self.client[self.db_name]
            logger.info(f"Connected to MongoDB: {self.db_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def close(self):
        """Close the database connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    def users_collection(self):
        """Get the users collection"""
        return self.db.users
    
    def medicines_collection(self):
        """Get the medicines collection"""
        return self.db.medicines
    
    def diagnoses_collection(self):
        """Get the diagnoses collection"""
        return self.db.diagnoses
    
    def blockchain_records_collection(self):
        """Get the blockchain_records collection"""
        return self.db.blockchain_records
    
    def feedback_collection(self):
        """Get the feedback collection"""
        return self.db.feedback

    def prices_collection(self):
        """Get the medicine_prices collection"""
        return self.db.medicine_prices
    
    def locations_collection(self):
        """Get the locations collection"""
        return self.db.locations

# Create a singleton instance
db = Database()

# Function to get the database instance
def get_database():
    return db
