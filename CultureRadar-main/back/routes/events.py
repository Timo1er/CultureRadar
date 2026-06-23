import math
import random
import subprocess
import sys
from flask import Blueprint, jsonify, request
from extensions import db
from models.event import event
from models.user import User
from models.notification import Notification
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

events_bp = Blueprint("events", __name__)


@events_bp.route("/events", methods=["POST"])
def create_event():
    data = request.get_json()
    date_debut = None
    date_fin = None
    if data.get("date_debut"):
        date_debut = datetime.strptime(data["date_debut"], "%Y-%m-%d").date()
    if data.get("date_fin"):
        if data["date_fin"]:
            date_fin = datetime.strptime(data["date_fin"], "%Y-%m-%d").date()
    event_instance = event(
        title=data.get("title"),
        author=data.get("author"),
        date_debut=date_debut,
        date_fin=date_fin,
        genres=",".join(data.get("genres", [])),
        description=data.get("description"),
        cover_image=data.get("cover_image"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        prix=data.get("prix"),
        event_url=data.get("event_url"),
        code_postal=data.get("code_postal"),
    )
    db.session.add(event_instance)
    db.session.commit()
    return jsonify({"success": True, "id": event_instance.id})


@events_bp.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    user_prefs = user.preferences.split(",") if user.preferences else []
    max_distance = float(request.args.get("distance", 0))
    page = int(request.args.get("page", 1))
    size = int(request.args.get("size", 30))
    user_lat, user_lon = user.latitude, user.longitude

    events = event.query.all()
    filtered = []
    def normalize(g):
        return g.strip().lower()

    user_prefs_norm = set(normalize(g) for g in user_prefs)
    for ev in events:
        ev_genres = ev.genres.split(",") if ev.genres else []
        ev_genres_norm = set(normalize(g) for g in ev_genres)
        if ev.author == user.username or user_prefs_norm.intersection(ev_genres_norm):
            if ev.latitude and ev.longitude and user_lat and user_lon:
                dist = haversine(user_lat, user_lon, ev.latitude, ev.longitude)
                if max_distance == 0 or dist <= max_distance:
                    filtered.append(ev.to_dict())

    total = len(filtered)
    totalPages = max(1, (total + size - 1) // size)
    start = (page - 1) * size
    end = start + size
    paginated = filtered[start:end]

    return jsonify({
        "events": paginated,
        "totalPages": totalPages,
        "page": page,
        "size": size,
        "total": total
    })


@events_bp.route("/events/<int:id>", methods=["DELETE"])
def delete_event(id):
    event_instance = event.query.get_or_404(id)
    db.session.delete(event_instance)
    db.session.commit()
    return jsonify({"message": "Event deleted"}), 200


@events_bp.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    event_instance = event.query.get(event_id)
    if not event_instance:
        return {"msg": "Événement non trouvé"}, 404
    event_dict = event_instance.to_dict()
    event_dict["participants"] = [u.username for u in event_instance.participants]
    return event_dict, 200


@events_bp.route("/events/<int:event_id>/participate", methods=["POST"])
@jwt_required()
def participate_event(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    event_instance = event.query.get(event_id)
    if not user or not event_instance:
        return {"msg": "Utilisateur ou événement introuvable"}, 404
    if event_instance in user.events_participated:
        return {"msg": "Déjà inscrit à cet événement"}, 400
    user.events_participated.append(event_instance)
    db.session.commit()
    return {"msg": "Participation enregistrée"}, 200


@events_bp.route("/events/<int:event_id>/unparticipate", methods=["POST"])
@jwt_required()
def unparticipate_event(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    event_instance = event.query.get(event_id)
    if not user or not event_instance:
        return {"msg": "Utilisateur ou événement introuvable"}, 404
    if event_instance not in user.events_participated:
        return {"msg": "Pas inscrit à cet événement"}, 400
    user.events_participated.remove(event_instance)
    db.session.commit()
    return {"msg": "Participation annulée"}, 200


@events_bp.route("/events/genres", methods=["GET"])
def get_all_genres():
    genres_set = set()
    for ev in event.query.all():
        if ev.genres:
            for g in ev.genres.split(","):
                genres_set.add(g.strip())
    return jsonify({"genres": sorted(genres_set)})


@events_bp.route("/genres/categories", methods=["GET"])
def get_genre_categories():
    categories = {
        "Musique": ["Concert", "Electro", "Rap", "Rock", "Pop", "DJ", "Chanson", "Reggae", "Disco", "Folk", "Punk", "Dub", "Jazz", "Electro-pop", "Hard techno", "Hardgroove", "Hardmusic", "Hardtechno", "Uptempo", "Metal", "Progressive", "House", "Afrohouse", "Shatta", "Latin", "Reggaeton", "Live", "Orchestrale"],
        "Art": ["Peinture", "Sculpture", "Art contemporain", "Atelier artistique", "Photographie", "Exposition", "Céramique", "Fantastique", "Imaginaire", "Lithographie", "Edition", "Artiste", "Autrice"],
        "Sport": ["Football", "MMA", "Parkour", "Tennis", "Footbag", "Compétition", "Sport", "Kinball", "Tournoi", "Urbain", "Street workout", "Junior", "Initiation", "Sport gratuit"],
        "Spectacle": ["Théâtre", "Humour", "Improvisation", "Performance", "Cabaret", "Stand up", "Mise en scène", "Show", "Showcase", "Spectacle", "Festival", "Comedy club"],
        "Famille": ["Enfant", "Famille", "Jeunesse", "Jeux", "Atelier", "Diversité", "Interculturalité", "Langue", "Lecture", "Tout public"],
        "Vie nocturne": ["Soirée", "Club", "Warehouse", "Rave", "Nuit", "Étudiant", "Fête", "Campus", "Pride"],
        "Nature & Environnement": ["Nature", "Jardin", "Biodiversité", "Balade nature", "Plante", "Engagé", "Bio", "Écologie", "Découverte", "Bords de loire", "Nature en ville"],
        "Rencontres & Société": ["Forum", "Conférence", "Rencontre", "Interconnaissance", "Convivialité", "Solidarité", "Social", "Ess", "Tiers-lieu", "Visite"],
        "Accessibilité": ["Handicap", "Handicaplap"],
        "Science & Makers": ["Science", "Technologie", "DIY", "Do it yourself", "Recyclage", "Plastique", "Déchet"],
        "Histoire & Société": ["Histoire", "Résistance", "Patrimoine", "Prisionniersdeguerre", "Secondeguerremondiale", "Histoire sociale", "Monde du travail", "Syndicalisme", "Sécurité sociale"],
        "Jeux & Loisirs": ["Jeux de cartes", "Jeux de sociétés", "Soirée jeux", "Flashmob", "Animation", "Loisir", "Détente", "Tout niveau"],
        "Culture & Littérature": ["Bibliothèque", "Littérature", "Lecture", "Langue", "Littérature jeunesse"],
        "Lieux & Festivals": ["Saison culturelle", "Restauration", "Machines de l'ile de nantes", "Ferrailleur", "Stereolux", "Square vertais", "Région pays de la loire", "Nantes maker campus", "Nantes métropole", "Ile de nantes"],
        "Autre": ["Autre"]
    }
    return jsonify(categories)


@events_bp.route("/events/suggestions", methods=["GET"])
@jwt_required()
def get_suggestions():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    participated_ids = [ev.id for ev in user.events_participated]
    prefs = user.preferences.split(",") if user.preferences else []

    if participated_ids:
        genres = set()
        for ev in user.events_participated:
            genres.update(ev.genres.split(",") if ev.genres else [])
        candidates = event.query.filter(event.id.notin_(participated_ids)).all()
        filtered = [ev for ev in candidates if any(g in (ev.genres or "") for g in genres)]
        if not filtered and prefs:
            filtered = [ev for ev in candidates if any(g in (ev.genres or "") for g in prefs)]
    elif prefs:
        candidates = event.query.all()
        filtered = [ev for ev in candidates if any(g in (ev.genres or "") for g in prefs)]
    else:
        filtered = event.query.all()

    if not filtered:
        filtered = event.query.all()

    suggestions = random.sample(filtered, min(8, len(filtered)))
    return jsonify([ev.to_dict() for ev in suggestions])


@events_bp.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    data = request.get_json()
    event_instance = event.query.get_or_404(event_id)
    old_data = event_instance.to_dict()
    event_instance.title = data.get("title", event_instance.title)
    event_instance.date_debut = datetime.strptime(data["date_debut"], "%Y-%m-%d").date() if data.get("date_debut") else event_instance.date_debut
    event_instance.date_fin = datetime.strptime(data["date_fin"], "%Y-%m-%d").date() if data.get("date_fin") else event_instance.date_fin
    event_instance.genres = ",".join(data.get("genres", [])) if isinstance(data.get("genres"), list) else data.get("genres", event_instance.genres)
    event_instance.description = data.get("description", event_instance.description)
    event_instance.cover_image = data.get("cover_image", event_instance.cover_image)
    event_instance.latitude = data.get("latitude", event_instance.latitude)
    event_instance.longitude = data.get("longitude", event_instance.longitude)
    event_instance.prix = data.get("prix", event_instance.prix)
    event_instance.event_url = data.get("event_url", event_instance.event_url)
    event_instance.code_postal = data.get("code_postal", event_instance.code_postal)
    db.session.commit()

    changes = []
    rename = None
    for key in old_data:
        if key in data and str(data[key]) != str(old_data[key]):
            if key == "title":
                rename = (old_data["title"], data["title"])
            elif key == "genres":
                changes.append("ses genres")
            elif key == "description":
                changes.append("sa description")
            else:
                changes.append(f"{key}")

    if rename or changes:
        if rename:
            message = f"L'événement \"{rename[0]}\" a été modifié : Il s'appelle désormais \"{rename[1]}\""
            if changes:
                message += ", " + " et ".join(changes) + " ont changé"
        else:
            message = f"L'événement \"{event_instance.title}\" a été modifié : " + ", ".join(changes) + " ont changé"
        for user in event_instance.participants:
            notif = Notification(
                user_id=user.id,
                message=message,
                event_id=event_instance.id,
                lu=False
            )
            db.session.add(notif)
        db.session.commit()

    return jsonify({"success": True, "id": event_instance.id})


@events_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.date.desc()).all()
    return jsonify([n.to_dict() for n in notifs])


@events_bp.route("/notifications/<int:notif_id>/read", methods=["POST"])
@jwt_required()
def read_notification(notif_id):
    user_id = get_jwt_identity()
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != user_id:
        return {"msg": "Accès non autorisé"}, 403
    notif.lu = True
    db.session.commit()
    return {"msg": "Notification marquée comme lue"}, 200


@events_bp.route("/notifications/<int:notif_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notif_id):
    user_id = get_jwt_identity()
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != user_id:
        return {"msg": "Accès non autorisé"}, 403
    db.session.delete(notif)
    db.session.commit()
    return {"msg": "Notification supprimée"}, 200


@events_bp.route("/import-events", methods=["GET"])
def import_events():
    try:
        result = subprocess.run(
            [sys.executable, "import_openagenda.py"],
            capture_output=True, text=True, timeout=120
        )
        return jsonify({
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
