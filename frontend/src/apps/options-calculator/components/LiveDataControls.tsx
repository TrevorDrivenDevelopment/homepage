import React from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface LiveDataControlsProps {
  symbol: string;
  setSymbol: (symbol: string) => void;
  investmentAmount: string;
  setInvestmentAmount: (amount: string) => void;
  percentageIncrements: string;
  setPercentageIncrements: (increments: string) => void;
  loading: boolean;
  onFetchData: () => void;
  isApiConfigured: boolean;
}

export const LiveDataControls: React.FC<LiveDataControlsProps> = ({
  symbol,
  setSymbol,
  investmentAmount,
  setInvestmentAmount,
  percentageIncrements,
  setPercentageIncrements,
  loading,
  onFetchData,
  isApiConfigured,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 2 }}>
      <TextField
        label="Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="AAPL"
        size="small"
        sx={{ minWidth: 120 }}
        helperText="Enter ticker symbol"
      />
      
      <TextField
        label="Investment Amount ($)"
        value={investmentAmount}
        onChange={(e) => setInvestmentAmount(e.target.value)}
        type="number"
        size="small"
        sx={{ minWidth: 150 }}
        helperText="Total investment budget"
      />
      
      <TextField
        label="Price Change % (comma-separated)"
        value={percentageIncrements}
        onChange={(e) => setPercentageIncrements(e.target.value)}
        placeholder="5,10,15,20,25"
        size="small"
        sx={{ minWidth: 200 }}
        helperText="Expected stock price changes"
      />
      
      <Button
        variant="contained"
        onClick={onFetchData}
        disabled={loading || !isApiConfigured}
        startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
      >
        {loading ? 'Loading...' : 'Fetch Data'}
      </Button>
    </Box>
  );
};
