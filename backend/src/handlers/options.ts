import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse, getPathParameter } from '../utils/response';
import { AlphaVantageService } from '../services/alphaVantageService';
import { OptionsChainResponse } from '../types/api';

const alphaVantageService = new AlphaVantageService(
  process.env.ALPHA_VANTAGE_API_KEY || ''
);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Options handler called:', { 
    path: event.path, 
    method: event.httpMethod,
    pathParameters: event.pathParameters 
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createSuccessResponse({});
  }

  try {
    const symbol = getPathParameter(event, 'symbol');
    
    if (!symbol) {
      return createErrorResponse(400, 'Symbol parameter is required');
    }

    // Route based on path
    if (event.path.includes('/stock/')) {
      return await handleStockQuote(symbol);
    } else if (event.path.includes('/chain/')) {
      return await handleOptionsChain(symbol);
    } else {
      return createErrorResponse(404, 'Endpoint not found');
    }
  } catch (error) {
    console.error('Options handler error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

async function handleStockQuote(symbol: string): Promise<APIGatewayProxyResult> {
  try {
    console.log('🔍 Fetching stock quote for:', symbol);
    console.log('🔑 Alpha Vantage API Key configured:', !!process.env.ALPHA_VANTAGE_API_KEY);
    
    if (!alphaVantageService.isConfigured()) {
      console.log('⚠️ Alpha Vantage not configured, returning mock data');
      return createSuccessResponse({
        symbol: symbol.toUpperCase(),
        price: 150 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: `${((Math.random() - 0.5) * 5).toFixed(2)}%`,
        lastUpdated: new Date().toISOString().split('T')[0],
        currency: 'USD',
      });
    }

    const stockQuote = await alphaVantageService.getStockQuote(symbol);
    console.log('✅ Successfully fetched real stock quote for', symbol);
    return createSuccessResponse(stockQuote);
  } catch (error) {
    console.error('❌ Stock quote error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, `Failed to fetch stock quote: ${errorMessage}`);
  }
}

async function handleOptionsChain(symbol: string): Promise<APIGatewayProxyResult> {
  try {
    console.log('Alpha Vantage API Key configured:', !!process.env.ALPHA_VANTAGE_API_KEY);
    console.log('Alpha Vantage service configured:', alphaVantageService.isConfigured());
    
    if (!alphaVantageService.isConfigured()) {
      // Return mock data if service not configured (for development)
      console.log('Using mock options data for symbol:', symbol);
      const mockResponse: OptionsChainResponse = {
        symbol: symbol.toUpperCase(),
        stockPrice: 150 + Math.random() * 50, // Mock price between $150-200 for AAPL-like
        calls: generateMockOptions(symbol, 'call'),
        puts: generateMockOptions(symbol, 'put'),
        expirationDates: getNextExpirationDates(),
      };
      return createSuccessResponse(mockResponse);
    }

    const [stockQuote, optionsChain] = await Promise.all([
      alphaVantageService.getStockQuote(symbol),
      alphaVantageService.getOptionsChain(symbol),
    ]);

    const calls = optionsChain.filter(option => option.type === 'call');
    const puts = optionsChain.filter(option => option.type === 'put');
    const expirationDates = [...new Set(optionsChain.map(option => option.expiration))];

    const response: OptionsChainResponse = {
      symbol: stockQuote.symbol,
      stockPrice: stockQuote.price,
      calls,
      puts,
      expirationDates,
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('Options chain error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // If Alpha Vantage fails, return mock data as fallback
    console.log('Falling back to mock data due to error:', errorMessage);
    const mockResponse: OptionsChainResponse = {
      symbol: symbol.toUpperCase(),
      stockPrice: 150 + Math.random() * 50,
      calls: generateMockOptions(symbol, 'call'),
      puts: generateMockOptions(symbol, 'put'),
      expirationDates: getNextExpirationDates(),
    };
    return createSuccessResponse(mockResponse);
  }
}

// Helper functions for mock data
function generateMockOptions(symbol: string, type: 'call' | 'put') {
  const currentPrice = 175; // Mock current price for AAPL
  const options = [];
  const expirationDate = getNextExpirationDates()[0];
  
  // Generate strikes around current price
  for (let i = -5; i <= 5; i++) {
    const strike = currentPrice + (i * 5);
    const isITM = type === 'call' ? currentPrice > strike : currentPrice < strike;
    const intrinsicValue = type === 'call' ? Math.max(0, currentPrice - strike) : Math.max(0, strike - currentPrice);
    const timeValue = Math.random() * 5 + 1;
    const bid = intrinsicValue + timeValue - 0.25;
    
    options.push({
      symbol: `${symbol}${expirationDate.replace(/-/g, '')}${type.charAt(0).toUpperCase()}${strike.toFixed(2).replace('.', '')}`,
      strike,
      expiration: expirationDate,
      bid: Math.max(0.01, bid),
      ask: Math.max(0.01, bid + 0.5),
      volume: Math.floor(Math.random() * 1000) + 100,
      openInterest: Math.floor(Math.random() * 5000) + 500,
      impliedVolatility: 0.25 + Math.random() * 0.3,
      type,
    });
  }
  
  return options;
}

function getNextExpirationDates() {
  const dates = [];
  const now = new Date();
  
  // Get next 3 monthly expirations (3rd Friday of each month)
  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    // Find 3rd Friday
    const firstFriday = 6 - date.getDay();
    const thirdFriday = firstFriday + 14;
    date.setDate(thirdFriday);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}
