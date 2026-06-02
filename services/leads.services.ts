import { api } from "./api";
import { LeadStatus } from "@/app/types/leads";

export const leadsService = {
  async getLeads(status?: LeadStatus | undefined, page = 1, limit = 20) {
    const { data } = await api.get("/leads/", {
      params: { ...(status ? { status } : {}), page, limit },
    });
    return data;
    // caller reads: result.data.items / result.data.pagination.total
  },

  async getLead(id: string) {
    const { data } = await api.get(`/leads/${id}`);
    return data;
  },

  async acceptLead(id: string) {
    const { data } = await api.post(`/leads/${id}/accept`);
    return data;
  },

  async declineLead(id: string, reason?: string) {
    const { data } = await api.post(`/leads/${id}/decline`, { reason });
    return data;
  },

  /**
   * Fetch all four status counts in parallel.
   * Returns a single object so callers don't have to fire 5 requests
   * and wrangle the shape themselves.
   *
   * Uses limit=1 per request — we only need `pagination.total`,
   * not the actual lead items.
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    expired: number;
  }> {
    const [allRes, pendingRes, acceptedRes, declinedRes, expiredRes] =
      await Promise.all([
        api.get("/leads/", { params: { page: 1, limit: 1 } }),
        api.get("/leads/", { params: { status: "pending",  page: 1, limit: 1 } }),
        api.get("/leads/", { params: { status: "accepted", page: 1, limit: 1 } }),
        api.get("/leads/", { params: { status: "declined", page: 1, limit: 1 } }),
        api.get("/leads/", { params: { status: "expired",  page: 1, limit: 1 } }),
      ]);

    // Each axios response: res.data = API body = { data: { items, pagination } }
    const total    = allRes.data?.data?.pagination?.total      ?? 0;
    const pending  = pendingRes.data?.data?.pagination?.total  ?? 0;
    const accepted = acceptedRes.data?.data?.pagination?.total ?? 0;
    const declined = declinedRes.data?.data?.pagination?.total ?? 0;
    const expired  = expiredRes.data?.data?.pagination?.total  ?? 0;

    return { total, pending, accepted, declined, expired };
  },
};