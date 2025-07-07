import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import StockSearchInput from './StockSearchInput';

interface AIInsight {
  id: string;
  type: 'bullish' | 'bearish' | 'neutral';
  title: string;
  content: string;
  confidence: number;
  timestamp: string;
}

export default function AISummary() {
  const [selectedStock, setSelectedStock] = useState({ symbol: 'AAPL', name: 'Apple Inc.' });
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  // Generate AI insights for the selected stock
  const generateInsights = async (forceRefresh: boolean = false) => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🧠 ${forceRefresh ? 'Refreshing' : 'Generating'} AI insights for ${selectedStock.symbol}...`);
      
      const aiInsights = await aiApi.generateStockInsights(selectedStock.symbol);
      
      if (aiInsights && aiInsights.length > 0) {
        setInsights(aiInsights);
        setLastGenerated(new Date().toLocaleString());
        console.log('✅ AI insights generated successfully:', aiInsights.length, 'insights');
      } else {
        throw new Error('No insights generated');
      }
    } catch (error) {
      console.error('❌ Error generating AI insights:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific error types
      if (errorMessage.includes('API key')) {
        setError('AI analysis unavailable: Please configure your Gemini API key in the environment variables.');
      } else if (errorMessage.includes('rate limit')) {
        setError('AI service is temporarily busy. Please try again in a few minutes.');
      } else if (errorMessage.includes('permissions')) {
        setError('API key lacks necessary permissions. Please check your Gemini API configuration.');
      } else {
        setError('Unable to fetch AI insights. Please try again or check your connection.');
      }
      
      // Show fallback insight
      const fallbackInsight = aiApi.getFallbackInsight(selectedStock.symbol);
      setInsights([fallbackInsight]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate insights when component mounts or stock changes
  useEffect(() => {
    generateInsights(false);
  }, [selectedStock.symbol]);

  const handleStockSelect = (symbol: string, name: string) => {
    const newStock = { symbol: symbol.toUpperCase(), name };
    setSelectedStock(newStock);
    setShowSearch(false);
    setError(null); // Clear any previous errors
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered for', selectedStock.symbol);
    setInsights([]); // Clear previous insights
    setError(null);
    setLastGenerated(null);
    generateInsights(true); // Force refresh
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish':
        return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      case 'bearish':
        return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              AI Stock Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Real-time AI insights for {selectedStock.symbol}</p>
            {lastGenerated && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                Generated on {lastGenerated}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
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
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {selectedStock.symbol} - {selectedStock.name}
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate fresh AI analysis"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Analyzing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Generating AI analysis for {selectedStock.symbol}...</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This may take a few moments...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No AI insights available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Click "Refresh" to generate new analysis for {selectedStock.symbol}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence)}`}
                    >
                      {insight.confidence}% confidence
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(insight.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{insight.content}</p>
              </div>
            ))}
            
            {/* Show disclaimer for AI-generated content */}
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-medium">Disclaimer:</span> AI analysis is for informational purposes only and should not be considered as financial advice. Always conduct your own research before making investment decisions.
              </p>
            </div>

            {/* API Configuration Notice */}
            {error && error.includes('API key') && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <span className="font-medium">Setup Required:</span> To enable live AI analysis, add your Gemini API key to the environment variables. 
                  Create a <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">.env</code> file with <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">VITE_GEMINI_API_KEY=your_key_here</code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 