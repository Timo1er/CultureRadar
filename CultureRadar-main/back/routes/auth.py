from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models.user import User
import secrets
from flask_mail import Message
import re
from werkzeug.security import generate_password_hash, check_password_hash
from config import BASE_URL, FRONTEND_URL

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    print("Route /register appelée")
    data = request.get_json()
    print("Données reçues :", data)

    if len(data["username"]) < 6:
        return jsonify({"msg": "Nombre de caractères du nom d'utilisateur insuffisant"}), 400

    email_regex = r"^[^@]{3,}@[a-zA-Z]+\.(com|fr)$"
    if not re.match(email_regex, data["email"]):
        return jsonify({"msg": "Format du mail incorrect"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"msg": "Nom d'utilisateur déjà utilisé"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"msg": "Email déjà utilisé"}), 400

    password = data["password"]
    if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$", password):
        return jsonify({
            "msg": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
        }), 400

    token = secrets.token_urlsafe(32)
    prefs = data.get("preferences", [])
    if isinstance(prefs, list):
        prefs_str = ",".join(prefs)
    elif isinstance(prefs, str):
        prefs_str = prefs
    else:
        prefs_str = ""
    user = User(
        username=data["username"],
        email=data["email"],
        is_confirmed=False,
        confirmation_token=token,
        preferences=prefs_str,
        code_postal=data.get("code_postal"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    confirm_url = f"{BASE_URL}/api/confirm/{token}"
    from app import mail
    msg = Message("Confirme ton email", recipients=[user.email])
    msg.html = f"""
    <div style="font-family: Arial, sans-serif; background: #fff; color: #222; padding: 24px;">
        <h2>Bienvenue sur CultureRadar !</h2>
        <p>Merci de t'être inscrit. Clique sur le lien ci-dessous pour confirmer ton compte :</p>
        <p>
            <a href="{confirm_url}" style="color: #1976d2; text-decoration: underline; font-size: 16px;">
                Confirmer mon compte
            </a>
        </p>
        <p style="font-size:12px;color:#888;">Si tu n'es pas à l'origine de cette inscription, ignore ce message.</p>
    </div>
    """
    mail.send(msg)

    return jsonify({"msg": "Utilisateur créé, vérifie tes mails pour confirmer ton compte"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"msg": "Identifiants invalides"}), 401
    if not user.is_confirmed:
        return jsonify({"msg": "Confirme d'abord ton email"}), 403
    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return {"msg": "Utilisateur non trouvé"}, 404
    user_dict = user.to_dict()
    user_dict["events_participated"] = [e.to_dict() for e in user.events_participated]
    return user_dict, 200


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Utilisateur non trouvé"}), 404

    data = request.get_json()
    new_password = data.get("new_password")
    if not new_password or len(new_password) < 6:
        return jsonify(
            {"msg": "Le mot de passe doit contenir au moins 6 caractères."}
        ), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"msg": "Mot de passe modifié avec succès."}), 200


@auth_bp.route("/confirm/<token>", methods=["GET"])
def confirm_email(token):
    user = User.query.filter_by(confirmation_token=token).first_or_404()
    user.is_confirmed = True
    user.confirmation_token = None
    db.session.commit()
    return redirect(f"{FRONTEND_URL}/confirmation-success")


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Si cet email existe, un lien de réinitialisation a été envoyé."}), 200
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    db.session.commit()
    reset_url = f"{FRONTEND_URL}/reset-password/{token}"
    from app import mail
    msg = Message("Réinitialisation du mot de passe", recipients=[user.email])
    msg.html = f"""
    <div style="font-family: Arial, sans-serif; background: #fff; color: #222; padding: 24px;">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Pour réinitialiser ton mot de passe, clique sur le lien ci-dessous :</p>
        <p>
            <a href="{reset_url}" style="color: #1976d2; text-decoration: underline; font-size: 16px;">
                Réinitialiser mon mot de passe
            </a>
        </p>
        <p style="font-size:12px;color:#888;">Si tu n'as pas demandé cette action, ignore ce message.</p>
    </div>
    """
    mail.send(msg)
    return jsonify({"msg": "Si cet email existe, un lien de réinitialisation a été envoyé."}), 200


@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json()
    new_password = data.get("new_password")
    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({"msg": "Lien invalide ou expiré."}), 400
    import re
    if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$", new_password):
        return jsonify({
            "msg": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
        }), 400
    if user.check_password(new_password):
        return jsonify({
            "msg": "Votre nouveau mot de passe ne peut pas être identique à votre mot de passe précédent."
        }), 400
    user.set_password(new_password)
    user.reset_token = None
    db.session.commit()
    return jsonify({"msg": "Mot de passe modifié avec succès."}), 200


@auth_bp.route("/update-preferences", methods=["POST"])
@jwt_required()
def update_preferences():
    import re
    data = request.get_json()
    prefs = data.get("preferences", [])
    code_postal = data.get("code_postal")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    if not isinstance(prefs, list) or not prefs:
        return jsonify({"msg": "Au moins une préférence est requise."}), 400
    prefs_str = ",".join(prefs)
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    user.preferences = prefs_str
    if code_postal and re.match(r"^\d{5}$", code_postal):
        user.code_postal = code_postal
        if latitude and longitude:
            user.latitude = latitude
            user.longitude = longitude
    db.session.commit()
    return jsonify({"msg": "Préférences mises à jour."}), 200
