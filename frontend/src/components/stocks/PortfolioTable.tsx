import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, RefreshCw, DollarSign, TrendingDown as Loss, TrendingUp as Gain, PieChart } from 'lucide-react';
import { stocksAPI, StockPrice } from '../../services/stockApi';

interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
}

interface AddPositionForm {
  symbol: string;
  name: string;
  shares: string;
  avgCost: string;
}

export default function PortfolioTable() {
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddPositionForm>({
    symbol: '',
    name: '',
    shares: '',
    avgCost: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Auto-refresh interval (1 minute)
  const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

  // Load portfolio from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('stock-portfolio');
    if (savedPortfolio) {
      try {
        const parsed = JSON.parse(savedPortfolio);
        const formattedPortfolio = parsed.map((item: any) => ({
          id: item.id || `${item.symbol}-${Date.now()}`,
          symbol: item.symbol,
          name: item.name || `${item.symbol} Corp.`,
          shares: Number(item.shares) || 0,
          avgCost: Number(item.avgCost) || 0,
          currentPrice: Number(item.currentPrice) || 0,
          change: Number(item.change) || 0,
          changePercent: Number(item.changePercent) || 0,
          lastUpdated: item.lastUpdated || 0
        }));
        setPortfolio(formattedPortfolio);
      } catch (error) {
        console.error('Error parsing saved portfolio:', error);
        setPortfolio([]);
      }
    }
  }, []);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    if (portfolio.length >= 0) { // Allow saving empty portfolio
      localStorage.setItem('stock-portfolio', JSON.stringify(portfolio));
    }
  }, [portfolio]);

  // Fetch live quotes for portfolio symbols
  const fetchQuotes = useCallback(async (force = false) => {
    if (portfolio.length === 0) return;

    // Check if we need to update (only if forced or data is stale)
    if (!force) {
      const hasRecentData = portfolio.some(item => 
        item.currentPrice > 0 && Date.now() - item.lastUpdated < 30000 // 30 seconds
      );
      if (hasRecentData) return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const symbols = portfolio.map(item => item.symbol);
      console.log('🔄 Fetching quotes for portfolio:', symbols);
      
      // Fetch quotes using the enhanced Finnhub service
      const quotes = await stocksAPI.getMultipleQuotes(symbols);
      
      // Update portfolio with live prices
      setPortfolio(prev => prev.map(item => {
        const quote = quotes[item.symbol];
        if (quote && quote.c > 0) {
          return {
            ...item,
            currentPrice: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            lastUpdated: Date.now()
          };
        }
        return {
          ...item,
          currentPrice: 0, // Show N/A if no valid price
          change: 0,
          changePercent: 0,
          lastUpdated: 0
        };
      }));
      
      setLastRefresh(new Date());
      console.log('✅ Portfolio quotes updated');
    } catch (error) {
      console.error('❌ Error fetching portfolio quotes:', error);
      setError('Failed to update portfolio prices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [portfolio]);

  // Initial data fetch
  useEffect(() => {
    if (portfolio.length > 0) {
      fetchQuotes(true);
    }
  }, [fetchQuotes]);

  // Set up auto-refresh
  useEffect(() => {
    if (portfolio.length === 0) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing portfolio data...');
      fetchQuotes(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [portfolio.length, fetchQuotes]);

  // Manual refresh
  const handleManualRefresh = async () => {
    await fetchQuotes(true);
  };

  // Add position to portfolio
  const handleAddPosition = async () => {
    if (!addForm.symbol || !addForm.shares || !addForm.avgCost) {
      setError('Please fill in all required fields');
      return;
    }

    const shares = parseFloat(addForm.shares);
    const avgCost = parseFloat(addForm.avgCost);

    if (isNaN(shares) || isNaN(avgCost) || shares <= 0 || avgCost <= 0) {
      setError('Please enter valid positive numbers for shares and average cost');
      return;
    }

    const upperSymbol = addForm.symbol.toUpperCase();

    // Check if position already exists
    if (portfolio.some(item => item.symbol === upperSymbol)) {
      setError(`Position for ${upperSymbol} already exists in your portfolio`);
      return;
    }

    try {
      // Fetch current quote to validate symbol and get company name
      const quote = await stocksAPI.getStockPrice(upperSymbol);
      
      const newPosition: PortfolioPosition = {
        id: `${upperSymbol}-${Date.now()}`,
        symbol: upperSymbol,
        name: addForm.name || `${upperSymbol} Corp.`,
        shares,
        avgCost,
        currentPrice: quote.price,
        change: quote.change,
        changePercent: quote.change_percent,
        lastUpdated: Date.now()
      };

      setPortfolio(prev => [...prev, newPosition]);
      setAddForm({ symbol: '', name: '', shares: '', avgCost: '' });
      setShowAddForm(false);
      setError(null);
      console.log('✅ Added position to portfolio:', upperSymbol);
    } catch (error) {
      console.error('❌ Error adding position:', error);
      setError(`Failed to add ${upperSymbol}. Please check the symbol and try again.`);
    }
  };

  // Remove position from portfolio
  const handleRemovePosition = (id: string) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
  };

  // Calculate portfolio metrics
  const portfolioMetrics = portfolio.reduce((acc, position) => {
    const marketValue = position.shares * position.currentPrice;
    const costBasis = position.shares * position.avgCost;
    const totalGainLoss = marketValue - costBasis;

    return {
      totalValue: acc.totalValue + marketValue,
      totalCost: acc.totalCost + costBasis,
      totalGainLoss: acc.totalGainLoss + totalGainLoss,
      positions: acc.positions + 1
    };
  }, { totalValue: 0, totalCost: 0, totalGainLoss: 0, positions: 0 });

  const totalReturnPercent = portfolioMetrics.totalCost > 0 
    ? ((portfolioMetrics.totalGainLoss / portfolioMetrics.totalCost) * 100) 
    : 0;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track your investment positions</p>
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
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Position
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Portfolio Summary */}
        {portfolio.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Value</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(portfolioMetrics.totalValue)}
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Cost</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(portfolioMetrics.totalCost)}
                  </p>
                </div>
                <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Gain/Loss</p>
                  <p className={`text-lg font-semibold ${
                    portfolioMetrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(portfolioMetrics.totalGainLoss)}
                  </p>
                </div>
                {portfolioMetrics.totalGainLoss >= 0 ? (
                  <Gain className="h-5 w-5 text-green-600" />
                ) : (
                  <Loss className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Return</p>
                  <p className={`text-lg font-semibold ${
                    totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(totalReturnPercent)}
                  </p>
                </div>
                {totalReturnPercent >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Add Position Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Add New Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbol *
                </label>
                <input
                  type="text"
                  value={addForm.symbol}
                  onChange={(e) => setAddForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  placeholder="AAPL"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Apple Inc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shares *
                </label>
                <input
                  type="number"
                  value={addForm.shares}
                  onChange={(e) => setAddForm(prev => ({ ...prev, shares: e.target.value }))}
                  placeholder="100"
                  min="0.001"
                  step="0.001"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avg Cost per Share *
                </label>
                <input
                  type="number"
                  value={addForm.avgCost}
                  onChange={(e) => setAddForm(prev => ({ ...prev, avgCost: e.target.value }))}
                  placeholder="150.00"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleAddPosition}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Position
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm({ symbol: '', name: '', shares: '', avgCost: '' });
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Table */}
        {portfolio.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Symbol</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Shares</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Current Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Market Value</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Gain/Loss</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Day Change</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((position) => {
                  const marketValue = position.shares * position.currentPrice;
                  const costBasis = position.shares * position.avgCost;
                  const totalGainLoss = marketValue - costBasis;
                  const totalGainLossPercent = costBasis > 0 ? (totalGainLoss / costBasis) * 100 : 0;
                  const dayChange = position.shares * position.change;
                  const hasData = position.currentPrice > 0;

                  return (
                    <tr key={position.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{position.symbol}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{position.name}</div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-900 dark:text-white">
                        {position.shares.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-900 dark:text-white">
                        {formatCurrency(position.avgCost)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {hasData ? (
                          <div className="text-gray-900 dark:text-white">
                            {formatCurrency(position.currentPrice)}
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                        )}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-900 dark:text-white">
                        {hasData ? formatCurrency(marketValue) : '--'}
                      </td>
                      <td className="text-right py-3 px-4">
                        {hasData ? (
                          <div className={totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                            <div className="font-semibold">{formatCurrency(totalGainLoss)}</div>
                            <div className="text-sm">{formatPercentage(totalGainLossPercent)}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">--</div>
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        {hasData ? (
                          <div className={position.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                            <div className="font-semibold">{formatCurrency(dayChange)}</div>
                            <div className="text-sm">{formatPercentage(position.changePercent)}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">--</div>
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        <button
                          onClick={() => handleRemovePosition(position.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your portfolio is empty</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Position
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 