from app import app
from extensions import db
from models.event import event
import requests
from datetime import datetime
import re

OA_KEY = "8a135178e6c348169f33f0bab8e1dc17"
AGENDAS = [
    {"uid": "2363867", "name": "Nantes"},
    {"uid": "42448083", "name": "Toulouse"},
    {"uid": "85319813", "name": "Rennes"},
    {"uid": "5746", "name": "JNA Normandie"},
    {"uid": "979472", "name": "Jardins ouverts"},
]

def parse_date(date_str):
    if not date_str:
        return None
    return datetime.strptime(date_str[:10], "%Y-%m-%d").date()

def extract_price(text):
    match = re.search(r'(\d+)\s*euros?', text, re.IGNORECASE)
    if match:
        return match.group(0)
    if "gratuit" in text.lower():
        return "Gratuit"
    return "Non communiqué"

def get_event_url(slug):
    if slug:
        return f"https://openagenda.com/agenda/{slug}"
    return ""

with app.app_context():
    total_count = 0
    for agenda in AGENDAS:
        OA_URL = f"https://api.openagenda.com/v2/agendas/{agenda['uid']}/events?key={OA_KEY}&size=300"
        response = requests.get(OA_URL)
        data = response.json()
        count = 0
        for ev in data.get("events", []):
            title = ev["title"].get("fr") or ev["title"].get("en") or ev["title"]
            description = ev.get("description", {}).get("fr") or ev.get("description", {}).get("en") or ""
            date_debut = parse_date(ev.get("dateRange", {}).get("begin"))
            date_fin = parse_date(ev.get("dateRange", {}).get("end"))

            if not date_debut and ev.get("firstTiming"):
                date_debut = parse_date(ev["firstTiming"].get("begin"))
            if not date_fin and ev.get("lastTiming"):
                date_fin = parse_date(ev["lastTiming"].get("end"))

            cover_image = ""
            if ev.get("image") and ev["image"].get("base") and ev["image"].get("variants"):
                cover_image = ev["image"]["base"] + ev["image"]["variants"][0]["filename"]
            genres = ", ".join(ev.get("keywords", {}).get("fr", []))
            author = agenda["name"]

            latitude = None
            longitude = None
            if ev.get("location"):
                latitude = ev["location"].get("latitude")
                longitude = ev["location"].get("longitude")

            if not date_debut:
                continue
            exists = event.query.filter_by(title=title, date_debut=date_debut).first()
            if not exists:
                prix = extract_price(description)
                slug = ev.get("slug", "")
                event_url = get_event_url(slug)
                new_event = event(
                    title=title,
                    author=author,
                    date_debut=date_debut,
                    date_fin=date_fin,
                    genres=genres,
                    description=description,
                    cover_image=cover_image,
                    latitude=latitude,
                    longitude=longitude,
                    prix=prix,
                    event_url=event_url,
                )
                db.session.add(new_event)
                count += 1
        db.session.commit()
        print(f"{count} événements importés pour {agenda['name']}.")
        total_count += count
    print(f"Total importé : {total_count} événements.")