import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import eventService from "../services/eventService";

const Profile = ({ user }) => {
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [editPrefs, setEditPrefs] = useState(false);
  const [allOptions, setAllOptions] = useState([]);
  const [prefs, setPrefs] = useState(user.preferences ? user.preferences.split(",") : []);
  const [prefsError, setPrefsError] = useState("");
  const [categories, setCategories] = useState({});
  const [openCategories, setOpenCategories] = useState([]);
  const [prefsCodePostal, setPrefsCodePostal] = useState(user.code_postal || "");
  const [editPostal, setEditPostal] = useState(false);
  const [postalInput, setPostalInput] = useState(user.code_postal || "");
  const [postalError, setPostalError] = useState("");

  useEffect(() => {
    eventService.getAllGenres().then(setAllOptions);
    fetch(`${process.env.REACT_APP_API_URL}/genres/categories`)
      .then(res => res.json())
      .then(setCategories);
  }, []);

  if (!user) return <p>Chargement du profil...</p>;

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirm) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await authService.changePassword(newPassword);
      setMessage("Mot de passe modifié !");
      setShowReset(false);
      setNewPassword("");
      setConfirm("");
    } catch {
      setMessage("Erreur lors de la modification.");
    }
  };

  // Système d'ouverture/fermeture des catégories
  const toggleCategory = (cat) => {
    setOpenCategories(prev => {
      if (!prev.includes(cat)) {
        // Ouvre la catégorie normalement
        return [...prev, cat];
      }
      // Si on veut fermer, on vérifie s'il reste des coches
      const hasChecked = categories[cat].some(opt => prefs.includes(opt));
      if (hasChecked) {
        // On ne retire pas la catégorie si elle a des coches
        return prev;
      }
      // Sinon, on peut la retirer
      return prev.filter(c => c !== cat);
    });
  };

  const displayedCategories = Object.keys(categories).filter(
    cat => openCategories.includes(cat) || categories[cat].some(opt => prefs.includes(opt))
  );

  return (
    <div className="card mx-auto mt-5" style={{ maxWidth: "1100px", minWidth: "600px" }}>
      <style>
        {`input[type="checkbox"]:checked { accent-color: #1976d2; }`}
      </style>
      <div className="card-body">
        <h3 className="card-title mb-4">Profil</h3>
        <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
        <p><strong>Email :</strong> {user.email}</p>
        <p>
          <strong>Code postal :</strong>{" "}
          {user.code_postal || <span style={{ color: "#888" }}>Non renseigné</span>}
        </p>
        {!editPostal && (
          <button
            className="btn btn-outline-primary btn-sm mb-2"
            onClick={() => {
              setPostalInput(user.code_postal || "");
              setPostalError("");
              setEditPostal(true);
            }}
          >
            Changer de code postal
          </button>
        )}
        {editPostal && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPostalError("");
                if (!/^\d{5}$/.test(postalInput)) {
                  setPostalError("Le code postal doit contenir exactement 5 chiffres.");
                  return;
                }
                try {
                  const geo = await geocodePostalCode(postalInput);
                  await authService.updatePreferences(prefs, postalInput, geo.latitude, geo.longitude);
                  setEditPostal(false);
                  window.location.reload();
                } catch {
                  setPostalError("Erreur lors de la mise à jour.");
                }
              }}
              className="mb-2"
              style={{ maxWidth: 220, width: "100%" }}
            >
              <input
                className="form-control mb-2"
                name="code_postal"
                placeholder="Nouveau code postal"
                value={postalInput}
                onChange={e => {
                  // N'accepte que des chiffres et max 5 caractères
                  const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setPostalInput(val);
                  setPostalError("");
                }}
                maxLength={5}
                required
                autoComplete="off"
              />
              <button className="btn btn-primary btn-sm w-100" type="submit">
                Valider
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm w-100"
                onClick={() => setEditPostal(false)}
              >
                Annuler
              </button>
              {postalError && (
                <div style={{ color: "red", fontSize: "0.9em", marginTop: -8, marginBottom: 8 }}>
                  {postalError}
                </div>
              )}
            </form>
          </div>
        )}
        <p>
          <strong>Préférences :</strong>{" "}
          {user.preferences
            ? user.preferences.split(",").join(", ")
            : <span style={{ color: "#888" }}>Aucune</span>}
        </p>
        {!editPrefs && (
          <button
            className="btn btn-outline-primary btn-sm mb-2"
            onClick={() => {
              setPrefs(user.preferences ? user.preferences.split(",") : []);
              setPrefsCodePostal(user.code_postal || "");
              setEditPrefs(true);
            }}
          >
            Changer mes préférences
          </button>
        )}
        {editPrefs && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPrefsError("");
              if (prefs.length === 0) {
                setPrefsError("Veuillez sélectionner au moins une préférence.");
                return;
              }
              if (!/^\d{5}$/.test(prefsCodePostal)) {
                setPrefsError("Le code postal doit contenir exactement 5 chiffres.");
                return;
              }
              try {
                await authService.updatePreferences(prefs, prefsCodePostal);
                setEditPrefs(false);
                window.location.reload();
              } catch {
                setPrefsError("Erreur lors de la mise à jour.");
              }
            }}
            className="mb-3"
          >
            <div className="mb-2">
              {/* Boutons catégories */}
              <div className="mb-3">
                {Object.keys(categories).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`btn btn-outline-primary m-2 ${
                      openCategories.includes(cat) || categories[cat].some(opt => prefs.includes(opt)) ? "active" : ""
                    }`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Sous-catégories */}
              {displayedCategories.map(cat => (
                <div key={cat} className="mb-3">
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <h5 style={{ margin: 0, marginRight: 12 }}>{cat} sous-catégories :</h5>
                    <button
                      type="button"
                      className="btn btn-link btn-sm"
                      style={{ color: "#1976d2", textDecoration: "underline", padding: "0 8px" }}
                      onClick={() => {
                        const allOptions = categories[cat];
                        const allSelected = allOptions.every(opt => prefs.includes(opt));
                        setPrefs(prev =>
                          allSelected
                            ? prev.filter(opt => !allOptions.includes(opt))
                            : [...prev, ...allOptions.filter(opt => !prev.includes(opt))]
                        );
                      }}
                    >
                      {categories[cat].every(opt => prefs.includes(opt)) ? "Tout décocher" : "Tout cocher"}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                    {categories[cat].map(opt => (
                      <label
                        key={opt}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: prefs.includes(opt) ? "#1976d2" : "#e3e3e3",
                          borderRadius: "20px",
                          padding: "6px 14px",
                          cursor: "pointer",
                          color: prefs.includes(opt) ? "#fff" : "#222",
                          fontWeight: 500,
                          border: prefs.includes(opt) ? "2px solid #1976d2" : "2px solid #e3e3e3"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={prefs.includes(opt)}
                          onChange={() =>
                            setPrefs(prefs =>
                              prefs.includes(opt)
                                ? prefs.filter(o => o !== opt)
                                : [...prefs, opt]
                            )
                          }
                          style={{ marginRight: 6 }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" type="submit">
              Enregistrer
            </button>
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => setEditPrefs(false)}
            >
              Annuler
            </button>
            {prefsError && <div className="text-danger mt-2">{prefsError}</div>}
          </form>
        )}
        <p>
          <strong>Mot de passe :</strong>{" "}
          <input type="password" value="password" disabled style={{ width: "120px" }} />
        </p>
        <button
          className="btn btn-outline-primary btn-sm mb-3"
          onClick={() => setShowReset((v) => !v)}
        >
          Réinitialiser le mot de passe
        </button>
        {showReset && (
          <form onSubmit={handleReset}>
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            <button className="btn btn-primary btn-sm" type="submit">
              Valider
            </button>
          </form>
        )}
        {message && <div className="mt-2 text-danger">{message}</div>}
        {user.events_participated && user.events_participated.length > 0 && (
          <p>
            <strong>Événements :</strong>{" "}
            {user.events_participated.map(ev => ev.title).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
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

export default Profile;