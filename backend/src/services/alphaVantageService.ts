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
      
      console.log(`🔍 Alpha Vantage Options API Call:`);
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

      // Step 1: Filter out invalid options data
      const validOptions = this.filterValidOptions(options);
      if (validOptions.length === 0) {
        console.log('❌ No valid options found after filtering');
        return [];
      }

      // Step 2: For each unique contract, keep only the one with the most recent timestamp
      const latestContracts = this.getLatestContractData(validOptions);
      
      console.log(`📊 Original options: ${validOptions.length}`);
      console.log(`📊 Unique contracts with latest data: ${latestContracts.length}`);
      
      if (latestContracts.length > 0) {
        const timestamps = latestContracts.map((opt: OptionQuote) => new Date(opt.lastUpdated || 0).getTime());
        const oldestTimestamp = Math.min(...timestamps);
        const newestTimestamp = Math.max(...timestamps);
        
        const hoursOld = Math.floor((Date.now() - newestTimestamp) / (1000 * 60 * 60));
        console.log(`📅 Data age range: ${hoursOld} hours (newest) to ${Math.floor((Date.now() - oldestTimestamp) / (1000 * 60 * 60))} hours (oldest)`);
      }

      console.log(`✅ Returning ${latestContracts.length} latest option contracts for ${symbol}`);
      return latestContracts;

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

  /**
   * Step 1: Filter out options that have invalid data
   * Removes options with no strike price, expiration, type, or timestamp
   */
  private filterValidOptions(options: OptionQuote[]): OptionQuote[] {
    return options.filter(option => 
      option.strike > 0 && 
      option.expiration && 
      (option.type === 'call' || option.type === 'put') &&
      option.lastUpdated // Must have a timestamp
    );
  }

  /**
   * Step 2: For each unique contract, keep only the one with the most recent timestamp
   * A unique contract = same strike price + expiration date + option type (call/put)
   */
  private getLatestContractData(validOptions: OptionQuote[]): OptionQuote[] {
    const contractMap = new Map<string, OptionQuote>();
    
    validOptions.forEach(option => {
      // Create unique key for this contract
      const contractKey = `${option.strike}_${option.expiration}_${option.type}`;
      const existing = contractMap.get(contractKey);
      
      if (!existing) {
        // First time seeing this contract
        contractMap.set(contractKey, option);
      } else {
        // We've seen this contract before - keep the one with newer timestamp
        const existingTime = new Date(existing.lastUpdated || 0).getTime();
        const optionTime = new Date(option.lastUpdated || 0).getTime();
        
        if (optionTime > existingTime) {
          contractMap.set(contractKey, option);
        }
      }
    });

    return Array.from(contractMap.values());
  }
}
