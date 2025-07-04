import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';

interface TargetPricesDisplayProps {
  sellPrices: number[];
  percentageIncrements: string;
  useManualData: boolean;
  manualSecurityPrice: string;
  stockQuote: { price: number } | null;
}

export const TargetPricesDisplay: React.FC<TargetPricesDisplayProps> = ({
  sellPrices,
  percentageIncrements,
  useManualData,
  manualSecurityPrice,
  stockQuote,
}) => {
  if (sellPrices.length === 0) return null;

  const currentPrice = useManualData ? parseFloat(manualSecurityPrice) : stockQuote?.price || 0;
  const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Target Sell Prices
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These are the projected stock prices based on your percentage increase inputs. 
          Each sell price is calculated as: Current Price × (1 + Percentage/100)
          {useManualData && (
            <>
              <br />
              <strong>Example:</strong> ${manualSecurityPrice} × 1.05 = ${(parseFloat(manualSecurityPrice) * 1.05).toFixed(2)} (+5%)
            </>
          )}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sellPrices.map((price, index) => {
            const increase = price - currentPrice;
            return (
              <Chip
                key={index}
                label={`$${price.toFixed(2)} (+${percentages[index]}% / +$${increase.toFixed(2)})`}
                variant="outlined"
                color="primary"
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};
