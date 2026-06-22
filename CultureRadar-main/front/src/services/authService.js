import api from "./api";

const authService = {
  register: async (userData) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  login: async (credentials) => {
    const res = await api.post("/login", credentials);
    if (res.data.access_token) {
      localStorage.setItem("token", res.data.access_token);
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  me: async () => {
    const res = await api.get("/me");
    return res.data;
  },

  changePassword: async (newPassword) => {
    return api.post("/change-password", { new_password: newPassword });
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  resetPassword: async (token, new_password) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password }),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  updatePreferences: async (preferences, code_postal, latitude, longitude) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.REACT_APP_API_URL}/update-preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ preferences, code_postal, latitude, longitude }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

export default authService;
