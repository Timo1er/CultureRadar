import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import eventService from "../services/eventService";

export default function RegisterStep2({ userData, setUserData, setErrors, errors }) {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selected, setSelected] = useState(userData.preferences || []);
  const [openCategories, setOpenCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/genres/categories`)
      .then(res => res.json())
      .then(setCategories);
  }, []);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    // Si on sélectionne la catégorie principale, on sélectionne tous ses sous-genres
    setSelected(categories[cat]);
  };

  const handleCategoryCheck = (cat) => {
    const allOptions = categories[cat];
    const allSelected = allOptions.every(opt => selected.includes(opt));
    setSelected(prev =>
      allSelected
        ? prev.filter(opt => !allOptions.includes(opt)) // décocher tous
        : [...prev, ...allOptions.filter(opt => !prev.includes(opt))] // cocher tous
    );
  };

  const handleCheck = (option) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
    setErrors({});
  };

  const isCategoryChecked = (cat) => {
    const allOptions = categories[cat];
    return allOptions.every(opt => selected.includes(opt));
  };

  async function geocodePostalCode(code_postal) {
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (selected.length === 0) {
      setErrors({ global: "Veuillez sélectionner au moins une préférence." });
      return;
    }
    try {
      const geo = await geocodePostalCode(userData.code_postal);
      await authService.register({
        ...userData,
        preferences: selected,
        latitude: geo.latitude,
        longitude: geo.longitude,
      });
      navigate("/check-email");
    } catch (error) {
      setErrors({ global: error.msg || "Erreur lors de l'inscription" });
    }
  };

  const toggleCategory = (cat) => {
    setOpenCategories(prev => {
      if (!prev.includes(cat)) {
        // Ouvre la catégorie normalement
        return [...prev, cat];
      }
      // Si on veut fermer, on vérifie s'il reste des coches
      const hasChecked = categories[cat].some(opt => selected.includes(opt));
      if (hasChecked) {
        // On ne retire pas la catégorie si elle a des coches
        return prev;
      }
      // Sinon, on peut la retirer
      return prev.filter(c => c !== cat);
    });
  };

  return (
    <>
      <style>
        {`input[type="checkbox"]:checked { accent-color: #1976d2; }`}
      </style>
      <form onSubmit={handleSubmit}>
        <h2>Choisis tes centres d'intérêt</h2>
        <div className="mb-3">
          {Object.keys(categories).map(cat => (
            <button
              key={cat}
              type="button"
              className={`btn btn-outline-primary m-2 ${openCategories.includes(cat) ? "active" : ""}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {openCategories.map(cat => (
          <div key={cat} className="mb-3">
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <h5 style={{ margin: 0, marginRight: 12 }}>{cat} sous-catégories :</h5>
              <button
                type="button"
                className="btn btn-link btn-sm"
                style={{ color: "#1976d2", textDecoration: "underline", padding: "0 8px" }}
                onClick={() => handleCategoryCheck(cat)}
              >
                {categories[cat].every(opt => selected.includes(opt)) ? "Tout décocher" : "Tout cocher"}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
              {categories[cat].map(opt => (
                <label key={opt} style={{ display: "flex", alignItems: "center", background: "#222", borderRadius: "20px", padding: "6px 14px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => handleCheck(opt)}
                    style={{ marginRight: 6 }}
                  />
                  <span style={{ color: "#fff" }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="btn btn-primary w-100" type="submit">
          Valider
        </button>
        {errors.global && (
          <div style={{ color: "red", fontSize: "0.9em", marginTop: 10 }}>
            {errors.global}
          </div>
        )}
      </form>
    </>
  );
}