import { OptionQuote } from '../enhancedOptionsService';

interface SeparateResult {
  calls: OptionQuote[];
  puts: OptionQuote[];
}

export const separateCallsAndPuts = (rawOptions: OptionQuote[]): SeparateResult => {
  // Simply separate calls and puts without any filtering - let the backend handle data quality
  const calls = rawOptions.filter(option => {
    // Include call options (default to call if type not specified)
    return !option.type || option.type === 'call';
  });

  const puts = rawOptions.filter(option => {
    // Include put options
    return option.type === 'put';
  });

  return { calls, puts };
};
