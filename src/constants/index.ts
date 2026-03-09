export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const AUTH_API_URL = 'https://crypt-iam-latest.onrender.com';

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
} as const;

export const AUTH_CONFIG = {
  REALM_ID: '22e5e8cb-a606-4a64-8ef5-7fb49f8c4787',
  CLIENT_ID: 'data-feedback-client',
} as const;

export const EXTERNAL_URLS = {
  SIGNUP: 'https://crypt-iam-latest.onrender.com/signup',
  FORGOT_PASSWORD: 'https://crypt-iam-latest.onrender.com/forgot-password',
  CHANGE_PASSWORD: 'https://crypt-iam-latest.onrender.com/change-password',
} as const;
