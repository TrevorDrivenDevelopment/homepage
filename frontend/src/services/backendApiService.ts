class BackendApiService {

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {

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
