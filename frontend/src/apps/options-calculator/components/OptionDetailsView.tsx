import React from 'react';
import {
  Alert,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { OptionQuote, StockQuote } from '../enhancedOptionsService';

interface OptionDetailsViewProps {
  option: OptionQuote;
  stockQuote: StockQuote;
  investmentAmount: string;
  percentageIncrements: string;
  optionType: 'call' | 'put';
  onBack: () => void;
}

export const OptionDetailsView: React.FC<OptionDetailsViewProps> = ({
  option,
  stockQuote,
  investmentAmount,
  percentageIncrements,
  optionType,
  onBack,
}) => {
  const roundMidpointUp = (bid: number, ask: number): number => {
    const midpoint = (bid + ask) / 2;
    return Math.ceil(midpoint * 100) / 100;
  };

  const calculateOptionValue = (stockPrice: number, strike: number, type: 'call' | 'put'): number => {
    if (type === 'call') {
      return Math.max(0, stockPrice - strike);
    } else {
      return Math.max(0, strike - stockPrice);
    }
  };

  const premiumPaid = roundMidpointUp(option.bid, option.ask);
  const contractsAffordable = Math.floor(parseFloat(investmentAmount) / (premiumPaid * 100));

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={onBack} sx={{ p: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">
          Potential Returns for ${option.strike} Strike {optionType.toUpperCase()}
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Calculation Details:</strong><br />
          • Cost per contract: ${premiumPaid.toFixed(2)} × 100 = ${(premiumPaid * 100).toFixed(2)}<br />
          • Number of contracts with ${investmentAmount}: {contractsAffordable}<br />
          • At expiration, profit = (max({optionType === 'call' ? 'Stock Price - Strike' : 'Strike - Stock Price'}, 0) - Premium Paid) × 100 × Contracts
        </Typography>
      </Alert>

      <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Price {optionType === 'call' ? 'Increase' : 'Decrease'}</TableCell>
              <TableCell>Stock Price</TableCell>
              <TableCell>Option Value</TableCell>
              <TableCell>Gain/Loss</TableCell>
              <TableCell>% Return</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {percentageIncrements.split(',').map((increment) => {
              const percentChange = parseFloat(increment.trim());
              const multiplier = optionType === 'call' ? (1 + percentChange / 100) : (1 - percentChange / 100);
              const newStockPrice = stockQuote.price * multiplier;
              const optionValue = calculateOptionValue(newStockPrice, option.strike, optionType);
              const profitPerShare = optionValue - premiumPaid;
              const totalProfit = profitPerShare * 100 * contractsAffordable;
              const percentReturn = (totalProfit / parseFloat(investmentAmount)) * 100;

              return (
                <TableRow key={increment}>
                  <TableCell>{optionType === 'call' ? '+' : '-'}{percentChange}%</TableCell>
                  <TableCell>${newStockPrice.toFixed(2)}</TableCell>
                  <TableCell>${optionValue.toFixed(2)}</TableCell>
                  <TableCell
                    sx={{
                      color: totalProfit >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(0)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: percentReturn >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {percentReturn >= 0 ? '+' : ''}{percentReturn.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
