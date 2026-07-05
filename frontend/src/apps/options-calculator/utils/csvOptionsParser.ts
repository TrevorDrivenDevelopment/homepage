import { ManualOptionEntry } from '../hooks/useManualOptions';

export type CsvParseResult =
  | { entries: ManualOptionEntry[]; error?: undefined }
  | { entries?: undefined; error: string };

/**
 * Parses a CSV string of option contracts (Strike Price, Bid, Ask, [Price]) into
 * ManualOptionEntry records. Pure function, no DOM/File API dependency, so it's
 * fully unit-testable independent of the file upload UI.
 */
export const parseOptionsCsv = (text: string): CsvParseResult => {
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    return { error: 'CSV must contain at least a header row and one data row' };
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const requiredColumns = ['strike price', 'bid', 'ask'];

  const missingColumns = requiredColumns.filter(
    col => !header.some(h => h.includes(col.split(' ')[0]))
  );

  if (missingColumns.length > 0) {
    return { error: `Missing required columns: ${missingColumns.join(', ')}` };
  }

  const strikeIndex = header.findIndex(h => h.includes('strike'));
  const bidIndex = header.findIndex(h => h.includes('bid'));
  const askIndex = header.findIndex(h => h.includes('ask'));
  const priceIndex = header.findIndex(h => h.includes('price') && !h.includes('strike'));

  const newEntries: ManualOptionEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());

    if (values.length < Math.max(strikeIndex, bidIndex, askIndex) + 1) {
      return { error: `Row ${i + 1} has insufficient columns` };
    }

    const strike = values[strikeIndex];
    const bid = values[bidIndex];
    const ask = values[askIndex];
    const price = priceIndex >= 0 ? values[priceIndex] : '';

    if (!strike || !bid || !ask) {
      return { error: `Row ${i + 1} is missing required data (strike, bid, or ask)` };
    }

    newEntries.push({
      id: (Date.now() + Math.random() + i).toString(),
      strike,
      bid,
      ask,
      price: price || '',
    });
  }

  return { entries: newEntries };
};
