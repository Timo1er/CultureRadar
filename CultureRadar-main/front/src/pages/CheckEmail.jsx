import React from "react";
import { useNavigate } from "react-router-dom";

export default function CheckEmail() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
      <h2>Vérifiez votre boîte mail</h2>
      <p>
        Un email de confirmation vous a été envoyé.<br />
        Cliquez sur le lien reçu pour activer votre compte.
      </p>
      <button
        className="btn btn-primary mt-4"
        onClick={() => navigate("/login")}
      >
        Retour à la connexion
      </button>
    </div>
  );
}