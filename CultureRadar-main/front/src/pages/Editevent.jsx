import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import eventservice from "../services/eventService";

const Editevent = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setevent] = useState(null);
  const [categories, setCategories] = useState({});
  const [selected, setSelected] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);
  const [showEndDate, setShowEndDate] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    eventservice.geteventById(id).then(setevent);
  }, [id]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/genres/categories`)
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  if (!event) return <div>Chargement...</div>;

  const handleCheck = (subcat) => {
    setSelected((prev) => {
      if (prev.includes(subcat)) {
        return prev.filter((g) => g !== subcat);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, subcat];
    });
  };

  const toggleCategory = (cat) => {
    setOpenCategories((prev) => {
      if (!prev.includes(cat)) {
        const stillOpen = prev.filter((openCat) => {
          const hasChecked = categories[openCat]?.some((opt) => selected.includes(opt));
          return hasChecked;
        });
        return [...stillOpen, cat];
      }
      const hasChecked = categories[cat]?.some((opt) => selected.includes(opt));
      if (hasChecked) {
        return prev;
      }
      return prev.filter((c) => c !== cat);
    });
  };

  const handleChange = (e) => {
    setevent({ ...event, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setevent(ev => ({ ...ev, cover_image: reader.result }));
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let geo = { latitude: null, longitude: null };
      if (event.code_postal) {
        geo = await geocodePostalCode(event.code_postal);
      }
      await eventservice.updateevent(event.id, {
        ...event,
        author: user.username,
        genres: selected,
        latitude: geo.latitude,
        longitude: geo.longitude,
      });
      navigate("/");
    } catch (error) {
      alert("Erreur lors de la modification de l'événement.");
    }
  };

  const geocodePostalCode = async (code_postal) => {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${code_postal}&country=France&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return { latitude: null, longitude: null };
  };

  // Catégories à afficher : ouvertes ou avec au moins une coche
  const displayedCategories = Object.keys(categories).filter(
    (cat) => openCategories.includes(cat) || categories[cat].some((opt) => selected.includes(opt))
  );

  return (
    <div>
      <h2>Modifier votre événement</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 32,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <input
          className="form-control mb-2"
          name="title"
          placeholder="Titre"
          value={event.title}
          onChange={handleChange}
          required
        />
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="date_debut" style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>
            Date de début
          </label>
          <input
            type="date"
            className="form-control mb-2"
            name="date_debut"
            id="date_debut"
            value={event.date_debut}
            onChange={handleChange}
            required
          />
          {!showEndDate && (
            <button
              type="button"
              className="btn btn-outline-primary w-100"
              style={{ marginBottom: 8 }}
              onClick={() => setShowEndDate(true)}
            >
              Plus d'une journée ? Enregistrez une date de fin !
            </button>
          )}
          {showEndDate && (
            <div>
              <label htmlFor="date_fin" style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>
                Date de fin
              </label>
              <input
                type="date"
                className="form-control mb-2"
                name="date_fin"
                id="date_fin"
                value={event.date_fin}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-link w-100"
                style={{ color: "#1976d2", textDecoration: "underline", fontWeight: 500, marginBottom: 8 }}
                onClick={() => {
                  setShowEndDate(false);
                  setevent(ev => ({ ...ev, date_fin: "" }));
                }}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
        <textarea
          className="form-control mb-2"
          name="description"
          placeholder="Description"
          value={event.description}
          onChange={handleChange}
          required
        />
        <div className="mb-2">
          <label>
            <strong>Genres :</strong>
          </label>
          <div
            style={{
              margin: "16px 0",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 8,
              scrollbarWidth: "thin"
            }}
          >
            {Object.keys(categories).map(cat => {
              const isActive = openCategories.includes(cat) || categories[cat].some(opt => selected.includes(opt));
              return (
                <button
                  key={cat}
                  type="button"
                  className="btn"
                  onClick={() => toggleCategory(cat)}
                  style={{
                    background: isActive ? "#1976d2" : "#fff",
                    color: isActive ? "#fff" : "#1976d2",
                    border: "2px solid #1976d2",
                    fontWeight: 500,
                    borderRadius: 12,
                    boxShadow: "none",
                    padding: "8px 22px",
                    margin: "0 4px",
                    transition: "background 0.2s, color 0.2s",
                    flex: "0 0 auto"
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          {displayedCategories.map(cat => (
            <div key={cat} style={{
              background: "#fff",
              borderRadius: 0,
              padding: "0 0 18px 0",
              marginBottom: 0,
              boxShadow: "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: "bold", color: "#222", fontSize: "1.15em", marginRight: 12 }}>
                  {cat} sous-catégories :
                </span>
                <button
                  type="button"
                  className="btn btn-link btn-sm"
                  style={{ color: "#1976d2", textDecoration: "underline", padding: "0 8px", fontWeight: 500 }}
                  onClick={() => {
                    const allOptions = categories[cat];
                    const allSelected = allOptions.every(opt => selected.includes(opt));
                    setSelected(prev =>
                      allSelected
                        ? prev.filter(opt => !allOptions.includes(opt))
                        : [...prev, ...allOptions.filter(opt => !prev.includes(opt))]
                    );
                  }}
                >
                  {categories[cat].every(opt => selected.includes(opt)) ? "Tout décocher" : "Tout cocher"}
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                {categories[cat].map(opt => (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: selected.includes(opt) ? "#1976d2" : "#e3e3e3",
                      borderRadius: "20px",
                      padding: "6px 18px",
                      cursor: "pointer",
                      color: selected.includes(opt) ? "#fff" : "#222",
                      fontWeight: 500,
                      border: "none"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(opt)}
                      onChange={() => handleCheck(opt)}
                      style={{ marginRight: 6, accentColor: "#1976d2" }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {selected.length >= 5 && (
            <div style={{ color: "#1976d2", fontWeight: 500, marginBottom: 8 }}>
              Vous pouvez sélectionner au maximum 5 sous-catégories.
            </div>
          )}
        </div>
        <input
          className="form-control mb-2"
          name="prix"
          placeholder="Prix (ex: Gratuit ou 10)"
          value={event.prix || ""}
          onChange={e => {
            const val = e.target.value;
            if (val === "Gratuit" || /^\d*$/.test(val)) {
              setevent({ ...event, prix: val });
            }
          }}
        />
        <input
          className="form-control mb-2"
          name="event_url"
          placeholder="Lien externe (URL)"
          value={event.event_url || ""}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="code_postal"
          placeholder="Code postal"
          value={event.code_postal || ""}
          onChange={handleChange}
          maxLength={5}
          required
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>
            Image de couverture
          </label>
          <input
            className="form-control mb-2"
            name="cover_image"
            placeholder="URL de la couverture"
            value={event.cover_image.startsWith("http") ? event.cover_image : ""}
            onChange={handleChange}
            style={{ marginBottom: 8 }}
          />
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleImageUpload}
            style={{ marginBottom: 8 }}
            ref={fileInputRef}
          />
          {event.cover_image && (
            <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
              <img
                src={event.cover_image}
                alt="aperçu"
                style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => {
                  setevent(ev => ({ ...ev, cover_image: "" }));
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  background: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  boxShadow: "0 1px 4px #0002",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "#1976d2",
                  fontSize: 18,
                }}
                aria-label="Retirer l'image"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default Editevent;
