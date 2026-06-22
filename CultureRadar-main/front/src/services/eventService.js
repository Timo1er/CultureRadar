import api from "./api";

const eventservice = {
  createevent: async (eventData) => {
    const res = await api.post("/events", eventData);
    return res.data;
  },
  getAllevents: async (distance = 0, page = 1, size = 30) => {
    const res = await api.get("/events", {
      params: { distance, page, size },
    });
    return res.data;
  },
  geteventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  participate: async (eventId) => {
    return api.post(`/events/${eventId}/participate`);
  },
  unparticipate: async (eventId) => {
    return api.post(`/events/${eventId}/unparticipate`);
  },
  getAllGenres: async () => {
    const res = await api.get("/events/genres");
    return res.data.genres;
  },
  getSuggestions: async () => {
    const res = await api.get("/events/suggestions");
    return res.data;
  },
  updateevent: async (id, eventData) => {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data;
  },
};

export default eventservice;