import { For } from 'solid-js';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
} from '@suid/material';
import { CloudUpload, Download } from '@suid/icons-material';
import { ManualOptionEntry } from '../hooks/useManualOptions';
import { roundMidpointUp } from '../utils/optionsCalculationUtils';

interface ManualDataInputProps {
  manualSecurityPrice: string;
  setManualSecurityPrice: (value: string) => void;
  investmentAmount: string;
  setInvestmentAmount: (value: string) => void;
  percentageIncrements: string;
  setPercentageIncrements: (value: string) => void;
  manualOptionEntries: ManualOptionEntry[];
  addManualOptionEntry: () => void;
  removeManualOptionEntry: (id: string) => void;
  updateManualOptionEntry: (id: string, field: keyof ManualOptionEntry, value: string) => void;
  handleCsvUpload: (event: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => void;
  downloadSampleCsv: () => void;
  csvUploadError: string | null;
  onCalculate: () => void;
}

export const ManualDataInput = (props: ManualDataInputProps) => {
  return (
    <Box sx={{ color: '#ffffff' }}>
      {/* Input Parameters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Current Security Price ($)"
          value={props.manualSecurityPrice}
          onChange={(e) => props.setManualSecurityPrice(e.target.value)}
          type="number"
          size="small"
          inputProps={{ step: 0.01, min: 0 }}
          sx={{ 
            minWidth: 150,
            '& .suid-input-label-root': { color: '#7CE2FF' },
            '& .suid-input-base-input': { color: '#ffffff' },
            '& .suid-form-helper-text-root': { color: '#7CE2FF' },
            '& .suid-outlined-input-root': {
              '& fieldset': { borderColor: '#4A6E8D' },
              '&:hover fieldset': { borderColor: '#7CE2FF' },
              '&.suid-focused fieldset': { borderColor: '#7CE2FF' }
            }
          }}
          helperText="Current stock price"
        />
        <TextField
          label="Investment Amount ($)"
          value={props.investmentAmount}
          onChange={(e) => props.setInvestmentAmount(e.target.value)}
          type="number"
          size="small"
          sx={{ 
            minWidth: 150,
            '& .suid-input-label-root': { color: '#7CE2FF' },
            '& .suid-input-base-input': { color: '#ffffff' },
            '& .suid-form-helper-text-root': { color: '#7CE2FF' },
            '& .suid-outlined-input-root': {
              '& fieldset': { borderColor: '#4A6E8D' },
              '&:hover fieldset': { borderColor: '#7CE2FF' },
              '&.suid-focused fieldset': { borderColor: '#7CE2FF' }
            }
          }}
          helperText="Total investment budget"
        />
        <TextField
          label="Price Change % (comma-separated)"
          value={props.percentageIncrements}
          onChange={(e) => props.setPercentageIncrements(e.target.value)}
          placeholder="5,10,15,20,25"
          size="small"
          sx={{ 
            minWidth: 200,
            '& .suid-input-label-root': { color: '#7CE2FF' },
            '& .suid-input-base-input': { color: '#ffffff' },
            '& .suid-form-helper-text-root': { color: '#7CE2FF' },
            '& .suid-outlined-input-root': {
              '& fieldset': { borderColor: '#4A6E8D' },
              '&:hover fieldset': { borderColor: '#7CE2FF' },
              '&.suid-focused fieldset': { borderColor: '#7CE2FF' }
            }
          }}
          helperText="Expected stock price changes"
        />
      </Box>

      {/* Options Data Section */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
          Options Data
        </Typography>
        <Typography variant="body2" gutterBottom sx={{ color: '#7CE2FF' }}>
          Enter individual options data or upload a CSV file. Strike, bid, and ask are required. Price is optional (will use mid-point if not provided).
        </Typography>
        
        {/* CSV Upload Section */}
        <Card variant="outlined" sx={{ 
          mb: 3, 
          p: 2,
          backgroundColor: '#1B3A57',
          borderColor: '#4A6E8D'
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffffff' }}>
            CSV Upload
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#7CE2FF' }}>
            Upload a CSV file with options data. Required columns: Strike Price, Bid, Ask
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{
                borderColor: '#7CE2FF',
                color: '#7CE2FF',
                '&:hover': {
                  borderColor: '#ffffff',
                  backgroundColor: '#4A6E8D'
                }
              }}
            >
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={(e) => props.handleCsvUpload(e)}
                hidden
              />
            </Button>
            
            <Button
              variant="text"
              size="small"
              onClick={props.downloadSampleCsv}
              startIcon={<Download />}
              sx={{
                color: '#7CE2FF',
                '&:hover': {
                  backgroundColor: '#4A6E8D'
                }
              }}
            >
              Download Sample CSV
            </Button>
          </Box>
          
          {props.csvUploadError && (
            <Alert severity="error" sx={{ 
              mt: 2,
              backgroundColor: '#1B3A57',
              borderColor: '#ff6b6b',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ff6b6b'
              }
            }}>
              {props.csvUploadError}
            </Alert>
          )}
        </Card>
        
        {/* Manual Option Entries */}
        <For each={props.manualOptionEntries}>{(entry) => 
          <Card variant="outlined" sx={{ 
            mb: 2, 
            p: 2,
            backgroundColor: '#1B3A57',
            borderColor: '#4A6E8D'
          }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                label="Strike"
                value={entry.strike}
                onChange={(e) => props.updateManualOptionEntry(entry.id, 'strike', e.target.value)}
                type="number"
                size="small"
                sx={{ 
                  minWidth: 100,
                  '& .suid-input-label-root': { color: '#7CE2FF' },
                  '& .suid-input-base-input': { color: '#ffffff' },
                  '& .suid-form-helper-text-root': { color: '#7CE2FF' },
                  '& .suid-outlined-input-root': {
                    '& fieldset': { borderColor: '#4A6E8D' },
                    '&:hover fieldset': { borderColor: '#7CE2FF' },
                    '&.suid-focused fieldset': { borderColor: '#7CE2FF' }
                  }
                }}
                inputProps={{ step: 0.01 }}
                helperText=" " // Empty space to maintain alignment
              />
              <TextField
                label="Bid"
                value={entry.bid}
                onChange={(e) => props.updateManualOptionEntry(entry.id, 'bid', e.target.value)}
                type="number"
                size="small"
                sx={{ 
                  minWidth: 100,
                  '& .suid-input-label-root': { color: '#7CE2FF' },
                  '& .suid-input-base-input': { color: '#ffffff' },
                  '& .suid-form-helper-text-root': { color: '#7CE2FF' },
                  '& .suid-outlined-input-root': {
                    '& fieldset': { borderColor: '#4A6E8D' },
                    '&:hover fieldset': { borderColor: '#7CE2FF' },
                    '&.suid-focused fieldset': { borderColor: '#7CE2FF' }
                  }
                }}
                inputProps={{ step: 0.01 }}
                helperText=" " // Empty space to maintain alignment
              />
              <TextField
                label="Ask"
                value={entry.ask}
                onChange={(e) => props.updateManualOptionEntry(entry.id, 'ask', e.target.value)}
                type="number"
                size="small"
                sx={{ 
                  minWidth: 100,
                  '& .suid-input-label-root': { color: '#7CE2FF' },
                  '& .suid-input-base-input': { color: '#ffffff' },
                  '& .suid-form-helper-text-root': { color: '#7CE2FF' },
                  '& .suid-outlined-input-root': {
                    '& fieldset': { borderColor: '#4A6E8D' },
                    '&:hover fieldset': { borderColor: '#7CE2FF' },
                    '&.suid-focused fieldset': { borderColor: '#7CE2FF' }
                  }
                }}
                inputProps={{ step: 0.01 }}
                helperText=" " // Empty space to maintain alignment
              />
              <TextField
                label="Price (Optional)"
                value={entry.price || ''}
                onChange={(e) => props.updateManualOptionEntry(entry.id, 'price', e.target.value)}
                type="number"
                size="small"
                sx={{ 
                  minWidth: 120,
                  '& .suid-input-label-root': { color: '#7CE2FF' },
                  '& .suid-input-base-input': { color: '#ffffff' },
                  '& .suid-form-helper-text-root': { color: '#7CE2FF' },
                  '& .suid-outlined-input-root': {
                    '& fieldset': { borderColor: '#4A6E8D' },
                    '&:hover fieldset': { borderColor: '#7CE2FF' },
                    '&.suid-focused fieldset': { borderColor: '#7CE2FF' }
                  }
                }}
                inputProps={{ step: 0.01 }}
                helperText="Leave empty to use mid-point"
              />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => props.removeManualOptionEntry(entry.id)}
                  disabled={props.manualOptionEntries.length === 1}
                  sx={{
                    borderColor: '#ff6b6b',
                    color: '#ff6b6b',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255, 107, 107, 0.1)'
                    }
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
            {entry.bid && entry.ask && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#7CE2FF' }}>
                Mid-point: ${roundMidpointUp(parseFloat(entry.bid), parseFloat(entry.ask)).toFixed(2)}
              </Typography>
            )}
          </Card>
        }</For>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={props.addManualOptionEntry}
            size="small"
            sx={{
              borderColor: '#7CE2FF',
              color: '#7CE2FF',
              '&:hover': {
                borderColor: '#ffffff',
                backgroundColor: '#4A6E8D'
              }
            }}
          >
            Add Option
          </Button>
        </Box>
        
        <Button
          variant="contained"
          onClick={props.onCalculate}
          size="large"
          fullWidth
          sx={{
            backgroundColor: '#7CE2FF',
            color: '#1B3A57',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#4A6E8D',
              color: '#ffffff'
            }
          }}
        >
          Calculate Options
        </Button>
      </Box>
    </Box>
  );
};
