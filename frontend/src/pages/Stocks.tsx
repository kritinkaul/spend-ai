import { TrendingUp, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import PortfolioTable from '../components/stocks/PortfolioTable';
import WatchlistCards from '../components/stocks/WatchlistCards';
import StockFundamentals from '../components/stocks/StockFundamentals';
import NewsSection from '../components/stocks/NewsSection';
import AISummary from '../components/stocks/AISummary';

export default function Stocks() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing all stock data...');
      
      // Trigger refresh in all components by updating the refresh trigger
      setRefreshTrigger(prev => prev + 1);

      // Wait a moment to show the refreshing state
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ All components refreshed');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 dark:text-white">Stocks & Options</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Track your investments and explore trading opportunities with real-time data</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </button>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Powered by Finnhub</span>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <PortfolioTable key={`portfolio-${refreshTrigger}`} />

      {/* Watchlist Section */}
      <WatchlistCards key={`watchlist-${refreshTrigger}`} />

      {/* Stock Fundamentals Section */}
      <StockFundamentals key={`fundamentals-${refreshTrigger}`} />

      {/* Company News Section */}
      <NewsSection key={`news-${refreshTrigger}`} />

      {/* AI Insights */}
      <AISummary key={`ai-${refreshTrigger}`} />
    </div>
  );
}
