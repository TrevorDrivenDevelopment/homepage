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
  const currentPrice = stockQuote.price;
  const week52High = stockQuote.week52High;
  const week52Low = stockQuote.week52Low;
  
  // Calculate position within 52-week range
  const get52WeekPosition = () => {
    if (!week52High || !week52Low) return null;
    const range = week52High - week52Low;
    const position = ((currentPrice - week52Low) / range) * 100;
    return Math.round(position);
  };

  const position52Week = get52WeekPosition();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
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
        </Box>

        {/* 52-Week Range Information */}
        {week52High && week52Low && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              52-Week Range
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Low:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${week52Low.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  High:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${week52High.toFixed(2)}
                </Typography>
              </Box>
              {position52Week !== null && (
                <Chip
                  label={`${position52Week}% of range`}
                  size="small"
                  color={position52Week > 75 ? 'warning' : position52Week < 25 ? 'info' : 'default'}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date(stockQuote.lastUpdated || new Date().toISOString()).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};
