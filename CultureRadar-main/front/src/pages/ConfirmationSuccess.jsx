import React from "react";

export default function ConfirmationSuccess() {
  return (
    <div style={{
      maxWidth: 500,
      margin: "60px auto",
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 8px #0001",
      padding: 32,
      textAlign: "center",
      color: "#222"
    }}>
      <h2 style={{ color: "#1976d2" }}>Email confirmé !</h2>
      <p>Ton compte est maintenant activé.<br />Tu peux te connecter 🎉</p>
    </div>
  );
}