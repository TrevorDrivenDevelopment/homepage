import React from 'react';
import {
  Alert,
  Box,
  Chip,
  Typography,
} from '@mui/material';

interface BestOptionsSummaryProps {
  bestAtPercentages: Map<number, { option: any; profit: number }>;
  optionType: 'call' | 'put';
}

export const BestOptionsSummary: React.FC<BestOptionsSummaryProps> = ({
  bestAtPercentages,
  optionType,
}) => {
  if (bestAtPercentages.size === 0) return null;

  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Best {optionType.toUpperCase()} Options by Price {optionType === 'call' ? 'Increase' : 'Decrease'}:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Array.from(bestAtPercentages.entries())
          .sort(([a], [b]) => a - b)
          .map(([percentage, { option, profit }]) => (
            <Chip
              key={percentage}
              label={`${optionType === 'call' ? '+' : '-'}${percentage}%: $${option.strike} Strike (${profit >= 0 ? '+' : ''}$${profit.toFixed(0)} profit)`}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
      </Box>
    </Alert>
  );
};
