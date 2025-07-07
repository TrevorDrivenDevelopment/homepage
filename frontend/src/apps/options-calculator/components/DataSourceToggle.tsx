import { Show } from 'solid-js';
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
} from '@suid/material';
import { Edit, CloudDownload } from '@suid/icons-material';
import type { Setter } from 'solid-js';

interface DataSourceToggleProps {
  useManualData: boolean;
  setUseManualData: Setter<boolean>;
  apiEndpoints: {
    stockQuoteUrl: string;
    optionsChainUrl: string;
    apiKey: string;
  };
  setApiEndpoints: Setter<{
    stockQuoteUrl: string;
    optionsChainUrl: string;
    apiKey: string;
  }>;
  showApiConfig: boolean;
  setShowApiConfig: Setter<boolean>;
}

export const DataSourceToggle = (props: DataSourceToggleProps) => {
  return (
    <Card sx={{ 
      mb: 3,
      backgroundColor: '#4A6E8D',
      border: '1px solid #4A6E8D'
    }}>
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={props.useManualData}
              onChange={(e, checked) => props.setUseManualData(checked)}
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#7CE2FF',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#7CE2FF',
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {props.useManualData ? <Edit sx={{ color: '#7CE2FF' }} /> : <CloudDownload sx={{ color: '#7CE2FF' }} />}
              <Typography sx={{ color: '#ffffff' }}>
                {props.useManualData ? 'Manual Data Entry Mode' : 'Live Data Mode'}
              </Typography>
            </Box>
          }
        />
        
        <Show when={!props.useManualData}>
          <Box sx={{ mt: 2 }}>
            <Show 
              when={props.apiEndpoints.stockQuoteUrl && props.apiEndpoints.optionsChainUrl && props.apiEndpoints.apiKey}
              fallback={              <Alert severity="warning" sx={{ 
                mb: 2,
                backgroundColor: '#1B3A57',
                borderColor: '#ff6b6b',
                color: '#ffffff',
                '& .MuiAlert-icon': {
                  color: '#ff6b6b'
                }
              }}>
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  <strong>API Configuration Required:</strong> To use live data mode, you must configure your own API endpoints that provide real market data.
                  {' '}
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => props.setShowApiConfig(true)}
                    sx={{ 
                      ml: 1,
                      backgroundColor: '#7CE2FF',
                      color: '#1B3A57',
                      '&:hover': {
                        backgroundColor: '#4A6E8D'
                      }
                    }}
                  >
                    Configure APIs Now
                  </Button>
                  {' '}
                  <Button 
                    size="small" 
                    variant="outlined"
                    href="#api-help"
                    sx={{ 
                      ml: 1,
                      borderColor: '#7CE2FF',
                      color: '#7CE2FF',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: '#4A6E8D'
                      }
                    }}
                  >
                    API Help
                  </Button>
                </Typography>
              </Alert>
              }
            >
              <Alert severity="success" sx={{ 
                mb: 2,
                backgroundColor: '#1B3A57',
                borderColor: '#7CE2FF',
                color: '#ffffff',
                '& .MuiAlert-icon': {
                  color: '#7CE2FF'
                }
              }}>
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  <strong>APIs Configured:</strong> Custom API endpoints are configured and ready to use.
                  {' '}
                  <Button 
                    size="small" 
                    onClick={() => props.setShowApiConfig(!props.showApiConfig)}
                    sx={{ 
                      ml: 1,
                      color: '#7CE2FF',
                      '&:hover': {
                        backgroundColor: '#4A6E8D'
                      }
                    }}
                  >
                    {props.showApiConfig ? 'Hide Config' : 'Edit Config'}
                  </Button>
                  {' '}
                  <Button 
                    size="small" 
                    variant="outlined"
                    href="#api-help"
                    sx={{ 
                      ml: 1,
                      borderColor: '#7CE2FF',
                      color: '#7CE2FF',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: '#4A6E8D'
                      }
                    }}
                  >
                    API Help
                  </Button>
                </Typography>
              </Alert>
            </Show>
            
            <Show when={props.showApiConfig}>
              <Card variant="outlined" sx={{ 
                p: 2, 
                mb: 2,
                backgroundColor: '#1B3A57',
                borderColor: '#4A6E8D'
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffffff' }}>
                  API Endpoint Configuration
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ color: '#7CE2FF' }}>
                  Enter your API endpoints that follow the required contract (see API Help below).
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    label="Stock Quote API URL"
                    value={props.apiEndpoints.stockQuoteUrl}
                    onChange={(e, value) => props.setApiEndpoints(prev => ({ ...prev, stockQuoteUrl: value }))}
                    placeholder="https://your-api.com/quote/{symbol}"
                    size="small"
                    fullWidth
                    helperText="URL should include {symbol} placeholder, e.g., https://api.example.com/quote/{symbol}"
                  />
                  <TextField
                    label="Options Chain API URL"
                    value={props.apiEndpoints.optionsChainUrl}
                    onChange={(e, value) => props.setApiEndpoints(prev => ({ ...prev, optionsChainUrl: value }))}
                    placeholder="https://your-api.com/options/{symbol}"
                    size="small"
                    fullWidth
                    helperText="URL should include {symbol} placeholder, e.g., https://api.example.com/options/{symbol}"
                  />
                  <TextField
                    label="API Key"
                    value={props.apiEndpoints.apiKey}
                    onChange={(e, value) => props.setApiEndpoints(prev => ({ ...prev, apiKey: value }))}
                    placeholder="your-api-key-here"
                    size="small"
                    fullWidth
                    type="password"
                    helperText="Your API key will be sent as X-API-Key header to your custom endpoints."
                  />
                </Box>
              </Card>
            </Show>
          </Box>
        </Show>
      </CardContent>
    </Card>
  );
};
