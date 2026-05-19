import { api } from "./api";

export const postsService = {
  async createPost(body: string, attachedArticleId?: string) {
    const { data } = await api.post("/posts/", {
      body,
      ...(attachedArticleId && { attachedArticleId }),
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
