import { describe, expect, test } from 'bun:test';
import { parseOptionsCsv } from './csvOptionsParser';

const SAMPLE_CSV = `Strike Price,Bid,Ask,Volume,Open Interest,Expiration Date
165.00,8.50,8.80,1250,5430,2024-01-19
170.00,5.50,5.70,2100,4200,2024-01-19`;

describe('parseOptionsCsv', () => {
  test('parses a valid CSV into entries', () => {
    const result = parseOptionsCsv(SAMPLE_CSV);
    expect(result.error).toBeUndefined();
    expect(result.entries).toHaveLength(2);
    expect(result.entries?.[0]).toMatchObject({ strike: '165.00', bid: '8.50', ask: '8.80' });
    expect(result.entries?.[1]).toMatchObject({ strike: '170.00', bid: '5.50', ask: '5.70' });
  });

  test('parses an optional Price column when present', () => {
    const csv = `Strike Price,Bid,Ask,Price\n100,1.0,1.2,1.1`;
    const result = parseOptionsCsv(csv);
    expect(result.entries?.[0].price).toBe('1.1');
  });

  test('errors when there is no data row', () => {
    const result = parseOptionsCsv('Strike Price,Bid,Ask');
    expect(result.error).toBe('CSV must contain at least a header row and one data row');
    expect(result.entries).toBeUndefined();
  });

  test('errors when required columns are missing', () => {
    const result = parseOptionsCsv('Foo,Bar\n1,2');
    expect(result.error).toMatch(/Missing required columns/);
  });

  test('errors when a row has insufficient columns', () => {
    const csv = `Strike Price,Bid,Ask\n100,1.0`;
    const result = parseOptionsCsv(csv);
    expect(result.error).toBe('Row 2 has insufficient columns');
  });

  test('errors when a row is missing required data', () => {
    const csv = `Strike Price,Bid,Ask\n,1.0,1.2`;
    const result = parseOptionsCsv(csv);
    expect(result.error).toBe('Row 2 is missing required data (strike, bid, or ask)');
  });

  test('ignores blank lines', () => {
    const csv = `Strike Price,Bid,Ask\n100,1.0,1.2\n\n`;
    const result = parseOptionsCsv(csv);
    expect(result.entries).toHaveLength(1);
  });
});
