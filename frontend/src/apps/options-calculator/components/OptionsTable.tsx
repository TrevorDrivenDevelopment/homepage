import { For } from 'solid-js';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
} from '@suid/material';
import { OptionQuote, StockQuote } from '../enhancedOptionsService';

interface OptionsTableProps {
  options: OptionQuote[];
  stockQuote: StockQuote | null;
  // eslint-disable-next-line no-unused-vars
  onOptionClick: (option: OptionQuote) => void;
  bestAtPercentages: Map<number, { option: OptionQuote; profit: number }>;
  optionType: 'call' | 'put';
}

export const OptionsTable = (props: OptionsTableProps) => {
  const roundMidpointUp = (bid: number, ask: number): number => {
    const midpoint = (bid + ask) / 2;
    return Math.ceil(midpoint * 100) / 100;
  };

  const getMoneyness = (option: OptionQuote, stockPrice: number, type: 'call' | 'put') => {
    if (type === 'call') {
      const isITM = stockPrice > option.strike;
      const isATM = Math.abs(stockPrice - option.strike) <= 2.50;
      const isOTM = stockPrice < option.strike;
      
      if (isATM) return { label: 'ATM', color: 'warning' as const };
      if (isITM) return { label: 'ITM', color: 'success' as const };
      if (isOTM) return { label: 'OTM', color: 'default' as const };
    } else {
      // For puts, ITM/OTM is reversed
      const isITM = stockPrice < option.strike;
      const isATM = Math.abs(stockPrice - option.strike) <= 2.50;
      const isOTM = stockPrice > option.strike;
      
      if (isATM) return { label: 'ATM', color: 'warning' as const };
      if (isITM) return { label: 'ITM', color: 'success' as const };
      if (isOTM) return { label: 'OTM', color: 'default' as const };
    }
    
    return { label: 'OTM', color: 'default' as const };
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Strike</TableCell>
            <TableCell>Bid</TableCell>
            <TableCell>Ask</TableCell>
            <TableCell>Mid Price</TableCell>
            <TableCell>Volume</TableCell>
            <TableCell>Open Interest</TableCell>
            <TableCell>IV</TableCell>
            <TableCell>Moneyness</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={props.options}>{(option) => {
            const midPrice = roundMidpointUp(option.bid, option.ask);
            const moneyness = props.stockQuote ? option.strike / props.stockQuote.price : 1;
            const moneynessInfo = props.stockQuote ? getMoneyness(option, props.stockQuote.price, props.optionType) : null;
            
            // Find which percentages this option is best for
            const bestAtPercentagesList: number[] = [];
            props.bestAtPercentages.forEach((value, percentage) => {
              if (value.option.symbol === option.symbol) {
                bestAtPercentagesList.push(percentage);
              }
            });
            
            return (
              <TableRow
                onClick={() => props.onOptionClick(option)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: bestAtPercentagesList.length > 0 ? 'primary.50' : 'inherit',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      ${option.strike}
                      {moneynessInfo && (
                        <Chip 
                          label={moneynessInfo.label} 
                          size="small" 
                          color={moneynessInfo.color} 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                    {bestAtPercentagesList.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <For each={bestAtPercentagesList}>{(percentage) => (
                          <Chip
                            label={`Best at +${percentage}%`}
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ fontSize: '0.65rem', height: '18px' }}
                          />
                        )}</For>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>${option.bid.toFixed(2)}</TableCell>
                <TableCell>${option.ask.toFixed(2)}</TableCell>
                <TableCell>
                  <strong>${midPrice.toFixed(2)}</strong>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    (Used for calculations)
                  </Typography>
                </TableCell>
                <TableCell>{option.volume.toLocaleString()}</TableCell>
                <TableCell>{option.openInterest.toLocaleString()}</TableCell>
                <TableCell>{((option.impliedVolatility || 0) * 100).toFixed(1)}%</TableCell>
                <TableCell>{moneyness.toFixed(3)}</TableCell>
              </TableRow>
            );
          }}</For>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
