// API Configuration and Service for Frontend
const API_BASE_URL = (() => {
  // In browser environments, check for Rsbuild environment variables
  if (typeof window !== 'undefined') {
    // Use import.meta.env for Rsbuild (Vite-like environment variables)
    return (import.meta.env?.RSBUILD_API_URL as string) || 
           (import.meta.env?.REACT_APP_API_URL as string) || 
           'http://localhost:8080';
  }
  // Fallback for server-side rendering or other environments
  return 'http://localhost:8080';
})();

export interface ApiClient {
  baseURL: string;
  isConfigured: boolean;
}

class BackendApiService {
  private baseURL: string;
  public isConfigured: boolean;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.isConfigured = !!API_BASE_URL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isConfigured) {
      throw new Error('Backend API not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Health Check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Options Calculator
  async calculateOptions(data: {
    securityPrice: number;
    investmentAmount: number;
    options: Array<{
      strike: number;
      bid: number;
      ask: number;
      price?: number;
    }>;
    percentageIncrements: number[];
  }) {
    return this.request('/api/calculator/options', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Stock Data
  async getStockQuote(symbol: string) {
    return this.request(`/api/options/stock/${symbol}`);
  }

  async getOptionsChain(symbol: string) {
    return this.request(`/api/options/chain/${symbol}`);
  }

  // Portfolio Services
  async analyzePortfolio(portfolioData: any) {
    return this.request('/api/portfolio/analyze', {
      method: 'POST',
      body: JSON.stringify(portfolioData),
    });
  }

  async getRiskMetrics() {
    return this.request('/api/portfolio/risk-metrics');
  }

  // Market Data
  async getMarketIndices() {
    return this.request('/api/market/indices');
  }

  async getMarketData(symbol: string) {
    return this.request(`/api/market/data/${symbol}`);
  }
}

export const backendApi = new BackendApiService();

// Hook for React components
export function useBackendApi() {
  return {
    api: backendApi,
    isConfigured: backendApi.isConfigured,
  };
}
