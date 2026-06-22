import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import eventservice from "../services/eventService";

const EventCarousel = ({ user }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState("right");
  const [isSliding, setIsSliding] = useState(false);
  const [hovered, setHovered] = useState({ left: false, right: false });
  const navigate = useNavigate();

  useEffect(() => {
    eventservice.getSuggestions().then(suggestions => {
      setSuggestions(suggestions);
      // Préchargement des images
      suggestions.forEach(ev => {
        const img = new window.Image();
        img.src = ev.cover_image;
      });
    });
  }, []);

  useEffect(() => {
    if (!suggestions.length) return;
    const timer = setInterval(() => {
      setSlideDirection("right");
      setPrevIndex(current);
      setIsSliding(true);
      const nextIndex = (current + 1) % suggestions.length;
      setTimeout(() => {
        setCurrent(nextIndex);
        setIsSliding(false);
        setPrevIndex(null);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [suggestions, current]);

  if (!suggestions.length) return null;

  const event = suggestions[current];

  const handlePrev = () => {
    setSlideDirection("left");
    setPrevIndex(current);
    setIsSliding(true);
    setTimeout(() => {
      setCurrent((current - 1 + suggestions.length) % suggestions.length);
      setIsSliding(false);
      setPrevIndex(null);
    }, 300); // durée de l’animation
  };

  const handleNext = () => {
    setSlideDirection("right");
    setPrevIndex(current);
    setIsSliding(true);
    setTimeout(() => {
      setCurrent((current + 1) % suggestions.length);
      setIsSliding(false);
      setPrevIndex(null);
    }, 300);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto 30px auto",
        position: "relative",
        height: "320px",
        overflow: "hidden",
        borderRadius: "18px",
        boxShadow: "0 2px 12px #0002",
        background: "#222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* Ancienne image, animée vers l'extérieur */}
      {isSliding && prevIndex !== null && (
        <img
          src={suggestions[prevIndex].cover_image}
          alt={suggestions[prevIndex].title}
          className={`carousel-img slide-out-${slideDirection}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)",
            borderRadius: "18px",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 1,
          }}
        />
      )}
      {/* Nouvelle image, animée vers l'intérieur */}
      {isSliding && prevIndex !== null ? (
        <img
          src={suggestions[
            (prevIndex + (slideDirection === "right" ? 1 : -1) + suggestions.length) % suggestions.length
          ].cover_image}
          alt={suggestions[
            (prevIndex + (slideDirection === "right" ? 1 : -1) + suggestions.length) % suggestions.length
          ].title}
          className={`carousel-img slide-in-${slideDirection}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)",
            borderRadius: "18px",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 2,
          }}
        />
      ) : (
        <img
          src={event.cover_image}
          alt={event.title}
          className="carousel-img"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)",
            borderRadius: "18px",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 2,
          }}
        />
      )}
      {/* Ancien titre, animé vers l'extérieur */}
      {isSliding && prevIndex !== null && (
        <div
          className={`carousel-title slide-out-${slideDirection}`}
          style={{
            position: "absolute",
            zIndex: 5,
            color: "#fff",
            fontSize: "2.2em",
            fontWeight: "bold",
            textShadow: "0 2px 8px #000",
            width: "100%",
            textAlign: "center",
            cursor: "pointer",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            pointerEvents: "none"
          }}
        >
          {suggestions[prevIndex].title}
        </div>
      )}
      {/* Nouveau titre, animé vers l'intérieur */}
      <div
        className={`carousel-title${isSliding ? ` slide-in-${slideDirection}` : ""}`}
        style={{
          position: "absolute",
          zIndex: 6,
          color: "#fff",
          fontSize: "2.2em",
          fontWeight: "bold",
          textShadow: "0 2px 8px #000",
          width: "100%",
          textAlign: "center",
          cursor: "pointer",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)"
        }}
        onClick={() => navigate(`/events/${event.id}`)}
      >
        {event.title}
      </div>
      {/* Points blancs */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          zIndex: 3
        }}
      >
        {suggestions.map((_, idx) => (
          <span
            key={idx}
            style={{
              display: "inline-block",
              width: current === idx ? 18 : 10,
              height: current === idx ? 18 : 10,
              borderRadius: "50%",
              background: "#fff",
              opacity: current === idx ? 1 : 0.5,
              transition: "all 0.3s"
            }}
          />
        ))}
      </div>

      {/* Flèche gauche */}
      <button
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: 60,
          zIndex: 10,
          background: hovered.left ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.18)",
          border: "none",
          borderRadius: 0,
          color: "#fff",
          fontSize: "2em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: 12,
          transition: "background 0.2s"
        }}
        onMouseEnter={() => setHovered(h => ({ ...h, left: true }))}
        onMouseLeave={() => setHovered(h => ({ ...h, left: false }))}
        onClick={handlePrev}
        aria-label="Précédent"
      >
        &#8592;
      </button>

      {/* Flèche droite */}
      <button
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: 60,
          zIndex: 10,
          background: hovered.right ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.18)",
          border: "none",
          borderRadius: 0,
          color: "#fff",
          fontSize: "2em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 12,
          transition: "background 0.2s"
        }}
        onMouseEnter={() => setHovered(h => ({ ...h, right: true }))}
        onMouseLeave={() => setHovered(h => ({ ...h, right: false }))}
        onClick={handleNext}
        aria-label="Suivant"
      >
        &#8594;
      </button>
    </div>
  );
};

export default EventCarousel;