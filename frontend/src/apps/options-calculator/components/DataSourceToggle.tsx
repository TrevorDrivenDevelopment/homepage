import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Button,
  TextField,
} from '@mui/material';
import { Edit, CloudDownload } from '@mui/icons-material';

interface DataSourceToggleProps {
  useManualData: boolean;
  setUseManualData: React.Dispatch<React.SetStateAction<boolean>>;
  apiEndpoints: {
    stockQuoteUrl: string;
    optionsChainUrl: string;
    apiKey: string;
  };
  setApiEndpoints: React.Dispatch<React.SetStateAction<{
    stockQuoteUrl: string;
    optionsChainUrl: string;
    apiKey: string;
  }>>;
  showApiConfig: boolean;
  setShowApiConfig: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DataSourceToggle: React.FC<DataSourceToggleProps> = ({
  useManualData,
  setUseManualData,
  apiEndpoints,
  setApiEndpoints,
  showApiConfig,
  setShowApiConfig,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={useManualData}
              onChange={(e) => setUseManualData(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {useManualData ? <Edit /> : <CloudDownload />}
              <Typography>
                {useManualData ? 'Manual Data Entry Mode' : 'Live Data Mode'}
              </Typography>
            </Box>
          }
        />
        
        {!useManualData && (
          <Box sx={{ mt: 2 }}>
            {!apiEndpoints.stockQuoteUrl || !apiEndpoints.optionsChainUrl || !apiEndpoints.apiKey ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>API Configuration Required:</strong> To use live data mode, you must configure your own API endpoints that provide real market data.
                  {' '}
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => setShowApiConfig(true)}
                    sx={{ ml: 1 }}
                  >
                    Configure APIs Now
                  </Button>
                  {' '}
                  <Button 
                    size="small" 
                    variant="outlined"
                    href="#api-help"
                    sx={{ ml: 1 }}
                  >
                    API Help
                  </Button>
                </Typography>
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>APIs Configured:</strong> Custom API endpoints are configured and ready to use.
                  {' '}
                  <Button 
                    size="small" 
                    onClick={() => setShowApiConfig(!showApiConfig)}
                    sx={{ ml: 1 }}
                  >
                    {showApiConfig ? 'Hide Config' : 'Edit Config'}
                  </Button>
                  {' '}
                  <Button 
                    size="small" 
                    variant="outlined"
                    href="#api-help"
                    sx={{ ml: 1 }}
                  >
                    API Help
                  </Button>
                </Typography>
              </Alert>
            )}
            
            {showApiConfig && (
              <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  API Endpoint Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Enter your API endpoints that follow the required contract (see API Help below).
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    label="Stock Quote API URL"
                    value={apiEndpoints.stockQuoteUrl}
                    onChange={(e) => setApiEndpoints(prev => ({ ...prev, stockQuoteUrl: e.target.value }))}
                    placeholder="https://your-api.com/quote/{symbol}"
                    size="small"
                    fullWidth
                    helperText="URL should include {symbol} placeholder, e.g., https://api.example.com/quote/{symbol}"
                  />
                  <TextField
                    label="Options Chain API URL"
                    value={apiEndpoints.optionsChainUrl}
                    onChange={(e) => setApiEndpoints(prev => ({ ...prev, optionsChainUrl: e.target.value }))}
                    placeholder="https://your-api.com/options/{symbol}"
                    size="small"
                    fullWidth
                    helperText="URL should include {symbol} placeholder, e.g., https://api.example.com/options/{symbol}"
                  />
                  <TextField
                    label="API Key"
                    value={apiEndpoints.apiKey}
                    onChange={(e) => setApiEndpoints(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="your-api-key-here"
                    size="small"
                    fullWidth
                    type="password"
                    helperText="Your API key will be sent as X-API-Key header to your custom endpoints."
                  />
                </Box>
              </Card>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
