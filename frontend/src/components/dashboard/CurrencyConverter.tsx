import { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, DollarSign, TrendingUp, TrendingDown, Globe, AlertCircle } from 'lucide-react';

interface CurrencyConverterProps {
  className?: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' }
];

export default function CurrencyConverter({ className = "" }: CurrencyConverterProps) {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Mock exchange rates for demo (in production, use real API)
  const getMockExchangeRate = (from: string, to: string): number => {
    const rates: Record<string, Record<string, number>> = {
      USD: { EUR: 0.85, GBP: 0.73, JPY: 110, CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45, INR: 74.5, BTC: 0.000023 },
      EUR: { USD: 1.18, GBP: 0.86, JPY: 130, CAD: 1.47, AUD: 1.59, CHF: 1.08, CNY: 7.6, INR: 87.8, BTC: 0.000027 },
      GBP: { USD: 1.37, EUR: 1.16, JPY: 151, CAD: 1.71, AUD: 1.85, CHF: 1.26, CNY: 8.84, INR: 102, BTC: 0.000031 },
      JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, CAD: 0.011, AUD: 0.012, CHF: 0.0084, CNY: 0.059, INR: 0.68, BTC: 0.00000021 }
    };

    if (from === to) return 1;
    
    // If we have direct conversion
    if (rates[from] && rates[from][to]) {
      return rates[from][to];
    }
    
    // If we have reverse conversion
    if (rates[to] && rates[to][from]) {
      return 1 / rates[to][from];
    }
    
    // Convert through USD if needed
    if (from !== 'USD' && to !== 'USD') {
      const fromToUSD = rates[from]?.USD || (rates['USD'][from] ? 1 / rates['USD'][from] : 1);
      const usdToTo = rates['USD'][to] || (rates[to]?.USD ? 1 / rates[to]['USD'] : 1);
      return fromToUSD * usdToTo;
    }

    // Default rate if not found
    return 1;
  };

  const fetchExchangeRate = async () => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(parseFloat(amount) || 0);
      setExchangeRate({
        from: fromCurrency,
        to: toCurrency,
        rate: 1,
        lastUpdated: new Date().toISOString()
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In production, use a real API like:
      // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      // const data = await response.json();
      // const rate = data.rates[toCurrency];

      // For demo, simulate API delay and use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const rate = getMockExchangeRate(fromCurrency, toCurrency);
      const inputAmount = parseFloat(amount) || 0;
      const converted = inputAmount * rate;

      setExchangeRate({
        from: fromCurrency,
        to: toCurrency,
        rate,
        lastUpdated: new Date().toISOString()
      });
      
      setConvertedAmount(converted);
      setLastUpdated(new Date().toLocaleTimeString());
      
    } catch (err) {
      setError('Failed to fetch exchange rate');
      console.error('Exchange rate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-convert when values change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (amount && fromCurrency && toCurrency) {
        fetchExchangeRate();
      }
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (value: number, currencyCode: string) => {
    const currency = POPULAR_CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    
    // Format based on currency
    if (currencyCode === 'BTC') {
      return `${symbol}${value.toFixed(8)}`;
    } else if (currencyCode === 'JPY') {
      return `${symbol}${value.toFixed(0)}`;
    } else {
      return `${symbol}${value.toFixed(2)}`;
    }
  };

  const getRateChange = () => {
    // Mock rate change for demo
    const change = (Math.random() - 0.5) * 0.02; // ±1% change
    return {
      percent: change * 100,
      isPositive: change > 0
    };
  };

  const rateChange = getRateChange();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              Currency Converter
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Real-time exchange rates
            </p>
          </div>
          
          <button
            onClick={fetchExchangeRate}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {POPULAR_CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {POPULAR_CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleSwapCurrencies}
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Swap currencies"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        {/* Result */}
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Conversion Result */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Converted Amount</p>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-lg text-gray-500">Converting...</span>
                  </div>
                ) : convertedAmount !== null ? (
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(convertedAmount, toCurrency)}
                  </p>
                ) : (
                  <p className="text-lg text-gray-500">Enter amount to convert</p>
                )}
              </div>
            </div>

            {/* Exchange Rate Info */}
            {exchangeRate && !isLoading && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Exchange Rate
                  </span>
                  <div className="flex items-center gap-1">
                    {rateChange.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${rateChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {rateChange.isPositive ? '+' : ''}{rateChange.percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    1 {fromCurrency} = {exchangeRate.rate.toFixed(4)} {toCurrency}
                  </p>
                  <p>
                    1 {toCurrency} = {(1 / exchangeRate.rate).toFixed(4)} {fromCurrency}
                  </p>
                </div>

                {lastUpdated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Last updated: {lastUpdated}
                  </p>
                )}
              </div>
            )}

            {/* Quick Convert Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 10, 100, 1000].map(quickAmount => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {quickAmount}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 