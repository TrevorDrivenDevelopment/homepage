import axios from 'axios';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export class MarketDataService {
  private apiKey: string;
  private baseUrl: string = 'https://api.example.com/v1'; // Replace with actual API

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    if (!this.apiKey) {
      throw new Error('Market Data API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/quote/${symbol}`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      return {
        symbol: response.data.symbol,
        price: response.data.price,
        change: response.data.change,
        changePercent: response.data.changePercent,
        volume: response.data.volume,
        marketCap: response.data.marketCap,
        pe: response.data.pe,
        eps: response.data.eps
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw new Error(`Failed to fetch market data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    if (!this.apiKey) {
      throw new Error('Market Data API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/indices`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      return response.data.indices;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw new Error(`Failed to fetch market indices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
