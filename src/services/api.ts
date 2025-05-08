// Base API service for making HTTP requests
const API_BASE_URL = 'https://shopkeeper-v2-5ejc8.ondigitalocean.app/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Base API service with helper methods for making HTTP requests
 */
export const api = {
  /**
   * Get the authorization token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },
  
  /**
   * Get the store ID from localStorage
   */
  getStoreId(): string | null {
    return localStorage.getItem('storeId');
  },
  
  /**
   * Create headers with authorization token and store ID
   */
  createHeaders(options: { includeToken?: boolean; includeStoreId?: boolean; storeId?: string; additionalHeaders?: Record<string, string> } = {}): Record<string, string> {
    const {
      includeToken = true,
      includeStoreId = true,
      storeId,
      additionalHeaders = {}
    } = options;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'D-UUID': '645545453533',
      ...additionalHeaders
    };
    
    if (includeToken) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    if (includeStoreId) {
      const finalStoreId = storeId || this.getStoreId();
      if (finalStoreId) {
        headers['S-UUID'] = finalStoreId;
      }
    }
    
    return headers;
  },
  
  /**
   * Build a URL with query parameters
   */
  buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    return url.toString();
  },
  
  /**
   * Make an HTTP request
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params
    } = options;
    
    const url = this.buildUrl(endpoint, params);
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.createHeaders(),
        ...headers
      }
    };
    
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new ApiError(`HTTP Error: ${response.status} ${response.statusText}`, response.status);
      }
      
      const data: ApiResponse<T> = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'API error occurred');
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params, headers });
  },
  
  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, body?: any, params?: Record<string, string>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, params, headers });
  },
  
  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, body?: any, params?: Record<string, string>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, params, headers });
  },
  
  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', params, headers });
  }
};

export default api; 