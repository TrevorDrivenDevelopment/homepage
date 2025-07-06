import axios from 'axios';
import { StockQuote, OptionQuote } from '../types/api';
import { API_CONFIG, TIMEOUT_CONFIG } from '../config/apiConfig';

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
      // Get both quote and overview data in parallel for complete stock information
      const [quoteResponse, overviewResponse] = await Promise.all([
        this.getQuoteData(symbol),
        this.getOverviewData(symbol)
      ]);

      return {
        symbol: quoteResponse.symbol,
        price: quoteResponse.price,
        change: quoteResponse.change,
        changePercent: quoteResponse.changePercent,
        lastUpdated: quoteResponse.lastUpdated,
        currency: quoteResponse.currency,
        week52High: overviewResponse.week52High,
        week52Low: overviewResponse.week52Low,
      };
    } catch (error) {
      console.error('❌ Stock quote error:', error);
      throw error;
    }
  }

  private async getQuoteData(symbol: string): Promise<{
    symbol: string;
    price: number;
    change: number;
    changePercent: string;
    lastUpdated: string;
    currency: string;
  }> {
    const url = this.baseUrl;
    const params = {
      function: API_CONFIG.ALPHA_VANTAGE.FUNCTIONS.GLOBAL_QUOTE,
      symbol: symbol.toUpperCase(),
      apikey: this.apiKey,
    };
    
    console.log(`🔍 Alpha Vantage Quote API Call:`);
    console.log(`URL: ${url}`);
    console.log(`Params:`, { ...params, apikey: '***' + this.apiKey.slice(-4) });
    
    const response = await axios.get(url, {
      params,
      timeout: TIMEOUT_CONFIG.STOCK_QUOTE,
    });

    console.log('✅ Alpha Vantage quote response status:', response.status);
    console.log('📋 Quote response data keys:', Object.keys(response.data));

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
  }

  private async getOverviewData(symbol: string): Promise<{
    week52High?: number;
    week52Low?: number;
  }> {
    const url = this.baseUrl;
    const params = {
      function: API_CONFIG.ALPHA_VANTAGE.FUNCTIONS.OVERVIEW,
      symbol: symbol.toUpperCase(),
      apikey: this.apiKey,
    };
    
    console.log(`🔍 Alpha Vantage Overview API Call:`);
    console.log(`URL: ${url}`);
    console.log(`Params:`, { ...params, apikey: '***' + this.apiKey.slice(-4) });
    
    const response = await axios.get(url, {
      params,
      timeout: TIMEOUT_CONFIG.STOCK_QUOTE,
    });

    console.log('✅ Alpha Vantage overview response status:', response.status);
    console.log('📋 Overview response data keys:', Object.keys(response.data));

    // Handle potential errors in overview response
    if (response.data['Error Message']) {
      console.log('⚠️ Overview API error, using fallback values:', response.data['Error Message']);
      return { week52High: undefined, week52Low: undefined };
    }
    if (response.data['Note']) {
      console.log('⚠️ Overview API rate limit, using fallback values:', response.data['Note']);
      return { week52High: undefined, week52Low: undefined };
    }
    if (response.data['Information']) {
      console.log('⚠️ Overview API info, using fallback values:', response.data['Information']);
      return { week52High: undefined, week52Low: undefined };
    }

    const week52High = response.data['52WeekHigh'] ? parseFloat(response.data['52WeekHigh']) : undefined;
    const week52Low = response.data['52WeekLow'] ? parseFloat(response.data['52WeekLow']) : undefined;

    console.log('✅ Successfully parsed overview data for', symbol);
    console.log(`📊 52W High: ${week52High}, 52W Low: ${week52Low}`);
    
    return {
      week52High,
      week52Low,
    };
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Step 1: Filter out invalid and expired options data
      const validOptions = this.filterValidOptions(options);
      if (validOptions.length === 0) {
        console.log('❌ No valid options found after filtering');
        return [];
      }
      
      const filteredCount = options.length - validOptions.length;
      if (filteredCount > 0) {
        console.log(`🗑️ Filtered out ${filteredCount} invalid/expired options (${validOptions.length} remaining)`);
      }

      // Step 2: Group by expiration date and get latest contracts for each expiration
      const latestContracts = this.getLatestContractData(validOptions);
      
      console.log(`📊 Original options: ${validOptions.length}`);
      console.log(`📊 Unique contracts across all expirations: ${latestContracts.length}`);
      
      // Show breakdown by expiration date for transparency
      const expirationBreakdown = new Map<string, number>();
      latestContracts.forEach(option => {
        const count = expirationBreakdown.get(option.expiration) || 0;
        expirationBreakdown.set(option.expiration, count + 1);
      });
      
      console.log(`📅 Final breakdown by expiration:`);
      Array.from(expirationBreakdown.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([expiration, count]) => {
          console.log(`   ${expiration}: ${count} contracts`);
        });
      
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
   * Step 1: Filter out options that have invalid data or are expired
   * Removes options with no strike price, expiration, type, timestamp, or past expiration
   */
  private filterValidOptions(options: OptionQuote[]): OptionQuote[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    
    return options.filter(option => {
      // Basic validation
      if (!option.strike || option.strike <= 0) return false;
      if (!option.expiration) return false;
      if (option.type !== 'call' && option.type !== 'put') return false;
      if (!option.lastUpdated) return false;
      
      // Expiration validation - filter out expired options
      const expirationDate = new Date(option.expiration);
      if (isNaN(expirationDate.getTime())) {
        console.log(`⚠️ Invalid expiration date format: ${option.expiration}`);
        return false;
      }
      
      // Options expire at market close on expiration date, so we consider them expired 
      // if the expiration date is in the past (before today)
      if (expirationDate < today) {
        console.log(`🗓️ Filtering out expired option: ${option.symbol} (expired ${option.expiration})`);
        return false;
      }
      
      return true;
    });
  }

  /**
   * Step 2: Group by expiration date and get the latest contracts for each unique contract within each expiration
   * This ensures we have good coverage of strikes for each expiration date, rather than just overall best contracts
   */
  private getLatestContractData(validOptions: OptionQuote[]): OptionQuote[] {
    // First, group all options by expiration date
    const byExpiration = new Map<string, OptionQuote[]>();
    
    validOptions.forEach(option => {
      const expiration = option.expiration;
      if (!byExpiration.has(expiration)) {
        byExpiration.set(expiration, []);
      }
      byExpiration.get(expiration)!.push(option);
    });

    console.log(`📅 Found ${byExpiration.size} unique expiration dates:`, Array.from(byExpiration.keys()).sort());

    const allLatestContracts: OptionQuote[] = [];

    // For each expiration date, deduplicate contracts within that expiration
    byExpiration.forEach((options, expiration) => {
      console.log(`🗓️ Processing expiration ${expiration} with ${options.length} options`);
      
      const contractMap = new Map<string, OptionQuote>();
      
      options.forEach(option => {
        // Create unique key for this contract within this expiration date
        const contractKey = `${option.strike}_${option.type}`;
        const existing = contractMap.get(contractKey);
        
        if (!existing) {
          // First time seeing this contract for this expiration
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

      const latestForThisExpiration = Array.from(contractMap.values());
      console.log(`✅ Expiration ${expiration}: ${latestForThisExpiration.length} unique contracts after deduplication`);
      
      allLatestContracts.push(...latestForThisExpiration);
    });

    console.log(`📊 Total contracts across all expirations: ${allLatestContracts.length}`);
    return allLatestContracts;
  }
}
