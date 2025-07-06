import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  Chip,
} from '@mui/material';
import { StockQuote, OptionQuote } from '../enhancedOptionsService';
import { OptionsGroupedByExpiration } from './OptionsGroupedByExpiration';
import { BestOptionsSummary } from './BestOptionsSummary';
import { OptionDetailsView } from './OptionDetailsView';

interface LiveOptionsChainProps {
  callsChain: OptionQuote[];
  putsChain: OptionQuote[];
  stockQuote: StockQuote;
  selectedTab: number;
  setSelectedTab: (value: number) => void;
  getBestCallsAtEachPercentage: Map<number, { option: OptionQuote; profit: number }>;
  getBestPutsAtEachPercentage: Map<number, { option: OptionQuote; profit: number }>;
  selectedOptionForDetails: OptionQuote | null;
  setSelectedOptionForDetails: (option: OptionQuote | null) => void;
  showDetailsView: boolean;
  setShowDetailsView: (show: boolean) => void;
  investmentAmount: string;
  percentageIncrements: string;
}

export const LiveOptionsChain: React.FC<LiveOptionsChainProps> = ({
  callsChain,
  putsChain,
  stockQuote,
  selectedTab,
  setSelectedTab,
  getBestCallsAtEachPercentage,
  getBestPutsAtEachPercentage,
  selectedOptionForDetails,
  setSelectedOptionForDetails,
  showDetailsView,
  setShowDetailsView,
  investmentAmount,
  percentageIncrements,
}) => {
  if (callsChain.length === 0 && putsChain.length === 0) {
    return null;
  }

  // Get data freshness info
  const getDataFreshness = (options: OptionQuote[]) => {
    const dates = options.map(opt => opt.lastUpdated).filter(Boolean);
    if (dates.length === 0) return null;
    
    const timestamps = dates.map(d => new Date(d!).getTime());
    const mostRecent = new Date(Math.max(...timestamps));
    const hoursAgo = Math.floor((Date.now() - mostRecent.getTime()) / (1000 * 60 * 60));
    
    return { mostRecent, hoursAgo };
  };

  const callsFreshness = getDataFreshness(callsChain);
  const putsFreshness = getDataFreshness(putsChain);
  const currentOptions = selectedTab === 0 ? callsChain : putsChain;
  const currentFreshness = selectedTab === 0 ? callsFreshness : putsFreshness;

  return (
    <Card>
      <CardContent>
        {!showDetailsView ? (
          <>
            <Typography variant="h6" gutterBottom>
              Options Chain
            </Typography>
            
            {/* Data freshness indicator */}
            {currentFreshness && (
              <Alert 
                severity={currentFreshness.hoursAgo <= 1 ? 'success' : currentFreshness.hoursAgo <= 24 ? 'info' : 'warning'} 
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>📅 Data Freshness:</strong> Most recent options data is {currentFreshness.hoursAgo} hours old 
                  (last updated: {currentFreshness.mostRecent.toLocaleString()})
                  {currentFreshness.hoursAgo > 24 && ' - Consider checking if your API provides more recent data'}
                </Typography>
              </Alert>
            )}
            
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 2 }}>
              <Tab 
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {`Calls (${callsChain.length})`}
                    {callsFreshness && (
                      <Chip 
                        size="small" 
                        label={`${callsFreshness.hoursAgo}h ago`}
                        color={callsFreshness.hoursAgo <= 1 ? 'success' : callsFreshness.hoursAgo <= 24 ? 'default' : 'warning'}
                        variant="outlined"
                      />
                    )}
                  </div>
                }
              />
              <Tab 
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {`Puts (${putsChain.length})`}
                    {putsFreshness && (
                      <Chip 
                        size="small" 
                        label={`${putsFreshness.hoursAgo}h ago`}
                        color={putsFreshness.hoursAgo <= 1 ? 'success' : putsFreshness.hoursAgo <= 24 ? 'default' : 'warning'}
                        variant="outlined"
                      />
                    )}
                  </div>
                }
              />
            </Tabs>

            {selectedTab === 0 && callsChain.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Click on any call option to see potential returns at different price levels.
                  <br />
                  <strong>Expiration Dates:</strong> Options are grouped by expiration date - check the Expiration column to compare similar-term contracts.
                  <br />
                  <strong>Pricing Note:</strong> Contract calculations use the mid-point price (average of bid and ask).
                  <br />
                  <strong>Data Source:</strong> Historical options data from Alpha Vantage - most recent available pricing.
                </Typography>

                <BestOptionsSummary 
                  bestAtPercentages={getBestCallsAtEachPercentage}
                  optionType="call"
                />
                
                <OptionsGroupedByExpiration
                  options={callsChain}
                  stockQuote={stockQuote}
                  onOptionClick={(option: OptionQuote) => {
                    setSelectedOptionForDetails(option);
                    setShowDetailsView(true);
                  }}
                  bestAtPercentages={getBestCallsAtEachPercentage}
                  optionType="call"
                  investmentAmount={investmentAmount}
                  percentageIncrements={percentageIncrements}
                />
              </>
            )}

            {selectedTab === 1 && putsChain.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Click on any put option to see potential returns at different price levels.
                  <br />
                  <strong>Expiration Dates:</strong> Options are grouped by expiration date - check the Expiration column to compare similar-term contracts.
                  <br />
                  <strong>Pricing Note:</strong> Contract calculations use the mid-point price (average of bid and ask).
                  <br />
                  <strong>Data Source:</strong> Historical options data from Alpha Vantage - most recent available pricing.
                </Typography>

                <BestOptionsSummary 
                  bestAtPercentages={getBestPutsAtEachPercentage}
                  optionType="put"
                />
                
                <OptionsGroupedByExpiration
                  options={putsChain}
                  stockQuote={stockQuote}
                  onOptionClick={(option: OptionQuote) => {
                    setSelectedOptionForDetails(option);
                    setShowDetailsView(true);
                  }}
                  bestAtPercentages={getBestPutsAtEachPercentage}
                  optionType="put"
                  investmentAmount={investmentAmount}
                  percentageIncrements={percentageIncrements}
                />
              </>
            )}
          </>
        ) : (
          selectedOptionForDetails && stockQuote && (
            <OptionDetailsView
              option={selectedOptionForDetails}
              stockQuote={stockQuote}
              investmentAmount={investmentAmount}
              percentageIncrements={percentageIncrements}
              optionType={selectedOptionForDetails.type === 'put' ? 'put' : 'call'}
              onBack={() => setShowDetailsView(false)}
            />
          )
        )}
      </CardContent>
    </Card>
  );
};
