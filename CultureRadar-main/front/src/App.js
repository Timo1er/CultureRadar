import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import EventDetail from "./pages/eventDetail";
import Profile from "./pages/Profile";
import Addevent from "./pages/Addevent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/legal/About";
import LegalNotice from "./pages/legal/LegalNotice";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfSale from "./pages/legal/TermsOfSale";
import ConfirmationSuccess from "./pages/ConfirmationSuccess";
import authService from "./services/authService";
import RequireAuth from "./components/RequireAuth";
import "./styles/App.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CheckEmail from "./pages/CheckEmail";
import MesEvenements from "./pages/MesEvenements";
import Editevent from "./pages/Editevent";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authService
        .me()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="App d-flex flex-column min-vh-100">
      {!isAuthPage && user && <Header user={user} setUser={setUser} />}
      <main className="container mt-4 flex-grow-1">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          {}
          <Route
            path="/"
            element={
              <RequireAuth user={user}>
                <Home user={user} />
              </RequireAuth>
            }
          />
          <Route
            path="/events/:id"
            element={
              <RequireAuth user={user}>
                <EventDetail user={user} />
              </RequireAuth>
            }
          />
          <Route
            path="/add-event"
            element={
              <RequireAuth user={user}>
                <Addevent user={user} />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={<Profile user={user} />}
          />
          <Route path="/a-propos" element={<About />} />
          <Route path="/mentions-legales" element={<LegalNotice />} />
          <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
          <Route path="/cgv" element={<TermsOfSale />} />
          <Route path="/confirmation-success" element={<ConfirmationSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/mes-evenements" element={<MesEvenements user={user} />} />
          <Route path="/events/:id/edit" element={<Editevent user={user} />} />
        </Routes>
      </main>
      {!isAuthPage && user && <Footer />}
    </div>
  );
}

export default App;
