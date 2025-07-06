import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Portfolio handler called:', { 
    path: event.path, 
    method: event.httpMethod,
    body: event.body 
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
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required');
  }

  try {
    const portfolioData = JSON.parse(event.body);
    console.log('Analyzing portfolio:', portfolioData);
    
    // Basic portfolio analysis logic
    const analysis = {
      totalValue: 0,
      totalGainLoss: 0,
      percentageGainLoss: 0,
      diversificationScore: 0,
      riskScore: 'medium',
      recommendations: ['Consider diversifying across sectors', 'Monitor position sizes'],
      analyzedAt: new Date().toISOString()
    };

    return createSuccessResponse(analysis);
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    return createErrorResponse(400, 'Invalid request format', error);
  }
}

async function handleRiskMetrics(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('Calculating risk metrics for request:', event.requestContext?.requestId);
  
  try {
    const riskMetrics = {
      volatility: 0.15,
      sharpeRatio: 1.2,
      maxDrawdown: 0.08,
      beta: 1.1,
      var95: 0.05,
      calculatedAt: new Date().toISOString()
    };

    return createSuccessResponse(riskMetrics);
  } catch (error) {
    console.error('Risk metrics error:', error);
    return createErrorResponse(500, 'Failed to calculate risk metrics', error);
  }
}
