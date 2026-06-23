from extensions import db
from datetime import date
from models.user import User, participants

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
