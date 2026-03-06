export interface Dataset {
  datasetId: string;
  name: string;
  description?: string;
  labels: Record<string, Record<string, string>>;
  createdBy: string;
  createdAt: string;
}

export interface Data {
  dataId: string;
  datasetId: string;
  row: Record<string, [unknown, string]>;
  createdBy: string;
  createdAt: string;
}

export interface Feedback {
  feedbackId: string;
  userId: string;
  datasetId: string;
  dataId: string;
  count: number;
  logs?: FeedbackLog[];
}

export interface FeedbackLog {
  feedbackLogsId: string;
  feedbackId: string;
  dataId: string;
  value: Record<string, number>;
  createdBy: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface User {
  userId: string;
  email: string;
  realmId: string;
  sessionId: string;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'bn';
