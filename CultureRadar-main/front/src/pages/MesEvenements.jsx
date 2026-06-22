import React, { useState, useEffect } from "react";
import eventservice from "../services/eventService";
import EventCard from "../components/EventCard";
import { formatEventDate } from "../utils/dateFormat";

const TABS = [
  { key: "passes", label: "Evènements passés" },
  { key: "futurs", label: "Evènements futurs" },
  { key: "ajoutes", label: "Evènements ajoutés" },
];

const MesEvenements = ({ user }) => {
  const [tab, setTab] = useState("futurs");
  const [events, setEvents] = useState({ passes: [], futurs: [], ajoutes: [] });

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    eventservice.getAllevents().then(data => {
      const passes = [];
      const futurs = [];
      const ajoutes = [];
      // Récupère les IDs des événements auxquels l'utilisateur participe
      const userEventIds = user.events_participated?.map(e => e.id) || [];
      data.events.forEach(ev => {
        const isParticipating = userEventIds.includes(ev.id);
        const isAdded = ev.author === user.username;
        const dateFin = ev.date_fin ? new Date(ev.date_fin) : new Date(ev.date_debut);

        if (isParticipating) {
          if (dateFin < now) passes.push(ev);
          else futurs.push(ev);
        }
        if (isAdded) ajoutes.push(ev);
      });
      setEvents({ passes, futurs, ajoutes });
    });
  }, [user]);

  const deduplicate = arr =>
    arr.filter((ev, idx, self) => self.findIndex(e => e.id === ev.id) === idx);

  const uniqueEvents = {
    passes: deduplicate(events.passes),
    futurs: deduplicate(events.futurs),
    ajoutes: deduplicate(events.ajoutes),
  };

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto" }}>
      <h2>Mes évènements</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`btn btn-outline-primary${tab === t.key ? " active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {uniqueEvents[tab].length === 0 ? (
          <p style={{ color: "#888" }}>Aucun évènement dans cette catégorie.</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "32px",
              justifyContent: "flex-start",
            }}
          >
            {uniqueEvents[tab].map(ev => (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  background: "#fff",
                  color: "#222",
                  borderRadius: 18,
                  boxShadow: "0 2px 12px #0002",
                  overflow: "hidden",
                  minHeight: 300,
                  height: 300,
                  width: "100%",
                  maxWidth: 1100,
                  margin: "0 auto"
                }}
              >
                {/* Image carrée à gauche */}
                <div style={{
                  width: 200,
                  height: "100%",
                  flexShrink: 0,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {ev.cover_image && (
                    <img
                      src={ev.cover_image}
                      alt={ev.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 0
                      }}
                    />
                  )}
                </div>
                {/* Texte à droite */}
                <div style={{
                  flex: 1,
                  padding: "36px 40px 36px 40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%"
                }}>
                  <div>
                    <h4 style={{ margin: "0 0 16px 0" }}>{ev.title}</h4>
                    <p style={{ marginBottom: 10, color: "#888" }}>Auteur : {ev.author}</p>
                    <p style={{ marginBottom: 18, fontWeight: "bold" }}>
                      Date : {formatEventDate(ev.date_debut, ev.date_fin)}
                    </p>
                  </div>
                  <div>
                    <EventCard event={ev} user={user} onlyActions />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesEvenements;