import React from "react";

export default function RegisterStep1({ userData, setUserData, setStep, errors, setErrors }) {
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setErrors({});
  };

  const handleNext = (e) => {
    e.preventDefault();
    setErrors({});
    if (userData.username.length < 6) {
      setErrors({ global: "Nombre de caractères du nom d'utilisateur insuffisant" });
      return;
    }
    const emailRegex = /^[^@]{3,}@[a-zA-Z]+\.(com|fr)$/;
    if (!emailRegex.test(userData.email)) {
      setErrors({ global: "Format du mail incorrect" });
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      setErrors({ global: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre." });
      return;
    }
    if (!/^\d{5}$/.test(userData.code_postal)) {
      setErrors({ global: "Le code postal doit contenir exactement 5 chiffres." });
      return;
    }
    setStep(2);
  };

  return (
    <form onSubmit={handleNext}>
      <h2>Inscription</h2>
      <input
        className="form-control mb-2"
        name="username"
        placeholder="Nom d'utilisateur"
        value={userData.username}
        onChange={handleChange}
        required
      />
      <input
        className="form-control mb-2"
        name="email"
        placeholder="Email"
        type="text"
        value={userData.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />
      <input
        className="form-control mb-2"
        name="password"
        placeholder="Mot de passe"
        type="password"
        value={userData.password}
        onChange={handleChange}
        required
      />
      <input
        className="form-control mb-2"
        name="code_postal"
        placeholder="Code postal"
        value={userData.code_postal || ""}
        onChange={e => {
          // N'accepte que des chiffres et max 5 caractères
          setUserData({ ...userData, code_postal: e.target.value.replace(/\D/g, "").slice(0, 5) });
          setErrors({});
        }}
        maxLength={5}
        required
      />
      <button className="btn btn-primary w-100" type="submit">
        Suivant
      </button>
      {errors.global && (
        <div style={{ color: "red", fontSize: "0.9em", marginTop: 10 }}>
          {errors.global}
        </div>
      )}
    </form>
  );
}