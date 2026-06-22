from flask import Flask
from flask_migrate import Migrate
from extensions import db
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import Config
from datetime import timedelta
import os

app = Flask(__name__)
app.config.from_object(Config)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=72)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Origines autorisées — ajoute ici ton URL Netlify une fois connue
allowed_origins = [
    "https://cultureradar-front.onrender.com",  # ancienne URL Render
    os.environ.get("FRONTEND_URL", ""),          # URL configurée via variable d'env
    "http://localhost:3000",                      # développement local
]
# Filtre les valeurs vides
allowed_origins = [o for o in allowed_origins if o]

CORS(
    app,
    origins=allowed_origins,
    supports_credentials=True
)

mail = Mail(app)

# Forcer l'import des modèles pour Flask-Migrate
from models import user, event
from models.user import User
from models.event import event
from models.notification import Notification

from routes.auth import auth_bp
from routes.events import events_bp

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(events_bp, url_prefix="/api")


@app.route("/")
def index():
    return "API CultureRadar is running!"


@app.route("/api/ping")
def ping():
    return "pong"


@app.route("/api/dbtest")
def dbtest():
    from models.user import User
    try:
        user_count = User.query.count()
        return f"Nombre d'utilisateurs : {user_count}"
    except Exception as e:
        return f"Erreur DB : {e}"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
