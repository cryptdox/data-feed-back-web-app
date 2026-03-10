import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import { ApiResponse, Dataset, Data, Feedback, PaginatedResponse } from '../types';

class ApiService {

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.data.accessToken);
        return true;
      }

      return false;

    } catch {
      return false;
    }
  }

  private logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    window.location.href = "/login";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    // handle token expired
    if (response.status === 401 && retry) {

      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        return this.request<T>(endpoint, options, false);
      }

      this.logout();
      throw new Error("Session expired");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Request failed",
      }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  async createDataset(data: {
    name: string;
    description?: string;
    labels: Record<string, Record<string, string>>;
  }): Promise<ApiResponse<Dataset>> {

    return this.request<Dataset>('/api/dataset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listDatasets(params?: {
    offset?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Dataset>>> {

    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );

    return this.request<PaginatedResponse<Dataset>>(`/api/dataset?${query}`);
  }

  async getDataset(datasetId: string): Promise<ApiResponse<Dataset>> {
    return this.request<Dataset>(`/api/dataset/${datasetId}`);
  }

  async uploadData(formData: FormData): Promise<ApiResponse<unknown>> {

    const response = await fetch(`${API_BASE_URL}/api/data/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
      },
      body: formData,
    });

    if (response.status === 401) {

      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        return this.uploadData(formData);
      }

      this.logout();
      throw new Error("Session expired");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Upload failed",
      }));
      throw new Error(error.message || "Upload failed");
    }

    return response.json();
  }

  async getRandomData(params?: {
    datasetId?: string;
    count?: number;
    offset?: number;
  }): Promise<ApiResponse<{ data: Data; dataset: Dataset }>> {

    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );

    return this.request<{ data: Data; dataset: Dataset }>(
      `/api/data/random?${query}`
    );
  }

  async submitFeedback(data: {
    dataId: string;
    value: Record<string, number>;
  }): Promise<ApiResponse<Feedback>> {

    return this.request<Feedback>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listFeedback(params?: {
    offset?: number;
    limit?: number;
    datasetId?: string;
    userId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Feedback>>> {

    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );

    return this.request<PaginatedResponse<Feedback>>(`/api/feedback?${query}`);
  }

  async getFeedback(feedbackId: string): Promise<ApiResponse<Feedback>> {
    return this.request<Feedback>(`/api/feedback/${feedbackId}`);
  }
}

export const apiService = new ApiService();