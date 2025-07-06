import React from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Refresh, Warning } from '@mui/icons-material';

interface LiveDataControlsProps {
  symbol: string;
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
  investmentAmount: string;
  setInvestmentAmount: React.Dispatch<React.SetStateAction<string>>;
  percentageIncrements: string;
  setPercentageIncrements: React.Dispatch<React.SetStateAction<string>>;
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
      
      <Tooltip title={!isApiConfigured ? "Please configure your API endpoints first" : ""}>
        <span>
          <Button
            variant="contained"
            onClick={onFetchData}
            disabled={loading || !isApiConfigured}
            startIcon={loading ? <CircularProgress size={16} /> : !isApiConfigured ? <Warning /> : <Refresh />}
            color={!isApiConfigured ? "warning" : "primary"}
          >
            {loading ? 'Loading...' : !isApiConfigured ? 'Configure APIs First' : 'Fetch Data'}
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};
