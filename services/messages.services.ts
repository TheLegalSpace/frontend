import { api } from "./api";

export const messagesService = {
  async getConversations(page = 1, limit = 20) {
    const { data } = await api.get("/conversations", {
      params: { page, limit },
    });
    return data;
  },

  async getConversation(id: string) {
    const { data } = await api.get(`/conversations/${id}`);
    return data;
  },

  async getMessages(id: string, limit = 50, before?: string) {
    const { data } = await api.get(`/conversations/${id}/messages`, {
      params: { limit, ...(before ? { before } : {}) },
    });
    return data;
  },

  async sendMessage(id: string, body: string) {
    const { data } = await api.post(`/conversations/${id}/messages`, { body });
    return data;
  },

  async markRead(id: string, messageId: string) {
    const { data } = await api.patch(
      `/conversations/${id}/messages/${messageId}/read`
    );
    return data;
  },

  async closeConversation(id: string) {
    const { data } = await api.post(`/conversations/${id}/close`);
    return data;
  },

  async setAnonymous(isAnonymous: boolean) {
    const { data } = await api.patch("/profile/me/anonymous", { isAnonymous });
    return data;
  },
};
