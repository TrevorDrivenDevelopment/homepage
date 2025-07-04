export const roundToCents = (input: number): number => Math.round((input * 100)) / 100;

export const roundMidpointUp = (bid: number, ask: number): number => {
  const midpoint = (bid + ask) / 2;
  return Math.ceil(midpoint * 100) / 100;
};

export const calculateTargetPrices = (
  currentPrice: number,
  percentageIncrements: string
): number[] => {
  if (currentPrice <= 0) return [];
  
  const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
  return percentages.map(percentage =>
    roundToCents(currentPrice * (1 + (percentage / 100)))
  );
};

export const calculatePerformanceForOption = (
  option: any,
  sellPrices: number[],
  percentageIncrements: string
) => {
  const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
  
  return percentages.map((percentage, index) => {
    const sellPrice = sellPrices[index];
    let gainLoss: number;
    
    if (sellPrice <= option.strike) {
      gainLoss = -option.actualInvestment;
    } else {
      gainLoss = roundToCents((sellPrice - option.strike) * option.shares - option.actualInvestment);
    }
    
    const percentageGainLoss = option.actualInvestment > 0 
      ? Math.max(-100, (gainLoss / option.actualInvestment) * 100)
      : 0;

    return {
      percentage: `${percentage}%`,
      sellPrice: `$${sellPrice.toFixed(2)}`,
      gainLoss: `$${gainLoss.toFixed(2)}`,
      percentageGainLoss: `${percentageGainLoss.toFixed(2)}%`,
      isProfit: gainLoss > 0,
    };
  });
};
