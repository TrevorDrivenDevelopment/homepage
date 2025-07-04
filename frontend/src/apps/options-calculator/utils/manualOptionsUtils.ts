import { ManualOptionEntry, ManualOptionProfile, OptionResult } from '../hooks/useManualOptions';

export const roundToCents = (input: number): number => Math.round((input * 100)) / 100;

export const roundMidpointUp = (bid: number, ask: number): number => {
  const midpoint = (bid + ask) / 2;
  return Math.ceil(midpoint * 100) / 100;
};

export const parseManualOptionsFromEntries = (entries: ManualOptionEntry[]): ManualOptionProfile[] => {
  try {
    const options: ManualOptionProfile[] = [];
    
    for (const entry of entries) {
      const strike = parseFloat(entry.strike);
      const bid = parseFloat(entry.bid);
      const ask = parseFloat(entry.ask);
      const price = entry.price ? parseFloat(entry.price) : undefined;
      
      // Only include entries with valid strike, bid, and ask
      if (!isNaN(strike) && !isNaN(bid) && !isNaN(ask)) {
        options.push({
          strike,
          bid,
          ask,
          price: price && !isNaN(price) ? price : undefined,
        });
      }
    }
    
    return options;
  } catch (err) {
    throw new Error('Invalid options data format');
  }
};

export const validateManualInputs = (
  price: string,
  money: string,
  percentageIncrements: string,
  options: ManualOptionProfile[]
) => {
  const securityPrice = parseFloat(price);
  const investmentAmount = parseFloat(money);
  const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));

  if (isNaN(securityPrice) || securityPrice <= 0) {
    throw new Error('Security price must be a positive number');
  }
  
  if (isNaN(investmentAmount) || investmentAmount <= 0) {
    throw new Error('Investment amount must be a positive number');
  }
  
  if (percentages.some(p => isNaN(p))) {
    throw new Error('All percentage increments must be valid numbers');
  }
  
  if (options.length === 0) {
    throw new Error('Please provide at least one option');
  }

  return {
    securityPrice,
    investmentAmount,
    percentages,
  };
};

export const calculateManualOptionsResults = (
  options: ManualOptionProfile[],
  securityPrice: number,
  investmentAmount: number,
  percentages: number[]
): Map<number, OptionResult[]> => {
  const sellPrices = percentages.map(percentage =>
    roundToCents(securityPrice * (1 + (percentage / 100)))
  );

  const topOptions = new Map<number, OptionResult[]>();
  
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

      const currentTop = topOptions.get(sellPrice) ?? [];
      currentTop.push({ 
        gainLoss, 
        actualInvestment, 
        shares, 
        contracts,
        percentageGainLoss,
        ...option 
      });
      currentTop.sort((a, b) => b.gainLoss - a.gainLoss);
      const updatedTop = currentTop.slice(0, 5);
      topOptions.set(sellPrice, updatedTop);
    }
  }

  return topOptions;
};
