import { describe, expect, test } from 'bun:test';
import {
  parseManualOptionsFromEntries,
  validateManualInputs,
  calculateManualOptionsResults,
} from './manualOptionsUtils';
import type { ManualOptionEntry } from '../hooks/useManualOptions';

describe('parseManualOptionsFromEntries', () => {
  test('parses valid entries into ManualOptionProfile objects', () => {
    const entries: ManualOptionEntry[] = [
      { id: '1', strike: '150', bid: '8.50', ask: '8.80', price: '' },
      { id: '2', strike: '160', bid: '4.00', ask: '4.20', price: '4.10' },
    ];
    const result = parseManualOptionsFromEntries(entries);
    expect(result).toEqual([
      { strike: 150, bid: 8.5, ask: 8.8, price: undefined },
      { strike: 160, bid: 4.0, ask: 4.2, price: 4.1 },
    ]);
  });

  test('skips entries with missing or invalid strike/bid/ask', () => {
    const entries: ManualOptionEntry[] = [
      { id: '1', strike: '', bid: '8.50', ask: '8.80', price: '' },
      { id: '2', strike: 'abc', bid: '4.00', ask: '4.20', price: '' },
      { id: '3', strike: '170', bid: '2.00', ask: '2.20', price: '' },
    ];
    const result = parseManualOptionsFromEntries(entries);
    expect(result).toEqual([{ strike: 170, bid: 2.0, ask: 2.2, price: undefined }]);
  });

  test('returns an empty array when given no entries', () => {
    expect(parseManualOptionsFromEntries([])).toEqual([]);
  });
});

describe('validateManualInputs', () => {
  const validOptions = [{ strike: 150, bid: 1, ask: 1.2 }];

  test('returns parsed values for valid input', () => {
    const result = validateManualInputs('100', '10000', '5, 10, 15', validOptions);
    expect(result.securityPrice).toBe(100);
    expect(result.investmentAmount).toBe(10000);
    expect(result.percentages).toEqual([5, 10, 15]);
  });

  test('throws when security price is not positive', () => {
    expect(() => validateManualInputs('0', '10000', '5', validOptions)).toThrow(
      'Security price must be a positive number'
    );
    expect(() => validateManualInputs('-5', '10000', '5', validOptions)).toThrow(
      'Security price must be a positive number'
    );
  });

  test('throws when investment amount is not positive', () => {
    expect(() => validateManualInputs('100', '0', '5', validOptions)).toThrow(
      'Investment amount must be a positive number'
    );
  });

  test('throws when percentage increments are invalid', () => {
    expect(() => validateManualInputs('100', '10000', '5, abc', validOptions)).toThrow(
      'All percentage increments must be valid numbers'
    );
  });

  test('throws when no options are provided', () => {
    expect(() => validateManualInputs('100', '10000', '5', [])).toThrow(
      'Please provide at least one option'
    );
  });
});

describe('calculateManualOptionsResults', () => {
  test('computes gain/loss and ranks options at each sell price', () => {
    const options = [{ strike: 100, bid: 1.0, ask: 1.0 }];
    const results = calculateManualOptionsResults(options, 100, 1000, [10]);

    // sellPrice = 100 * 1.10 = 110
    expect(results.has(110)).toBe(true);
    const atSellPrice = results.get(110)!;
    expect(atSellPrice.length).toBe(1);

    const result = atSellPrice[0];
    expect(result.contracts).toBe(10);
    expect(result.shares).toBe(1000);
    expect(result.actualInvestment).toBe(1000);
    // gainLoss = (110 - 100) * 1000 - 1000 = 9000
    expect(result.gainLoss).toBe(9000);
    expect(result.percentageGainLoss).toBe(900);
  });

  test('treats sell price at or below strike as a total loss', () => {
    const options = [{ strike: 150, bid: 1.0, ask: 1.0 }];
    const results = calculateManualOptionsResults(options, 100, 500, [10]); // sellPrice = 110 < strike 150

    const atSellPrice = results.get(110)!;
    expect(atSellPrice[0].gainLoss).toBe(-atSellPrice[0].actualInvestment);
    expect(atSellPrice[0].percentageGainLoss).toBe(-100);
  });

  test('excludes options that cannot afford a single contract', () => {
    const options = [{ strike: 100, bid: 1.0, ask: 1.0 }]; // $100/contract
    const results = calculateManualOptionsResults(options, 100, 10, [10]); // only $10 to invest

    expect(results.get(110)).toBeUndefined();
  });

  test('keeps only the top 5 results per sell price, sorted by gain/loss descending', () => {
    const options = Array.from({ length: 8 }, (_, i) => ({
      strike: 90 + i, // varying strikes -> varying gain/loss
      bid: 1.0,
      ask: 1.0,
    }));
    const results = calculateManualOptionsResults(options, 100, 100000, [20]);

    const atSellPrice = results.get(120)!;
    expect(atSellPrice.length).toBe(5);

    // Verify descending order by gainLoss
    for (let i = 1; i < atSellPrice.length; i++) {
      expect(atSellPrice[i - 1].gainLoss).toBeGreaterThanOrEqual(atSellPrice[i].gainLoss);
    }
  });

  test('uses explicit option price over bid/ask midpoint when provided', () => {
    const options = [{ strike: 100, bid: 1.0, ask: 3.0, price: 2.5 }];
    const results = calculateManualOptionsResults(options, 100, 1000, [10]);
    const atSellPrice = results.get(110)!;
    // totalCostPerContract = 2.5 * 100 = 250, contracts = floor(1000/250) = 4
    expect(atSellPrice[0].contracts).toBe(4);
  });
});
