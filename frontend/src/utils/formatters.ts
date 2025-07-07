/**
 * Formats large financial values in human-readable shorthand format
 * @param value - The value to format (can be string with commas or number)
 * @param isMarketCap - Whether this is a market cap value from Finnhub (which comes in millions)
 * @returns Formatted string like "$550.5B", "$12.3M", etc.
 */
export const formatLargeNumber = (value: number | string, isMarketCap: boolean = false): string => {
  // Handle string input by removing commas and parsing as float
  let numValue: number;
  if (typeof value === 'string') {
    // Remove commas and parse as number
    numValue = parseFloat(value.replace(/,/g, ''));
  } else {
    numValue = value;
  }

  // Check if value is invalid
  if (isNaN(numValue) || numValue <= 0) {
    return 'N/A';
  }

  // Finnhub returns market cap in millions, so multiply by 1 million
  // For example: 550,519.022 from API = $550.519B actual market cap
  const actualValue = isMarketCap ? numValue * 1000000 : numValue;

  // Format with 1 decimal place for cleaner display
  if (actualValue >= 1e12) {
    return `$${(actualValue / 1e12).toFixed(1)}T`;
  } else if (actualValue >= 1e9) {
    return `$${(actualValue / 1e9).toFixed(1)}B`;
  } else if (actualValue >= 1e6) {
    return `$${(actualValue / 1e6).toFixed(1)}M`;
  } else if (actualValue >= 1e3) {
    return `$${(actualValue / 1e3).toFixed(1)}K`;
  }
  return `$${actualValue.toFixed(0)}`;
};

/**
 * Specifically formats market cap values from Finnhub API
 * @param marketCap - Market cap value from Finnhub (in millions)
 * @returns Formatted string like "$550.5B"
 */
export const formatMarketCap = (marketCap: number | string): string => {
  return formatLargeNumber(marketCap, true);
}; 