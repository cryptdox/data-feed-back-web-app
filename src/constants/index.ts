export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  DATASETS: '/datasets',
  CREATE_DATASET: '/datasets/create',
  UPLOAD_DATA: '/data/upload',
  LABELING: '/labeling',
  FEEDBACK: '/feedback',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

export const STORAGE_KEYS = {
  THEME: 'app-theme',
  LANGUAGE: 'app-language',
  AUTH_TOKEN: 'auth-token',
} as const;
