import { api } from "./api";
import { LeadStatus } from "@/app/types/leads";

export const leadsService = {
  async getLeads(status?: LeadStatus, page = 1, limit = 20) {
    const { data } = await api.get("/leads/", {
      params: { ...(status && { status }), page, limit },
    });
    return data;
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
};