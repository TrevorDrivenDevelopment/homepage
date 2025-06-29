import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
} from '@mui/material';
import { TrendingUp, TrendingDown, Refresh, Edit, CloudDownload, ArrowBack, CloudUpload, Download } from '@mui/icons-material';
import { fetchStockQuote, fetchOptionsChain, StockQuote, OptionQuote } from './optionsService';
import { useBackendApi } from '../../services/backendApiService';

interface ManualOptionProfile {
  strike: number;
  bid: number;
  ask: number;
  price?: number;
}

interface ManualOptionEntry {
  id: string;
  strike: string;
  bid: string;
  ask: string;
  price?: string;
}

interface OptionResult extends ManualOptionProfile {
  gainLoss: number;
  actualInvestment: number;
  shares: number;
  contracts: number;
  percentageGainLoss: number;
}

const LiveOptionsCalculator: React.FC = () => {
  // Live data state
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [optionsChain, setOptionsChain] = useState<OptionQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // API Configuration state
  const [apiEndpoints, setApiEndpoints] = useState({
    stockQuoteUrl: '',
    optionsChainUrl: '',
    apiKey: ''
  });
  const [showApiConfig, setShowApiConfig] = useState<boolean>(false);
  
  // Manual data state
  const [useManualData, setUseManualData] = useState<boolean>(false);
  const [manualSecurityPrice, setManualSecurityPrice] = useState<string>('100');
  const [manualOptionEntries, setManualOptionEntries] = useState<ManualOptionEntry[]>([
    { id: '1', strike: '', bid: '', ask: '', price: '' }
  ]);
  const [manualResults, setManualResults] = useState<Map<number, OptionResult[]>>(new Map());
  const [bestManualOptions, setBestManualOptions] = useState<{
    best?: OptionResult;
    secondBest?: OptionResult;
  }>({});
  
  // Common state
  const [error, setError] = useState<string>('');
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('10000');
  const [percentageIncrements, setPercentageIncrements] = useState<string>('5,10,15,20,25');
  const [selectedOptionForDetails, setSelectedOptionForDetails] = useState<OptionQuote | null>(null);
  const [showDetailsView, setShowDetailsView] = useState<boolean>(false);

  const { api, isConfigured } = useBackendApi();

  const roundToCents = (input: number): number => Math.round((input * 100)) / 100;
  
  const roundMidpointUp = (bid: number, ask: number): number => {
    const midpoint = (bid + ask) / 2;
    return Math.ceil(midpoint * 100) / 100;
  };

  const fetchData = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    if (!apiEndpoints.stockQuoteUrl || !apiEndpoints.optionsChainUrl || !apiEndpoints.apiKey) {
      setError('Please configure API endpoints and API key in the settings above');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Replace {symbol} placeholder in URLs
      const stockUrl = apiEndpoints.stockQuoteUrl.replace('{symbol}', symbol.trim().toUpperCase());
      const optionsUrl = apiEndpoints.optionsChainUrl.replace('{symbol}', symbol.trim().toUpperCase());

      const [quote, options] = await Promise.all([
        fetchStockQuote(symbol.trim().toUpperCase(), stockUrl, apiEndpoints.apiKey),
        fetchOptionsChain(symbol.trim().toUpperCase(), optionsUrl, apiEndpoints.apiKey),
      ]);

      setStockQuote(quote);
      setOptionsChain(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const parseManualOptionsData = (): ManualOptionProfile[] => {
    try {
      const options: ManualOptionProfile[] = [];
      
      for (const entry of manualOptionEntries) {
        const strike = parseFloat(entry.strike);
        const bid = parseFloat(entry.bid);
        const ask = parseFloat(entry.ask);
        const price = entry.price ? parseFloat(entry.price) : undefined;
        
        // Only include entries with valid strike, bid, and ask
        if (!isNaN(strike) && !isNaN(bid) && !isNaN(ask)) {
          options.push({
            strike,
            bid,
            ask,
            price: price && !isNaN(price) ? price : undefined,
          });
        }
      }
      
      return options;
    } catch (err) {
      throw new Error('Invalid options data format');
    }
  };

  const addManualOptionEntry = () => {
    const newId = (Date.now() + Math.random()).toString();
    setManualOptionEntries([...manualOptionEntries, { id: newId, strike: '', bid: '', ask: '', price: '' }]);
  };

  const removeManualOptionEntry = (id: string) => {
    if (manualOptionEntries.length > 1) {
      setManualOptionEntries(manualOptionEntries.filter(entry => entry.id !== id));
    }
  };

  const updateManualOptionEntry = (id: string, field: keyof ManualOptionEntry, value: string) => {
    setManualOptionEntries(manualOptionEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvUploadError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setCsvUploadError('CSV must contain at least a header row and one data row');
          return;
        }

        const header = lines[0].toLowerCase().split(',').map(h => h.trim());
        const requiredColumns = ['strike price', 'bid', 'ask'];
        
        // Check for required columns
        const missingColumns = requiredColumns.filter(col => 
          !header.some(h => h.includes(col.split(' ')[0]))
        );
        
        if (missingColumns.length > 0) {
          setCsvUploadError(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }

        // Find column indices
        const strikeIndex = header.findIndex(h => h.includes('strike'));
        const bidIndex = header.findIndex(h => h.includes('bid'));
        const askIndex = header.findIndex(h => h.includes('ask'));
        const priceIndex = header.findIndex(h => h.includes('price') && !h.includes('strike'));

        const newEntries: ManualOptionEntry[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length < Math.max(strikeIndex, bidIndex, askIndex) + 1) {
            setCsvUploadError(`Row ${i + 1} has insufficient columns`);
            return;
          }

          const strike = values[strikeIndex];
          const bid = values[bidIndex];
          const ask = values[askIndex];
          const price = priceIndex >= 0 ? values[priceIndex] : '';

          if (!strike || !bid || !ask) {
            setCsvUploadError(`Row ${i + 1} is missing required data (strike, bid, or ask)`);
            return;
          }

          newEntries.push({
            id: (Date.now() + Math.random() + i).toString(),
            strike,
            bid,
            ask,
            price: price || ''
          });
        }

        setManualOptionEntries(newEntries);
        setCsvUploadError(null);
        
        // Reset the file input
        event.target.value = '';
        
        // Automatically trigger calculation with the new entries directly
        calculateManualOptionsWithEntries(newEntries);
        
      } catch (error) {
        setCsvUploadError('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const csvContent = `Strike Price,Bid,Ask,Volume,Open Interest,Expiration Date
165.00,8.50,8.80,1250,5430,2024-01-19
170.00,5.50,5.70,2100,4200,2024-01-19
175.00,3.20,3.40,1800,3500,2024-01-19
180.00,1.80,2.00,950,2100,2024-01-19
185.00,0.95,1.10,600,1200,2024-01-19
190.00,0.45,0.55,300,800,2024-01-19`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-options.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Helper function to parse manual options from entries array
  const parseManualOptionsFromEntries = (entries: ManualOptionEntry[]): ManualOptionProfile[] => {
    try {
      const options: ManualOptionProfile[] = [];
      
      for (const entry of entries) {
        const strike = parseFloat(entry.strike);
        const bid = parseFloat(entry.bid);
        const ask = parseFloat(entry.ask);
        const price = entry.price ? parseFloat(entry.price) : undefined;
        
        // Only include entries with valid strike, bid, and ask
        if (!isNaN(strike) && !isNaN(bid) && !isNaN(ask)) {
          options.push({
            strike,
            bid,
            ask,
            price: price && !isNaN(price) ? price : undefined,
          });
        }
      }
      
      return options;
    } catch (err) {
      throw new Error('Invalid options data format');
    }
  };

  // Function to calculate with explicit options array (used for CSV upload)
  const calculateManualOptionsWithEntries = (entries: ManualOptionEntry[]) => {
    try {
      setError('');
      
      const price = parseFloat(manualSecurityPrice);
      const money = parseFloat(investmentAmount);
      const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
      const options = parseManualOptionsFromEntries(entries);

      if (isNaN(price) || price <= 0) {
        throw new Error('Security price must be a positive number');
      }
      
      if (isNaN(money) || money <= 0) {
        throw new Error('Investment amount must be a positive number');
      }
      
      if (percentages.some(p => isNaN(p))) {
        throw new Error('All percentage increments must be valid numbers');
      }
      
      if (options.length === 0) {
        throw new Error('Please provide at least one option');
      }

      const sellPrices = percentages.map(percentage =>
        roundToCents(price * (1 + (percentage / 100)))
      );

      const topOptions = new Map<number, OptionResult[]>();
      
      for (const option of options) {
        const optionPrice = option.price ?? roundMidpointUp(option.bid, option.ask);
        const totalCostPerContract = optionPrice * 100;
        
        if (totalCostPerContract <= 0) continue;

        const contracts = Math.floor(money / totalCostPerContract);
        if (contracts <= 0) continue;

        const shares = contracts * 100;
        const actualInvestment = roundToCents(totalCostPerContract * contracts);

        for (const sellPrice of sellPrices) {
          let gainLoss: number;
          
          if (sellPrice <= option.strike) {
            gainLoss = -actualInvestment;
          } else {
            gainLoss = roundToCents((sellPrice - option.strike) * shares - actualInvestment);
          }
          
          const percentageGainLoss = actualInvestment > 0 
            ? Math.max(-100, (gainLoss / actualInvestment) * 100)
            : 0;

          const currentTop = topOptions.get(sellPrice) ?? [];
          currentTop.push({ 
            gainLoss, 
            actualInvestment, 
            shares, 
            contracts,
            percentageGainLoss,
            ...option 
          });
          currentTop.sort((a, b) => b.gainLoss - a.gainLoss);
          const updatedTop = currentTop.slice(0, 5);
          topOptions.set(sellPrice, updatedTop);
        }
      }

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

  const calculateManualOptions = () => {
    try {
      setError('');
      
      const price = parseFloat(manualSecurityPrice);
      const money = parseFloat(investmentAmount);
      const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
      const options = parseManualOptionsData();

      if (isNaN(price) || price <= 0) {
        throw new Error('Security price must be a positive number');
      }
      
      if (isNaN(money) || money <= 0) {
        throw new Error('Investment amount must be a positive number');
      }
      
      if (percentages.some(p => isNaN(p))) {
        throw new Error('All percentage increments must be valid numbers');
      }
      
      if (options.length === 0) {
        throw new Error('Please provide at least one option');
      }

      const sellPrices = percentages.map(percentage =>
        roundToCents(price * (1 + (percentage / 100)))
      );

      const topOptions = new Map<number, OptionResult[]>();
      
      for (const option of options) {
        const optionPrice = option.price ?? roundMidpointUp(option.bid, option.ask);
        const totalCostPerContract = optionPrice * 100;
        
        if (totalCostPerContract <= 0) continue;

        const contracts = Math.floor(money / totalCostPerContract);
        if (contracts <= 0) continue;

        const shares = contracts * 100;
        const actualInvestment = roundToCents(totalCostPerContract * contracts);

        for (const sellPrice of sellPrices) {
          let gainLoss: number;
          
          if (sellPrice <= option.strike) {
            gainLoss = -actualInvestment;
          } else {
            gainLoss = roundToCents((sellPrice - option.strike) * shares - actualInvestment);
          }
          
          const percentageGainLoss = actualInvestment > 0 
            ? Math.max(-100, (gainLoss / actualInvestment) * 100)
            : 0;

          const currentTop = topOptions.get(sellPrice) ?? [];
          currentTop.push({ 
            gainLoss, 
            actualInvestment, 
            shares, 
            contracts,
            percentageGainLoss,
            ...option 
          });
          currentTop.sort((a, b) => b.gainLoss - a.gainLoss);
          const updatedTop = currentTop.slice(0, 5);
          topOptions.set(sellPrice, updatedTop);
        }
      }

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

  const getTargetPrices = useMemo(() => {
    const currentPrice = useManualData 
      ? parseFloat(manualSecurityPrice) 
      : stockQuote?.price || 0;
    
    if (currentPrice <= 0) return [];
    
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    return percentages.map(percentage =>
      roundToCents(currentPrice * (1 + (percentage / 100)))
    );
  }, [useManualData, manualSecurityPrice, stockQuote?.price, percentageIncrements]);

  const sellPrices = getTargetPrices;

  // Calculate best options for each percentage increase
  const getBestOptionsAtEachPercentage = useMemo(() => {
    if (useManualData || !stockQuote || optionsChain.length === 0) return new Map();
    
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    const investment = parseFloat(investmentAmount) || 10000;
    const bestAtPercentage = new Map<number, { option: OptionQuote; profit: number }>();
    
    percentages.forEach(percentage => {
      const targetPrice = stockQuote.price * (1 + percentage / 100);
      let bestOption: OptionQuote | null = null;
      let bestProfit = -Infinity;
      
      optionsChain.forEach(option => {
        const premiumPaid = roundMidpointUp(option.bid, option.ask);
        const contractsAffordable = Math.floor(investment / (premiumPaid * 100));
        
        if (contractsAffordable > 0) {
          const optionValue = Math.max(0, targetPrice - option.strike);
          const profitPerShare = optionValue - premiumPaid;
          const totalProfit = profitPerShare * 100 * contractsAffordable;
          
          if (totalProfit > bestProfit) {
            bestProfit = totalProfit;
            bestOption = option;
          }
        }
      });
      
      if (bestOption) {
        bestAtPercentage.set(percentage, { option: bestOption, profit: bestProfit });
      }
    });
    
    return bestAtPercentage;
  }, [useManualData, stockQuote, optionsChain, percentageIncrements, investmentAmount]);

  // Calculate best manual options for each percentage increase
  const getBestManualOptionsAtEachPercentage = useMemo(() => {
    if (!useManualData || manualResults.size === 0) return new Map();
    
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    const currentPrice = parseFloat(manualSecurityPrice);
    const bestAtPercentage = new Map<number, OptionResult>();
    
    percentages.forEach(percentage => {
      const targetPrice = currentPrice * (1 + percentage / 100);
      const resultsAtTargetPrice = manualResults.get(roundToCents(targetPrice));
      
      if (resultsAtTargetPrice && resultsAtTargetPrice.length > 0) {
        // The results are already sorted by gainLoss descending, so first is best
        bestAtPercentage.set(percentage, resultsAtTargetPrice[0]);
      }
    });
    
    return bestAtPercentage;
  }, [useManualData, manualResults, percentageIncrements, manualSecurityPrice]);

  const calculatePerformanceForOption = (option: OptionResult) => {
    const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
    
    return percentages.map((percentage, index) => {
      const sellPrice = sellPrices[index];
      let gainLoss: number;
      
      if (sellPrice <= option.strike) {
        gainLoss = -option.actualInvestment;
      } else {
        gainLoss = roundToCents((sellPrice - option.strike) * option.shares - option.actualInvestment);
      }
      
      const percentageGainLoss = option.actualInvestment > 0 
        ? Math.max(-100, (gainLoss / option.actualInvestment) * 100)
        : 0;

      return {
        percentage: `${percentage}%`,
        sellPrice: `$${sellPrice.toFixed(2)}`,
        gainLoss: `$${gainLoss.toFixed(2)}`,
        percentageGainLoss: `${percentageGainLoss.toFixed(2)}%`,
        isProfit: gainLoss > 0,
      };
    });
  };

  // Enhanced calculation function
  const calculateOptionsWithBackend = async () => {
    if (!isConfigured) {
      // Fall back to client-side calculation
      return calculateManualOptions();
    }

    try {
      setError('');
      
      const price = parseFloat(manualSecurityPrice);
      const money = parseFloat(investmentAmount);
      const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
      const options = parseManualOptionsData();    const result = await api.calculateOptions({
      securityPrice: price,
      investmentAmount: money,
      options: options,
      percentageIncrements: percentages
    }) as any; // Type assertion for now

    // Process backend results
    const resultsMap = new Map<number, OptionResult[]>();
    Object.entries(result.resultsByPrice).forEach(([key, value]) => {
      resultsMap.set(parseFloat(key), value as OptionResult[]);
    });
    
    setManualResults(resultsMap);
    setBestManualOptions(result.bestOptions);
      
    } catch (err) {
      console.error('Backend calculation failed, falling back to client-side:', err);
      // Fall back to client-side calculation
      calculateManualOptions();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Options Calculator
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Data Source:</strong> Toggle between live market data (simulated for demo) and manual entry mode below.
        </Typography>
      </Alert>

      {/* Data Source Toggle */}
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
                  {useManualData ? 'Manual Data Entry Mode' : 'Live Data Mode (Demo)'}
                </Typography>
              </Box>
            }
          />
          
          {!useManualData && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>API Configuration Required:</strong> Live mode requires API endpoints for stock quotes and options data.
                  {' '}
                  <Button 
                    size="small" 
                    onClick={() => setShowApiConfig(!showApiConfig)}
                    sx={{ ml: 1 }}
                  >
                    {showApiConfig ? 'Hide Config' : 'Configure APIs'}
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
              
              {showApiConfig && (
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    API Endpoint Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Enter your custom API endpoints that follow the required contract (see API Help below).
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
                      helperText="Your API key will be sent as X-API-Key header to the entered service endpoint for your use. We do not otherwise send or store it."
                    />
                  </Box>
                </Card>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {useManualData ? 'Manual Input Parameters' : 'Live Data Parameters'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 2 }}>
            {!useManualData ? (
              <TextField
                label="Stock Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                size="small"
                sx={{ minWidth: 120 }}
                helperText="Enter ticker symbol"
              />
            ) : (
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
            )}
            
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
              label="Price Increase % (comma-separated)"
              value={percentageIncrements}
              onChange={(e) => setPercentageIncrements(e.target.value)}
              placeholder="5,10,15,20,25"
              size="small"
              sx={{ minWidth: 200 }}
              helperText="Expected stock price increases"
            />
            
            {!useManualData && (
              <Button
                variant="contained"
                onClick={fetchData}
                disabled={loading || !apiEndpoints.stockQuoteUrl || !apiEndpoints.optionsChainUrl || !apiEndpoints.apiKey}
                startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              >
                {loading ? 'Loading...' : 'Fetch Data'}
              </Button>
            )}
          </Box>
          
          {useManualData && (
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
                onClick={calculateOptionsWithBackend}
                size="large"
                fullWidth
              >
                Calculate Options
              </Button>
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Target Prices Display */}
      {sellPrices.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Target Sell Prices
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These are the projected stock prices based on your percentage increase inputs. 
              Each sell price is calculated as: Current Price × (1 + Percentage/100)
              {useManualData && (
                <>
                  <br />
                  <strong>Example:</strong> ${manualSecurityPrice} × 1.05 = ${(parseFloat(manualSecurityPrice) * 1.05).toFixed(2)} (+5%)
                </>
              )}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {sellPrices.map((price, index) => {
                const percentages = percentageIncrements.split(',').map(p => parseFloat(p.trim()));
                const currentPrice = useManualData ? parseFloat(manualSecurityPrice) : stockQuote?.price || 0;
                const increase = price - currentPrice;
                return (
                  <Chip
                    key={index}
                    label={`$${price.toFixed(2)} (+${percentages[index]}% / +$${increase.toFixed(2)})`}
                    variant="outlined"
                    color="primary"
                  />
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Stock Quote for Live Data */}
      {!useManualData && stockQuote && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h5">
                {stockQuote.symbol}
              </Typography>
              <Typography variant="h4" color="primary">
                ${stockQuote.price.toFixed(2)}
              </Typography>
              <Chip
                icon={stockQuote.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${stockQuote.change >= 0 ? '+' : ''}${stockQuote.change.toFixed(2)} (${stockQuote.changePercent.toFixed(2)}%)`}
                color={stockQuote.change >= 0 ? 'success' : 'error'}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date(stockQuote.lastUpdated).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Manual Results */}
      {useManualData && manualResults.size > 0 && (
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
                  
                  <TableContainer component={Paper}>                      <Table size="small">
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
      )}

      {/* Live Options Chain */}
      {!useManualData && optionsChain.length > 0 && (
        <Card>
          <CardContent>
            {!showDetailsView ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Options Chain - Call Options
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Click on any option to see potential returns at different price levels. Expiration: {optionsChain[0]?.expiration}
                  <br />
                  <strong>Pricing Note:</strong> Contract calculations use the mid-point price (average of bid and ask).
                </Typography>

                {/* Best Options Summary */}
                {getBestOptionsAtEachPercentage.size > 0 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Best Options by Price Increase:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Array.from(getBestOptionsAtEachPercentage.entries())
                        .sort(([a], [b]) => a - b)
                        .map(([percentage, { option, profit }]) => (
                          <Chip
                            key={percentage}
                            label={`+${percentage}%: $${option.strike} Strike (${profit >= 0 ? '+' : ''}$${profit.toFixed(0)} profit)`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                    </Box>
                  </Alert>
                )}
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Strike</TableCell>
                        <TableCell>Bid</TableCell>
                        <TableCell>Ask</TableCell>
                        <TableCell>Mid Price</TableCell>
                        <TableCell>Volume</TableCell>
                        <TableCell>Open Interest</TableCell>
                        <TableCell>IV</TableCell>
                        <TableCell>Moneyness</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {optionsChain.map((option) => {
                        const midPrice = roundMidpointUp(option.bid, option.ask);
                        const moneyness = stockQuote ? option.strike / stockQuote.price : 1;
                        const isITM = stockQuote ? stockQuote.price > option.strike : false;
                        const isATM = stockQuote ? Math.abs(stockQuote.price - option.strike) <= (stockQuote.price * 0.02) : false; // Within 2% is ATM
                        const isOTM = stockQuote ? stockQuote.price < option.strike : false;
                        
                        // Find which percentages this option is best for
                        const bestAtPercentages: number[] = [];
                        getBestOptionsAtEachPercentage.forEach((value, percentage) => {
                          if (value.option.symbol === option.symbol) {
                            bestAtPercentages.push(percentage);
                          }
                        });
                        
                        const getMoneyIndicator = () => {
                          if (isATM) return <Chip label="ATM" size="small" color="warning" variant="outlined" />;
                          if (isITM) return <Chip label="ITM" size="small" color="success" variant="outlined" />;
                          if (isOTM) return <Chip label="OTM" size="small" color="default" variant="outlined" />;
                          return null;
                        };
                        
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
                            key={option.symbol}
                            onClick={() => {
                              setSelectedOptionForDetails(option);
                              setShowDetailsView(true);
                            }}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                              bgcolor: bestAtPercentages.length > 0 ? 'primary.50' : 'inherit',
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  ${option.strike}
                                  {getMoneyIndicator()}
                                </Box>
                                {getBestAtIndicators()}
                              </Box>
                            </TableCell>
                            <TableCell>${option.bid.toFixed(2)}</TableCell>
                            <TableCell>${option.ask.toFixed(2)}</TableCell>
                            <TableCell>
                              <strong>${midPrice.toFixed(2)}</strong>
                              <Typography variant="caption" color="text.secondary" display="block">
                                (Used for calculations)
                              </Typography>
                            </TableCell>
                            <TableCell>{option.volume.toLocaleString()}</TableCell>
                            <TableCell>{option.openInterest.toLocaleString()}</TableCell>
                            <TableCell>{((option.impliedVolatility || 0) * 100).toFixed(1)}%</TableCell>
                            <TableCell>{moneyness.toFixed(3)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              selectedOptionForDetails && stockQuote && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <IconButton 
                      onClick={() => setShowDetailsView(false)}
                      sx={{ p: 1 }}
                    >
                      <ArrowBack />
                    </IconButton>
                    <Typography variant="h6">
                      Potential Returns for ${selectedOptionForDetails.strike} Strike
                    </Typography>
                  </Box>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Calculation Details:</strong><br />
                      • Cost per contract: ${roundMidpointUp(selectedOptionForDetails.bid, selectedOptionForDetails.ask).toFixed(2)} × 100 = ${(roundMidpointUp(selectedOptionForDetails.bid, selectedOptionForDetails.ask) * 100).toFixed(2)}<br />
                      • Number of contracts with ${investmentAmount}: {Math.floor(parseFloat(investmentAmount) / (roundMidpointUp(selectedOptionForDetails.bid, selectedOptionForDetails.ask) * 100))}<br />
                      • At expiration, profit = (max(Stock Price - Strike, 0) - Premium Paid) × 100 × Contracts
                    </Typography>
                  </Alert>

                  <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Price Increase</TableCell>
                          <TableCell>Stock Price</TableCell>
                          <TableCell>Option Value</TableCell>
                          <TableCell>Gain/Loss</TableCell>
                          <TableCell>% Return</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {percentageIncrements.split(',').map((increment) => {
                          const percentIncrease = parseFloat(increment.trim());
                          const newStockPrice = stockQuote.price * (1 + percentIncrease / 100);
                          const optionValue = Math.max(0, newStockPrice - selectedOptionForDetails.strike);
                          const premiumPaid = roundMidpointUp(selectedOptionForDetails.bid, selectedOptionForDetails.ask);
                          const profitPerShare = optionValue - premiumPaid;
                          const contractsAffordable = Math.floor(parseFloat(investmentAmount) / (premiumPaid * 100));
                          const totalProfit = profitPerShare * 100 * contractsAffordable;
                          const percentReturn = (totalProfit / parseFloat(investmentAmount)) * 100;

                          return (
                            <TableRow key={increment}>
                              <TableCell>+{percentIncrease}%</TableCell>
                              <TableCell>${newStockPrice.toFixed(2)}</TableCell>
                              <TableCell>${optionValue.toFixed(2)}</TableCell>
                              <TableCell
                                sx={{
                                  color: totalProfit >= 0 ? 'success.main' : 'error.main',
                                  fontWeight: 'bold',
                                }}
                              >
                                {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(0)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: percentReturn >= 0 ? 'success.main' : 'error.main',
                                  fontWeight: 'bold',
                                }}
                              >
                                {percentReturn >= 0 ? '+' : ''}{percentReturn.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* OpenAPI3 Documentation */}
      <Card id="api-help" sx={{ mb: 3, display: !useManualData && showApiConfig ? 'block' : 'none' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            OpenAPI 3.0 Specification
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            Your API endpoints must comply with the following OpenAPI 3.0 specification:
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
{`openapi: 3.0.3
info:
  title: Options Calculator API
  version: 1.0.0
  description: API endpoints required for live options data
servers:
  - url: https://your-api.com/v1
security:
  - ApiKeyAuth: []
paths:
  /quote/{symbol}:
    get:
      summary: Get stock quote
      security:
        - ApiKeyAuth: []
      parameters:
        - name: symbol
          in: path
          required: true
          schema:
            type: string
            example: AAPL
      responses:
        '200':
          description: Current stock quote
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StockQuote'
  /options/{symbol}:
    get:
      summary: Get options chain
      security:
        - ApiKeyAuth: []
      parameters:
        - name: symbol
          in: path
          required: true
          schema:
            type: string
            example: AAPL
      responses:
        '200':
          description: Options chain data
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/OptionQuote'
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
  schemas:
    StockQuote:
      type: object
      required:
        - symbol
        - price
        - change
        - changePercent
        - lastUpdated
      properties:
        symbol:
          type: string
          example: AAPL
        price:
          type: number
          format: float
          example: 175.50
        change:
          type: number
          format: float
          example: 2.30
        changePercent:
          type: number
          format: float
          example: 1.33
        lastUpdated:
          type: string
          format: date-time
          example: "2024-01-15T21:00:00.000Z"
    OptionQuote:
      type: object
      required:
        - symbol
        - strike
        - expiration
        - bid
        - ask
        - volume
        - openInterest
      properties:
        symbol:
          type: string
          example: AAPL_170
        strike:
          type: number
          format: float
          example: 170.00
        expiration:
          type: string
          format: date
          example: "2024-01-19"
        bid:
          type: number
          format: float
          example: 5.50
        ask:
          type: number
          format: float
          example: 5.70
        volume:
          type: integer
          example: 1250
        openInterest:
          type: integer
          example: 5430
        impliedVolatility:
          type: number
          format: float
          example: 0.28
          description: Optional - decimal form (0.28 = 28%)`}
            </Typography>
          </Alert>

          <Typography variant="subtitle2" gutterBottom>
            Implementation Notes:
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              • Replace <code>{'{symbol}'}</code> in your endpoint URLs with the actual stock symbol<br/>
              • Ensure proper CORS headers are included<br/>
              • Use HTTPS for production deployments<br/>
              • Consider rate limiting and authentication as needed<br/>
              • The impliedVolatility field is optional but recommended
            </Typography>
          </Alert>

          <Typography variant="subtitle2" gutterBottom>
            Sample Implementation (AWS Lambda + API Gateway):
          </Typography>
          <Alert severity="warning">
            <Typography variant="body2">
              A complete AWS Lambda implementation example with Terraform deployment scripts 
              is available at: <code>https://github.com/options-calculator/api-lambda-template</code>
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LiveOptionsCalculator;
