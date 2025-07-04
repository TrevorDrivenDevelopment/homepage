import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { StockQuote } from '../enhancedOptionsService';

interface StockQuoteCardProps {
  stockQuote: StockQuote;
}

export const StockQuoteCard: React.FC<StockQuoteCardProps> = ({ stockQuote }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5">
            {stockQuote.symbol}
          </Typography>
          <Typography variant="h4" color="primary">
            ${stockQuote.price.toFixed(2)}
          </Typography>
          <Chip
            icon={(stockQuote.change ?? 0) >= 0 ? <TrendingUp /> : <TrendingDown />}
            label={`${(stockQuote.change ?? 0) >= 0 ? '+' : ''}${(stockQuote.change ?? 0).toFixed(2)} (${stockQuote.changePercent || '0.00%'})`}
            color={(stockQuote.change ?? 0) >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date(stockQuote.lastUpdated || new Date().toISOString()).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
