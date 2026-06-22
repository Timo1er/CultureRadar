import React, { useEffect, useState } from "react";
import eventservice from "../services/eventService";
import EventCard from "../components/EventCard";
import EventCarousel from "../components/EventCarousel";

const Home = ({ user }) => {
  const [events, setevents] = useState([]);
  const [distance, setDistance] = useState(20);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchevents = async () => {
      try {
        const data = await eventservice.getAllevents(distance, page, 30);
        setevents(data.events);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Erreur chargement des events :", error);
      }
    };
    fetchevents();
  }, [distance, page]);

  return (
    <div>
      <EventCarousel user={user} />
      <div className="mb-4">
        <label htmlFor="distance" style={{ marginRight: 10 }}>
          Distance max (km) :
        </label>
        <input
          type="range"
          id="distance"
          min={5}
          max={100}
          step={1}
          value={distance}
          onChange={e => setDistance(Number(e.target.value))}
          style={{ width: 300, accentColor: "#1976d2" }}
        />
        <span style={{ marginLeft: 15, fontWeight: "bold", color: "#1976d2" }}>
          {distance} km
        </span>
      </div>
      <div className="row">
        {events.map((event) => (
          <div key={event.id} className="col-md-4 mb-3 d-flex">
            <EventCard event={event} user={user} />
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline-primary mx-2"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Précédent
        </button>
        <span style={{ alignSelf: "center" }}>Page {page} / {totalPages}</span>
        <button
          className="btn btn-outline-primary mx-2"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Home;