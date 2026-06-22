from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

participants = db.Table(
    "participants",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id")),
    db.Column("event_id", db.Integer, db.ForeignKey("event.id")),
)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_confirmed = db.Column(db.Boolean, default=False)
    confirmation_token = db.Column(db.String(128), nullable=True)
    reset_token = db.Column(db.String(128), nullable=True)
    preferences = db.Column(db.String(256), nullable=True)
    code_postal = db.Column(db.String(10), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    events_participated = db.relationship(
        "event", secondary=participants, backref="participants"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "preferences": self.preferences,
            "code_postal": self.code_postal,
            "events_participated": [ev.to_dict() for ev in self.events_participated],
        }