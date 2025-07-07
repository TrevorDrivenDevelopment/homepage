import { Show, createMemo } from 'solid-js';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@suid/material';
import { TrendingUp, TrendingDown } from '@suid/icons-material';
import { StockQuote } from '../enhancedOptionsService';

interface StockQuoteCardProps {
  stockQuote: StockQuote;
}

export const StockQuoteCard = (props: StockQuoteCardProps) => {
  const currentPrice = () => props.stockQuote.price;
  const week52High = () => props.stockQuote.week52High;
  const week52Low = () => props.stockQuote.week52Low;
  
  // Calculate position within 52-week range
  const get52WeekPosition = createMemo(() => {
    const high = week52High();
    const low = week52Low();
    if (!high || !low) return null;
    const range = high - low;
    const position = ((currentPrice() - low) / range) * 100;
    return Math.round(position);
  });

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="h5">
            {props.stockQuote.symbol}
          </Typography>
          <Typography variant="h4" color="primary">
            ${props.stockQuote.price.toFixed(2)}
          </Typography>
          <Chip
            icon={(props.stockQuote.change ?? 0) >= 0 ? <TrendingUp /> : <TrendingDown />}
            label={`${(props.stockQuote.change ?? 0) >= 0 ? '+' : ''}${(props.stockQuote.change ?? 0).toFixed(2)} (${props.stockQuote.changePercent || '0.00%'})`}
            color={(props.stockQuote.change ?? 0) >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>

        <Show when={week52High() && week52Low()}>
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
                  ${week52Low()?.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  High:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${week52High()?.toFixed(2)}
                </Typography>
              </Box>
              <Show when={get52WeekPosition() !== null}>
                <Chip
                  label={`${get52WeekPosition()}% of range`}
                  size="small"
                  color={get52WeekPosition()! > 75 ? 'warning' : get52WeekPosition()! < 25 ? 'info' : 'default'}
                  variant="outlined"
                />
              </Show>
            </Box>
          </Box>
        </Show>

        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date(props.stockQuote.lastUpdated || new Date().toISOString()).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};
