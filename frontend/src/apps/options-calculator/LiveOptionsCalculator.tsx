import { Show, createSignal } from 'solid-js';
import { createTheme, ThemeProvider } from '@suid/material/styles';
import { LiveDataControls } from './components/LiveDataControls';
import { DataSourceToggle } from './components/DataSourceToggle';
import { ManualDataInput } from './components/ManualDataInput';
import { TargetPricesDisplay } from './components/TargetPricesDisplay';
import { StockQuoteCard } from './components/StockQuoteCard';
import { ManualResultsDisplay } from './components/ManualResultsDisplay';
import { ApiDocumentation } from './components/ApiDocumentation';
import { LiveOptionsChain } from './components/LiveOptionsChain';
import { ErrorModal } from './components/ErrorModal';
import { calculateManualOptionsResults, validateManualInputs, parseManualOptionsFromEntries } from './utils/manualOptionsUtils';
import { calculatePerformanceForOption } from './utils/optionsCalculationUtils';
import { useLiveData } from './hooks/useLiveData';

interface ManualOptionEntry {
  id: string;
  strike: string;
  bid: string;
  ask: string;
  price?: string;
}

interface OptionResult {
  strike: number;
  bid: number;
  ask: number;
  price?: number;
  gainLoss: number;
  actualInvestment: number;
  shares: number;
  contracts: number;
  percentageGainLoss: number;
}

interface LiveOptionsCalculatorProps {
  onNavigate?: (page: string) => void;
}

