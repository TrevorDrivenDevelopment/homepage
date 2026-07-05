/**
 * Centralized API configuration for all external services
 */

export const API_CONFIG = {
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    FUNCTIONS: {
      GLOBAL_QUOTE: 'GLOBAL_QUOTE',
      TIME_SERIES_DAILY: 'TIME_SERIES_DAILY',
      TIME_SERIES_INTRADAY: 'TIME_SERIES_INTRADAY',
      OVERVIEW: 'OVERVIEW',
      HISTORICAL_OPTIONS: 'HISTORICAL_OPTIONS',
    },
    RATE_LIMIT: {
      FREE_TIER_PER_DAY: 25,     // 25 API requests per day
      FREE_TIER_PER_SEC: 1,      // 1 request per second
      PREMIUM_PER_MIN: 75,       // 75 API requests per minute (lowest premium)
    },
  },
} as const;

// Environment variable names
export const ENV_VARS = {
  ALPHA_VANTAGE_API_KEY: 'ALPHA_VANTAGE_API_KEY',
} as const;

// API response timeout configurations
export const TIMEOUT_CONFIG = {
  STOCK_QUOTE: 10000,    // 10 seconds
  OPTIONS_CHAIN: 15000,  // 15 seconds
  MARKET_DATA: 10000,    // 10 seconds
} as const;

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  STOCK_QUOTE: 5 * 60 * 1000,       // 5 minutes — prices change during trading
  COMPANY_OVERVIEW: 24 * 60 * 60 * 1000, // 24 hours — 52-week range rarely changes
  OPTIONS_CHAIN: 10 * 60 * 1000,    // 10 minutes — options data is less volatile
} as const;
