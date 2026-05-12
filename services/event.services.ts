// services/event.service.ts
import { api } from "./api";

export interface Event {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  location: string;
  startAt: string;
  endAt: string;
  registrationUrl: string;
  status: "published" | "draft" | "cancelled";
  createdByAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  error: boolean;
  message: string;
  data: {
    items: Event[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  registrationUrl: string;
}

export const eventService = {
  list: (page = 1, limit = 20) =>
    api.get<EventsResponse>("/api/v1/events", { params: { page, limit } }),

  get: (id: string) =>
    api.get<{ error: boolean; message: string; data: Event }>(`/api/v1/events/${id}`),

  create: (payload: CreateEventPayload) =>
    api.post<{ error: boolean; message: string; data: Event }>("/api/v1/events", payload),

  update: (id: string, payload: Partial<CreateEventPayload>) =>
    api.patch<{ error: boolean; message: string; data: Event }>(`/api/v1/events/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/api/v1/events/${id}`),

  uploadCover: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/api/v1/events/${id}/cover`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};