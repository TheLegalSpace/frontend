const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://legalspace.onrender.com";

function getToken() {
  return localStorage.getItem("accessToken") ?? "";
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export const messagesService = {
  async getConversations(page = 1, limit = 20) {
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations?page=${page}&limit=${limit}`,
      { headers: headers(), cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.status}`);
    return res.json();
  },

  async getConversation(id: string) {
    const res = await fetch(`${BASE_URL}/api/v1/conversations/${id}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch conversation: ${res.status}`);
    return res.json();
  },

  async getMessages(id: string, limit = 50, before?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations/${id}/messages?${params}`,
      { headers: headers(), cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
    return res.json();
  },

  async sendMessage(id: string, body: string) {
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations/${id}/messages`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ body }),
      }
    );
    if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
    return res.json();
  },

  async markRead(id: string, messageId: string) {
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations/${id}/messages/${messageId}/read`,
      { method: "PATCH", headers: headers() }
    );
    if (!res.ok) throw new Error(`Failed to mark read: ${res.status}`);
    return res.json();
  },

  async closeConversation(id: string) {
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations/${id}/close`,
      { method: "POST", headers: headers() }
    );
    if (!res.ok) throw new Error(`Failed to close conversation: ${res.status}`);
    return res.json();
  },

  async setAnonymous(isAnonymous: boolean) {
    const res = await fetch(
      `${BASE_URL}/api/v1/profile/me/anonymous`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ isAnonymous }),
      }
    );
    if (!res.ok) throw new Error(`Failed to update anonymous setting: ${res.status}`);
    return res.json();
  },
};