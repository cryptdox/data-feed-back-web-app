export interface Package {
  packageId: string;
  name: string;
  plan: {
    period: string;           // e.g., "monthly"
    storageMB: number;        // e.g., 500
    datasetsMax: number;      // e.g., 30
    privateDataset: boolean;  // true/false
    dailyFeedbackMax: number; // e.g., 500
  };
  createdAt: string; // ISO date string
}

export enum UserPackageStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface UserPackageLog {
  userPackageLogId: string;
  userPackageUserAccessId: string;
  logs: {
    datasetsCreated: number;
    storageUsedMB: number;
    feedbackToday: number;
    privateDatasetCount: number;
  };
  logsType: 'BILL' | 'USAGE';
  createdAt: string;
}

export interface UserPackage {
  userAccessId: string;
  userId: string;
  packagePackageId: string;
  package: Package;
  status: UserPackageStatus;
  currentState: {
    datasetsCreated: number;
    storageUsedMB: number;
    feedbackToday: number;
    privateDatasetCount: number;
  };
  createdAt: string;
  updatedAt?: string;
  userPackageLogs: UserPackageLog[];
}
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
export interface UserAnalytics {
  totalDatasets: number
  totalDataRows: number
  totalFeedbacks: number
  totalStorageMB: number
}

export interface FeedbackTrendItem {
  date: string
  count: number
}

export interface DatasetStatsItem {
  datasetId: string
  datasetName: string
  totalRows: number
  labeledRows: { _count: { userId: number }, userId: string }[]
  labelCoverage: {
    userId: string
    count: number
    coverage: number
  }[]
  createdAt: string
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
  name?: string;
  isEmailVerified?: boolean;
  isMasterRealmUser?: boolean;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'bn';

export interface FeedbackSummaryItem {
  feedbackId: string;
  userId: string;
  dataId: string;
  url: string;
  date: string; // or Date যদি parse করো
  label: string;
  topic: string;
  source: string;
  comment: string;
  sentiment: string;
  Label_mapped: string;
  Sentiment_mapped: string;
}

export interface FeedbackSummaryResponse extends ApiResponse<PaginatedResponse<FeedbackSummaryItem>> { }