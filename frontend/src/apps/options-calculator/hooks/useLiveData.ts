import { useState } from 'react';
import { fetchStockQuote, fetchOptionsChain, StockQuote, OptionQuote } from '../enhancedOptionsService';
import { separateCallsAndPuts } from '../utils/optionsSeparationUtils';

interface ApiEndpoints {
  stockQuoteUrl: string;
  optionsChainUrl: string;
  apiKey: string;
}

export const useLiveData = () => {
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [callsChain, setCallsChain] = useState<OptionQuote[]>([]);
  const [putsChain, setPutsChain] = useState<OptionQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<number>(0); // 0 for calls, 1 for puts
  
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoints>({
    stockQuoteUrl: '',
    optionsChainUrl: '',
    apiKey: ''
  });
  const [showApiConfig, setShowApiConfig] = useState<boolean>(true); // Show API config by default until configured

  const fetchData = async () => {
    if (!symbol.trim()) {
      throw new Error('Please enter a stock symbol');
    }

    setLoading(true);

    try {
      const [quote, rawOptions] = await Promise.all([
        fetchStockQuote(symbol.trim().toUpperCase(), apiEndpoints.stockQuoteUrl, apiEndpoints.apiKey),
        fetchOptionsChain(symbol.trim().toUpperCase(), apiEndpoints.optionsChainUrl, apiEndpoints.apiKey),
      ]);

      const { calls, puts } = separateCallsAndPuts(rawOptions);

      // Sort by expiration date first, then by strike price within each expiration
      calls.sort((a: OptionQuote, b: OptionQuote) => {
        const dateComparison = a.expiration.localeCompare(b.expiration);
        if (dateComparison !== 0) return dateComparison;
        return a.strike - b.strike;
      });
      puts.sort((a: OptionQuote, b: OptionQuote) => {
        const dateComparison = a.expiration.localeCompare(b.expiration);
        if (dateComparison !== 0) return dateComparison;
        return a.strike - b.strike;
      });

      setStockQuote(quote);
      setCallsChain(calls);
      setPutsChain(puts);
    } finally {
      setLoading(false);
    }
  };

  const isApiConfigured = !!(apiEndpoints.stockQuoteUrl && apiEndpoints.optionsChainUrl && apiEndpoints.apiKey);

  return {
    // State
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
    
    // Actions
    fetchData,
    isApiConfigured,
  };
};
