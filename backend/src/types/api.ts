export interface StockQuote {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: string;
  lastUpdated?: string;
  currency?: string;
  week52High?: number;
  week52Low?: number;
}

export interface OptionQuote {
  symbol: string;
  strike: number;
  expiration: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility?: number;
  type: 'call' | 'put';
  lastUpdated?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface OptionsChainResponse {
  symbol: string;
  stockPrice: number;
  calls: OptionQuote[];
  puts: OptionQuote[];
  expirationDates: string[];
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    alphaVantage: 'available' | 'unavailable' | 'not_configured';
  };
}

// Calculator API types
export interface ManualOptionProfile {
  strike: number;
  bid: number;
  ask: number;
  price?: number;
}

export interface CalculationRequest {
  securityPrice: number;
  investmentAmount: number;
  options: ManualOptionProfile[];
  percentageIncrements: number[];
}

export interface OptionResult {
  strike: number;
  bid: number;
  ask: number;
  price?: number;
  gainLoss: number;
  actualInvestment: number;
  shares: number;
  contracts: number;
  percentageGainLoss: number;
}

export interface CalculationResult {
  sellPrices: number[];
  resultsByPrice: Record<number, OptionResult[]>;
  bestOptions: {
    best: OptionResult | null;
    secondBest: OptionResult | null;
  };
  metadata: {
    calculatedAt: string;
    optionsAnalyzed: number;
    priceTargets: number;
  };
}
