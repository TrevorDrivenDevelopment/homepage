import React from 'react';
import {
  Container,
  Typography,
  Alert,
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import LiveOptionsCalculator from './LiveOptionsCalculator';

const OptionsCalculator: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Options Calculator
      </Typography>
      
      <Alert 
        severity="warning" 
        icon={<WarningAmber />}
        sx={{ mb: 4 }}
      >
        <Typography variant="h6" gutterBottom>
          Disclaimer - No Warranty Implied
        </Typography>
        <Typography variant="body2">
          This calculator is provided for educational and informational purposes only. 
          It does not constitute financial advice. Options trading involves substantial risk 
          and may not be suitable for all investors. Past performance does not guarantee future results. 
          Please consult with a qualified financial advisor before making investment decisions. 
          The creators of this tool provide no warranty and accept no liability for any losses 
          that may arise from its use.
        </Typography>
      </Alert>

      <LiveOptionsCalculator />
    </Container>
  );
};

export default OptionsCalculator;
