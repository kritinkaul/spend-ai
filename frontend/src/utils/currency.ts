import axios from 'axios';

const API_KEY = import.meta.env.VITE_CURRENCY_API_KEY;
const BASE_URL = 'https://api.freecurrencyapi.com/v1';

export interface CurrencyRate {
  [key: string]: number;
}

export interface HistoricalRate {
  date: string;
  [currency: string]: string | number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

// Common currency information
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
];

/**
 * Get the latest exchange rates
 * @param baseCurrency - Base currency (default: USD)
 * @param currencies - Specific currencies to get rates for (optional)
 */
export const getLatestRates = async (
  baseCurrency: string = 'USD',
  currencies?: string[]
): Promise<CurrencyRate> => {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('Currency API key not found. Please check your .env file.');
      throw new Error('Currency API key not configured. Please restart the development server.');
    }

    const params: any = {
      apikey: API_KEY,
      base_currency: baseCurrency,
    };
    
    if (currencies && currencies.length > 0) {
      params.currencies = currencies.join(',');
    }

    console.log('Fetching rates with params:', params);
    const response = await axios.get(`${BASE_URL}/latest`, { params });
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from currency API');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching latest rates:', error);
    
    if (error.response) {
      // API responded with error
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`API Error (${status}): ${message}`);
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Other error
      throw new Error(error.message || 'Failed to fetch exchange rates. Please try again.');
    }
  }
};

/**
 * Get historical exchange rates
 * @param baseCurrency - Base currency (default: USD)
 * @param targetCurrency - Target currency to get historical data for
 * @param dateFrom - Start date (YYYY-MM-DD format)
 * @param dateTo - End date (YYYY-MM-DD format)
 */
export const getHistoricalRates = async (
  baseCurrency: string = 'USD',
  targetCurrency: string,
  dateFrom: string,
  dateTo: string
): Promise<HistoricalRate[]> => {
  try {
    if (!API_KEY) {
      console.error('Currency API key not found. Please check your .env file.');
      throw new Error('Currency API key not configured. Please restart the development server.');
    }

    const params = {
      apikey: API_KEY,
      base_currency: baseCurrency,
      currencies: targetCurrency,
      date_from: dateFrom,
      date_to: dateTo,
    };

    console.log('Fetching historical rates with params:', params);
    const response = await axios.get(`${BASE_URL}/historical`, { params });
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from currency API');
    }
    
    const data = response.data.data;
    
    // Transform the data into a more usable format for charting
    return Object.entries(data).map(([date, rates]) => ({
      date,
      [targetCurrency]: (rates as any)[targetCurrency],
      rate: (rates as any)[targetCurrency], // For easier chart access
    }));
  } catch (error: any) {
    console.error('Error fetching historical rates:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`API Error (${status}): ${message}`);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Failed to fetch historical exchange rates. Please try again.');
    }
  }
};

/**
 * Convert an amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param rates - Current exchange rates (if not provided, will fetch latest)
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates?: CurrencyRate
): Promise<number> => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    let exchangeRates = rates;
    if (!exchangeRates) {
      exchangeRates = await getLatestRates(fromCurrency, [toCurrency]);
    }

    const rate = exchangeRates[toCurrency];
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw new Error('Failed to convert currency. Please try again.');
  }
};

/**
 * Format currency amount with symbol
 * @param amount - Amount to format
 * @param currencyCode - Currency code
 * @param locale - Locale for formatting (default: en-US)
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if currency code is not supported
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    return `${symbol}${amount.toLocaleString(locale, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 6 
    })}`;
  }
};

/**
 * Get currency information by code
 * @param code - Currency code
 */
export const getCurrencyInfo = (code: string): CurrencyInfo | undefined => {
  return CURRENCIES.find(currency => currency.code === code);
};

/**
 * Get the last 30 days date range
 */
export const getLast30DaysRange = (): { dateFrom: string; dateTo: string } => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
    dateTo: today.toISOString().split('T')[0],
  };
}; 