export const API_BASE_URL = import.meta.env.VITE_API_URL as string
export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string

export const ROUTES = {
  LOGIN: '/login',
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
  REFRESH_TOKEN: 'refresh-token',
  LAST_ACTIVITY: 'last-activity'
} as const;

export const AUTH_CONFIG = {
  REALM_NAME: import.meta.env.VITE_REALM_NAME,
  CLIENT_ID: import.meta.env.VITE_CLIENT_ID,
} as const;

export const EXTERNAL_URLS = {
  FORGOT_PASSWORD: 'https://crypt-iam-latest.onrender.com/forgot-password',
  CHANGE_PASSWORD: 'https://crypt-iam-latest.onrender.com/change-password',
} as const;
