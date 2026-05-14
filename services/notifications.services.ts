import { api } from "./api";

export const notificationsService = {
  async getNotifications(page = 1, limit = 20) {
    const { data } = await api.get("/notifications/", {
      params: { page, limit },
    });
    console.log("Fetched notifications:", data);
    return data;
  },

  async getUnreadCount() {
    const { data } = await api.get("/notifications/unread-count");
    console.log("Fetched unread count:", data);
    return data;
  },

  async markRead(id: string) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    console.log("Marked notification as read:", data);
    return data;
  },

  async markAllRead() {
    const { data } = await api.patch("/notifications/read-all");
    console.log("Marked all notifications as read:", data);
    return data;
  },
};