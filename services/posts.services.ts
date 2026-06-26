import { api } from "./api";

export const postsService = {
  async createPost(body: string) {
    const { data } = await api.post("/posts", { body });
    return data;
  },

  async createArticlePost(body: string, pdf: File, title: string) {
    const form = new FormData();
    form.append("body", body);
    form.append("pdf", pdf);
    form.append("pdfName", title);
    const { data } = await api.post("/posts/article", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async getPost(id: string) {
    const { data } = await api.get(`/posts/${id}`);
    return data;
  },

  async deletePost(id: string) {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
  },

  async reactToPost(id: string, type: "like" | "dislike") {
    const { data } = await api.post(`/posts/${id}/reactions`, { type });
    return data;
  },

  async unreactToPost(id: string) {
    const { data } = await api.delete(`/posts/${id}/reactions`);
    return data;
  },
};