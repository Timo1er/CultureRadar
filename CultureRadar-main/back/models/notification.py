from extensions import db
from datetime import datetime
from models.user import User

class Notification(db.Model):
    __tablename__ = "notification"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    lu = db.Column(db.Boolean, default=False)
    event_id = db.Column(db.Integer, nullable=True)

    user = db.relationship("User", backref="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "date": self.date.isoformat(),
            "lu": self.lu,
            "event_id": self.event_id,
        }