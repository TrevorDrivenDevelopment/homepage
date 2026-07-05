import axios from 'axios';
import { StockQuote, OptionQuote } from '../types/api';
import { API_CONFIG, TIMEOUT_CONFIG, CACHE_TTL } from '../config/apiConfig';
import { cache } from '../utils/cache';
import { throttledCall, RateLimitError } from '../utils/rateLimiter';
import { log } from '../utils/logger';

export class AlphaVantageService {
  private readonly apiKey: string;
  private readonly baseUrl = API_CONFIG.ALPHA_VANTAGE.BASE_URL;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // ── Error Detection ─────────────────────────────────────────────────

  /**
   * Detect Alpha Vantage rate-limit / info messages and throw typed errors.
   * Returns true if the response contains an error indicator.
   */
  private checkForApiError(data: Record<string, unknown>): void {
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage Error: ${data['Error Message']}`);
    }
    // Both "Note" and "Information" indicate rate limiting on the free tier
    if (data['Note'] || data['Information']) {
      const msg = (data['Note'] || data['Information']) as string;
      throw new RateLimitError(msg);
    }
  }

  /**
   * Returns true if the response data looks like a rate-limit / info message.
   */
  private isRateLimited(data: Record<string, unknown>): boolean {
    return !!(data['Note'] || data['Information']);
  }

  // ── Public API ──────────────────────────────────────────────────────

  async getStockQuote(symbol: string): Promise<StockQuote> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const upperSymbol = symbol.toUpperCase();
    const cacheKey = `quote:${upperSymbol}`;

    // Check cache first
    const cached = cache.get<StockQuote>(cacheKey);
    if (cached) {
      log.debug(`Cache HIT for stock quote: ${upperSymbol}`);
      return cached;
    }
    log.debug(`Cache MISS for stock quote: ${upperSymbol}`);

    try {
      // SEQUENTIAL calls (not parallel) to respect 1 req/sec free tier limit
      const quoteResponse = await this.getQuoteData(upperSymbol);

      // Try overview but don't fail the whole request if it rate-limits
      let overviewResponse: { week52High?: number; week52Low?: number } = {};
      try {
        overviewResponse = await this.getOverviewData(upperSymbol);
      } catch (err) {
        if (err instanceof RateLimitError) {
          log.debug('Overview rate-limited, continuing without 52-week data');
        } else {
          log.debug('Overview failed, continuing without 52-week data', err instanceof Error ? err.message : err);
        }
      }

      const result: StockQuote = {
        symbol: quoteResponse.symbol,
        price: quoteResponse.price,
        change: quoteResponse.change,
        changePercent: quoteResponse.changePercent,
        lastUpdated: quoteResponse.lastUpdated,
        currency: quoteResponse.currency,
        week52High: overviewResponse.week52High,
        week52Low: overviewResponse.week52Low,
      };

      // Cache the result
      cache.set(cacheKey, result, CACHE_TTL.STOCK_QUOTE);
      log.debug(`Cached stock quote for ${upperSymbol} (TTL: ${CACHE_TTL.STOCK_QUOTE / 1000}s)`);
      return result;
    } catch (error) {
      log.error('Stock quote error', error);
      throw error;
    }
  }

  async getOptionsChain(symbol: string): Promise<OptionQuote[]> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const upperSymbol = symbol.toUpperCase();
    const cacheKey = `options:${upperSymbol}`;

    // Check cache first
    const cached = cache.get<OptionQuote[]>(cacheKey);
    if (cached) {
      log.debug(`Cache HIT for options chain: ${upperSymbol} (${cached.length} contracts)`);
      return cached;
    }
    log.debug(`Cache MISS for options chain: ${upperSymbol}`);

    try {
      const options = await this.fetchOptionsData(upperSymbol);

      // Step 1: Filter out invalid and expired options
      const validOptions = this.filterValidOptions(options);
      if (validOptions.length === 0) {
        log.debug('No valid options found after filtering');
        // Cache empty result briefly to avoid hammering the API
        cache.set(cacheKey, [], CACHE_TTL.OPTIONS_CHAIN);
        return [];
      }

      const filteredCount = options.length - validOptions.length;
      if (filteredCount > 0) {
        log.debug(`Filtered out ${filteredCount} invalid/expired options (${validOptions.length} remaining)`);
      }

      // Step 2: Deduplicate by expiration
      const latestContracts = this.getLatestContractData(validOptions);

      log.debug(`Original: ${validOptions.length}, Unique contracts: ${latestContracts.length}`);

      // Cache the result
      cache.set(cacheKey, latestContracts, CACHE_TTL.OPTIONS_CHAIN);
      log.debug(`Cached options chain for ${upperSymbol} (TTL: ${CACHE_TTL.OPTIONS_CHAIN / 1000}s)`);

      return latestContracts;
    } catch (error) {
      log.error('Alpha Vantage Options API error', error);
      if (axios.isAxiosError(error)) {
        log.error('Response status', error.response?.status);
        throw new Error(`Failed to fetch options chain: ${error.message}`);
      }
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  // ── Private: API Calls (all throttled) ──────────────────────────────

  private async getQuoteData(symbol: string): Promise<{
    symbol: string;
    price: number;
    change: number;
    changePercent: string;
    lastUpdated: string;
    currency: string;
  }> {
    const params = {
      function: API_CONFIG.ALPHA_VANTAGE.FUNCTIONS.GLOBAL_QUOTE,
      symbol,
      apikey: this.apiKey,
    };

    log.debug(`Alpha Vantage GLOBAL_QUOTE for ${symbol}`);

    const response = await throttledCall(() =>
      axios.get(this.baseUrl, { params, timeout: TIMEOUT_CONFIG.STOCK_QUOTE })
    );

    log.debug('Quote response status', response.status);

    const quote = response.data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) {
      this.checkForApiError(response.data);
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    log.debug('Parsed quote data for', symbol);

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
    // Overview data rarely changes — use a long TTL
    const overviewCacheKey = `overview:${symbol}`;
    const cached = cache.get<{ week52High?: number; week52Low?: number }>(overviewCacheKey);
    if (cached) {
      log.debug(`Cache HIT for overview: ${symbol}`);
      return cached;
    }

    const params = {
      function: API_CONFIG.ALPHA_VANTAGE.FUNCTIONS.OVERVIEW,
      symbol,
      apikey: this.apiKey,
    };

    log.debug(`Alpha Vantage OVERVIEW for ${symbol}`);

    const response = await throttledCall(() =>
      axios.get(this.baseUrl, { params, timeout: TIMEOUT_CONFIG.STOCK_QUOTE })
    );

    log.debug('Overview response status', response.status);

    // Check for rate limiting
    if (this.isRateLimited(response.data)) {
      const msg = (response.data['Note'] || response.data['Information']) as string;
      log.debug('Overview API rate-limited', msg.substring(0, 80));
      throw new RateLimitError(msg);
    }

    const week52High = response.data['52WeekHigh'] ? parseFloat(response.data['52WeekHigh']) : undefined;
    const week52Low = response.data['52WeekLow'] ? parseFloat(response.data['52WeekLow']) : undefined;

    const result = { week52High, week52Low };

    // Cache for 24 hours — this data barely changes
    cache.set(overviewCacheKey, result, CACHE_TTL.COMPANY_OVERVIEW);
    log.debug(`Cached overview for ${symbol} (TTL: 24h)`);

    return result;
  }

  private async fetchOptionsData(symbol: string): Promise<OptionQuote[]> {
    const params = {
      function: API_CONFIG.ALPHA_VANTAGE.FUNCTIONS.HISTORICAL_OPTIONS,
      symbol,
      apikey: this.apiKey,
    };

    log.debug(`Alpha Vantage HISTORICAL_OPTIONS for ${symbol}`);

    const response = await throttledCall(() =>
      axios.get(this.baseUrl, { params, timeout: TIMEOUT_CONFIG.OPTIONS_CHAIN })
    );

    log.debug('Options response status', response.status);

    // Check for rate limit / premium gating
    this.checkForApiError(response.data);

    const optionsData = response.data.data;

    if (!optionsData || !Array.isArray(optionsData)) {
      throw new Error(`No options data found for symbol: ${symbol}`);
    }

    log.debug(`Found ${optionsData.length} options records for ${symbol}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return optionsData.map((option: any) => ({
      symbol: option.contractID || `${symbol}${option.strike}${option.type?.toUpperCase()}${option.expiration}`,
      strike: parseFloat(option.strike),
      expiration: option.expiration,
      bid: parseFloat(option.bid) || 0,
      ask: parseFloat(option.ask) || 0,
      volume: parseInt(option.volume) || 0,
      openInterest: parseInt(option.open_interest) || 0,
      impliedVolatility: option.implied_volatility ? parseFloat(option.implied_volatility) : undefined,
      type: option.type?.toLowerCase() as 'call' | 'put',
      lastUpdated: option.date,
    }));
  }

