import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer
    className="bg-dark text-white py-3 mt-5"
    style={{
      left: 0,
      bottom: 0,
      width: "100%",
      zIndex: 100,
    }}
  >
    <div className="container text-center">
      <ul className="list-unstyled">
        <li className="d-inline-block mx-2">
          <Link to="/a-propos" className="text-white text-decoration-none">
            À propos
          </Link>
        </li>
        <li className="d-inline-block mx-2">
          <Link to="/mentions-legales" className="text-white text-decoration-none">
            Mentions légales
          </Link>
        </li>
        <li className="d-inline-block mx-2">
          <Link to="/politique-confidentialite" className="text-white text-decoration-none">
            Politique de confidentialité
          </Link>
        </li>
        <li className="d-inline-block mx-2">
          <Link to="/cgv" className="text-white text-decoration-none">
            Conditions générales de vente
          </Link>
        </li>
      </ul>
    </div>
  </footer>
);

export default Footer;
