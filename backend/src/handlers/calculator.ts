import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { CalculationRequest, CalculationResult } from '../types/api';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Calculator handler called:', { 
    path: event.path, 
    method: event.httpMethod,
    body: event.body 
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createSuccessResponse({});
  }

  try {
    if (event.httpMethod === 'POST' && event.path.includes('/calculate')) {
      return await handleOptionsCalculation(event);
    }

    return createErrorResponse(404, 'Endpoint not found');
  } catch (error) {
    console.error('Calculator handler error:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};

async function handleOptionsCalculation(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required');
  }

  try {
    const request: CalculationRequest = JSON.parse(event.body);
    
    // Validate input
    if (!request.securityPrice || request.securityPrice <= 0) {
      return createErrorResponse(400, 'Security price must be a positive number');
    }
    
    if (!request.investmentAmount || request.investmentAmount <= 0) {
      return createErrorResponse(400, 'Investment amount must be a positive number');
    }
    
    if (!request.options || request.options.length === 0) {
      return createErrorResponse(400, 'At least one option must be provided');
    }
    
    if (!request.percentageIncrements || request.percentageIncrements.length === 0) {
      return createErrorResponse(400, 'Percentage increments must be provided');
    }

    // Perform calculations
    const results = calculateOptionsReturns(request);
    
    return createSuccessResponse(results);
  } catch (error) {
    console.error('Options calculation error:', error);
    return createErrorResponse(400, 'Invalid request format or calculation error', error);
  }
}

function calculateOptionsReturns(request: CalculationRequest): CalculationResult {
  const { securityPrice, investmentAmount, options, percentageIncrements } = request;
  
  const roundToCents = (input: number): number => Math.round((input * 100)) / 100;
  const roundMidpointUp = (bid: number, ask: number): number => {
    const midpoint = (bid + ask) / 2;
    return Math.ceil(midpoint * 100) / 100;
  };

  const sellPrices = percentageIncrements.map((percentage: number) =>
    roundToCents(securityPrice * (1 + (percentage / 100)))
  );

  const resultsByPrice = new Map<number, any[]>();
  
  for (const option of options) {
    const optionPrice = option.price ?? roundMidpointUp(option.bid, option.ask);
    const totalCostPerContract = optionPrice * 100;
    
    if (totalCostPerContract <= 0) continue;

    const contracts = Math.floor(investmentAmount / totalCostPerContract);
    if (contracts <= 0) continue;

    const shares = contracts * 100;
    const actualInvestment = roundToCents(totalCostPerContract * contracts);

    for (const sellPrice of sellPrices) {
      let gainLoss: number;
      
      if (sellPrice <= option.strike) {
        gainLoss = -actualInvestment;
      } else {
        gainLoss = roundToCents((sellPrice - option.strike) * shares - actualInvestment);
      }
      
      const percentageGainLoss = actualInvestment > 0 
        ? Math.max(-100, (gainLoss / actualInvestment) * 100)
        : 0;

      const currentResults = resultsByPrice.get(sellPrice) ?? [];
      currentResults.push({ 
        gainLoss, 
        actualInvestment, 
        shares, 
        contracts,
        percentageGainLoss,
        ...option 
      });
      
      // Sort by gain/loss descending and keep top 5
      currentResults.sort((a, b) => b.gainLoss - a.gainLoss);
      resultsByPrice.set(sellPrice, currentResults.slice(0, 5));
    }
  }

  // Find best options
  const highestSellPrice = sellPrices[sellPrices.length - 1];
  const resultsAtHighestPercentage = resultsByPrice.get(highestSellPrice) || [];
  
  return {
    sellPrices,
    resultsByPrice: Object.fromEntries(resultsByPrice),
    bestOptions: {
      best: resultsAtHighestPercentage[0] || null,
      secondBest: resultsAtHighestPercentage[1] || null,
    },
    metadata: {
      calculatedAt: new Date().toISOString(),
      optionsAnalyzed: options.length,
      priceTargets: sellPrices.length,
    }
  };
}
