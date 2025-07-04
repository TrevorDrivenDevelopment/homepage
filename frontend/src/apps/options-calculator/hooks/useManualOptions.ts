import { useState, useMemo } from 'react';

export interface ManualOptionProfile {
  strike: number;
  bid: number;
  ask: number;
  price?: number;
}

export interface ManualOptionEntry {
  id: string;
  strike: string;
  bid: string;
  ask: string;
  price?: string;
}

export interface OptionResult extends ManualOptionProfile {
  gainLoss: number;
  actualInvestment: number;
  shares: number;
  contracts: number;
  percentageGainLoss: number;
}

export const useManualOptions = () => {
  const [manualSecurityPrice, setManualSecurityPrice] = useState<string>('100');
  const [manualOptionEntries, setManualOptionEntries] = useState<ManualOptionEntry[]>([
    { id: '1', strike: '', bid: '', ask: '', price: '' }
  ]);
  const [manualResults, setManualResults] = useState<Map<number, OptionResult[]>>(new Map());
  const [bestManualOptions, setBestManualOptions] = useState<{
    best?: OptionResult;
    secondBest?: OptionResult;
  }>({});
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);

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

  const handleCsvUpload = (
    event: React.ChangeEvent<HTMLInputElement>, 
    calculateCallback: (entries: ManualOptionEntry[]) => void
  ) => {
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
        calculateCallback(newEntries);
        
      } catch (error) {
        setCsvUploadError('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  return {
    manualSecurityPrice,
    setManualSecurityPrice,
    manualOptionEntries,
    setManualOptionEntries,
    manualResults,
    setManualResults,
    bestManualOptions,
    setBestManualOptions,
    csvUploadError,
    setCsvUploadError,
    addManualOptionEntry,
    removeManualOptionEntry,
    updateManualOptionEntry,
    parseManualOptionsData,
    parseManualOptionsFromEntries,
    downloadSampleCsv,
    handleCsvUpload,
  };
};
