// services/survey.service.ts
import { api } from "./api";

export interface SurveyResponseData {
  answer: string;
  featureVotes: string[];
}

export interface SurveyData {
  id: string;
  slug: string;
  question: string;
  options: string[]; // e.g. ["yes", "no", "maybe"]
  myResponse: SurveyResponseData | null;
}

export interface GetSurveyResponse {
  error: boolean;
  message: string;
  data: SurveyData;
}

export interface SubmitSurveyPayload {
  answer: string; // must be one of the survey's `options`
  featureVotes?: string[]; // max 20 items, each max 120 chars
}

export interface SubmitSurveyResponse {
  error: boolean;
  message: string;
  data: {
    id: string;
    surveyId: string;
    answer: string;
    featureVotes: string[];
    [key: string]: unknown;
  };
}

export const surveyService = {
  getLegalNewsSurvey: () =>
    api.get<GetSurveyResponse>("/survey/legal-news"),

  submitLegalNewsResponse: (payload: SubmitSurveyPayload) =>
    api.post<SubmitSurveyResponse>("/survey/legal-news/responses", payload),
};