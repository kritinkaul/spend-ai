import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { stocksAPI, StockSearchResult } from '../../utils/stocksAPI';

interface StockSearchInputProps {
  onSelect: (symbol: string, name: string) => void;
  placeholder?: string;
  className?: string;
}

export default function StockSearchInput({ onSelect, placeholder = "Search stocks...", className = "" }: StockSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search stocks when query changes
  useEffect(() => {
    const searchStocks = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowResults(false);
        setError(null);
        return;
      }

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
        setError('Search failed. Please try again later.');
        setResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounceTimer);
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
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Searching...</span>
          </div>
        </div>
      )}

      {/* Results dropdown */}
      {showResults && results.length > 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.symbol}-${index}`}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {result.symbol}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.instrument_name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {result.exchange}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {result.country} • {result.currency}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && !isSearching && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        </div>
      )}
    </div>
  );
} 