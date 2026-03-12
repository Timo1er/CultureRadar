import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    basedir = os.path.abspath(os.path.dirname(__file__))
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = (
        f"sqlite:///{os.path.join(basedir, 'instance', 'events.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = (
        False if os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS") == "False" else True
    )
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    MAIL_SERVER = "sandbox.smtp.mailtrap.io"
    MAIL_PORT = 2525
    MAIL_USE_TLS = True
    MAIL_USERNAME = "34bc6190402a3d"
    MAIL_PASSWORD = "b9028b2cf79d6c"
    MAIL_DEFAULT_SENDER = "noreply@cultureradar.com"
    MAIL_SUPPRESS_SEND = False

BASE_URL = os.environ.get("BASE_URL", "http://localhost:5000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
