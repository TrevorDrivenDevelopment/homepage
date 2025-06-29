// Enhanced options service with backend API integration
// This service can fall back to mock data when the backend is not available

export interface OptionQuote {
  symbol: string;
  strike: number;
  expiration: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility?: number;
  type?: 'call' | 'put';
}

export interface StockQuote {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: string;
  lastUpdated?: string;
  currency?: string;
}

export interface OptionsChainResponse {
  symbol: string;
  stockPrice: number;
  calls: OptionQuote[];
  puts: OptionQuote[];
  expirationDates: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

class OptionsService {
  private readonly apiUrl: string;
  private readonly useBackend: boolean;

  constructor() {
    // Check if backend API URL is configured
    this.apiUrl = (import.meta.env?.REACT_APP_API_URL as string) || 
                  (import.meta.env?.RSBUILD_API_URL as string) || 
                  '';
    this.useBackend = !!this.apiUrl;
    
    if (this.useBackend) {
      console.log('Options service initialized with backend API:', this.apiUrl);
    } else {
      console.log('Options service initialized in mock mode (no backend API configured)');
    }
  }

  async fetchStockQuote(symbol: string): Promise<StockQuote> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.apiUrl}/api/options/stock/${symbol}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const apiResponse: ApiResponse<StockQuote> = await response.json();
        
        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.error || 'API returned no data');
        }

        return apiResponse.data;
      } catch (error) {
        console.warn('Backend API failed, falling back to mock data:', error);
        return this.generateMockStockQuote(symbol);
      }
    } else {
      return this.generateMockStockQuote(symbol);
    }
  }

  async fetchOptionsChain(symbol: string): Promise<OptionQuote[]> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.apiUrl}/api/options/chain/${symbol}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const apiResponse: ApiResponse<OptionsChainResponse> = await response.json();
        
        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.error || 'API returned no data');
        }

        return [...apiResponse.data.calls, ...apiResponse.data.puts];
      } catch (error) {
        console.warn('Backend API failed, falling back to mock data:', error);
        const stockQuote = await this.generateMockStockQuote(symbol);
        return this.generateMockOptionsData(symbol, stockQuote.price);
      }
    } else {
      const stockQuote = await this.generateMockStockQuote(symbol);
      return this.generateMockOptionsData(symbol, stockQuote.price);
    }
  }

  async checkBackendHealth(): Promise<{ healthy: boolean; message: string }> {
    if (!this.useBackend) {
      return { healthy: false, message: 'Backend API not configured' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { healthy: false, message: `API health check failed: ${response.status}` };
      }

      const healthData = await response.json();
      return { 
        healthy: healthData.success && healthData.data?.status === 'healthy',
        message: healthData.success ? 'Backend is healthy' : 'Backend reports unhealthy status'
      };
    } catch (error) {
      return { 
        healthy: false, 
        message: `Backend health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  private generateMockStockQuote(symbol: string): StockQuote {
    const basePrice = 100 + Math.random() * 200; // $100-300
    const change = (Math.random() - 0.5) * 10; // -$5 to +$5
    const changePercent = ((change / basePrice) * 100).toFixed(2);
    
    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: `${changePercent}%`,
      lastUpdated: new Date().toISOString().split('T')[0] || '',
      currency: 'USD',
    };
  }

  private generateMockOptionsData(symbol: string, currentPrice: number): OptionQuote[] {
    const options: OptionQuote[] = [];
    const expirationDate = this.getNextFridayExpiration();
    
    // Generate strike prices around current price
    const strikes = [];
    const baseStrike = Math.round(currentPrice / 5) * 5; // Round to nearest $5
    for (let i = -10; i <= 10; i++) {
      strikes.push(baseStrike + (i * 5));
    }

    strikes.forEach(strike => {
      if (strike > 0) {
        // Call option
        const callValue = Math.max(0, currentPrice - strike);
        const callTimeValue = Math.random() * 5;
        const callBid = Math.max(0.01, callValue + callTimeValue);
        const callAsk = callBid * (1.05 + Math.random() * 0.1);

        options.push({
          symbol: `${symbol}${expirationDate.replace(/-/g, '')}C${strike.toFixed(0).padStart(3, '0')}`,
          strike,
          expiration: expirationDate,
          bid: Math.round(callBid * 100) / 100,
          ask: Math.round(callAsk * 100) / 100,
          volume: Math.floor(Math.random() * 1000),
          openInterest: Math.floor(Math.random() * 5000),
          impliedVolatility: 0.2 + Math.random() * 0.3,
          type: 'call',
        });

        // Put option
        const putValue = Math.max(0, strike - currentPrice);
        const putTimeValue = Math.random() * 5;
        const putBid = Math.max(0.01, putValue + putTimeValue);
        const putAsk = putBid * (1.05 + Math.random() * 0.1);

        options.push({
          symbol: `${symbol}${expirationDate.replace(/-/g, '')}P${strike.toFixed(0).padStart(3, '0')}`,
          strike,
          expiration: expirationDate,
          bid: Math.round(putBid * 100) / 100,
          ask: Math.round(putAsk * 100) / 100,
          volume: Math.floor(Math.random() * 1000),
          openInterest: Math.floor(Math.random() * 5000),
          impliedVolatility: 0.2 + Math.random() * 0.3,
          type: 'put',
        });
      }
    });

    return options;
  }

  private getNextFridayExpiration(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday + 7); // Next Friday, not this Friday
    return nextFriday.toISOString().split('T')[0] ?? '';
  }

  isUsingBackend(): boolean {
    return this.useBackend;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}

// Create a singleton instance
const optionsService = new OptionsService();

// Export the service methods for backwards compatibility
export const fetchStockQuote = (symbol: string, customUrl?: string, apiKey?: string): Promise<StockQuote> => {
  return optionsService.fetchStockQuote(symbol);
};

export const fetchOptionsChain = (symbol: string, customUrl?: string, apiKey?: string): Promise<OptionQuote[]> => {
  return optionsService.fetchOptionsChain(symbol);
};

// Export the service instance for advanced usage
export { optionsService };
