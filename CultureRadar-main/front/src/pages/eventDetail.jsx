import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import eventservice from "../services/eventService";
import { formatEventDate } from "../utils/dateFormat";

const EventDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    eventservice.geteventById(id)
      .then(setEvent)
      .catch(() => setError("Événement introuvable"));
  }, [id]);

  const isParticipating = user?.events_participated?.some(ev => ev.id === Number(id));

  const handleParticipate = async (eventId) => {
    try {
      await eventservice.participate(eventId);
      alert("Participation enregistrée !");
      window.location.reload();
    } catch (e) {
      alert("Erreur lors de la participation.");
    }
  };

  const handleUnparticipate = async (eventId) => {
    try {
      await eventservice.unparticipate(eventId);
      alert("Participation annulée !");
      window.location.reload();
    } catch (e) {
      alert("Erreur lors de l'annulation.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!event) return <p>Chargement...</p>;

  return (
    <div className="card mx-auto d-flex flex-column" style={{ maxWidth: "900px", minWidth: "350px", height: "100%" }}>
      {event.cover_image && (
        <img
          src={event.cover_image}
          alt={event.title}
          className="card-img-top"
          style={{ maxHeight: "300px", objectFit: "cover" }}
        />
      )}
      <div className="card-body d-flex flex-column">
        <h2 className="card-title">{event.title}</h2>
        <p className="card-text"><strong>Auteur :</strong> {event.author}</p>
        <p className="card-text"><strong>Genres :</strong> {event.genres ? event.genres.split(",").join(", ") : "Aucun"}</p>
        <p className="card-text"><strong>Date :</strong> {formatEventDate(event.date_debut, event.date_fin)}</p>
        <p className="card-text"><strong>Prix :</strong> {event.prix || "Non communiqué"}</p>
        {event.event_url && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a
              href={event.event_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm mb-2"
              style={{ width: "fit-content" }}
            >
              Voir sur OpenAgenda
            </a>
          </div>
        )}
        <p className="card-text" style={{ textAlign: "center", marginTop: 10 }}>
          <strong>Description :</strong> {event.description}
        </p>
        {event.participants && event.participants.length > 0 && (
          <div className="mt-3">
            <strong>Participant(s)&nbsp;:</strong> {event.participants.join(", ")}
          </div>
        )}
        <div className="mt-auto">
          {isParticipating ? (
            <button
              className="btn btn-secondary mt-3 w-100"
              onClick={() => handleUnparticipate(event.id)}
            >
              Je ne participe plus...
            </button>
          ) : (
            <button
              className="btn btn-success mt-3 w-100"
              onClick={() => handleParticipate(event.id)}
            >
              Je participe !
            </button>
          )}
          {user?.username === event.author && (
            <button
              className="btn btn-warning mt-3 w-100"
              onClick={() => navigate(`/events/${event.id}/edit`)}
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;