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

  async getOptionsChain(symbol: string, maxAgeHours: number = 24): Promise<OptionQuote[]> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    try {
      const url = this.baseUrl;
      const params = {
        function: API_CONFIG.ALPHA_VANTAGE.FUNCTIONS.HISTORICAL_OPTIONS,
        symbol: symbol.toUpperCase(),
        apikey: this.apiKey,
      };
      
      console.log(`🔍 Alpha Vantage Options API Call (max age: ${maxAgeHours}h):`);
      console.log(`URL: ${url}`);
      console.log(`Params:`, { ...params, apikey: '***' + this.apiKey.slice(-4) });
      
      const response = await axios.get(url, {
        params,
        timeout: TIMEOUT_CONFIG.OPTIONS_CHAIN,
      });

      console.log('✅ Alpha Vantage options response status:', response.status);
      console.log('📋 Response data keys:', Object.keys(response.data));
      
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

      const optionsData = response.data.data;
      
      if (!optionsData || !Array.isArray(optionsData)) {
        console.log('❌ No options data found in response');
        throw new Error(`No options data found for symbol: ${symbol}`);
      }

      console.log(`✅ Found ${optionsData.length} historical options records for ${symbol}`);
      
      // Transform Alpha Vantage historical options data to our OptionQuote format
      const options: OptionQuote[] = optionsData.map((option: any) => ({
        symbol: option.contractID || `${symbol}${option.strike}${option.type?.toUpperCase()}${option.expiration}`,
        strike: parseFloat(option.strike),
        expiration: option.expiration,
        bid: parseFloat(option.bid) || 0,
        ask: parseFloat(option.ask) || 0,
        volume: parseInt(option.volume) || 0,
        openInterest: parseInt(option.open_interest) || 0,
        impliedVolatility: option.implied_volatility ? parseFloat(option.implied_volatility) : undefined,
        type: option.type?.toLowerCase() as 'call' | 'put',
        lastUpdated: option.date, // Include the data timestamp from Alpha Vantage
      }));

      // Filter out options with invalid data (but let the frontend handle most filtering)
      const validOptions = options.filter(option => 
        option.strike > 0 && 
        option.expiration && 
        (option.type === 'call' || option.type === 'put')
      );

      // Sort by lastUpdated date to get the most recent data first
      validOptions.sort((a, b) => {
        const dateA = new Date(a.lastUpdated || 0).getTime();
        const dateB = new Date(b.lastUpdated || 0).getTime();
        return dateB - dateA; // Most recent first
      });

      // Group by contract (same strike, expiration, type) and keep only the most recent data for each
      const contractMap = new Map<string, OptionQuote>();
      
      validOptions.forEach(option => {
        const contractKey = `${option.strike}_${option.expiration}_${option.type}`;
        const existing = contractMap.get(contractKey);
        
        if (!existing) {
          contractMap.set(contractKey, option);
        } else {
          // Keep the one with more recent data
          const existingDate = new Date(existing.lastUpdated || 0).getTime();
          const optionDate = new Date(option.lastUpdated || 0).getTime();
          
          if (optionDate > existingDate) {
            contractMap.set(contractKey, option);
          }
        }
      });

      const mostRecentOptions = Array.from(contractMap.values());
      
      // Filter by data age if specified
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      const cutoffTime = Date.now() - maxAgeMs;
      
      const recentOptions = mostRecentOptions.filter(option => {
        if (!option.lastUpdated) {
          // If no timestamp, assume it's too old
          return false;
        }
        
        const optionTime = new Date(option.lastUpdated).getTime();
        return optionTime >= cutoffTime;
      });
      
      // Log the data freshness
      if (mostRecentOptions.length > 0) {
        const dates = mostRecentOptions.map(opt => opt.lastUpdated).filter(Boolean);
        if (dates.length > 0) {
          const mostRecentDate = new Date(Math.max(...dates.map(d => new Date(d!).getTime())));
          const oldestDate = new Date(Math.min(...dates.map(d => new Date(d!).getTime())));
          console.log(`📅 Options data freshness: Most recent: ${mostRecentDate.toISOString()}, Oldest: ${oldestDate.toISOString()}`);
          
          // Warn if data is older than 1 day
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (mostRecentDate < oneDayAgo) {
            console.warn(`⚠️ Warning: Most recent options data is ${Math.floor((Date.now() - mostRecentDate.getTime()) / (1000 * 60 * 60))} hours old`);
          }
        }
        
        if (recentOptions.length < mostRecentOptions.length) {
          console.log(`📊 Filtered to ${recentOptions.length} options within ${maxAgeHours} hours (from ${mostRecentOptions.length} total)`);
        }
      }

      console.log(`✅ Returning ${recentOptions.length} recent options contracts for ${symbol}`);
      return recentOptions;

    } catch (error) {
      console.error('❌ Alpha Vantage Options API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        throw new Error(`Failed to fetch options chain: ${error.message}`);
      }
      throw error;
    }
  }


  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}
