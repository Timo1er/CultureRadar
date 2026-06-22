import React, { useState } from "react";
import authService from "../services/authService";
import eventService from "../services/eventService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await authService.forgotPassword(email);
      setMsg("Si cet email existe, un lien de réinitialisation a été envoyé.");
    } catch {
      setMsg("Erreur lors de la demande.");
    }
  };

  const handleEventCreate = async (eventData) => {
    const { title, genres } = eventData;
    const user = authService.getCurrentUser();

    try {
      await eventService.createEvent({
        title,
        author: user.username,
        genres,
      });
    } catch (error) {
    }
  };

  return (
    <div>
      <h2>Mot de passe oublié</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          type="text"
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100" type="submit">
          Envoyer le lien
        </button>
        {msg && <div style={{ color: "red", marginTop: 10 }}>{msg}</div>}
      </form>
    </div>
  );
}