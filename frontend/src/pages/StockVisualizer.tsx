import { useState, useEffect } from 'react';
import { Search, BarChart3, Clock, AlertCircle, Star, History } from 'lucide-react';
import TickerSearch from '../components/stocks/TickerSearch';
import StockChart from '../components/stocks/StockChart';
import StockSummary from '../components/stocks/StockSummary';
// Removed unused stocksAPI import

interface RecentStock {
  symbol: string;
  name: string;
  timestamp: Date;
}

export default function StockVisualizer() {
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);
  const [recentStocks, setRecentStocks] = useState<RecentStock[]>([]);
  const [marketStatus, setMarketStatus] = useState<{ is_market_open: boolean; market_state: string } | null>(null);

  // Popular stocks to display initially
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
  ];

  // Load recent stocks from localStorage
  useEffect(() => {
    const savedRecent = localStorage.getItem('recent-stocks');
    if (savedRecent) {
      try {
        const parsed = JSON.parse(savedRecent).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setRecentStocks(parsed);
      } catch (error) {
        console.error('Error parsing recent stocks:', error);
      }
    }
    
    // Set default stock to AAPL
    setSelectedStock({ symbol: 'AAPL', name: 'Apple Inc.' });
  }, []);

  // Fetch market status
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        // Mock market status for now
        setMarketStatus({ is_market_open: true, market_state: 'Market Open' });
      } catch (error) {
        console.error('Failed to fetch market status:', error);
      }
    };

    fetchMarketStatus();
  }, []);

  // Handle stock selection
  const handleStockSelect = (symbol: string, name: string) => {
    const newStock = { symbol: symbol.toUpperCase(), name };
    setSelectedStock(newStock);

    // Add to recent stocks
    const newRecentStock: RecentStock = {
      symbol: newStock.symbol,
      name: newStock.name,
      timestamp: new Date()
    };

    setRecentStocks(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(stock => stock.symbol !== newStock.symbol);
      // Add new entry at the beginning
      const updated = [newRecentStock, ...filtered].slice(0, 10); // Keep only last 10
      
      // Save to localStorage
      localStorage.setItem('recent-stocks', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle popular stock selection
  const handlePopularStockSelect = (stock: { symbol: string; name: string }) => {
    handleStockSelect(stock.symbol, stock.name);
  };

  // Handle recent stock selection
  const handleRecentStockSelect = (stock: RecentStock) => {
    handleStockSelect(stock.symbol, stock.name);
  };

  // Clear recent stocks
  const handleClearRecent = () => {
    setRecentStocks([]);
    localStorage.removeItem('recent-stocks');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            Stock Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time stock charts and analysis with historical data
          </p>
        </div>
        
        {/* Market Status */}
        {marketStatus && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            marketStatus.is_market_open 
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
          }`}>
            <Clock className={`h-4 w-4 ${
              marketStatus.is_market_open 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`} />
            <span className={`text-sm font-medium ${
              marketStatus.is_market_open 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {marketStatus.market_state}
            </span>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search Stocks</h2>
        </div>
        
        <TickerSearch 
          onSelect={handleStockSelect}
          placeholder="Search stocks by symbol or company name..."
          className="mb-6"
        />

        {/* Popular Stocks */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            Popular Stocks
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {popularStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handlePopularStockSelect(stock)}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedStock?.symbol === stock.symbol
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-medium text-sm">{stock.symbol}</div>
                <div className="text-xs opacity-75 truncate">{stock.name.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Stocks */}
        {recentStocks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <History className="h-4 w-4 text-gray-500 mr-2" />
                Recent Searches
              </h3>
              <button
                onClick={handleClearRecent}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentStocks.slice(0, 8).map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleRecentStockSelect(stock)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedStock?.symbol === stock.symbol
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {selectedStock ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Summary */}
          <div className="lg:col-span-1">
            <StockSummary 
              symbol={selectedStock.symbol}
              companyName={selectedStock.name}
            />
          </div>
          
          {/* Stock Chart */}
          <div className="lg:col-span-2">
            <StockChart 
              symbol={selectedStock.symbol}
              companyName={selectedStock.name}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Select a Stock to Visualize
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Use the search bar above to find a stock symbol, or click on one of the popular stocks to get started.
            </p>
          </div>
        </div>
      )}

      {/* API Information */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Real-time Stock Data
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This visualizer uses real-time stock data with intraday quotes from IEX and 15+ years of historical data. 
              Data includes 30,000+ worldwide stock tickers from major exchanges including NASDAQ and NYSE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 