// Enhanced options service - PRODUCTION VERSION - NO MOCK DATA
// This service only uses real API endpoints provided by the user

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

// Export the service methods for custom API support ONLY
export const fetchStockQuote = async (symbol: string, customUrl?: string, apiKey?: string): Promise<StockQuote> => {
  // Require custom URL and API key - no fallbacks or mock data
  if (!customUrl || !apiKey) {
    throw new Error('Custom API URL and API key are required. No mock data or fallbacks are available.');
  }

  try {
    const url = customUrl.replace('{symbol}', symbol);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Transform response to our StockQuote format
    // Adapt this based on your API's actual response structure
    if (responseData.data) {
      return {
        symbol: responseData.data.symbol || symbol,
        price: responseData.data.price,
        change: responseData.data.change,
        changePercent: responseData.data.changePercent,
        lastUpdated: responseData.data.lastUpdated || new Date().toISOString(),
        currency: responseData.data.currency || 'USD',
      };
    } else {
      // Direct response format
      return {
        symbol: responseData.symbol || symbol,
        price: responseData.price,
        change: responseData.change,
        changePercent: responseData.changePercent,
        lastUpdated: responseData.lastUpdated || new Date().toISOString(),
        currency: responseData.currency || 'USD',
      };
    }
  } catch (error) {
    throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchOptionsChain = async (symbol: string, customUrl?: string, apiKey?: string): Promise<OptionQuote[]> => {
  // Require custom URL and API key - no fallbacks or mock data
  if (!customUrl || !apiKey) {
    throw new Error('Custom API URL and API key are required. No mock data or fallbacks are available.');
  }

  try {
    const url = customUrl.replace('{symbol}', symbol);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Transform response to our OptionQuote[] format
    // Adapt this based on your API's actual response structure
    if (responseData.data) {
      if (responseData.data.calls && responseData.data.puts) {
        // OptionsChainResponse format
        return [...responseData.data.calls, ...responseData.data.puts];
      } else if (Array.isArray(responseData.data)) {
        // Direct array format
        return responseData.data;
      } else {
        throw new Error('API response data is not in expected format');
      }
    } else if (Array.isArray(responseData)) {
      // Direct array response
      return responseData;
    } else {
      throw new Error('API response is not in expected format');
    }
  } catch (error) {
    throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Legacy compatibility export - placeholder that requires real API configuration
export const optionsService = {
  fetchStockQuote: (symbol: string) => {
    throw new Error('Direct service calls are not supported. Use custom API endpoints with fetchStockQuote(symbol, customUrl, apiKey).');
  },
  fetchOptionsChain: (symbol: string) => {
    throw new Error('Direct service calls are not supported. Use custom API endpoints with fetchOptionsChain(symbol, customUrl, apiKey).');
  },
  isUsingBackend: () => false,
  getApiUrl: () => '',
  checkBackendHealth: () => Promise.resolve({ healthy: false, message: 'Backend service disabled for safety. Use custom API endpoints only.' })
};
