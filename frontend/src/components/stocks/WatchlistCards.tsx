import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Plus, X, TrendingUp, TrendingDown, RefreshCw, Building2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { stocksAPI, StockPrice } from '../../services/stockApi';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import StockSearchInput from './StockSearchInput';

// Company Logo Component
interface CompanyLogoProps {
  symbol: string;
  companyName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CompanyLogo = ({ symbol, companyName, size = 'md' }: CompanyLogoProps) => {
  const [logoError, setLogoError] = useState(false);
  const logoUrl = getCompanyLogoUrl(symbol, companyName);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  if (logoError || !logoUrl) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">{symbol.charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${symbol} logo`}
      className={`${sizeClasses[size]} rounded-lg object-cover bg-white`}
      onError={() => setLogoError(true)}
    />
  );
};

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
  sparklineData: { value: number }[];
}

// Generate simple sparkline data based on current price and change
const generateSparklineData = (currentPrice: number, changePercent: number): { value: number }[] => {
  const points = 12;
  const data: { value: number }[] = [];
  const maxVariation = 0.02; // 2% max variation
  
  for (let i = 0; i < points; i++) {
    const randomVariation = (Math.random() - 0.5) * maxVariation;
    const progressFactor = i / (points - 1);
    const trendFactor = (changePercent / 100) * progressFactor;
    const price = currentPrice * (1 + trendFactor + randomVariation);
    data.push({ value: Math.max(0, price) });
  }
  
  return data;
};

