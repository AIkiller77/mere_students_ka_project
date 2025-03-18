import os
from app import create_app
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = create_app()

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
jwt = JWTManager(app)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
