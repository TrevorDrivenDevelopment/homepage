import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse, getPathParameter } from '../utils/response';
import { AlphaVantageService } from '../services/alphaVantageService';
import { OptionQuote, OptionsChainResponse } from '../types/api';

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
      return createErrorResponse(503, 'Alpha Vantage API service not configured');
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
    console.log('🔍 Fetching options chain for:', symbol);
    console.log('🔑 Alpha Vantage API Key configured:', !!process.env.ALPHA_VANTAGE_API_KEY);
    console.log('🔧 Alpha Vantage service configured:', alphaVantageService.isConfigured());
    
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
      console.log('⚠️ Options data not available:', optionsError instanceof Error ? optionsError.message : 'Unknown error');
      console.log('📋 Returning empty options chain with stock data only');
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

    console.log('✅ Successfully fetched options response for', symbol);
    console.log(`📊 Calls: ${calls.length}, Puts: ${puts.length}, Stock Price: $${stockQuote.price}`);
    return createSuccessResponse(response);
  } catch (error) {
    console.error('❌ Options chain error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, `Failed to fetch options chain: ${errorMessage}`);
  }
}
