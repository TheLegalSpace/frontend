import { api } from "./api";
import {
  ResearchThread,
  ResearchMessage,
  ResearchThreadDetail,
} from "@/app/types/Research";

export const researchService = {
  async listThreads(): Promise<ResearchThread[]> {
    const res = await api.get(`/research/threads`);
    return res.data?.data ?? [];
  },

  async createThread(): Promise<ResearchThread> {
    const res = await api.post(`/research/threads`);
    return res.data?.data;
  },

  async getThread(id: string): Promise<ResearchThreadDetail> {
    const res = await api.get(`/research/threads/${id}`);
    return res.data?.data;
  },

  async patchThread(
    id: string,
    body: { title?: string; pinned?: boolean }
  ): Promise<ResearchThread> {
    const res = await api.patch(`/research/threads/${id}`, body);
    return res.data?.data;
  },

  async deleteThread(id: string): Promise<void> {
    await api.delete(`/research/threads/${id}`);
  },

  async ask(
    threadId: string,
    text: string,
    pdf?: File
  ): Promise<ResearchMessage> {
    const form = new FormData();
    form.append("text", text);
    if (pdf) form.append("pdf", pdf);

    const res = await api.post(`/research/threads/${threadId}/messages`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data?.error) {
      const err = new Error(res.data.message || "Request failed") as Error & {
        status: number;
      };
      (err as any).status = res.status;
      throw err;
    }

    return res.data?.data;
  },
};