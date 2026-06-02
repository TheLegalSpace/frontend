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
// services/messages.services.ts
import { api } from "./api";

function log(method: string, label: string, ...args: unknown[]) {
  console.log(`[messagesService.${method}]`, label, ...args);
}

export const messagesService = {
  async getConversations(page = 1, limit = 20) {
    log("getConversations", "→ GET", { page, limit });
    const res = await api.get(`/conversations`, {
      params: { page, limit },
    });
    log("getConversations", "← status", res.status);
    log("getConversations", "← data", res.data);
    return res.data;
  },

  async getConversation(id: string) {
    log("getConversation", "→ GET", id);
    const res = await api.get(`/conversations/${id}`);
    log("getConversation", "← status", res.status);
    log("getConversation", "← data", res.data);
    return res.data;
  },

  async getMessages(id: string, limit = 50, before?: string) {
    const params: Record<string, string> = { limit: String(limit) };
    if (before) params.before = before;
    log("getMessages", "→ GET", { id, params });
    const res = await api.get(`/conversations/${id}/messages`, {
      params,
    });
    log("getMessages", "← status", res.status);
    log("getMessages", "← data", res.data);
    return res.data;
  },

  async sendMessage(id: string, body: string) {
    log("sendMessage", "→ POST", { conversationId: id, body });
    const res = await api.post(`/conversations/${id}/messages`, { body });
    log("sendMessage", "← status", res.status);
    log("sendMessage", "← data", res.data);
    return res.data;
  },

  async markRead(id: string, messageId: string) {
    log("markRead", "→ PATCH", { conversationId: id, messageId });
    const res = await api.patch(`/conversations/${id}/messages/${messageId}/read`);
    log("markRead", "← status", res.status);
    log("markRead", "← data", res.data);
    return res.data;
  },

  async closeConversation(id: string) {
    log("closeConversation", "→ POST", id);
    const res = await api.post(`/conversations/${id}/close`, {});
    log("closeConversation", "← status", res.status);
    log("closeConversation", "← data", res.data);
    return res.data;
  },

  async setAnonymous(isAnonymous: boolean) {
    log("setAnonymous", "→ PATCH", { isAnonymous });
    const res = await api.patch(`/profile/me/anonymous`, { isAnonymous });
    log("setAnonymous", "← status", res.status);
    log("setAnonymous", "← data", res.data);
    return res.data;
  },

  async submitReview(
    id: string,
    payload: { rating: number; body?: string }
  ) {
    log("submitReview", "→ POST", id, payload);
    const res = await api.post(`/conversations/${id}/reviews`, payload);
    log("submitReview", "← status", res.status);
    log("submitReview", "← data", res.data);
    return res.data;
  },
};
