import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { OptionQuote, StockQuote } from '../enhancedOptionsService';
import { OptionsTable } from './OptionsTable';

interface OptionsGroupedByExpirationProps {
  options: OptionQuote[];
  stockQuote: StockQuote | null;
  onOptionClick: (option: OptionQuote) => void;
  bestAtPercentages: Map<number, { option: OptionQuote; profit: number }>;
  optionType: 'call' | 'put';
  investmentAmount: string;
  percentageIncrements: string;
}

export const OptionsGroupedByExpiration: React.FC<OptionsGroupedByExpirationProps> = ({
  options,
  stockQuote,
  onOptionClick,
  bestAtPercentages,
  optionType,
  investmentAmount,
  percentageIncrements,
}) => {
  // Group options by expiration date
  const groupedOptions = options.reduce((groups, option) => {
    const expiration = option.expiration;
    if (!groups[expiration]) {
      groups[expiration] = [];
    }
    groups[expiration].push(option);
    return groups;
  }, {} as Record<string, OptionQuote[]>);

  // Sort expiration dates chronologically
  const sortedExpirations = Object.keys(groupedOptions).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Default to expanding the first (nearest) expiration
  const [expandedPanel, setExpandedPanel] = useState<string>(sortedExpirations[0] || '');

  const handleAccordionChange = (expiration: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? expiration : '');
  };

  const getDaysToExpiry = (expiration: string) => {
    const daysToExpiry = Math.ceil((new Date(expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysToExpiry;
  };

  const formatExpirationDate = (expiration: string) => {
    return new Date(expiration).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function for rounding midpoint up (same as in useOptionsCalculation)
  const roundMidpointUp = (bid: number, ask: number): number => {
    const midpoint = (bid + ask) / 2;
    return Math.ceil(midpoint * 100) / 100;
  };

  // Calculate best options for a specific expiration date group using the same logic as global calculation
  const getBestOptionsForExpiration = (expirationOptions: OptionQuote[]) => {
    if (!stockQuote) return new Map();
    
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    const investment = parseFloat(investmentAmount) || 10000;
    const bestForExpiration = new Map<number, { option: OptionQuote; profit: number }>();
    
    percentages.forEach(percentage => {
      const targetPrice = optionType === 'call' 
        ? stockQuote.price * (1 + percentage / 100)
        : stockQuote.price * (1 - percentage / 100);
      let bestOption: OptionQuote | null = null;
      let bestProfit = -Infinity;
      
      expirationOptions.forEach((option: OptionQuote) => {
        const premiumPaid = roundMidpointUp(option.bid, option.ask);
        const contractsAffordable = Math.floor(investment / (premiumPaid * 100));
        
        if (contractsAffordable > 0 && contractsAffordable <= 10000) { // Reasonable contract limit
          let optionValue = 0;
          if (optionType === 'call') {
            optionValue = Math.max(0, targetPrice - option.strike);
          } else {
            optionValue = Math.max(0, option.strike - targetPrice);
          }
          
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
        bestForExpiration.set(percentage, { option: bestOption, profit: bestProfit });
      }
    });
    
    return bestForExpiration;
  };

  if (sortedExpirations.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No {optionType} options available
      </Typography>
    );
  }

  return (
    <Box>
      {sortedExpirations.map((expiration) => {
        const expirationOptions = groupedOptions[expiration];
        const daysToExpiry = getDaysToExpiry(expiration);
        const isExpanded = expandedPanel === expiration;
        
        // Calculate best options for this specific expiration date
        const bestForThisExpiration = getBestOptionsForExpiration(expirationOptions);
        const bestOptionsInGroup = bestForThisExpiration.size;

        return (
          <Accordion
            key={expiration}
            expanded={isExpanded}
            onChange={handleAccordionChange(expiration)}
            sx={{ 
              mb: 1,
              '&:before': { display: 'none' }, // Remove default divider
              boxShadow: 1,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: isExpanded ? 'action.selected' : 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' },
                minHeight: 64,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" component="div">
                    {formatExpirationDate(expiration)}
                  </Typography>
                  <Chip 
                    label={`${daysToExpiry} days`}
                    size="small"
                    color={daysToExpiry <= 7 ? 'error' : daysToExpiry <= 30 ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`${expirationOptions.length} contracts`}
                    size="small"
                    variant="outlined"
                  />
                  {bestOptionsInGroup > 0 && (
                    <Chip 
                      label={`${bestOptionsInGroup} best`}
                      size="small"
                      color="primary"
                      variant="filled"
                    />
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <OptionsTable
                options={expirationOptions}
                stockQuote={stockQuote}
                onOptionClick={onOptionClick}
                bestAtPercentages={bestForThisExpiration}
                optionType={optionType}
              />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};
