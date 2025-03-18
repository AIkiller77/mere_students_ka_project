import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app(test_config=None):
    """Create and configure the Flask application"""
    app = Flask(__name__, 
                static_folder="../frontend/build",
                static_url_path='/')
    
    # Configure app
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        MONGO_URI=os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/telemedical')
    )
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    from app.api.endpoints.users import users_bp
    from app.api.endpoints.diagnosis import diagnosis_bp
    from app.api.endpoints.medicines import medicines_bp
    from app.api.endpoints.blockchain import blockchain_bp
    
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(diagnosis_bp, url_prefix='/api/diagnosis')
    app.register_blueprint(medicines_bp, url_prefix='/api/medicines')
    app.register_blueprint(blockchain_bp, url_prefix='/api/blockchain')
    
    # Health check route
    @app.route('/api/health')
    def health_check():
        """Health check endpoint to verify the API is running"""
        return jsonify({"status": "ok", "message": "TeleMedChain API is running"})
    
    # Serve frontend
    @app.route('/')
    def serve_frontend():
        return app.send_static_file('index.html')
    
    @app.errorhandler(404)
    def not_found(e):
        # For SPA routing - return index.html for all non-API routes
        if not request.path.startswith('/api/'):
            return app.send_static_file('index.html')
        return jsonify({"error": "Not found"}), 404
    
    return app
