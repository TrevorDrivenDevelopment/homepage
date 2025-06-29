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
      // Return mock data if no API key
      return this.getMockMarketData(symbol);
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
      return this.getMockMarketData(symbol);
    }
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    if (!this.apiKey) {
      return this.getMockMarketIndices();
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
      return this.getMockMarketIndices();
    }
  }

  private getMockMarketData(symbol: string): MarketData {
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 100000000000),
      pe: parseFloat((15 + Math.random() * 20).toFixed(2)),
      eps: parseFloat((5 + Math.random() * 10).toFixed(2))
    };
  }

  private getMockMarketIndices(): MarketIndex[] {
    return [
      {
        name: 'S&P 500',
        symbol: 'SPX',
        value: 4200 + Math.random() * 400,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 2
      },
      {
        name: 'NASDAQ',
        symbol: 'IXIC',
        value: 13000 + Math.random() * 2000,
        change: (Math.random() - 0.5) * 100,
        changePercent: (Math.random() - 0.5) * 2
      },
      {
        name: 'Dow Jones',
        symbol: 'DJI',
        value: 33000 + Math.random() * 3000,
        change: (Math.random() - 0.5) * 200,
        changePercent: (Math.random() - 0.5) * 1.5
      }
    ];
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
