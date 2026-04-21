import { API_BASE_URL, AUTH_API_URL, STORAGE_KEYS } from '../constants';
import { ApiResponse, Dataset, Data, Feedback, PaginatedResponse, UserPackage, FeedbackLog, FeedbackTrendItem, DatasetStatsItem, UserAnalytics, FeedbackSummaryResponse } from '../types';

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

  async getDatasetUsersFeedback(datasetId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/feedback/users/${datasetId}`);
  }
  // view feedbacks by dataset and user
  // /api/feedback/dataset/{datasetId}/user/{userId}
  //   {
  //   "success": true,
  //   "status": 200,
  //   "message": "Feedback summary fetched successfully",
  //   "data": {
  //     "items": [
  //       {
  //         "feedbackId": "31dadf47-3724-4fcd-b467-d3bb860136ac",
  //         "userId": "a347ac4f-cba3-4cdd-8c7e-9d0e4920cfe3",
  //         "dataId": "f27c3804-c092-4028-8def-856501128b3b",
  //         "url": "https://www.youtube.com/watch?v=kv-GisikOF0",
  //         "date": "2025-12-28 00:00:00",
  //         "label": "bullying",
  //         "topic": "Rice Price & Governance",
  //         "source": "YouTube",
  //         "comment": "আপনি তো এসির ভিতরে বাতাস খাওয়ার জন্য উপদেষ্টা হয়েছেন",
  //         "sentiment": "Aggressive",
  //         "Label_mapped": "Non Bullying",
  //         "Sentiment_mapped": "Sarcastic"
  //       },
  //       {
  //         "feedbackId": "7a9ac865-995c-4e6b-9a28-4c2b304386cf",
  //         "userId": "a347ac4f-cba3-4cdd-8c7e-9d0e4920cfe3",
  //         "dataId": "09701f50-2702-4abc-aefa-3e664f5f5493",
  //         "url": "https://www.youtube.com/watch?v=kv-GisikOF0",
  //         "date": "2025-12-28 00:00:00",
  //         "label": "bullying",
  //         "topic": "Rice Price & Governance",
  //         "source": "YouTube",
  //         "comment": "উপদেষ্টা মনেহয় রুটি খায় ফালতু একটা",
  //         "sentiment": "Aggressive",
  //         "Label_mapped": "Bullying",
  //         "Sentiment_mapped": "Aggressive"
  //       },
  //       {
  //         "feedbackId": "8ec51cb4-37d4-472f-9b55-5cf908421822",
  //         "userId": "a347ac4f-cba3-4cdd-8c7e-9d0e4920cfe3",
  //         "dataId": "c5e3b61c-1593-4c1b-9014-76262e280206",
  //         "url": "https://www.youtube.com/watch?v=kv-GisikOF0",
  //         "date": "2025-12-28 00:00:00",
  //         "label": "neutral",
  //         "topic": "Rice Price & Governance",
  //         "source": "YouTube",
  //         "comment": "চালের পরিবর্তে আলু",
  //         "sentiment": "Normal Comment",
  //         "Label_mapped": "Non Bullying",
  //         "Sentiment_mapped": "Sarcastic"
  //       },
  //       {
  //         "feedbackId": "d736a4dd-2f01-461d-b081-1d38125f752e",
  //         "userId": "a347ac4f-cba3-4cdd-8c7e-9d0e4920cfe3",
  //         "dataId": "82a2d8a8-86f0-4e72-a935-1b0e459a6cfa",
  //         "url": "https://www.youtube.com/watch?v=kv-GisikOF0",
  //         "date": "2025-12-28 00:00:00",
  //         "label": "neutral",
  //         "topic": "Rice Price & Governance",
  //         "source": "YouTube",
  //         "comment": "দ্রুত বেসরকারিভাবে চাল আমদানি করতে হবে",
  //         "sentiment": "Normal Comment",
  //         "Label_mapped": "Neutral",
  //         "Sentiment_mapped": "Supportive"
  //       },
  //       {
  //         "feedbackId": "ea3a38ae-835b-4edb-a784-ba05697befe9",
  //         "userId": "a347ac4f-cba3-4cdd-8c7e-9d0e4920cfe3",
  //         "dataId": "1515eef8-9119-4a38-9b20-519f462d29d8",
  //         "url": "https://www.youtube.com/watch?v=kv-GisikOF0",
  //         "date": "2025-12-28 00:00:00",
  //         "label": "neutral",
  //         "topic": "Rice Price & Governance",
  //         "source": "YouTube",
  //         "comment": "দেশে কোন সরকার না থাকলে এরকমই হয়",
  //         "sentiment": "Normal Comment",
  //         "Label_mapped": "Neutral",
  //         "Sentiment_mapped": "Normal Comment"
  //       }
  //     ],
  //     "total": 41,
  //     "offset": 0,
  //     "limit": 5
  //   }
  // }

  async getDatasetUserFeedback(datasetId: string, userId: string, offset: number, limit: number): Promise<FeedbackSummaryResponse> {
    return this.request<any>(`/api/feedback/dataset/${datasetId}/user/${userId}?offset=${offset}&limit=${limit}`);
  }

  // /api/feedback/dataset/{datasetId}/download/{userId}
  async downloadDataset(datasetId: string, userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/feedback/dataset/${datasetId}/download/${userId}`);
  }
}

export const apiService = new ApiService();