import React from "react";

export default function TermsOfSale() {
  return (
    <div className="legal-page">
      <h1>Conditions Générales de Vente</h1>
      <h2>Éditeur</h2>
      <p>
        Capsule Culture – SASU<br />
        SIRET : 903 112 654 00021<br />
        Siège social : 4 rue pas trop cher, 75011 Paris, France<br />
        Email : <a href="mailto:contact.principale@gmail.com">contact.principale@gmail.com</a><br />
        Représentée par Mme Lemoine, Présidente
      </p>
      <h2>Produits et services concernés</h2>
      <ul>
        <li>Abonnements Premium (utilisateurs particuliers)</li>
        <li>Abonnements Professionnels (organisateurs d’événements)</li>
        <li>Mises en avant d’événements (upvote ou promotion)</li>
        <li>Commissions sur billetterie en ligne</li>
      </ul>
      <h2>Modalités de paiement</h2>
      <p>
        Les paiements s’effectuent par carte bancaire via un prestataire sécurisé (Stripe, Paypal ou autre).<br />
        Les prix sont indiqués en euros TTC.
      </p>
      <h2>Rétractation & résiliation</h2>
      <p>
        L’utilisateur dispose d’un droit de rétractation de 14 jours.<br />
        Les abonnements sont sans engagement, résiliables à tout moment depuis l’espace personnel.
      </p>
      <h2>Responsabilité & litiges</h2>
      <p>
        Capsule Culture ne garantit pas la présence ou le succès des événements promus.<br />
        Tout litige sera soumis au droit français et traité par les tribunaux de Paris.
      </p>
    </div>
  );
}