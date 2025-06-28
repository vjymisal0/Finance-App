import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, Transaction, User, LoginCredentials, RegisterCredentials, FilterOptions, ExportConfig } from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3001/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          // Don't redirect automatically, let the auth context handle it
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/register', {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  async validateToken(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/validate');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Session expired');
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  async updateProfile(data: { name: string; email: string }): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.put('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  // Transaction endpoints
  async getTransactions(
    page: number = 1,
    limit: number = 10,
    filters?: FilterOptions,
    search?: string
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.dateRange && filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);

      const response = await this.api.get(`/transactions?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  async exportTransactions(config: ExportConfig): Promise<Blob> {
    try {
      const response = await this.api.post('/transactions/export', config, {
        responseType: 'blob'
      });
      
      return new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Export failed');
    }
  }

  // Dashboard data
  async getDashboardData(): Promise<ApiResponse<{
    metrics: any[];
    chartData: any[];
    recentTransactions: Transaction[];
  }>> {
    try {
      const response = await this.api.get('/dashboard');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }

  // Analytics endpoints
  async getAnalyticsData(period: string = '6months', startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams({ period });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await this.api.get(`/analytics?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  }

  async getAnalyticsSummary(period: string = '1year'): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/analytics/summary?period=${period}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics summary');
    }
  }
}

export const apiService = new ApiService();