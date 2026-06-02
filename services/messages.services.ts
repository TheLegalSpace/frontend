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

function log(method: string, label: string, ...args: unknown[]) {
  console.log(`[messagesService.${method}]`, label, ...args);
}

export const messagesService = {
  async getConversations(page = 1, limit = 20) {
    log("getConversations", "→ GET", { page, limit });
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations?page=${page}&limit=${limit}`,
      { headers: headers(), cache: "no-store" }
    );
    log("getConversations", "← status", res.status);
    if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.status}`);
    const data = await res.json();
    log("getConversations", "← data", data);
    return data;
  },

  async getConversation(id: string) {
    log("getConversation", "→ GET", id);
    const res = await fetch(`${BASE_URL}/api/v1/conversations/${id}`, {
      headers: headers(),
      cache: "no-store",
    });
    log("getConversation", "← status", res.status);
    if (!res.ok) throw new Error(`Failed to fetch conversation: ${res.status}`);
    const data = await res.json();
    log("getConversation", "← data", data);
    return data;
  },

  async getMessages(id: string, limit = 50, before?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    const url = `${BASE_URL}/api/v1/conversations/${id}/messages?${params}`;
    log("getMessages", "→ GET", url);
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    log("getMessages", "← status", res.status);
    if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
    const data = await res.json();
    log("getMessages", "← data", data);
    return data;
  },

  async sendMessage(id: string, body: string) {
    log("sendMessage", "→ POST", { conversationId: id, body });
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations/${id}/messages`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ body }),
      }
    );
    log("sendMessage", "← status", res.status);
    if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
    const data = await res.json();
    log("sendMessage", "← data", data);
    return data;
  },

  async markRead(id: string, messageId: string) {
    log("markRead", "→ PATCH", { conversationId: id, messageId });
    const res = await fetch(
      `${BASE_URL}/api/v1/conversations/${id}/messages/${messageId}/read`,
      { method: "PATCH", headers: headers() }
    );
    log("markRead", "← status", res.status);
    if (!res.ok) throw new Error(`Failed to mark read: ${res.status}`);
    const data = await res.json();
    log("markRead", "← data", data);
    return data;
  },

  async closeConversation(id: string) {
    const url = `${BASE_URL}/api/v1/conversations/${id}/close`;
    log("closeConversation", "→ POST", url);

    // The endpoint requires Content-Type: application/json, so we must
    // send an explicit body — even if empty — or the server returns 400.
    const res = await fetch(url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({}),
    });

    log("closeConversation", "← status", res.status);
    const responseText = await res.text();
    log("closeConversation", "← body", responseText);

    if (!res.ok) {
      throw new Error(
        `Failed to close conversation: ${res.status} — ${responseText}`
      );
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  },

  async setAnonymous(isAnonymous: boolean) {
    log("setAnonymous", "→ PATCH", { isAnonymous });
    const res = await fetch(`${BASE_URL}/api/v1/profile/me/anonymous`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ isAnonymous }),
    });
    log("setAnonymous", "← status", res.status);
    if (!res.ok)
      throw new Error(`Failed to update anonymous setting: ${res.status}`);
    const data = await res.json();
    log("setAnonymous", "← data", data);
    return data;
  },

  /**
   * Submit a review for a conversation.
   * POST /conversations/{id}/reviews
   * Body: { rating: 1–5, body?: string }
   */
  async submitReview(
    id: string,
    payload: { rating: number; body?: string }
  ) {
    const url = `${BASE_URL}/api/v1/conversations/${id}/reviews`;
    log("submitReview", "→ POST", url, payload);

    const res = await fetch(url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });

    log("submitReview", "← status", res.status);
    const responseText = await res.text();
    log("submitReview", "← body", responseText);

    if (!res.ok) {
      throw new Error(
        `Failed to submit review: ${res.status} — ${responseText}`
      );
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  },
};