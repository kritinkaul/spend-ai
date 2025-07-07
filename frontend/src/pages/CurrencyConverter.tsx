import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { 
  Calculator,
  TrendingUp,
  ArrowLeftRight,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Plus,
  Minus,
  X,
  Divide,
  Equal
} from 'lucide-react';
import {
  getLatestRates,
  formatCurrency,
  getCurrencyInfo,
  CURRENCIES,
  type CurrencyRate,
} from '../utils/currency';

interface ConversionHistory {
  id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  result: number;
  timestamp: Date;
}

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForNewValue: boolean;
}

export default function CurrencyConverter() {
  // Form state
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [conversionResult, setConversionResult] = useState<number | null>(null);
  
  // Calculator state
  const [isCalculatorMode, setIsCalculatorMode] = useState<boolean>(false);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForNewValue: false,
  });
  
  // History state
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>(() => {
    try {
      const saved = localStorage.getItem('currencyConverterHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Exchange rates query
  const { data: exchangeRates, isLoading: ratesLoading, error: ratesError, refetch: refetchRates } = useQuery(
    ['exchangeRates', fromCurrency],
    () => getLatestRates(fromCurrency),
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
      retry: 2,
    }
  );

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('currencyConverterHistory', JSON.stringify(conversionHistory));
    } catch (error) {
      console.error('Failed to save conversion history:', error);
    }
  }, [conversionHistory]);

  const handleConvert = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || !exchangeRates) return;
    
    try {
      const numAmount = Number(amount);
      const rate = exchangeRates[toCurrency];
      
      if (!rate) {
        console.error('Exchange rate not found for', toCurrency);
        return;
      }
      
      const result = numAmount * rate;
      setConversionResult(result);
      
      // Add to history
      const newConversion: ConversionHistory = {
        id: Date.now().toString(),
        amount: numAmount,
        fromCurrency,
        toCurrency,
        result,
        timestamp: new Date(),
      };
      
      setConversionHistory(prev => [newConversion, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Conversion error:', error);
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  // Auto-convert when data is available
  useEffect(() => {
    if (amount && exchangeRates && !isCalculatorMode) {
      handleConvert();
    }
  }, [amount, exchangeRates, isCalculatorMode, handleConvert]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Calculator functions
  const inputNumber = (num: string) => {
    if (calculatorState.waitingForNewValue) {
      setCalculatorState(prev => ({
        ...prev,
        display: num,
        waitingForNewValue: false,
      }));
    } else {
      setCalculatorState(prev => ({
        ...prev,
        display: prev.display === '0' ? num : prev.display + num,
      }));
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(calculatorState.display);

    if (calculatorState.previousValue === null) {
      setCalculatorState(prev => ({
        ...prev,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForNewValue: true,
      }));
    } else if (calculatorState.operation) {
      const currentValue = calculatorState.previousValue || 0;
      const newValue = calculate(currentValue, inputValue, calculatorState.operation);

      setCalculatorState({
        display: String(newValue),
        previousValue: newValue,
        operation: nextOperation,
        waitingForNewValue: true,
      });
    }
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(calculatorState.display);

    if (calculatorState.previousValue !== null && calculatorState.operation) {
      const newValue = calculate(calculatorState.previousValue, inputValue, calculatorState.operation);
      
      setCalculatorState({
        display: String(newValue),
        previousValue: null,
        operation: null,
        waitingForNewValue: true,
      });
      
      // Update amount with calculated value
      setAmount(String(newValue));
    }
  };

  const clearCalculator = () => {
    setCalculatorState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForNewValue: false,
    });
  };

  const currentRate = exchangeRates?.[toCurrency];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Currency Converter</h1>
          <p className="text-blue-100 text-lg">
            Convert currencies with live exchange rates and market insights.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversion Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Converter Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ArrowLeftRight className="h-5 w-5 mr-2 text-blue-600" />
                  Currency Converter
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsCalculatorMode(!isCalculatorMode)}
                    className={`p-2 rounded-lg transition-colors ${
                      isCalculatorMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Toggle Calculator Mode"
                  >
                    <Calculator className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => refetchRates()}
                    disabled={ratesLoading}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    title="Refresh Rates"
                  >
                    <RefreshCw className={`h-4 w-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={isCalculatorMode ? calculatorState.display : amount}
                  onChange={(e) => !isCalculatorMode && setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-medium"
                  placeholder="Enter amount"
                  readOnly={isCalculatorMode}
                />
              </div>

              {/* Currency Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSwapCurrencies}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title="Swap currencies"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion Result */}
              {conversionResult !== null && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(Number(amount), fromCurrency)} = {formatCurrency(conversionResult, toCurrency)}
                    </div>
                    {currentRate && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Calculator Mode */}
              {isCalculatorMode && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Calculator</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={clearCalculator} className="col-span-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      Clear
                    </button>
                    <button onClick={() => inputOperation('/')} className="p-3 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                      <Divide className="h-4 w-4 mx-auto" />
                    </button>
                    <button onClick={() => inputOperation('*')} className="p-3 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                      <X className="h-4 w-4 mx-auto" />
                    </button>

                    {[7, 8, 9].map(num => (
                      <button key={num} onClick={() => inputNumber(String(num))} className="p-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                        {num}
                      </button>
                    ))}
                    <button onClick={() => inputOperation('-')} className="p-3 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                      <Minus className="h-4 w-4 mx-auto" />
                    </button>

                    {[4, 5, 6].map(num => (
                      <button key={num} onClick={() => inputNumber(String(num))} className="p-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                        {num}
                      </button>
                    ))}
                    <button onClick={() => inputOperation('+')} className="p-3 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                      <Plus className="h-4 w-4 mx-auto" />
                    </button>

                    {[1, 2, 3].map(num => (
                      <button key={num} onClick={() => inputNumber(String(num))} className="p-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                        {num}
                      </button>
                    ))}
                    <button onClick={performCalculation} className="row-span-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Equal className="h-4 w-4 mx-auto" />
                    </button>

                    <button onClick={() => inputNumber('0')} className="col-span-2 p-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                      0
                    </button>
                    <button onClick={() => inputNumber('.')} className="p-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                      .
                    </button>
                  </div>
                </div>
              )}

              {/* Convert Button */}
              {!isCalculatorMode && (
                <button
                  onClick={handleConvert}
                  disabled={ratesLoading || !amount}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {ratesLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </div>
                  ) : (
                    'Convert'
                  )}
                </button>
              )}

              {/* Error Display */}
              {ratesError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{(ratesError as any)?.message || 'Failed to fetch exchange rates. Please try again.'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Exchange Rate Information */}
          {fromCurrency !== toCurrency && currentRate && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Exchange Rate Information
                </h3>
              </div>

              <div className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {currentRate.toFixed(6)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Live exchange rate • Updates every 5 minutes
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Conversions History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-600" />
                Recent Conversions
              </h3>
            </div>

            <div className="p-6">
              {conversionHistory.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversionHistory.map((conversion) => (
                    <div
                      key={conversion.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(conversion.amount, conversion.fromCurrency)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conversion.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-center py-2">
                        <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 text-center">
                        {formatCurrency(conversion.result, conversion.toCurrency)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        {conversion.fromCurrency} → {conversion.toCurrency}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversion history yet.</p>
                  <p className="text-sm">Start converting to see your recent transactions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 