import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    basedir = os.path.abspath(os.path.dirname(__file__))
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(basedir, 'instance', 'events.db')}"
    )
    # Render fournit parfois "postgres://" au lieu de "postgresql://"
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    MAIL_SERVER = "sandbox.smtp.mailtrap.io"
    MAIL_PORT = 2525
    MAIL_USE_TLS = True
    MAIL_USERNAME = "e98985f3c3fda6"
    MAIL_PASSWORD = "4228f6f29fcd56"
    MAIL_DEFAULT_SENDER = "noreply@cultureradar.com"
    MAIL_SUPPRESS_SEND = False

BASE_URL = os.environ.get("BASE_URL", "http://localhost:5000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
