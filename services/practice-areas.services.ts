// services/practice-areas.service.ts
import { api } from "./api";

export interface PracticeArea {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface PracticeAreasResponse {
  error: boolean;
  message: string;
  data: PracticeArea[];
}

export const practiceAreasService = {
  list: () => api.get<PracticeAreasResponse>("/practice-areas"),
};