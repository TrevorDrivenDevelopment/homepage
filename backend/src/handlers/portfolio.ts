import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Portfolio handler called:', { 
    path: event.path, 
    method: event.httpMethod 
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createSuccessResponse({});
  }

  try {
    if (event.httpMethod === 'POST' && event.path.includes('/analyze')) {
      return await handlePortfolioAnalysis(event);
    }

    if (event.httpMethod === 'GET' && event.path.includes('/risk-metrics')) {
      return await handleRiskMetrics(event);
    }

    return createErrorResponse(404, 'Endpoint not found');
  } catch (error) {
    console.error('Portfolio handler error:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};

async function handlePortfolioAnalysis(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Portfolio analysis logic here
  const analysis = {
    totalValue: 50000,
    diversification: 'Well diversified',
    riskLevel: 'Moderate',
    recommendations: [
      'Consider rebalancing tech allocation',
      'Add more international exposure'
    ],
    analyzedAt: new Date().toISOString()
  };

  return createSuccessResponse(analysis);
}

async function handleRiskMetrics(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Risk metrics calculation logic
  const metrics = {
    volatility: 0.15,
    sharpeRatio: 1.2,
    maxDrawdown: 0.08,
    beta: 1.05,
    calculatedAt: new Date().toISOString()
  };

  return createSuccessResponse(metrics);
}
