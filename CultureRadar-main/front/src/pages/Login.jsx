import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(credentials);
      const user = await authService.me();
      setUser(user);
      navigate("/");
    } catch (error) {
      // Axios place le message du serveur dans error.response.data.msg
      const msg =
        error?.response?.data?.msg ||
        error?.msg ||
        "Identifiants invalides";
      alert("Erreur de connexion : " + msg);
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="username"
          placeholder="Nom d'utilisateur"
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="password"
          type="password"
          placeholder="Mot de passe"
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn-primary">
          Se connecter
        </button>
      </form>
      <div className="mt-3">
        <span>Pas de compte ? </span>
        <Link to="/register">Créer un compte</Link>
      </div>
      <div className="mt-2">
        <Link to="/forgot-password">Mot de passe oublié&nbsp;?</Link>
      </div>
    </div>
  );
};

export default Login;
