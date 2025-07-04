import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { OptionResult } from '../hooks/useManualOptions';
import { roundMidpointUp, calculatePerformanceForOption } from '../utils/optionsCalculationUtils';

interface ManualResultsDisplayProps {
  manualResults: Map<number, OptionResult[]>;
  bestManualOptions: {
    best?: OptionResult;
    secondBest?: OptionResult;
  };
  getBestManualOptionsAtEachPercentage: Map<number, OptionResult>;
  calculatePerformanceForOption: (option: OptionResult) => any[];
}

export const ManualResultsDisplay: React.FC<ManualResultsDisplayProps> = ({
  manualResults,
  bestManualOptions,
  getBestManualOptionsAtEachPercentage,
  calculatePerformanceForOption,
}) => {
  if (manualResults.size === 0) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Manual Entry Results
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Pricing Note:</strong> All calculations use mid-point pricing (average of bid and ask) unless a custom price is specified.
        </Typography>

        {/* Best Options by Percentage Summary for Manual Entry */}
        {getBestManualOptionsAtEachPercentage.size > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Best Options by Price Increase:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.from(getBestManualOptionsAtEachPercentage.entries())
                .sort(([a], [b]) => a - b)
                .map(([percentage, option]) => (
                  <Chip
                    key={percentage}
                    label={`+${percentage}%: $${option.strike} Strike (${option.gainLoss >= 0 ? '+' : ''}$${option.gainLoss.toFixed(0)} profit)`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
            </Box>
          </Alert>
        )}
        
        {/* Best Options Summary */}
        {(bestManualOptions.best || bestManualOptions.secondBest) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Top Options Summary
            </Typography>
            
            {bestManualOptions.best && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Best Option: Strike ${bestManualOptions.best.strike} 
                  (Mid-price: ${((bestManualOptions.best.bid + bestManualOptions.best.ask) / 2).toFixed(2)})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Investment: ${bestManualOptions.best.actualInvestment.toFixed(2)} | 
                  Contracts: {bestManualOptions.best.contracts} | 
                  Shares: {bestManualOptions.best.shares}
                </Typography>
                
                <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Price Increase</TableCell>
                        <TableCell>Sell Price</TableCell>
                        <TableCell>Gain/Loss</TableCell>
                        <TableCell>% Return</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calculatePerformanceForOption(bestManualOptions.best).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.percentage}</TableCell>
                          <TableCell>{row.sellPrice}</TableCell>
                          <TableCell sx={{ color: row.isProfit ? 'success.main' : 'error.main' }}>
                            {row.gainLoss}
                          </TableCell>
                          <TableCell sx={{ color: row.isProfit ? 'success.main' : 'error.main' }}>
                            {row.percentageGainLoss}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {bestManualOptions.secondBest && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="secondary">
                  Second Best Option: Strike ${bestManualOptions.secondBest.strike}
                  (Mid-price: ${((bestManualOptions.secondBest.bid + bestManualOptions.secondBest.ask) / 2).toFixed(2)})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Investment: ${bestManualOptions.secondBest.actualInvestment.toFixed(2)} | 
                  Contracts: {bestManualOptions.secondBest.contracts} | 
                  Shares: {bestManualOptions.secondBest.shares}
                </Typography>
                
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Price Increase</TableCell>
                        <TableCell>Sell Price</TableCell>
                        <TableCell>Gain/Loss</TableCell>
                        <TableCell>% Return</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calculatePerformanceForOption(bestManualOptions.secondBest).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.percentage}</TableCell>
                          <TableCell>{row.sellPrice}</TableCell>
                          <TableCell sx={{ color: row.isProfit ? 'success.main' : 'error.main' }}>
                            {row.gainLoss}
                          </TableCell>
                          <TableCell sx={{ color: row.isProfit ? 'success.main' : 'error.main' }}>
                            {row.percentageGainLoss}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Detailed Results by Sell Price */}
        <Typography variant="subtitle1" gutterBottom>
          Top Options by Sell Price
        </Typography>
        
        {Array.from(manualResults.entries()).map(([sellPrice, options]) => (
          <Card key={sellPrice} sx={{ mb: 2 }} variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                At Sell Price: ${sellPrice.toFixed(2)}
              </Typography>
              
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Strike</TableCell>
                      <TableCell>Bid/Ask (Mid)</TableCell>
                      <TableCell>Contracts</TableCell>
                      <TableCell>Investment</TableCell>
                      <TableCell>Gain/Loss</TableCell>
                      <TableCell>% Return</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {options.map((option, index) => {
                      const midPrice = roundMidpointUp(option.bid, option.ask);
                      
                      // Find which percentages this option is best for
                      const bestAtPercentages: number[] = [];
                      getBestManualOptionsAtEachPercentage.forEach((bestOption, percentage) => {
                        if (bestOption.strike === option.strike) {
                          bestAtPercentages.push(percentage);
                        }
                      });
                      
                      const getBestAtIndicators = () => {
                        if (bestAtPercentages.length === 0) return null;
                        
                        return (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {bestAtPercentages.map(percentage => (
                              <Chip
                                key={percentage}
                                label={`Best at +${percentage}%`}
                                size="small"
                                color="primary"
                                variant="filled"
                                sx={{ fontSize: '0.65rem', height: '18px' }}
                              />
                            ))}
                          </Box>
                        );
                      };
                      
                      return (
                        <TableRow 
                          key={index}
                          sx={{
                            bgcolor: bestAtPercentages.length > 0 ? 'primary.50' : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                              ${option.strike}
                              {getBestAtIndicators()}
                            </Box>
                          </TableCell>
                          <TableCell>
                            ${option.bid} / ${option.ask}
                            <Typography variant="caption" color="text.secondary" display="block">
                              Mid: ${midPrice.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>{option.contracts}</TableCell>
                          <TableCell>${option.actualInvestment.toFixed(2)}</TableCell>
                          <TableCell sx={{ color: option.gainLoss > 0 ? 'success.main' : 'error.main' }}>
                            ${option.gainLoss.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ color: option.percentageGainLoss > 0 ? 'success.main' : 'error.main' }}>
                            {option.percentageGainLoss.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
