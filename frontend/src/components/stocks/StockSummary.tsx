import { useState, useEffect } from 'react';
import { DollarSign, Globe, Calendar, RefreshCw, AlertCircle, Building2, ArrowUp, ArrowDown, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { stocksAPI, StockPrice, CompanyInfo } from '../../services/stockApi';
import { getCompanyLogoUrl } from '../../utils/companyLogos';

interface StockSummaryProps {
  symbol: string;
  companyName: string;
  className?: string;
}

export default function StockSummary({ symbol, companyName, className = "" }: StockSummaryProps) {
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Get company logo URL
  const logoUrl = getCompanyLogoUrl(symbol, companyName);

  // Fetch stock price and company info
  const fetchStockData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Fetching stock data for ${symbol}`);
      
      // Fetch price and company info in parallel
      const [priceData, companyData] = await Promise.allSettled([
        stocksAPI.getStockPrice(symbol),
        stocksAPI.getCompanyInfo(symbol)
      ]);
      
      // Handle price data
      if (priceData.status === 'fulfilled') {
        setStockPrice(priceData.value);
        setLastUpdated(new Date());
      } else {
        console.error('Price fetch failed:', priceData.reason);
        throw new Error('Failed to fetch stock price');
      }
      
      // Handle company info (optional)
      if (companyData.status === 'fulfilled') {
        setCompanyInfo(companyData.value);
      } else {
        console.warn('Company info fetch failed:', companyData.reason);
        // Don't throw error for company info failure
      }
      
      console.log(`✅ Successfully loaded stock data for ${symbol}`);
    } catch (error) {
      console.error('❌ Error fetching stock data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load stock data');
      setStockPrice(null);
      setCompanyInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when symbol changes
  useEffect(() => {
    if (symbol) {
      fetchStockData();
    }
  }, [symbol]);

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

  const formatMarketCap = (value?: number): string => {
    if (!value || value === 0) return 'N/A';
    
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchStockData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stockPrice) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center py-8">
          <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No stock data available</p>
        </div>
      </div>
    );
  }

  const isPositive = stockPrice.change_percent >= 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Company Logo */}
            {logoError || !logoUrl ? (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{symbol.charAt(0)}</span>
              </div>
            ) : (
              <img
                src={logoUrl}
                alt={`${symbol} logo`}
                className="w-12 h-12 rounded-lg object-cover bg-white"
                onError={() => setLogoError(true)}
              />
            )}
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{symbol}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {companyInfo?.name || companyName}
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchStockData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Price Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Price */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Current Price</h4>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stockPrice.price)}
                </span>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <ArrowUp className="h-5 w-5" />
                  ) : (
                    <ArrowDown className="h-5 w-5" />
                  )}
                  <span className="text-lg font-semibold">
                    {formatPercentage(stockPrice.change_percent)}
                  </span>
                </div>
              </div>
              <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{formatCurrency(stockPrice.change)} today
              </p>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 border border-green-200 dark:border-green-700 overflow-hidden">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-green-700 dark:text-green-300">Day High</p>
                </div>
                <p className="text-sm font-bold text-green-900 dark:text-green-100 leading-tight">
                  {formatCurrency(stockPrice.high)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-3 border border-red-200 dark:border-red-700 overflow-hidden">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">Day Low</p>
                </div>
                <p className="text-sm font-bold text-red-900 dark:text-red-100 leading-tight">
                  {formatCurrency(stockPrice.low)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 border border-blue-200 dark:border-blue-700 overflow-hidden">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Open</p>
                </div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100 leading-tight">
                  {formatCurrency(stockPrice.open)}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 border border-purple-200 dark:border-purple-700 overflow-hidden">
                <div className="flex items-center gap-1 mb-1">
                  <BarChart3 className="h-3 w-3 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Prev Close</p>
                </div>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-100 leading-tight">
                  {formatCurrency(stockPrice.previous_close)}
                </p>
              </div>
            </div>

            {/* Company Info */}
            {companyInfo && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-700 overflow-hidden">
                <div className="flex items-center gap-1 mb-1">
                  <Building2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Market Cap</p>
                </div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
                  {formatMarketCap(companyInfo.market_cap)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Company Details */}
        {companyInfo && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Company Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-300">Exchange</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {companyInfo.exchange}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-300">Industry</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {companyInfo.industry || companyInfo.sector || 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-300">Country</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {companyInfo.country}
                </p>
              </div>
              
              {companyInfo.ipo && companyInfo.ipo !== 'N/A' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">IPO Date</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {companyInfo.ipo}
                  </p>
                </div>
              )}
              
              {companyInfo.website && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">Website</p>
                  </div>
                  <a
                    href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 