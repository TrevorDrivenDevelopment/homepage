import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import { LiveDataControls } from './components/LiveDataControls';
import { DataSourceToggle } from './components/DataSourceToggle';
import { ManualDataInput } from './components/ManualDataInput';
import { TargetPricesDisplay } from './components/TargetPricesDisplay';
import { StockQuoteCard } from './components/StockQuoteCard';
import { ManualResultsDisplay } from './components/ManualResultsDisplay';
import { ApiDocumentation } from './components/ApiDocumentation';
import { LiveOptionsChain } from './components/LiveOptionsChain';
import { ErrorModal } from './components/ErrorModal';
import { useLiveData } from './hooks/useLiveData';
import { useManualOptions } from './hooks/useManualOptions';
import { useOptionsCalculation } from './hooks/useOptionsCalculation';
import { useComponentState } from './hooks/useComponentState';
import { calculatePerformanceForOption } from './utils/optionsCalculationUtils';
import { 
  validateManualInputs, 
  calculateManualOptionsResults,
  parseManualOptionsFromEntries 
} from './utils/manualOptionsUtils';
import { ManualOptionEntry } from './hooks/useManualOptions';

const LiveOptionsCalculator: React.FC = () => {
  // Use custom hooks for state management
  const {
    useManualData,
    setUseManualData,
    error,
    setError,
    errorModalOpen,
    setErrorModalOpen,
    investmentAmount,
    setInvestmentAmount,
    percentageIncrements,
    setPercentageIncrements,
    selectedOptionForDetails,
    setSelectedOptionForDetails,
    showDetailsView,
    setShowDetailsView,
  } = useComponentState();

  // Live data hook
  const {
    symbol,
    setSymbol,
    stockQuote,
    callsChain,
    putsChain,
    loading,
    selectedTab,
    setSelectedTab,
    apiEndpoints,
    setApiEndpoints,
    showApiConfig,
    setShowApiConfig,
    fetchData: fetchLiveData,
    isApiConfigured,
  } = useLiveData();

  // Manual options hook
  const {
    manualSecurityPrice,
    setManualSecurityPrice,
    manualOptionEntries,
    manualResults,
    setManualResults,
    bestManualOptions,
    setBestManualOptions,
    csvUploadError,
    addManualOptionEntry,
    removeManualOptionEntry,
    updateManualOptionEntry,
    parseManualOptionsData,
    downloadSampleCsv,
    handleCsvUpload,
  } = useManualOptions();

  // Options calculation hook
  const {
    getTargetPrices,
    getBestCallsAtEachPercentage,
    getBestPutsAtEachPercentage,
    getBestManualOptionsAtEachPercentage,
  } = useOptionsCalculation({
    useManualData,
    stockQuote,
    callsChain,
    putsChain,
    manualSecurityPrice,
    percentageIncrements,
    investmentAmount,
    manualResults,
  });

  const fetchData = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    try {
      setError('');
      await fetchLiveData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      setErrorModalOpen(true);
    }
  };

  const calculateManualOptions = () => {
    try {
      setError('');
      
      const options = parseManualOptionsData();
      const { securityPrice, investmentAmount: money, percentages } = validateManualInputs(
        manualSecurityPrice,
        investmentAmount,
        percentageIncrements,
        options
      );

      const topOptions = calculateManualOptionsResults(options, securityPrice, money, percentages);
      const sellPrices = getTargetPrices;

      const highestSellPrice = sellPrices[sellPrices.length - 1];
      const resultsAtHighestPercentage = topOptions.get(highestSellPrice);
      
      setBestManualOptions({
        best: resultsAtHighestPercentage?.[0],
        secondBest: resultsAtHighestPercentage?.[1],
      });
      
      setManualResults(topOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const calculateManualOptionsWithEntries = (entries: ManualOptionEntry[]) => {
    try {
      setError('');
      
      const options = parseManualOptionsFromEntries(entries);
      const { securityPrice, investmentAmount: money, percentages } = validateManualInputs(
        manualSecurityPrice,
        investmentAmount,
        percentageIncrements,
        options
      );

      const topOptions = calculateManualOptionsResults(options, securityPrice, money, percentages);
      const sellPrices = getTargetPrices;

      const highestSellPrice = sellPrices[sellPrices.length - 1];
      const resultsAtHighestPercentage = topOptions.get(highestSellPrice);
      
      setBestManualOptions({
        best: resultsAtHighestPercentage?.[0],
        secondBest: resultsAtHighestPercentage?.[1],
      });
      
      setManualResults(topOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating options');
    }
  };

  const sellPrices = getTargetPrices;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Options Calculator
      </Typography>

      {/* Data Display Info */}
      {!useManualData && (callsChain.length > 0 || putsChain.length > 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>📊 Options Data:</strong> Showing {callsChain.length} call options and {putsChain.length} put options. 
            Data quality and filtering is handled by your configured API endpoint. 
            If you see unrealistic prices or profits, please verify your API endpoint is returning real market data.
          </Typography>
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Data Source:</strong> Toggle between live market data (requires your own API configuration) and manual entry mode below. 
          For live data, you must provide your own API endpoints that return real market data - no default APIs are included for security and reliability.
        </Typography>
      </Alert>

      {/* Data Source Toggle */}
      <DataSourceToggle
        useManualData={useManualData}
        setUseManualData={setUseManualData}
        apiEndpoints={apiEndpoints}
        setApiEndpoints={setApiEndpoints}
        showApiConfig={showApiConfig}
        setShowApiConfig={setShowApiConfig}
      />

      {/* Input Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {useManualData ? 'Manual Input Parameters' : 'Live Data Parameters'}
          </Typography>
          
          {!useManualData ? (
            <LiveDataControls
              symbol={symbol}
              setSymbol={setSymbol}
              investmentAmount={investmentAmount}
              setInvestmentAmount={setInvestmentAmount}
              percentageIncrements={percentageIncrements}
              setPercentageIncrements={setPercentageIncrements}
              loading={loading}
              onFetchData={fetchData}
              isApiConfigured={isApiConfigured}
            />
          ) : (
            <ManualDataInput
              manualSecurityPrice={manualSecurityPrice}
              setManualSecurityPrice={setManualSecurityPrice}
              investmentAmount={investmentAmount}
              setInvestmentAmount={setInvestmentAmount}
              percentageIncrements={percentageIncrements}
              setPercentageIncrements={setPercentageIncrements}
              manualOptionEntries={manualOptionEntries}
              addManualOptionEntry={addManualOptionEntry}
              removeManualOptionEntry={removeManualOptionEntry}
              updateManualOptionEntry={updateManualOptionEntry}
              handleCsvUpload={(event) => handleCsvUpload(event, calculateManualOptionsWithEntries)}
              downloadSampleCsv={downloadSampleCsv}
              csvUploadError={csvUploadError}
              onCalculate={calculateManualOptions}
            />
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Target Prices Display */}
      <TargetPricesDisplay
        sellPrices={sellPrices}
        percentageIncrements={percentageIncrements}
        useManualData={useManualData}
        manualSecurityPrice={manualSecurityPrice}
        stockQuote={stockQuote}
      />

      {/* Stock Quote for Live Data */}
      {!useManualData && stockQuote && (
        <StockQuoteCard stockQuote={stockQuote} />
      )}

      {/* Manual Results */}
      {useManualData && (
        <ManualResultsDisplay
          manualResults={manualResults}
          bestManualOptions={bestManualOptions}
          getBestManualOptionsAtEachPercentage={getBestManualOptionsAtEachPercentage}
          calculatePerformanceForOption={(option) => calculatePerformanceForOption(option, sellPrices, percentageIncrements)}
        />
      )}

      {/* Live Options Chain */}
      {!useManualData && stockQuote && (
        <LiveOptionsChain
          callsChain={callsChain}
          putsChain={putsChain}
          stockQuote={stockQuote}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          getBestCallsAtEachPercentage={getBestCallsAtEachPercentage}
          getBestPutsAtEachPercentage={getBestPutsAtEachPercentage}
          selectedOptionForDetails={selectedOptionForDetails}
          setSelectedOptionForDetails={setSelectedOptionForDetails}
          showDetailsView={showDetailsView}
          setShowDetailsView={setShowDetailsView}
          investmentAmount={investmentAmount}
          percentageIncrements={percentageIncrements}
        />
      )}

      {/* Show placeholder when no options data but live mode is enabled */}
      {!useManualData && !stockQuote && !loading && isApiConfigured && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Options Chain
            </Typography>
            <Alert severity="info">
              <Typography variant="body2">
                Enter a stock symbol and click "Get Data" to view options chain information.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Error Modal */}
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        onRetry={fetchData}
        error={error}
        title="Failed to Load Options Data"
      />

      {/* API Documentation */}
      <ApiDocumentation
        showApiConfig={showApiConfig}
        useManualData={useManualData}
      />
    </Box>
  );
};

export default LiveOptionsCalculator;
