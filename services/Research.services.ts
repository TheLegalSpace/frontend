import { api } from "./api";
import {
  ResearchThread,
  ResearchMessage,
  ResearchThreadDetail,
} from "@/app/types/Research";

/** True if this error came from an AbortController cancel, not a real failure. */
function isCancelError(err: any): boolean {
  return (
    err?.code === "ERR_CANCELED" ||
    err?.name === "CanceledError" ||
    err?.name === "AbortError"
  );
}

/**
 * Backend messages sometimes append a raw upstream error dump in parens, e.g.:
 * "Legal source search is currently unavailable, so I can't verify citations
 * right now. Please try again shortly. ({"error":{"code":429,...}})"
 * Strip everything from " (" onward so users see the clean sentence, while
 * the full raw message is still preserved on the error object for logging.
 */
function extractFriendlyMessage(raw: string): string {
  if (!raw) return "Something went wrong. Please try again.";
  const parenIndex = raw.indexOf(" (");
  if (parenIndex > 20) {
    return raw.slice(0, parenIndex).trim();
  }
  return raw;
}

function normalizeError(err: any): Error & { status?: number; rawMessage?: string } {
  const status = err?.response?.status ?? err?.status;
  const rawMessage =
    err?.response?.data?.message ?? err?.data?.message ?? err?.message ?? "";
  const friendlyMessage = extractFriendlyMessage(rawMessage);

  const normalized = new Error(friendlyMessage) as Error & {
    status?: number;
    rawMessage?: string;
  };
  normalized.status = status;
  normalized.rawMessage = rawMessage;
  return normalized;
}

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
    pdf?: File,
    signal?: AbortSignal
  ): Promise<ResearchMessage> {
    const form = new FormData();
    form.append("text", text);
    if (pdf) form.append("pdf", pdf);

    try {
      const res = await api.post(
        `/research/threads/${threadId}/messages`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          signal,
        }
      );

      // Backend returned a 2xx but the body itself says error: true —
      // still needs the same message cleanup as a real HTTP error.
      if (res.data?.error) {
        const err = normalizeError({
          status: res.status,
          message: res.data.message,
        });
        throw err;
      }

      return res.data?.data;
    } catch (err: any) {
      if (isCancelError(err)) {
        // Let cancellation pass through untouched — the page's
        // isCancelError check needs the original err.code/name intact.
        throw err;
      }
      throw normalizeError(err);
    }
  },
};