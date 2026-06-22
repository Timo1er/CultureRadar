import api from "./api";

export async function getNotifications() {
  const res = await api.get("/notifications");
  return res.data;
}

export async function markAsRead(id) {
  await api.post(`/notifications/${id}/read`);
}

export async function deleteNotification(id) {
  await api.delete(`/notifications/${id}`);
}