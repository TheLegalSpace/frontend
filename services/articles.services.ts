import { api } from "./api";

export type ArticleStatus = "draft" | "published";

export interface CreateArticlePayload {
  title: string;
  body: string;
  coverUrl?: string;
  status?: ArticleStatus;
}

export const articlesService = {
  async createArticle(payload: CreateArticlePayload) {
    const { data } = await api.post("/articles/", payload);
    return data as { data: { id: string; slug: string; title: string } };
  },

  async getArticle(slug: string) {
    const { data } = await api.get(`/articles/${slug}`);
    return data;
  },

  async updateArticle(id: string, payload: Partial<CreateArticlePayload>) {
    const { data } = await api.patch(`/articles/${id}`, payload);
    return data;
  },

  async deleteArticle(id: string) {
    const { data } = await api.delete(`/articles/${id}`);
    return data;
  },

  async uploadCover(id: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post(`/articles/${id}/cover`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { data: { coverUrl: string } };
  },

  async reactToArticle(id: string, type: "like" | "dislike") {
    const { data } = await api.post(`/articles/${id}/reactions`, { type });
    return data;
  },

  async unreactToArticle(id: string) {
    const { data } = await api.delete(`/articles/${id}/reactions`);
    return data;
  },

  async markRead(id: string) {
    const { data } = await api.post(`/articles/${id}/read`);
    return data;
  },
};