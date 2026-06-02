import {
    ResearchThread,
    ResearchMessage,
    ResearchThreadDetail,
  } from "@/app/types/Research";
  
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "https://legalspace.onrender.com";
  const API_PREFIX = "/api/v1";
  const BASE = `${BASE_URL}${API_PREFIX}`;
  
  function getToken() {
    return localStorage.getItem("accessToken") ?? "";
  }
  function authHeaders() {
    return { Authorization: `Bearer ${getToken()}` };
  }
  
  export const researchService = {
    async listThreads(): Promise<ResearchThread[]> {
      const r = await fetch(`${BASE}/research/threads`, {
        headers: authHeaders(),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.message || "Failed to load threads");
      return json.data ?? [];
    },
  
    async createThread(): Promise<ResearchThread> {
      const r = await fetch(`${BASE}/research/threads`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.message || "Failed to create thread");
      return json.data;
    },
  
    async getThread(id: string): Promise<ResearchThreadDetail> {
      const r = await fetch(`${BASE}/research/threads/${id}`, {
        headers: authHeaders(),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.message || "Thread not found");
      return json.data;
    },
  
    async patchThread(
      id: string,
      body: { title?: string; pinned?: boolean }
    ): Promise<ResearchThread> {
      const r = await fetch(`${BASE}/research/threads/${id}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.message || "Failed to update thread");
      return json.data;
    },
  
    async deleteThread(id: string): Promise<void> {
      await fetch(`${BASE}/research/threads/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
    },
  
    async ask(
      threadId: string,
      text: string,
      pdf?: File
    ): Promise<ResearchMessage> {
      const form = new FormData();
      form.append("text", text);
      if (pdf) form.append("pdf", pdf);
  
      const r = await fetch(`${BASE}/research/threads/${threadId}/messages`, {
        method: "POST",
        headers: authHeaders(), // NO Content-Type — browser sets multipart boundary
        body: form,
      });
  
      const json = await r.json();
      if (!r.ok || json.error) {
        const err = new Error(json.message || "Request failed") as Error & {
          status: number;
        };
        (err as any).status = r.status;
        throw err;
      }
      return json.data;
    },
  };