import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { CloudUpload, Download } from '@mui/icons-material';
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
  handleCsvUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  downloadSampleCsv: () => void;
  csvUploadError: string | null;
  onCalculate: () => void;
}

export const ManualDataInput: React.FC<ManualDataInputProps> = ({
  manualSecurityPrice,
  setManualSecurityPrice,
  investmentAmount,
  setInvestmentAmount,
  percentageIncrements,
  setPercentageIncrements,
  manualOptionEntries,
  addManualOptionEntry,
  removeManualOptionEntry,
  updateManualOptionEntry,
  handleCsvUpload,
  downloadSampleCsv,
  csvUploadError,
  onCalculate,
}) => {
  return (
    <Box>
      {/* Input Parameters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Current Security Price ($)"
          value={manualSecurityPrice}
          onChange={(e) => setManualSecurityPrice(e.target.value)}
          type="number"
          size="small"
          inputProps={{ step: 0.01, min: 0 }}
          sx={{ minWidth: 150 }}
          helperText="Current stock price"
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
      </Box>

      {/* Options Data Section */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Options Data
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Enter individual options data or upload a CSV file. Strike, bid, and ask are required. Price is optional (will use mid-point if not provided).
        </Typography>
        
        {/* CSV Upload Section */}
        <Card variant="outlined" sx={{ mb: 3, p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            CSV Upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file with options data. Required columns: Strike Price, Bid, Ask
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
            >
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                hidden
              />
            </Button>
            
            <Button
              variant="text"
              size="small"
              onClick={downloadSampleCsv}
              startIcon={<Download />}
            >
              Download Sample CSV
            </Button>
          </Box>
          
          {csvUploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {csvUploadError}
            </Alert>
          )}
        </Card>
        
        {/* Manual Option Entries */}
        {manualOptionEntries.map((entry, index) => (
          <Card key={entry.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                label="Strike"
                value={entry.strike}
                onChange={(e) => updateManualOptionEntry(entry.id, 'strike', e.target.value)}
                type="number"
                size="small"
                sx={{ minWidth: 100 }}
                inputProps={{ step: 0.01 }}
                helperText=" " // Empty space to maintain alignment
              />
              <TextField
                label="Bid"
                value={entry.bid}
                onChange={(e) => updateManualOptionEntry(entry.id, 'bid', e.target.value)}
                type="number"
                size="small"
                sx={{ minWidth: 100 }}
                inputProps={{ step: 0.01 }}
                helperText=" " // Empty space to maintain alignment
              />
              <TextField
                label="Ask"
                value={entry.ask}
                onChange={(e) => updateManualOptionEntry(entry.id, 'ask', e.target.value)}
                type="number"
                size="small"
                sx={{ minWidth: 100 }}
                inputProps={{ step: 0.01 }}
                helperText=" " // Empty space to maintain alignment
              />
              <TextField
                label="Price (Optional)"
                value={entry.price || ''}
                onChange={(e) => updateManualOptionEntry(entry.id, 'price', e.target.value)}
                type="number"
                size="small"
                sx={{ minWidth: 120 }}
                inputProps={{ step: 0.01 }}
                helperText="Leave empty to use mid-point"
              />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => removeManualOptionEntry(entry.id)}
                  disabled={manualOptionEntries.length === 1}
                >
                  Remove
                </Button>
              </Box>
            </Box>
            {entry.bid && entry.ask && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Mid-point: ${roundMidpointUp(parseFloat(entry.bid), parseFloat(entry.ask)).toFixed(2)}
              </Typography>
            )}
          </Card>
        ))}
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={addManualOptionEntry}
            size="small"
          >
            Add Option
          </Button>
        </Box>
        
        <Button
          variant="contained"
          onClick={onCalculate}
          size="large"
          fullWidth
        >
          Calculate Options
        </Button>
      </Box>
    </Box>
  );
};
