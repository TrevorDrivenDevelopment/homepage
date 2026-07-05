import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse, getPathParameter } from '../utils/response';
import { AlphaVantageService } from '../services/alphaVantageService';
import { RateLimitError } from '../utils/rateLimiter';
import { log } from '../utils/logger';
import { OptionQuote, OptionsChainResponse } from '../types/api';

const alphaVantageService = new AlphaVantageService(
  process.env.ALPHA_VANTAGE_API_KEY || ''
);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  log.debug('Options handler called', {
    path: event.path,
    method: event.httpMethod,
    pathParameters: event.pathParameters,
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
    log.error('Options handler error', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

async function handleStockQuote(symbol: string): Promise<APIGatewayProxyResult> {
  try {
    log.debug('Fetching stock quote', { symbol, apiKeyConfigured: !!process.env.ALPHA_VANTAGE_API_KEY });
    
    if (!alphaVantageService.isConfigured()) {
      return createErrorResponse(503, 'Alpha Vantage API service not configured');
    }

    const stockQuote = await alphaVantageService.getStockQuote(symbol);
    log.debug('Successfully fetched stock quote', { symbol });
    return createSuccessResponse(stockQuote);
  } catch (error) {
    log.error('Stock quote error', error);
    if (error instanceof RateLimitError) {
      return createErrorResponse(429, 'Alpha Vantage rate limit reached. Please try again later.');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, `Failed to fetch stock quote: ${errorMessage}`);
  }
}

async function handleOptionsChain(symbol: string): Promise<APIGatewayProxyResult> {
  try {
    log.debug('Fetching options chain', {
      symbol,
      apiKeyConfigured: !!process.env.ALPHA_VANTAGE_API_KEY,
      serviceConfigured: alphaVantageService.isConfigured(),
    });
    
    if (!alphaVantageService.isConfigured()) {
      return createErrorResponse(503, 'Alpha Vantage API service not configured');
    }

    // First get the stock quote
    const stockQuote = await alphaVantageService.getStockQuote(symbol);
    
    // Try to get options chain, but handle the case where it's not available
    let optionsChain: OptionQuote[] = [];
    try {
      optionsChain = await alphaVantageService.getOptionsChain(symbol);
    } catch (optionsError) {
      log.debug('Options data not available, returning empty options chain with stock data only', {
        error: optionsError instanceof Error ? optionsError.message : 'Unknown error',
      });
      // Continue with empty options chain - this is expected for Alpha Vantage
    }

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

    log.debug('Successfully fetched options response', {
      symbol,
      calls: calls.length,
      puts: puts.length,
      stockPrice: stockQuote.price,
    });
    return createSuccessResponse(response);
  } catch (error) {
    log.error('Options chain error', error);
    if (error instanceof RateLimitError) {
      return createErrorResponse(429, 'Alpha Vantage rate limit reached. Please try again later.');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, `Failed to fetch options chain: ${errorMessage}`);
  }
}
