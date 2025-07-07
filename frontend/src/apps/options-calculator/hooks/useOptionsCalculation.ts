import { createMemo } from 'solid-js';
import { OptionQuote, StockQuote } from '../enhancedOptionsService';
import { roundMidpointUp, roundToCents, calculateTargetPrices } from '../utils/optionsCalculationUtils';
import { ManualOptionProfile, OptionResult } from './useManualOptions';

interface UseOptionsCalculationProps {
  useManualData: boolean;
  stockQuote: StockQuote | null;
  callsChain: OptionQuote[];
  putsChain: OptionQuote[];
  manualSecurityPrice: string;
  percentageIncrements: string;
  investmentAmount: string;
  manualResults: Map<number, OptionResult[]>;
}

export const useOptionsCalculation = ({
  useManualData,
  stockQuote,
  callsChain,
  putsChain,
  manualSecurityPrice,
  percentageIncrements,
  investmentAmount,
  manualResults,
}: UseOptionsCalculationProps) => {
  
  const getTargetPrices = createMemo(() => {
    const currentPrice = useManualData 
      ? parseFloat(manualSecurityPrice) 
      : stockQuote?.price || 0;
    
    return calculateTargetPrices(currentPrice, percentageIncrements);
  }, [useManualData, manualSecurityPrice, stockQuote?.price, percentageIncrements]);

  // Calculate best call options for each percentage increase
  const getBestCallsAtEachPercentage = createMemo(() => {
    if (useManualData || !stockQuote || callsChain.length === 0) return new Map();
    
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    const investment = parseFloat(investmentAmount) || 10000;
    const bestAtPercentage = new Map<number, { option: OptionQuote; profit: number }>();
    
    percentages.forEach(percentage => {
      const targetPrice = stockQuote.price * (1 + percentage / 100);
      let bestOption: OptionQuote | null = null;
      let bestProfit = -Infinity;
      
      callsChain.forEach((option: OptionQuote) => {
        const premiumPaid = roundMidpointUp(option.bid, option.ask);
        const contractsAffordable = Math.floor(investment / (premiumPaid * 100));
        
        if (contractsAffordable > 0 && contractsAffordable <= 10000) { // Reasonable contract limit
          const optionValue = Math.max(0, targetPrice - option.strike);
          const profitPerShare = optionValue - premiumPaid;
          const totalProfit = profitPerShare * 100 * contractsAffordable;
          
          // Sanity check for unrealistic profits (over $1M suggests data issue)
          if (Math.abs(totalProfit) < 1000000 && totalProfit > bestProfit) {
            bestProfit = totalProfit;
            bestOption = option;
          }
        }
      });
      
      if (bestOption) {
        bestAtPercentage.set(percentage, { option: bestOption, profit: bestProfit });
      }
    });
    
    return bestAtPercentage;
  }, [useManualData, stockQuote, callsChain, percentageIncrements, investmentAmount]);

  // Calculate best put options for each percentage decrease
  const getBestPutsAtEachPercentage = createMemo(() => {
    if (useManualData || !stockQuote || putsChain.length === 0) return new Map();
    
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    const investment = parseFloat(investmentAmount) || 10000;
    const bestAtPercentage = new Map<number, { option: OptionQuote; profit: number }>();
    
    percentages.forEach(percentage => {
      const targetPrice = stockQuote.price * (1 - percentage / 100); // Decrease for puts
      let bestOption: OptionQuote | null = null;
      let bestProfit = -Infinity;
      
      putsChain.forEach((option: OptionQuote) => {
        const premiumPaid = roundMidpointUp(option.bid, option.ask);
        const contractsAffordable = Math.floor(investment / (premiumPaid * 100));
        
        if (contractsAffordable > 0 && contractsAffordable <= 10000) { // Reasonable contract limit
          const optionValue = Math.max(0, option.strike - targetPrice);
          const profitPerShare = optionValue - premiumPaid;
          const totalProfit = profitPerShare * 100 * contractsAffordable;
          
          // Sanity check for unrealistic profits (over $1M suggests data issue)
          if (Math.abs(totalProfit) < 1000000 && totalProfit > bestProfit) {
            bestProfit = totalProfit;
            bestOption = option;
          }
        }
      });
      
      if (bestOption) {
        bestAtPercentage.set(percentage, { option: bestOption, profit: bestProfit });
      }
    });
    
    return bestAtPercentage;
  }, [useManualData, stockQuote, putsChain, percentageIncrements, investmentAmount]);

  // Calculate best manual options for each percentage increase
  const getBestManualOptionsAtEachPercentage = createMemo(() => {
    if (!useManualData || manualResults.size === 0) return new Map();
    
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    const currentPrice = parseFloat(manualSecurityPrice);
    const bestAtPercentage = new Map<number, OptionResult>();
    
    percentages.forEach(percentage => {
      const targetPrice = currentPrice * (1 + percentage / 100);
      const resultsAtTargetPrice = manualResults.get(roundToCents(targetPrice));
      
      if (resultsAtTargetPrice && resultsAtTargetPrice.length > 0) {
        // The results are already sorted by gainLoss descending, so first is best
        bestAtPercentage.set(percentage, resultsAtTargetPrice[0]);
      }
    });
    
    return bestAtPercentage;
  }, [useManualData, manualResults, percentageIncrements, manualSecurityPrice]);

  const calculateManualOptionsReturns = (
    options: ManualOptionProfile[],
    securityPrice: number,
    investment: number,
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

      const contracts = Math.floor(investment / totalCostPerContract);
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

  return {
    getTargetPrices,
    getBestCallsAtEachPercentage,
    getBestPutsAtEachPercentage,
    getBestManualOptionsAtEachPercentage,
    calculateManualOptionsReturns,
  };
};
