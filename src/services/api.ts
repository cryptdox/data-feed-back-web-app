import { API_BASE_URL, AUTH_API_URL, STORAGE_KEYS } from '../constants';
import { ApiResponse, Dataset, Data, Feedback, PaginatedResponse, UserPackage, FeedbackLog, FeedbackTrendItem, DatasetStatsItem, UserAnalytics } from '../types';

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
      const response = await fetch(`${AUTH_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
        return true;
      }

      return false;

    } catch {
      return false;
    }
  }

  async handleLogout(retry: boolean = true): Promise<any> {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) as string;
      let response = await fetch(`${AUTH_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      response = await response.json();
      if (response.status === 401 && retry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          this.handleLogout(false);
        }
        throw new Error("Session expired");
      }
      return response
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
      return {}
    }
  };

  private logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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


  async listMyDatasets(params?: {
    offset?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Dataset>>> {

    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );

    return this.request<PaginatedResponse<Dataset>>(`/api/dataset/my-datasets?${query}`);
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

  /**
 * Dashboard analytics summary
 */
  async getUserAnalytics(): Promise<ApiResponse<UserAnalytics>> {

    return this.request<UserAnalytics>(
      "/api/data/analytics/me"
    );
  }

  /**
   * Feedback trend chart data
   */
  async getFeedbackTrend(params?: {
    datasetId?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<FeedbackTrendItem[]>> {

    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );

    return this.request<FeedbackTrendItem[]>(
      `/api/data/analytics/feedback-trend?${query}`
    );
  }

  /**
   * Dataset statistics table
   */
  async getDatasetStats(params?: {
    offset?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<DatasetStatsItem>>> {

    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );

    return this.request<PaginatedResponse<DatasetStatsItem>>(
      `/api/data/analytics/dataset-stats?${query}`
    );
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

  async listUserPackages(params?: { offset?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<UserPackage>>> {
    const query = new URLSearchParams(Object.entries(params || {}).map(([k, v]) => [k, String(v)]));
    return this.request<PaginatedResponse<UserPackage>>(`/api/user-package?${query}`);
  }

  async listFeedbackLogs(params?: { offset?: number; limit?: number; datasetId?: string }): Promise<ApiResponse<PaginatedResponse<FeedbackLog>>> {
    const query = new URLSearchParams(Object.entries(params || {}).map(([k, v]) => [k, String(v)]));
    return this.request<PaginatedResponse<FeedbackLog>>(`/api/feedback-log?${query}`);
  }
}

export const apiService = new ApiService();