import axios from 'axios';
import { StockQuote, OptionQuote } from '../types/api';
import { API_CONFIG, ENV_VARS, TIMEOUT_CONFIG } from '../config/apiConfig';

export class AlphaVantageService {
  private readonly apiKey: string;
  private readonly baseUrl = API_CONFIG.ALPHA_VANTAGE.BASE_URL;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    try {
      const url = this.baseUrl;
      const params = {
        function: API_CONFIG.ALPHA_VANTAGE.FUNCTIONS.GLOBAL_QUOTE,
        symbol: symbol.toUpperCase(),
        apikey: this.apiKey,
      };
      
      console.log(`🔍 Alpha Vantage API Call:`);
      console.log(`URL: ${url}`);
      console.log(`Params:`, { ...params, apikey: '***' + this.apiKey.slice(-4) });
      
      const response = await axios.get(url, {
        params,
        timeout: TIMEOUT_CONFIG.STOCK_QUOTE,
      });

      console.log('✅ Alpha Vantage response status:', response.status);
      console.log('📋 Response data keys:', Object.keys(response.data));
      console.log('📄 Full response data:', JSON.stringify(response.data, null, 2));

      const quote = response.data['Global Quote'];
      
      if (!quote || Object.keys(quote).length === 0) {
        console.log('❌ No Global Quote data found in response');
        
        // Check for common Alpha Vantage error responses
        if (response.data['Error Message']) {
          throw new Error(`Alpha Vantage Error: ${response.data['Error Message']}`);
        }
        if (response.data['Note']) {
          throw new Error(`Alpha Vantage Rate Limit: ${response.data['Note']}`);
        }
        if (response.data['Information']) {
          throw new Error(`Alpha Vantage Info: ${response.data['Information']}`);
        }
        
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      console.log('✅ Successfully parsed quote data for', symbol);
      
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        lastUpdated: quote['07. latest trading day'],
        currency: 'USD',
      };
    } catch (error) {
      console.error('❌ Alpha Vantage API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        throw new Error(`Failed to fetch stock quote: ${error.message}`);
      }
      throw error;
    }
  }

  async getOptionsChain(symbol: string): Promise<OptionQuote[]> {
    // Note: Alpha Vantage doesn't provide options data in their free tier
    // This is a placeholder that generates mock data similar to your current implementation
    // You would need a different service (like Polygon.io, IEX Cloud, etc.) for real options data
    const stockQuote = await this.getStockQuote(symbol);
    return this.generateMockOptionsData(symbol, stockQuote.price);
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
      // Call option
      const callMoneyness = currentPrice / strike;
      const callIV = 0.2 + Math.random() * 0.3; // 20-50% IV
      const callBid = Math.max(0.01, (currentPrice - strike) + (callIV * Math.sqrt(30/365) * currentPrice * 0.5));
      const callAsk = callBid * 1.1;

      options.push({
        symbol: `${symbol}${expirationDate.replace(/-/g, '')}C${strike.toFixed(2).replace('.', '')}`,
        strike,
        expiration: expirationDate,
        bid: Math.max(0.01, callBid),
        ask: callAsk,
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVolatility: callIV,
        type: 'call',
      });

      // Put option
      const putMoneyness = strike / currentPrice;
      const putIV = 0.2 + Math.random() * 0.3;
      const putBid = Math.max(0.01, (strike - currentPrice) + (putIV * Math.sqrt(30/365) * currentPrice * 0.5));
      const putAsk = putBid * 1.1;

      options.push({
        symbol: `${symbol}${expirationDate.replace(/-/g, '')}P${strike.toFixed(2).replace('.', '')}`,
        strike,
        expiration: expirationDate,
        bid: Math.max(0.01, putBid),
        ask: putAsk,
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVolatility: putIV,
        type: 'put',
      });
    });

    return options;
  }

  private getNextFridayExpiration(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday + 7); // Next Friday, not this Friday
    return nextFriday.toISOString().split('T')[0];
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}
