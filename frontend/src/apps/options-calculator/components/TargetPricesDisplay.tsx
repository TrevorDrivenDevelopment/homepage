import { Show, For, createMemo } from 'solid-js';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@suid/material';

interface TargetPricesDisplayProps {
  sellPrices: number[];
  percentageIncrements: string;
  useManualData: boolean;
  manualSecurityPrice: string;
  stockQuote: { price: number } | null;
}

export const TargetPricesDisplay = (props: TargetPricesDisplayProps) => {
  const currentPrice = createMemo(() => 
    props.useManualData ? parseFloat(props.manualSecurityPrice) : props.stockQuote?.price || 0
  );
  
  const percentages = createMemo(() => 
    props.percentageIncrements.split(',').map(p => parseFloat(p.trim()))
  );

  return (
    <Show when={props.sellPrices.length > 0}>
      <Card sx={{ 
        mb: 3,
        backgroundColor: '#4A6E8D',
        border: '1px solid #4A6E8D',
        color: '#ffffff'
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
            Target Sell Prices
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#7CE2FF' }}>
            These are the projected stock prices based on your percentage increase inputs. 
            Each sell price is calculated as: Current Price × (1 + Percentage/100)
            <Show when={props.useManualData}>
              <br />
              <strong>Example:</strong> ${props.manualSecurityPrice} × 1.05 = ${(parseFloat(props.manualSecurityPrice) * 1.05).toFixed(2)} (+5%)
            </Show>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <For each={props.sellPrices}>
              {(price, index) => {
                const increase = price - currentPrice();
                return (
                  <Chip
                    label={`$${price.toFixed(2)} (+${percentages()[index()]}% / +$${increase.toFixed(2)})`}
                    variant="outlined"
                    color="primary"
                    sx={{
                      backgroundColor: '#1B3A57',
                      color: '#7CE2FF',
                      borderColor: '#7CE2FF',
                      '&:hover': {
                        backgroundColor: '#4A6E8D'
                      }
                    }}
                  />
                );
              }}
            </For>
          </Box>
        </CardContent>
      </Card>
    </Show>
  );
};
