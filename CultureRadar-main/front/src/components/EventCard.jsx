import React from "react";
import { Link } from "react-router-dom";
import eventservice from "../services/eventService";
import { formatEventDate } from "../utils/dateFormat";

const CARD_WIDTH = 400;
const CARD_HEIGHT = 370;
const IMG_HEIGHT = 140;

const EventCard = ({ event, user, onlyActions }) => {
  const isParticipating = user?.events_participated?.some(ev => ev.id === event.id);

  const handleParticipate = async (eventId) => {
    try {
      await eventservice.participate(eventId);
      window.location.reload();
    } catch (e) {
      alert("Erreur lors de la participation.");
    }
  };

  const handleUnparticipate = async (eventId) => {
    try {
      await eventservice.unparticipate(eventId);
      window.location.reload();
    } catch (e) {
      alert("Erreur lors de l'annulation.");
    }
  };

  if (onlyActions) {
    return (
      <div>
        <Link to={`/events/${event.id}`} className="btn btn-primary w-100 mb-2 mt-auto">
          Voir les détails
        </Link>
        {isParticipating ? (
          <button
            className="btn btn-secondary btn-sm w-100"
            onClick={() => handleUnparticipate(event.id)}
          >
            Je ne participe plus...
          </button>
        ) : (
          <button
            className="btn btn-success btn-sm w-100"
            onClick={() => handleParticipate(event.id)}
          >
            Je participe !
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="card d-flex flex-column align-items-stretch"
      style={{
        width: `${CARD_WIDTH}px`,
        minWidth: `${CARD_WIDTH}px`,
        maxWidth: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        minHeight: `${CARD_HEIGHT}px`,
        maxHeight: `${CARD_HEIGHT}px`,
        margin: "0 auto"
      }}
    >
      {event.cover_image && (
        <img
          src={event.cover_image}
          alt={event.title}
          className="card-img-top"
          style={{
            height: `${IMG_HEIGHT}px`,
            width: "100%",
            objectFit: "cover",
            objectPosition: "center"
          }}
        />
      )}
      <div className="card-body d-flex flex-column p-3" style={{ flex: 1, minHeight: 0 }}>
        <h5 className="card-title">{event.title}</h5>
        <p className="card-text mb-1">Auteur : {event.author}</p>
        <p className="card-text mb-2" style={{ fontSize: "0.95em" }}>
          <strong>Date :</strong>{" "}
          {formatEventDate(event.date_debut, event.date_fin)}
        </p>
        <Link to={`/events/${event.id}`} className="btn btn-primary w-100 mb-2 mt-auto">
          Voir les détails
        </Link>
        {isParticipating ? (
          <button
            className="btn btn-secondary btn-sm w-100"
            onClick={() => handleUnparticipate(event.id)}
          >
            Je ne participe plus...
          </button>
        ) : (
          <button
            className="btn btn-success btn-sm w-100"
            onClick={() => handleParticipate(event.id)}
          >
            Je participe !
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;