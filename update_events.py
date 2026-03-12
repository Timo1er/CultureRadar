from app import app
from extensions import db
from models.event import event

# Liste officielle des sous-catégories à enrichir selon tes besoins
official_subcats = set([
    # Musique
    "Concert", "Electro", "Rap", "Rock", "Pop", "DJ", "Chanson", "Reggae", "Disco", "Folk", "Punk", "Dub", "Jazz", "Electro-pop", "Hard techno", "Hardgroove", "Hardmusic", "Hardtechno", "Uptempo", "Metal", "Progressive", "House", "Afrohouse", "Shatta", "Latin", "Reggaeton", "Live", "Orchestrale",
    # Art
    "Peinture", "Sculpture", "Art contemporain", "Atelier artistique", "Photographie", "Exposition", "Céramique", "Fantastique", "Imaginaire", "Lithographie", "Edition", "Artiste", "Autrice",
    # Sport
    "Football", "MMA", "Parkour", "Tennis", "Footbag", "Compétition", "Sport", "Kinball", "Tournoi", "Urbain", "Street workout", "Junior", "Initiation", "Sport gratuit",
    # Spectacle
    "Théâtre", "Humour", "Improvisation", "Performance", "Cabaret", "Stand up", "Mise en scène", "Show", "Showcase", "Spectacle", "Festival", "Comedy club",
    # Famille
    "Enfant", "Famille", "Jeunesse", "Jeux", "Atelier", "Diversité", "Interculturalité", "Langue", "Lecture", "Tout public",
    # Vie nocturne
    "Soirée", "Club", "Warehouse", "Rave", "Nuit", "Étudiant", "Fête", "Campus", "Pride",
    # Nature & Environnement
    "Nature", "Jardin", "Biodiversité", "Balade nature", "Plante", "Engagé", "Bio", "Écologie", "Découverte", "Bords de loire", "Nature en ville",
    # Rencontres & Société
    "Forum", "Conférence", "Rencontre", "Interconnaissance", "Convivialité", "Solidarité", "Social", "Ess", "Tiers-lieu", "Visite",
    # Accessibilité
    "Handicap", "Handicaplap",
    # Science & Makers
    "Science", "Technologie", "DIY", "Do it yourself", "Recyclage", "Plastique", "Déchet",
    # Histoire & Société
    "Histoire", "Résistance", "Patrimoine", "Prisionniersdeguerre", "Secondeguerremondiale", "Histoire sociale", "Monde du travail", "Syndicalisme", "Sécurité sociale",
    # Jeux & Loisirs
    "Jeux de cartes", "Jeux de sociétés", "Soirée jeux", "Flashmob", "Animation", "Loisir", "Détente", "Tout niveau",
    # Culture & Littérature
    "Bibliothèque", "Littérature", "Lecture", "Langue", "Littérature jeunesse",
    # Lieux & Festivals
    "Saison culturelle", "Restauration", "Machines de l'ile de nantes", "Ferrailleur", "Stereolux", "Square vertais", "Région pays de la loire", "Nantes maker campus", "Nantes métropole", "Ile de nantes",
    # Autre
    "Autre"
])

def normalize_genre(genre):
    genre = genre.strip().lower()
    if genre.endswith("s") and len(genre) > 4 and " " not in genre:
        genre = genre[:-1]
    return genre.capitalize()

with app.app_context():
    events = event.query.all()
    for e in events:
        if e.genres:
            genres_list = [normalize_genre(g) for g in e.genres.split(",") if g.strip()]
            if not any(g in official_subcats for g in genres_list):
                genres_list.append("Autre")
            e.genres = ", ".join(sorted(set(genres_list)))
    db.session.commit()
    print("Genres nettoyés, normalisés et 'Autre' ajouté si besoin.")