export default function WatchlistCards() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showAddStock, setShowAddStock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const watchlistRef = useRef<WatchlistItem[]>([]);
  
  // Auto-refresh interval (1 minute)
  const AUTO_REFRESH_INTERVAL = 60000; // 1 minute
  const intervalRef = useRef<NodeJS.Timeout>();

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stock-watchlist');
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        const formattedWatchlist = parsed.map((item: any) => ({
          symbol: item.symbol,
          name: item.name,
          price: item.price || 0,
          change: item.change || 0,
          changePercent: item.changePercent || 0,
          lastUpdated: item.lastUpdated || 0,
          sparklineData: item.sparklineData || []
        }));
        setWatchlist(formattedWatchlist);
        watchlistRef.current = formattedWatchlist;
      } catch (error) {
        console.error('Error parsing saved watchlist:', error);
        // Initialize with default stocks if parsing fails
        const defaultWatchlist = [
          { symbol: 'AAPL', name: 'Apple Inc.' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.' },
          { symbol: 'MSFT', name: 'Microsoft Corp.' },
          { symbol: 'TSLA', name: 'Tesla Inc.' },
          { symbol: 'NVDA', name: 'NVIDIA Corp.' },
          { symbol: 'AMZN', name: 'Amazon.com Inc.' }
        ].map(stock => ({
          ...stock,
          price: 0,
          change: 0,
          changePercent: 0,
          lastUpdated: 0,
          sparklineData: []
        }));
        setWatchlist(defaultWatchlist);
        watchlistRef.current = defaultWatchlist;
        localStorage.setItem('stock-watchlist', JSON.stringify(defaultWatchlist));
      }
    } else {
      // Initialize with popular stocks
      const defaultWatchlist = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corp.' },
        { symbol: 'TSLA', name: 'Tesla Inc.' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.' }
      ].map(stock => ({
        ...stock,
        price: 0,
        change: 0,
        changePercent: 0,
        lastUpdated: 0,
        sparklineData: []
      }));
      setWatchlist(defaultWatchlist);
      watchlistRef.current = defaultWatchlist;
      localStorage.setItem('stock-watchlist', JSON.stringify(defaultWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('stock-watchlist', JSON.stringify(watchlist));
      watchlistRef.current = watchlist;
    }
  }, [watchlist]);

  // Fetch quotes for stocks in watchlist
  const fetchQuotes = useCallback(async (targetWatchlist?: WatchlistItem[], force = false) => {
    const currentWatchlist = targetWatchlist || watchlistRef.current;
    if (currentWatchlist.length === 0) return;
    
    // Check if we need to update (only if forced or data is stale)
    if (!force) {
      const hasRecentData = currentWatchlist.some(item => 
        item.price > 0 && Date.now() - item.lastUpdated < 30000 // 30 seconds
      );
      if (hasRecentData) return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const symbols = currentWatchlist.map(item => item.symbol);
      console.log('🔄 Fetching quotes for:', symbols);
      
      // Fetch quotes using the enhanced Finnhub service
      const quotes = await stocksAPI.getMultipleQuotes(symbols);
      
      setWatchlist(prev => prev.map(item => {
        const quote = quotes[item.symbol];
        if (quote && quote.c > 0) {
          return {
            ...item,
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            lastUpdated: Date.now(),
            sparklineData: generateSparklineData(quote.c, quote.dp)
          };
        }
        return item;
      }));
      
      setLastRefresh(new Date());
      console.log('✅ Updated quotes for watchlist');
    } catch (error) {
      console.error('❌ Error fetching quotes:', error);
      setError('Failed to update stock prices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (watchlist.length > 0) {
      fetchQuotes(watchlist, true);
    }
  }, [fetchQuotes]);

  // Set up auto-refresh
  useEffect(() => {
    const startAutoRefresh = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refreshing watchlist data...');
        fetchQuotes(undefined, true);
      }, AUTO_REFRESH_INTERVAL);
    };

    if (watchlist.length > 0) {
      startAutoRefresh();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [watchlist.length, fetchQuotes]);

  // Manual refresh
  const handleManualRefresh = async () => {
    await fetchQuotes(undefined, true);
  };

  // Add stock to watchlist
  const addStock = async (symbol: string, name: string) => {
    if (watchlist.some(item => item.symbol === symbol.toUpperCase())) {
      setError(`${symbol.toUpperCase()} is already in your watchlist`);
      return;
    }

    const newStock: WatchlistItem = {
      symbol: symbol.toUpperCase(),
      name,
      price: 0,
      change: 0,
      changePercent: 0,
      lastUpdated: 0,
      sparklineData: []
    };

    const updatedWatchlist = [...watchlist, newStock];
    setWatchlist(updatedWatchlist);
    setShowAddStock(false);
    setError(null);

    // Fetch data for the new stock
    try {
      const quote = await stocksAPI.getStockPrice(symbol.toUpperCase());
      if (quote) {
        setWatchlist(prev => prev.map(item => 
          item.symbol === symbol.toUpperCase() 
            ? {
                ...item,
                price: quote.price,
                change: quote.change,
                changePercent: quote.change_percent,
                lastUpdated: Date.now(),
                sparklineData: generateSparklineData(quote.price, quote.change_percent)
              }
            : item
        ));
      }
    } catch (error) {
      console.error('Error fetching data for new stock:', error);
    }
  };

  // Remove stock from watchlist
  const removeStock = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Watchlist
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your favorite stocks</p>
            {lastRefresh && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setShowAddStock(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Stock
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="p-6">
        {showAddStock ? (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Add Stock to Watchlist</h3>
            <StockSearchInput 
              onSelect={addStock}
              placeholder="Search for stocks to add..."
            />
            <button 
              onClick={() => setShowAddStock(false)} 
              className="mt-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {isLoading && watchlist.filter(item => item.price > 0).length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading stock data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              const hasData = stock.price > 0;
              
              return (
                <div
                  key={stock.symbol}
                  className="relative group p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeStock(stock.symbol)}
                    className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Stock Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <CompanyLogo symbol={stock.symbol} companyName={stock.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h3>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{stock.name}</p>
                    </div>
                  </div>

                  {hasData ? (
                    <>
                      {/* Price and Change */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${stock.price.toFixed(2)}
                          </span>
                          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {formatPercentage(stock.changePercent)}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(stock.change)}
                        </p>
                      </div>

                      {/* Sparkline Chart */}
                      {stock.sparklineData.length > 0 && (
                        <div className="h-12 mb-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stock.sparklineData}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? '#16a34a' : '#dc2626'}
                                strokeWidth={2}
                                dot={false}
                                animationDuration={300}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Last Updated */}
                      {stock.lastUpdated > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Updated: {new Date(stock.lastUpdated).toLocaleTimeString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {watchlist.length === 0 && !showAddStock && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your watchlist is empty</p>
            <button
              onClick={() => setShowAddStock(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Stock
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 