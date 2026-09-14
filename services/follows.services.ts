// services/follows.services.ts
import { api } from "./api";

/**
 * Follows. Anyone can follow anyone (users → lawyers, lawyers → lawyers, etc.).
 *   POST   /follows/:accountId
 *   DELETE /follows/:accountId
 *   GET    /follows/me/following
 *   GET    /follows/me/followers
 */
export const followsService = {
  follow: (accountId: string) => api.post(`/follows/${accountId}`),
  unfollow: (accountId: string) => api.delete(`/follows/${accountId}`),
  getFollowing: (page = 1, limit = 20) =>
    api.get("/follows/me/following", { params: { page, limit } }),
  getFollowers: (page = 1, limit = 20) =>
    api.get("/follows/me/followers", { params: { page, limit } }),
};
