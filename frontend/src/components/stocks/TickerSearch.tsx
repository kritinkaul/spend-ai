import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Building2 } from 'lucide-react';
import { stocksAPI, StockSearchResult } from '../../utils/stocksAPI';

interface TickerSearchProps {
  onSelect: (symbol: string, name: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export default function TickerSearch({ 
  onSelect, 
  placeholder = "Search stocks (e.g., AAPL, TSLA)...", 
  className = "",
  initialValue = ""
}: TickerSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popularTickers] = useState(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX']);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number>();

  // Debounced search function
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        console.log('🔍 Searching for:', query);
        const searchResults = await stocksAPI.searchStocks(query);
        setResults(searchResults);
        setShowResults(searchResults.length > 0);
        
        if (searchResults.length === 0) {
          setError('No stocks found. Try a different search term.');
        }
      } catch (error) {
        console.error('❌ Search error:', error);
        setError(error instanceof Error ? error.message : 'Search failed. Please try again.');
        setResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: StockSearchResult) => {
    onSelect(result.symbol, result.instrument_name);
    setQuery(result.symbol);
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  const handlePopularSelect = (symbol: string) => {
    onSelect(symbol, symbol);
    setQuery(symbol);
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    } else if (query.length === 0) {
      setShowResults(true); // Show popular tickers when input is empty
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          onFocus={handleInputFocus}
          maxLength={10}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Search Results or Popular Tickers */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {query.length === 0 && results.length === 0 && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Popular Stocks</span>
                </div>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-4 gap-2">
                  {popularTickers.map((ticker) => (
                    <button
                      key={ticker}
                      onClick={() => handlePopularSelect(ticker)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {ticker}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {results.length > 0 && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Search Results</span>
              </div>
              {results.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="font-medium text-gray-900 dark:text-white">{result.symbol}</div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {result.instrument_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {result.exchange} • {result.country}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                      {result.type}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 z-50">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
} 