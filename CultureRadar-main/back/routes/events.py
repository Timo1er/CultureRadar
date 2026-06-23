from extensions import db
from datetime import date
from models.user import User, participants


class event(db.Model):
    __tablename__ = "event"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    author = db.Column(db.String(120), nullable=False)
    date_debut = db.Column(db.Date, nullable=False)
    date_fin = db.Column(db.Date, nullable=True)
    genres = db.Column(db.Text)           # Text = illimité
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(512))
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    prix = db.Column(db.String(100))
    event_url = db.Column(db.String(512))
    code_postal = db.Column(db.String(10))
    participants = db.relationship("User", secondary=participants, back_populates="events_participated")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "date_debut": self.date_debut.isoformat() if self.date_debut else None,
            "date_fin": self.date_fin.isoformat() if self.date_fin else None,
            "genres": self.genres,
            "description": self.description,
            "cover_image": self.cover_image,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "prix": self.prix,
            "event_url": self.event_url,
            "code_postal": self.code_postal,
        }
