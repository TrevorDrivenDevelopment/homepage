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
    const validationError = validateCalculationRequest(request);
    if (validationError) {
      return createErrorResponse(400, validationError);
    }

    // Perform calculations
    const results = calculateOptionsReturns(request);
    
    return createSuccessResponse(results);
  } catch (error) {
    console.error('Options calculation error:', error);
    return createErrorResponse(400, 'Invalid request format or calculation error', error);
  }
}

/**
 * Validates the calculation request input
 * Returns error message if invalid, null if valid
 */
function validateCalculationRequest(request: CalculationRequest): string | null {
  if (!request.securityPrice || request.securityPrice <= 0) {
    return 'Security price must be a positive number';
  }
  
  if (!request.investmentAmount || request.investmentAmount <= 0) {
    return 'Investment amount must be a positive number';
  }
  
  if (!request.options || request.options.length === 0) {
    return 'At least one option must be provided';
  }
  
  if (!request.percentageIncrements || request.percentageIncrements.length === 0) {
    return 'Percentage increments must be provided';
  }

  return null; // Valid
}

function calculateOptionsReturns(request: CalculationRequest): CalculationResult {
  const { securityPrice, investmentAmount, options, percentageIncrements } = request;
  
  const sellPrices = calculateSellPrices(securityPrice, percentageIncrements);
  const resultsByPrice = calculateResultsByPrice(options, investmentAmount, sellPrices);
  const bestOptions = findBestOptions(resultsByPrice, sellPrices);

  return {
    sellPrices,
    resultsByPrice: Object.fromEntries(resultsByPrice),
    bestOptions,
    metadata: {
      calculatedAt: new Date().toISOString(),
      optionsAnalyzed: options.length,
      priceTargets: sellPrices.length,
    }
  };
}

/**
 * Calculate target sell prices based on percentage increments
 */
function calculateSellPrices(securityPrice: number, percentageIncrements: number[]): number[] {
  return percentageIncrements.map((percentage: number) =>
    roundToCents(securityPrice * (1 + (percentage / 100)))
  );
}

/**
 * Calculate results for each option at each sell price
 */
function calculateResultsByPrice(
  options: any[], 
  investmentAmount: number, 
  sellPrices: number[]
): Map<number, any[]> {
  const resultsByPrice = new Map<number, any[]>();
  
  for (const option of options) {
    const optionAnalysis = analyzeOption(option, investmentAmount, sellPrices);
    if (!optionAnalysis) continue; // Skip invalid options
    
    addOptionResultsToMap(optionAnalysis, resultsByPrice);
  }
  
  return resultsByPrice;
}

/**
 * Analyze a single option and calculate its performance at all sell prices
 */
function analyzeOption(option: any, investmentAmount: number, sellPrices: number[]) {
  const optionPrice = option.price ?? roundMidpointUp(option.bid, option.ask);
  const totalCostPerContract = optionPrice * 100;
  
  if (totalCostPerContract <= 0) return null;

  const contracts = Math.floor(investmentAmount / totalCostPerContract);
  if (contracts <= 0) return null;

  const shares = contracts * 100;
  const actualInvestment = roundToCents(totalCostPerContract * contracts);

  const results = sellPrices.map(sellPrice => {
    const gainLoss = calculateGainLoss(sellPrice, option.strike, shares, actualInvestment);
    const percentageGainLoss = actualInvestment > 0 
      ? Math.max(-100, (gainLoss / actualInvestment) * 100)
      : 0;

    return {
      sellPrice,
      gainLoss, 
      actualInvestment, 
      shares, 
      contracts,
      percentageGainLoss,
      ...option 
    };
  });

  return results;
}

/**
 * Calculate gain/loss for an option at a specific sell price
 */
function calculateGainLoss(
  sellPrice: number, 
  strikePrice: number, 
  shares: number, 
  actualInvestment: number
): number {
  if (sellPrice <= strikePrice) {
    return -actualInvestment; // Total loss
  } else {
    return roundToCents((sellPrice - strikePrice) * shares - actualInvestment);
  }
}

/**
 * Add option results to the results map, keeping only top 5 per price
 */
function addOptionResultsToMap(
  optionResults: any[], 
  resultsByPrice: Map<number, any[]>
): void {
  for (const result of optionResults) {
    const currentResults = resultsByPrice.get(result.sellPrice) ?? [];
    currentResults.push(result);
    
    // Sort by gain/loss descending and keep top 5
    currentResults.sort((a, b) => b.gainLoss - a.gainLoss);
    resultsByPrice.set(result.sellPrice, currentResults.slice(0, 5));
  }
}

/**
 * Find the best performing options at the highest sell price
 */
function findBestOptions(resultsByPrice: Map<number, any[]>, sellPrices: number[]) {
  const highestSellPrice = sellPrices[sellPrices.length - 1];
  const resultsAtHighestPercentage = resultsByPrice.get(highestSellPrice) || [];
  
  return {
    best: resultsAtHighestPercentage[0] || null,
    secondBest: resultsAtHighestPercentage[1] || null,
  };
}

// Utility functions
function roundToCents(input: number): number {
  return Math.round((input * 100)) / 100;
}

function roundMidpointUp(bid: number, ask: number): number {
  const midpoint = (bid + ask) / 2;
  return Math.ceil(midpoint * 100) / 100;
}
