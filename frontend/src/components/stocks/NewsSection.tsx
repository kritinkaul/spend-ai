import { useState, useEffect } from 'react';
import { Newspaper, Clock, ExternalLink, RefreshCw, AlertCircle, TrendingUp, Calendar, Search } from 'lucide-react';
import { stocksAPI, NewsArticle } from '../../services/stockApi';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import StockSearchInput from './StockSearchInput';

export default function NewsSection() {
  const [selectedStock, setSelectedStock] = useState({ symbol: 'AAPL', name: 'Apple Inc.' });
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Auto-refresh interval (5 minutes for news)
  const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Fetch company news
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      setLogoError(false);
      
      try {
        console.log('🔄 Fetching news for:', selectedStock.symbol);
        const newsData = await stocksAPI.getCompanyNews(selectedStock.symbol, 7); // Last 7 days
        
        if (newsData && newsData.length > 0) {
          setNews(newsData);
          setLastRefresh(new Date());
          console.log('✅ Got news articles:', newsData.length);
        } else {
          setNews([]);
          setError('No recent news articles found for this company.');
        }
      } catch (error) {
        console.error('❌ Error fetching news:', error);
        setError(error instanceof Error ? error.message : 'Failed to load news articles.');
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [selectedStock.symbol]);

  // Set up auto-refresh for news
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing news data...');
      // Trigger re-fetch by updating state
      setSelectedStock(prev => ({ ...prev }));
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedStock.symbol]);

  const handleStockSelect = (symbol: string, name: string) => {
    setSelectedStock({ symbol: symbol.toUpperCase(), name });
    setShowSearch(false);
  };

  const handleRefresh = () => {
    setSelectedStock(prev => ({ ...prev })); // Trigger useEffect
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format timestamp to time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get sentiment color based on keywords in headline
  const getSentiment = (headline: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['gains', 'up', 'rises', 'grows', 'beats', 'exceeds', 'strong', 'surge', 'boost', 'jump'];
    const negativeWords = ['falls', 'drops', 'declines', 'down', 'loses', 'misses', 'weak', 'plunge', 'crash', 'slump'];
    
    const lowerHeadline = headline.toLowerCase();
    
    const hasPositive = positiveWords.some(word => lowerHeadline.includes(word));
    const hasNegative = negativeWords.some(word => lowerHeadline.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  };

  // Get company logo
  const logoUrl = getCompanyLogoUrl(selectedStock.symbol, selectedStock.name);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Company Logo */}
            {logoError || !logoUrl ? (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{selectedStock.symbol.charAt(0)}</span>
              </div>
            ) : (
              <img
                src={logoUrl}
                alt={`${selectedStock.symbol} logo`}
                className="w-12 h-12 rounded-xl object-cover bg-white shadow-sm"
                onError={() => setLogoError(true)}
              />
            )}
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Company News
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Latest news for {selectedStock.symbol} - {selectedStock.name}
              </p>
              {lastRefresh && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Stock Selector */}
            {showSearch ? (
              <div className="w-64">
                <StockSearchInput 
                  onSelect={handleStockSelect} 
                  placeholder="Search symbol..."
                />
                <button 
                  onClick={() => setShowSearch(false)} 
                  className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Search className="h-4 w-4" />
                {selectedStock.symbol}
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading latest news...</p>
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-4">
            {news.map((article, index) => {
              const sentiment = getSentiment(article.headline);
              const sentimentColor = {
                positive: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
                negative: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
                neutral: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
              };

              return (
                <article
                  key={article.id || index}
                  className={`border-l-4 ${sentimentColor[sentiment]} rounded-lg p-4 hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Headline */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                        {article.headline}
                      </h3>
                      
                      {/* Summary */}
                      {article.summary && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                          {article.summary}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(article.datetime)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(article.datetime)}</span>
                        </div>
                        
                        {article.source && (
                          <div className="flex items-center gap-1">
                            <Newspaper className="h-3 w-3" />
                            <span className="font-medium">{article.source}</span>
                          </div>
                        )}

                        {/* Sentiment Indicator */}
                        <div className="flex items-center gap-1">
                          {sentiment === 'positive' ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : sentiment === 'negative' ? (
                            <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          )}
                          <span className={`text-xs font-medium ${
                            sentiment === 'positive' ? 'text-green-600' :
                            sentiment === 'negative' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Article Image */}
                    {article.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={article.image}
                          alt="Article thumbnail"
                          className="w-24 h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Read More Link */}
                  {article.url && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        Read full article
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No Recent News</p>
            <p className="text-gray-400 dark:text-gray-500">
              No news articles found for {selectedStock.symbol} in the last 7 days.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Footer with auto-refresh info */}
        {news.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <p>News automatically refreshes every 5 minutes</p>
              <p>Powered by Finnhub API</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 