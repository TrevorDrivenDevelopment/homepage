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
      FREE_TIER: 5, // 5 API requests per minute
      PREMIUM: 75,  // 75 API requests per minute
    },
  },
  
  // Add other API services here as needed
  POLYGON: {
    BASE_URL: 'https://api.polygon.io/v2',
    ENDPOINTS: {
      STOCK_QUOTE: '/aggs/ticker/{symbol}/prev',
      OPTIONS_CHAIN: '/snapshot/options/{symbol}',
    },
  },
  
  IEX_CLOUD: {
    BASE_URL: 'https://cloud.iexapis.com/stable',
    ENDPOINTS: {
      STOCK_QUOTE: '/stock/{symbol}/quote',
      OPTIONS_CHAIN: '/stock/{symbol}/options',
    },
  },
} as const;

// Environment variable names
export const ENV_VARS = {
  ALPHA_VANTAGE_API_KEY: 'ALPHA_VANTAGE_API_KEY',
  POLYGON_API_KEY: 'POLYGON_API_KEY',
  IEX_CLOUD_API_KEY: 'IEX_CLOUD_API_KEY',
  MARKET_DATA_API_KEY: 'MARKET_DATA_API_KEY',
} as const;

// API response timeout configurations
export const TIMEOUT_CONFIG = {
  STOCK_QUOTE: 10000,    // 10 seconds
  OPTIONS_CHAIN: 15000,  // 15 seconds
  MARKET_DATA: 10000,    // 10 seconds
} as const;
