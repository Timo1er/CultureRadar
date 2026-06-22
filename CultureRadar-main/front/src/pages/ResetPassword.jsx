import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await authService.resetPassword(token, password);
      setMsg("Mot de passe modifié !");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg(err.msg || "Erreur lors de la modification.");
    }
  };

  return (
    <div>
      <h2>Nouveau mot de passe</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100" type="submit">
          Valider
        </button>
        {msg && <div style={{ color: "red", marginTop: 10 }}>{msg}</div>}
      </form>
    </div>
  );
}