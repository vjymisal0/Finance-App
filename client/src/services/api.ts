import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, Transaction, User, LoginCredentials, RegisterCredentials, FilterOptions, ExportConfig } from '../types';
import { config, validateEnvironment } from '../config/environment';

// Validate environment on module load
validateEnvironment();

class ApiService {
  private api: AxiosInstance;
  private baseURL = config.API_BASE_URL;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false, // Important for CORS
    });

    // Request interceptor to add auth token and headers
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add origin header explicitly
        if (typeof window !== 'undefined') {
          config.headers['Origin'] = window.location.origin;
        }
        
        // Log request details in development
        if (import.meta.env.DEV) {
          console.log('🔄 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            origin: config.headers['Origin']
          });
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
          });
        }
        return response;
      },
      (error) => {
        // Enhanced error logging
        console.error('❌ API Error Details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          baseURL: this.baseURL,
          origin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
          responseData: error.response?.data
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
          console.log('🔐 Unauthorized - clearing auth data');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
        
        // Handle CORS errors specifically
        if (error.message.includes('CORS') || 
            error.message.includes('Network Error') ||
            error.code === 'ERR_NETWORK') {
          console.error('🚫 CORS/Network Error:', {
            message: error.message,
            frontend: typeof window !== 'undefined' ? window.location.origin : 'Unknown',
            backend: this.baseURL,
            suggestion: 'Check if backend is running and CORS is configured correctly'
          });
          
          // Provide user-friendly error message
          const corsError = new Error('Unable to connect to server. Please check your internet connection or try again later.');
          corsError.name = 'NetworkError';
          return Promise.reject(corsError);
        }
        
        return Promise.reject(error);
      }
    );

    // Log API configuration
    console.log('🔧 API Service initialized:', {
      baseURL: this.baseURL,
      environment: config.NODE_ENV,
      origin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
      timeout: '30s'
    });
  }

  // Health check method to verify API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Performing health check...');
      const response = await this.api.get('/health');
      console.log('✅ Health check passed:', response.data);
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Health check failed:', {
        message: error.message,
        status: error.response?.status,
        baseURL: this.baseURL
      });
      return false;
    }
  }

  // Test CORS connectivity
  async testCORS(): Promise<boolean> {
    try {
      console.log('🔗 Testing CORS connectivity...');
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors'
      });
      
      const data = await response.json();
      console.log('✅ CORS test passed:', data);
      return response.ok;
    } catch (error: any) {
      console.error('❌ CORS test failed:', error);
      return false;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('🔐 Attempting login...');
      const response = await this.api.post('/auth/login', credentials);
      console.log('✅ Login successful');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Login failed. Please check your credentials.';
      console.error('❌ Login error:', message);
      throw new Error(message);
    }
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('📝 Attempting registration...');
      const response = await this.api.post('/auth/register', {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password
      });
      console.log('✅ Registration successful');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Registration failed. Please try again.';
      console.error('❌ Registration error:', message);
      throw new Error(message);
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  async validateToken(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/validate');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Session expired';
      throw new Error(message);
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Failed to fetch profile';
      throw new Error(message);
    }
  }

  async updateProfile(data: { name: string; email: string }): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Failed to update profile';
      throw new Error(message);
    }
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.put('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Failed to change password';
      throw new Error(message);
    }
  }

  // Transaction endpoints with server-side sorting
  async getTransactions(
    page: number = 1,
    limit: number = 10,
    filters?: FilterOptions,
    search?: string,
    sortField?: string,
    sortDirection?: string
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
      
      // Add sorting parameters
      if (sortField) params.append('sortField', sortField);
      if (sortDirection) params.append('sortDirection', sortDirection);

      const response = await this.api.get(`/transactions?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Failed to fetch transactions';
      throw new Error(message);
    }
  }

  async exportTransactions(config: ExportConfig): Promise<Blob> {
    try {
      const response = await this.api.post('/transactions/export', config, {
        responseType: 'blob'
      });
      
      return new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Export failed';
      throw new Error(message);
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
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Failed to fetch dashboard data';
      throw new Error(message);
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
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Failed to fetch analytics data';
      throw new Error(message);
    }
  }

  async getAnalyticsSummary(period: string = '1year'): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/analytics/summary?period=${period}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.name === 'NetworkError' ? error.message :
                     'Failed to fetch analytics summary';
      throw new Error(message);
    }
  }

  // Get current configuration
  getConfig() {
    return {
      baseURL: this.baseURL,
      environment: config.NODE_ENV,
      version: config.APP_VERSION,
      features: {
        analytics: config.ENABLE_ANALYTICS,
        notifications: config.ENABLE_NOTIFICATIONS,
        export: config.ENABLE_EXPORT
      }
    };
  }
}

export const apiService = new ApiService();

// Auto-test connectivity on module load in development
if (import.meta.env.DEV) {
  apiService.healthCheck().then(isHealthy => {
    if (isHealthy) {
      console.log('✅ API connectivity verified');
    } else {
      console.warn('⚠️ API connectivity issues detected');
    }
  });
}