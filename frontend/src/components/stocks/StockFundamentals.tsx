import { useState, useEffect } from 'react';
import { Building2, RefreshCw, AlertCircle, Globe, Calendar, DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Info } from 'lucide-react';
import { stocksAPI, CompanyProfile, BasicFinancials } from '../../services/stockApi';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import StockSearchInput from './StockSearchInput';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

export default function StockFundamentals() {
  const [selectedStock, setSelectedStock] = useState({ symbol: 'AAPL', name: 'Apple Inc.' });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [basicFinancials, setBasicFinancials] = useState<BasicFinancials | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Colors for charts
  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Fetch comprehensive company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      setIsLoading(true);
      setError(null);
      setLogoError(false);
      
      try {
        console.log('🔄 Fetching comprehensive data for:', selectedStock.symbol);
        
        // Fetch company profile and financial metrics in parallel
        const [profileResult, financialsResult] = await Promise.allSettled([
          stocksAPI.getCompanyProfile(selectedStock.symbol),
          stocksAPI.getBasicFinancials(selectedStock.symbol)
        ]);
        
        // Handle company profile
        if (profileResult.status === 'fulfilled') {
          setCompanyProfile(profileResult.value);
          console.log('✅ Got company profile:', profileResult.value);
        } else {
          console.warn('⚠️ Failed to fetch company profile:', profileResult.reason);
        }
        
        // Handle financial metrics
        if (financialsResult.status === 'fulfilled') {
          setBasicFinancials(financialsResult.value);
          console.log('✅ Got financial metrics:', financialsResult.value);
        } else {
          console.warn('⚠️ Failed to fetch financial metrics:', financialsResult.reason);
        }
        
        // Set error only if both failed
        if (profileResult.status === 'rejected' && financialsResult.status === 'rejected') {
          throw new Error('Failed to load company data. Some data may not be available with the current Finnhub plan.');
        }
        
      } catch (error) {
        console.error('❌ Error fetching company data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load company information.');
        setCompanyProfile(null);
        setBasicFinancials(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [selectedStock.symbol]);

  const handleStockSelect = (symbol: string, name: string) => {
    setSelectedStock({ symbol: symbol.toUpperCase(), name });
    setShowSearch(false);
  };

  const handleRefresh = () => {
    setSelectedStock(prev => ({ ...prev })); // Trigger useEffect
  };

  // Format large numbers
  const formatLargeNumber = (value: number): string => {
    if (!value || value === 0) return 'N/A';
    
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatRatio = (value: number): string => {
    if (!value || isNaN(value)) return 'N/A';
    return value.toFixed(2);
  };

  const formatPercentage = (value: number): string => {
    if (!value || isNaN(value)) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  // Get company logo
  const logoUrl = getCompanyLogoUrl(selectedStock.symbol, selectedStock.name);

  // Prepare data for charts
  const getFinancialMetricsData = () => {
    if (!basicFinancials?.metric) return [];
    
    const metrics = basicFinancials.metric;
    return [
      { name: 'P/E Ratio', value: metrics.peBasicExclExtraTTM || 0 },
      { name: 'P/B Ratio', value: metrics.pbAnnual || 0 },
      { name: 'Beta', value: metrics.beta || 0 },
      { name: 'Dividend Yield', value: metrics.dividendYieldIndicatedAnnual || 0 },
    ].filter(item => item.value > 0);
  };

  const getMarketCapData = () => {
    if (!companyProfile?.marketCapitalization) return [];
    
    const marketCap = companyProfile.marketCapitalization;
    const shareOutstanding = companyProfile.shareOutstanding || 0;
    const pricePerShare = shareOutstanding > 0 ? marketCap / shareOutstanding : 0;
    
    return [
      { name: 'Market Cap', value: marketCap, color: CHART_COLORS[0] },
      { name: 'Share Value', value: pricePerShare * 1e6, color: CHART_COLORS[1] }, // Approximate calculation
    ].filter(item => item.value > 0);
  };

  const getPerformanceData = () => {
    if (!basicFinancials?.metric) return [];
    
    const metrics = basicFinancials.metric;
    return [
      { name: '52W High', value: metrics['52WeekHigh'] || 0 },
      { name: '52W Low', value: metrics['52WeekLow'] || 0 },
      { name: '10D Avg Volume', value: (metrics['10DayAverageTradingVolume'] || 0) / 1e6 }, // Convert to millions
    ].filter(item => item.value > 0);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Loading comprehensive company data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Company Logo */}
            {logoError || !logoUrl ? (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">{selectedStock.symbol.charAt(0)}</span>
              </div>
            ) : (
              <img
                src={logoUrl}
                alt={`${selectedStock.symbol} logo`}
                className="w-16 h-16 rounded-xl object-cover bg-white shadow-sm"
                onError={() => setLogoError(true)}
              />
            )}
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                {selectedStock.symbol}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">{companyProfile?.name || selectedStock.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive Fundamentals Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Stock Selector */}
            {showSearch ? (
              <div className="w-72">
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px] text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {selectedStock.symbol} - {selectedStock.name}
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Limited Data Available</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Company Overview Cards */}
        {companyProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Market Cap</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {formatLargeNumber(companyProfile.marketCapitalization)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-3">
                <PieChart className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Shares Outstanding</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">
                    {companyProfile.shareOutstanding ? `${(companyProfile.shareOutstanding / 1e9).toFixed(2)}B` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">IPO Date</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {companyProfile.ipo || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Exchange</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {companyProfile.exchange}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Metrics */}
        {basicFinancials?.metric && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Key Ratios */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Key Financial Ratios
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">P/E Ratio (TTM)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatRatio(basicFinancials.metric.peBasicExclExtraTTM)}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">P/B Ratio</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatRatio(basicFinancials.metric.pbAnnual)}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Beta</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatRatio(basicFinancials.metric.beta)}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Dividend Yield</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPercentage(basicFinancials.metric.dividendYieldIndicatedAnnual)}
                    </p>
                  </div>
                </div>

                {/* Financial Metrics Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFinancialMetricsData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Price Performance */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                Price Performance
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">52-Week High</p>
                        <p className="text-xl font-bold text-green-600">
                          ${formatRatio(basicFinancials.metric['52WeekHigh'])}
                        </p>
                        <p className="text-xs text-gray-500">
                          {basicFinancials.metric['52WeekHighDate']}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">52-Week Low</p>
                        <p className="text-xl font-bold text-red-600">
                          ${formatRatio(basicFinancials.metric['52WeekLow'])}
                        </p>
                        <p className="text-xs text-gray-500">
                          {basicFinancials.metric['52WeekLowDate']}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">10-Day Avg Volume</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {basicFinancials.metric['10DayAverageTradingVolume'] ? 
                        `${(basicFinancials.metric['10DayAverageTradingVolume'] / 1e6).toFixed(2)}M` : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">EPS (TTM)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${formatRatio(basicFinancials.metric.epsBasicExclExtraTTM)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Information */}
        {companyProfile && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Company Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Company Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{companyProfile.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Industry</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {companyProfile.finnhubIndustry || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Country</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{companyProfile.country}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Currency</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{companyProfile.currency}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Exchange</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{companyProfile.exchange}</p>
                </div>
                
                {companyProfile.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{companyProfile.phone}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {companyProfile.weburl && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Website</p>
                    <a
                      href={companyProfile.weburl.startsWith('http') ? companyProfile.weburl : `https://${companyProfile.weburl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Enhanced Data</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Data powered by Finnhub API with comprehensive financial metrics and real-time updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No data state */}
        {!companyProfile && !basicFinancials && !isLoading && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No Fundamental Data Available</p>
            <p className="text-gray-400 dark:text-gray-500">
              Unable to load comprehensive data for {selectedStock.symbol}. Please try a different symbol.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 