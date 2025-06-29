// Real-time options data service
// Note: This is a placeholder implementation. In a real application, you would need:
// 1. A financial data API (like Alpha Vantage, Yahoo Finance, or similar)
// 2. Proper API keys and authentication
// 3. Error handling for API limits and failures

export interface OptionQuote {
  symbol: string;
  strike: number;
  expiration: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility?: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

// Simulated data for demonstration purposes
const generateMockOptionsData = (symbol: string, currentPrice: number): OptionQuote[] => {
  const strikes = [];
  const baseStrike = Math.floor(currentPrice / 5) * 5; // Round to nearest 5
  
  // Generate strikes from 20% below to 20% above current price
  for (let i = -4; i <= 4; i++) {
    strikes.push(baseStrike + (i * 5));
  }
  
  return strikes.map(strike => {
    const moneyness = strike / currentPrice;
    const timeValue = Math.max(0.1, 2 - Math.abs(moneyness - 1) * 10);
    const intrinsicValue = Math.max(0, currentPrice - strike);
    const optionValue = intrinsicValue + timeValue;
    
    const spread = optionValue * 0.05; // 5% bid-ask spread
    
    return {
      symbol: `${symbol}_${strike}`,
      strike,
      expiration: getNextFridayExpiration(),
      bid: Math.max(0.01, optionValue - spread / 2),
      ask: optionValue + spread / 2,
      volume: Math.floor(Math.random() * 1000),
      openInterest: Math.floor(Math.random() * 5000),
      impliedVolatility: 0.2 + Math.random() * 0.3,
    };
  });
};

const getNextFridayExpiration = (): string => {
  const now = new Date();
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7; // Next Friday
  const nextFriday = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  return nextFriday.toISOString().split('T')[0];
};

export const fetchStockQuote = async (symbol: string, customUrl?: string, apiKey?: string): Promise<StockQuote> => {
  if (customUrl) {
    // Use custom API endpoint
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add API key header if provided
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }
      
      const response = await fetch(customUrl, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Expect the API to return data in the StockQuote format
      // If your API returns different format, you'll need to transform it
      return {
        symbol: data.symbol || symbol,
        price: data.price,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch from custom API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fallback to mock data when no custom URL provided
  // In a real implementation, this would call a financial API
  // For now, we'll simulate with mock data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock stock prices for common symbols
  const mockPrices: Record<string, number> = {
    'AAPL': 175.50,
    'GOOGL': 135.25,
    'MSFT': 415.75,
    'TSLA': 245.80,
    'SPY': 485.20,
    'GLD': 195.40,
    'QQQ': 395.15,
  };
  
  const basePrice = mockPrices[symbol.toUpperCase()] || 100;
  const change = (Math.random() - 0.5) * 10; // Random change between -5 and +5
  const price = basePrice + change;
  
  return {
    symbol: symbol.toUpperCase(),
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / basePrice) * 10000) / 100,
    lastUpdated: new Date().toISOString(),
  };
};

export const fetchOptionsChain = async (symbol: string, customUrl?: string, apiKey?: string): Promise<OptionQuote[]> => {
  if (customUrl) {
    // Use custom API endpoint
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add API key header if provided
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }
      
      const response = await fetch(customUrl, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Expect the API to return an array of OptionQuote objects
      // If your API returns different format, you'll need to transform it
      if (!Array.isArray(data)) {
        throw new Error('API response must be an array of options');
      }
      
      return data.map(option => ({
        symbol: option.symbol,
        strike: option.strike,
        expiration: option.expiration,
        bid: option.bid,
        ask: option.ask,
        volume: option.volume || 0,
        openInterest: option.openInterest || 0,
        impliedVolatility: option.impliedVolatility,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch options from custom API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fallback to mock data when no custom URL provided
  // In a real implementation, this would call a financial API
  // For now, we'll generate mock data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const quote = await fetchStockQuote(symbol);
  const price = quote.price;
  
  return generateMockOptionsData(symbol, price);
};

// Real API integration example (commented out - requires API key)
/*
const ALPHA_VANTAGE_API_KEY = 'YOUR_API_KEY_HERE';

export const fetchStockQuoteReal = async (symbol: string): Promise<StockQuote> => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch stock quote');
  }
  
  const data = await response.json();
  const quote = data['Global Quote'];
  
  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    lastUpdated: quote['07. latest trading day'],
  };
};
*/