const LiveOptionsCalculator = (props: LiveOptionsCalculatorProps) => {
  // Initialize live data hook
  const {
    symbol: stockSymbol,
    setSymbol: setStockSymbol,
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
    fetchData,
    isApiConfigured,
  } = useLiveData();

  // Create dark theme to match the homepage
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#7CE2FF',
      },
      secondary: {
        main: '#4A6E8D',
      },
      background: {
        default: '#1B3A57',
        paper: '#4A6E8D',
      },
      text: {
        primary: '#ffffff',
        secondary: '#7CE2FF',
      },
    },
  });
  const [useManualData, setUseManualData] = createSignal(true);
  const [manualSecurityPrice, setManualSecurityPrice] = createSignal('150.00');
  const [percentageIncrements, setPercentageIncrements] = createSignal('5, 10, 15, 20');
  const [investmentAmount, setInvestmentAmount] = createSignal('10000');
  const [errorMessage, setErrorMessage] = createSignal('');
  
  // Manual options state
  const [manualOptionEntries, setManualOptionEntries] = createSignal<ManualOptionEntry[]>([
    { id: '1', strike: '155', bid: '8.50', ask: '8.80', price: '' }
  ]);
  const [manualResults, setManualResults] = createSignal(new Map<number, OptionResult[]>());
  const [bestManualOptions, setBestManualOptions] = createSignal<{
    best?: OptionResult;
    secondBest?: OptionResult;
  }>({});
  const [csvUploadError, setCsvUploadError] = createSignal<string | null>(null);

  // Mock data for demonstration
  const mockStockQuote = () => ({
    symbol: stockSymbol(),
    price: parseFloat(manualSecurityPrice()),
    change: 2.5,
    changePercent: '1.5%'
  });

  const sellPrices = () => {
    const price = parseFloat(manualSecurityPrice());
    const percentages = percentageIncrements().split(',').map(p => parseFloat(p.trim()));
    return percentages.map(pct => price * (1 + pct / 100));
  };

  // Manual options functions
  const addManualOptionEntry = () => {
    const newId = (Date.now() + Math.random()).toString();
    setManualOptionEntries([...manualOptionEntries(), { id: newId, strike: '', bid: '', ask: '', price: '' }]);
  };

  const removeManualOptionEntry = (id: string) => {
    if (manualOptionEntries().length > 1) {
      setManualOptionEntries(manualOptionEntries().filter(entry => entry.id !== id));
    }
  };

  const updateManualOptionEntry = (id: string, field: keyof ManualOptionEntry, value: string) => {
    setManualOptionEntries(manualOptionEntries().map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
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

  const handleCsvUpload = (event: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => {
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
        
        // Automatically trigger calculation
        calculateOptions();
        
      } catch (error) {
        setCsvUploadError('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const calculateOptions = () => {
    try {
      const options = parseManualOptionsFromEntries(manualOptionEntries());
      const { securityPrice, investmentAmount: investment, percentages } = validateManualInputs(
        manualSecurityPrice(),
        investmentAmount(),
        percentageIncrements(),
        options
      );

      const results = calculateManualOptionsResults(options, securityPrice, investment, percentages);
      setManualResults(results);

      // Find best options
      let best: OptionResult | undefined;
      let secondBest: OptionResult | undefined;
      
      for (const optionsAtPrice of results.values()) {
        for (const option of optionsAtPrice) {
          if (!best || option.gainLoss > best.gainLoss) {
            secondBest = best;
            best = option;
          } else if (!secondBest || option.gainLoss > secondBest.gainLoss) {
            secondBest = option;
          }
        }
      }

      setBestManualOptions({ best, secondBest });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during calculation');
    }
  };

  const getBestManualOptionsAtEachPercentage = () => {
    const best = new Map<number, { option: OptionResult; profit: number }>();
    for (const [sellPrice, options] of manualResults()) {
      if (options.length > 0) {
        const bestOption = options[0];
        best.set(sellPrice, { option: bestOption, profit: bestOption.gainLoss });
      }
    }
    return best;
  };

  const calculatePerformanceForOptionWrapper = (option: OptionResult) => {
    return calculatePerformanceForOption(option, sellPrices(), percentageIncrements());
  };

  // Wrapper for fetchData with error handling
  const handleFetchData = async () => {
    try {
      await fetchData();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch live data');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ 
        padding: "20px",
        "max-width": "1200px",
        margin: "0 auto",
        "background-color": "#1B3A57",
        color: "#ffffff",
        "min-height": "100vh"
      }}>
      <Show when={props.onNavigate}>
        <div style={{ "margin-bottom": "20px", "text-align": "center" }}>
          <span 
            onClick={() => props.onNavigate?.('applications')}
            style={{ 
              color: '#7CE2FF', 
              cursor: 'pointer', 
              "text-decoration": 'underline',
              "font-size": "16px"
            }}
          >
            ← Back to Applications
          </span>
        </div>
      </Show>
      
      <div style={{ 
        "margin-bottom": "24px",
        border: "1px solid #4A6E8D",
        "border-radius": "4px",
        "box-shadow": "0 1px 3px rgba(0,0,0,0.12)",
        "background-color": "#4A6E8D"
      }}>
        <div style={{ padding: "16px" }}>
          <h2 style={{ 
            margin: "0 0 16px 0",
            "font-size": "1.5rem",
            "font-weight": "500",
            color: "#ffffff"
          }}>
            Live Options Calculator
          </h2>
          
          <div style={{ 
            "background-color": "#1B3A57",
            border: "1px solid #7CE2FF",
            "border-radius": "4px",
            padding: "12px",
            "margin-bottom": "16px"
          }}>
            <p style={{ 
              margin: "0",
              "font-size": "0.875rem",
              color: "#7CE2FF"
            }}>
              Calculate potential profits from options trades. Use manual entry to test scenarios or configure live data for real-time analysis.
            </p>
          </div>

          {/* Data Source Toggle */}
          <DataSourceToggle
            useManualData={useManualData()}
            setUseManualData={setUseManualData}
            apiEndpoints={apiEndpoints()}
            setApiEndpoints={setApiEndpoints}
            showApiConfig={showApiConfig()}
            setShowApiConfig={setShowApiConfig}
          />

          {/* Manual Data Input */}
          <Show when={useManualData()}>
            <ManualDataInput
              manualSecurityPrice={manualSecurityPrice()}
              setManualSecurityPrice={setManualSecurityPrice}
              investmentAmount={investmentAmount()}
              setInvestmentAmount={setInvestmentAmount}
              percentageIncrements={percentageIncrements()}
              setPercentageIncrements={setPercentageIncrements}
              manualOptionEntries={manualOptionEntries()}
              addManualOptionEntry={addManualOptionEntry}
              removeManualOptionEntry={removeManualOptionEntry}
              updateManualOptionEntry={updateManualOptionEntry}
              handleCsvUpload={handleCsvUpload}
              downloadSampleCsv={downloadSampleCsv}
              csvUploadError={csvUploadError()}
              onCalculate={calculateOptions}
            />
          </Show>

          {/* Live Data Controls */}
          <Show when={!useManualData()}>
            <LiveDataControls
              symbol={stockSymbol()}
              setSymbol={setStockSymbol}
              percentageIncrements={percentageIncrements()}
              setPercentageIncrements={setPercentageIncrements}
              investmentAmount={investmentAmount()}
              setInvestmentAmount={setInvestmentAmount}
              loading={loading()}
              onFetchData={handleFetchData}
              isApiConfigured={isApiConfigured()}
            />
          </Show>

          {/* Target Prices Display */}
          <TargetPricesDisplay
            sellPrices={sellPrices()}
            percentageIncrements={percentageIncrements()}
            useManualData={useManualData()}
            manualSecurityPrice={manualSecurityPrice()}
            stockQuote={mockStockQuote()}
          />

          {/* Stock Quote Card */}
          <Show when={!useManualData()}>
            <StockQuoteCard
              stockQuote={stockQuote() || mockStockQuote()}
            />
          </Show>

          {/* Manual Results Display */}
          <Show when={useManualData()}>
            <ManualResultsDisplay
              manualResults={manualResults()}
              bestManualOptions={bestManualOptions()}
              getBestManualOptionsAtEachPercentage={getBestManualOptionsAtEachPercentage()}
              calculatePerformanceForOption={calculatePerformanceForOptionWrapper}
            />
          </Show>

          {/* API Documentation */}
          <ApiDocumentation
            showApiConfig={showApiConfig()}
            useManualData={useManualData()}
            onToggle={() => setShowApiConfig(!showApiConfig())}
          />

          {/* Live Options Chain */}
          <Show when={!useManualData()}>
            <LiveOptionsChain
              callsChain={callsChain()}
              putsChain={putsChain()}
              stockQuote={stockQuote() || mockStockQuote()}
              selectedTab={selectedTab()}
              setSelectedTab={setSelectedTab}
              getBestCallsAtEachPercentage={new Map()}
              getBestPutsAtEachPercentage={new Map()}
              selectedOptionForDetails={null}
              setSelectedOptionForDetails={() => {}}
              showDetailsView={false}
              setShowDetailsView={() => {}}
              investmentAmount={investmentAmount()}
              percentageIncrements={percentageIncrements()}
            />
          </Show>

          {/* Error Modal */}
          <ErrorModal
            open={errorMessage().length > 0}
            error={errorMessage()}
            onClose={() => setErrorMessage('')}
          />
        </div>
      </div>
      </div>
    </ThemeProvider>
  );
};

export default LiveOptionsCalculator;
