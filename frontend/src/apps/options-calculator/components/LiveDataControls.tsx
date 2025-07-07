import { Show } from 'solid-js';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
} from '@suid/material';
import { Refresh, Warning } from '@suid/icons-material';

interface LiveDataControlsProps {
  symbol: string;
  setSymbol: (value: string) => void;
  investmentAmount: string;
  setInvestmentAmount: (value: string) => void;
  percentageIncrements: string;
  setPercentageIncrements: (value: string) => void;
  loading: boolean;
  onFetchData: () => void;
  isApiConfigured: boolean;
}

export const LiveDataControls = (props: LiveDataControlsProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 2 }}>
      <TextField
        label="Stock Symbol"
        value={props.symbol}
        onChange={(e) => props.setSymbol(e.target.value.toUpperCase())}
        placeholder="AAPL"
        size="small"
        sx={{ minWidth: 120 }}
        helperText="Enter ticker symbol"
      />
      
      <TextField
        label="Investment Amount ($)"
        value={props.investmentAmount}
        onChange={(e) => props.setInvestmentAmount(e.target.value)}
        type="number"
        size="small"
        sx={{ minWidth: 150 }}
        helperText="Total investment budget"
      />
      
      <TextField
        label="Price Change % (comma-separated)"
        value={props.percentageIncrements}
        onChange={(e) => props.setPercentageIncrements(e.target.value)}
        placeholder="5,10,15,20,25"
        size="small"
        sx={{ minWidth: 200 }}
        helperText="Expected stock price changes"
      />
      
      <Button
        variant="contained"
        onClick={props.onFetchData}
        disabled={props.loading || !props.isApiConfigured}
        startIcon={
          <Show when={props.loading} fallback={
            <Show when={!props.isApiConfigured} fallback={<Refresh />}>
              <Warning />
            </Show>
          }>
            <CircularProgress size={16} />
          </Show>
        }
        color={!props.isApiConfigured ? "warning" : "primary"}
        title={!props.isApiConfigured ? "Please configure your API endpoints first" : ""}
      >
        {props.loading ? 'Loading...' : !props.isApiConfigured ? 'Configure APIs First' : 'Fetch Data'}
      </Button>
    </Box>
  );
};
