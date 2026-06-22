import React from "react";

export default function LegalNotice() {
  return (
    <div className="legal-page">
      <h1>Mentions légales</h1>
      <h2>Éditeur du site</h2>
      <p>
        Capsule Culture – SASU<br />
        Siège social : 4 rue pas trop cher, 75011 Paris, France<br />
        SIRET : 903 112 654 00021<br />
        Représentée par : Mme Lemoine, Présidente<br />
        Contact : <a href="mailto:contact.principale@gmail.com">contact.principale@gmail.com</a>
      </p>
      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Render.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        L’ensemble du site et de ses contenus (textes, images, vidéos, graphismes, logo, base de données, code source, etc.) est la propriété exclusive de Capsule Culture, sauf mention contraire.<br />
        Toute reproduction ou représentation, même partielle, sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
      </p>
      <h2>Données personnelles</h2>
      <p>
        Les données des utilisateurs sont traitées conformément au RGPD. L’utilisateur peut exercer ses droits d’accès, de modification ou de suppression de ses données via <a href="mailto:contact.principale@gmail.com">contact.principale@gmail.com</a>.
      </p>
      <h2>Responsabilité</h2>
      <p>
        Capsule Culture met tout en œuvre pour assurer l’exactitude des informations publiées sur son site, mais ne saurait être tenue pour responsable d’erreurs, d’omissions ou d’un mauvais usage du service. L’utilisateur est seul responsable de ses contenus et publications.
      </p>
      <h2>Loi applicable</h2>
      <p>
        Le présent site est soumis à la loi française. En cas de litige, les tribunaux compétents seront ceux du ressort de Paris, sauf disposition légale contraire.
      </p>
    </div>
  );
}