  // ── Private: Filtering & Dedup ──────────────────────────────────────

  private filterValidOptions(options: OptionQuote[]): OptionQuote[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return options.filter(option => {
      if (!option.strike || option.strike <= 0) return false;
      if (!option.expiration) return false;
      if (option.type !== 'call' && option.type !== 'put') return false;
      if (!option.lastUpdated) return false;

      const expirationDate = new Date(option.expiration);
      if (isNaN(expirationDate.getTime())) return false;
      if (expirationDate < today) return false;

      return true;
    });
  }

  private getLatestContractData(validOptions: OptionQuote[]): OptionQuote[] {
    const byExpiration = new Map<string, OptionQuote[]>();

    validOptions.forEach(option => {
      if (!byExpiration.has(option.expiration)) {
        byExpiration.set(option.expiration, []);
      }
      byExpiration.get(option.expiration)!.push(option);
    });

    const allLatestContracts: OptionQuote[] = [];

    byExpiration.forEach((options, expiration) => {
      const contractMap = new Map<string, OptionQuote>();

      options.forEach(option => {
        const key = `${option.strike}_${option.type}`;
        const existing = contractMap.get(key);

        if (!existing || new Date(option.lastUpdated || 0).getTime() > new Date(existing.lastUpdated || 0).getTime()) {
          contractMap.set(key, option);
        }
      });

      const contracts = Array.from(contractMap.values());
      log.debug(`${expiration}: ${contracts.length} unique contracts`);
      allLatestContracts.push(...contracts);
    });

    return allLatestContracts;
  }
}
