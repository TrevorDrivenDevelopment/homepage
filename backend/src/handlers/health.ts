import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse } from '../utils/response';
import { HealthCheckResponse } from '../types/api';
import { AlphaVantageService } from '../services/alphaVantageService';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Health check called');

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createSuccessResponse({});
  }

  const alphaVantageService = new AlphaVantageService(
    process.env.ALPHA_VANTAGE_API_KEY || ''
  );

  const healthResponse: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
    services: {
      alphaVantage: alphaVantageService.isConfigured() ? 'available' : 'not_configured',
    },
  };

  return createSuccessResponse(healthResponse);
};
