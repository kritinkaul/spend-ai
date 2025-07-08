import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { stocksAPI, HistoricalData } from '../../services/stockApi';

interface StockChartProps {
  symbol: string;
  companyName: string;
  className?: string;
}

interface ChartData {
  datetime: string;
  price: number;
  volume: number;
  displayTime: string;
  fullDateTime: string;
}

type TimeRange = '1D' | '1M' | '6M' | '1Y' | '5Y';

const timeRanges: { value: TimeRange; label: string; description: string }[] = [
  { value: '1D', label: '1D', description: 'Today' },
  { value: '1M', label: '1M', description: 'Past Month' },
  { value: '6M', label: '6M', description: 'Past 6 Months' },
  { value: '1Y', label: '1Y', description: 'Past Year' },
  { value: '5Y', label: '5Y', description: 'Past 5 Years' },
];

export default function StockChart({ symbol, companyName, className = "" }: StockChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<{ amount: number; percent: number } | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Process data for chart display
  const processedData = useMemo(() => {
    if (!chartData.length) return [];
    
    return chartData.map(item => ({
      ...item,
      // Format the price for display
      formattedPrice: item.price.toFixed(2),
      // Create a display label based on the time range
      displayLabel: item.displayTime,
    }));
  }, [chartData]);

  // Calculate price change
  const calculatePriceChange = (data: ChartData[]) => {
    if (data.length < 2) return null;
    
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    
    return { amount: change, percent: changePercent };
  };

  // Format datetime for display
  const formatDateTime = (datetime: string, range: TimeRange): string => {
    const date = new Date(datetime);
    
    switch (range) {
      case '1D':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '1M':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case '6M':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case '1Y':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        });
      case '5Y':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        });
      default:
        return date.toLocaleDateString();
    }
  };

  // Generate realistic mock data when API is unavailable
  const generateMockData = (range: TimeRange, basePrice: number = 200): ChartData[] => {
    let days = 30;
    switch (range) {
      case '1D': days = 1; break;
      case '1M': days = 30; break;
      case '6M': days = 180; break;
      case '1Y': days = 365; break;
      case '5Y': days = 1825; break;
    }

    const dataPoints: ChartData[] = [];
    const currentDate = new Date();
    let currentPrice = basePrice;

    for (let i = days; i >= 0; i--) {
      const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Add some realistic price movement
      const randomChange = (Math.random() - 0.5) * 0.05; // ±2.5% random movement
      const trendFactor = Math.sin((days - i) / days * Math.PI) * 0.02; // Some trend
      currentPrice *= (1 + randomChange + trendFactor);
      
      dataPoints.push({
        datetime: date.toISOString().split('T')[0],
        price: Math.max(1, currentPrice), // Ensure positive price
        volume: Math.floor(Math.random() * 10000000), // Random volume
        displayTime: formatDateTime(date.toISOString(), range),
        fullDateTime: date.toLocaleString(),
      });
    }

    return dataPoints;
  };

  // Fetch chart data
  const fetchChartData = async (range: TimeRange) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Fetching ${range} data for ${symbol}`);
      
      // Try to use real API first
      try {
        const data = await stocksAPI.getHistoricalDataFormatted(symbol, range);
        
        if (data && data.length > 0) {
          // Process real data for chart
          const processedData: ChartData[] = data.map(item => ({
            datetime: item.datetime,
            price: item.close,
            volume: item.volume,
            displayTime: formatDateTime(item.datetime, range),
            fullDateTime: new Date(item.datetime).toLocaleString(),
          }));
          
          setChartData(processedData);
          setPriceChange(calculatePriceChange(processedData));
          setIsUsingMockData(false);
          console.log(`✅ Successfully loaded ${processedData.length} real data points for ${symbol}`);
          return;
        }
      } catch (apiError) {
        console.warn('⚠️ API unavailable, using mock data:', apiError);
      }

      // Fallback to mock data
      console.log(`📊 Generating mock chart data for ${symbol} (${range})`);
      
      // Try to get current price for more realistic mock data
      let basePrice = 200;
      try {
        const currentData = await stocksAPI.getStockPrice(symbol);
        basePrice = currentData.price || 200;
      } catch (priceError) {
        console.warn('⚠️ Could not get current price, using default');
        // Use symbol-specific base prices for demo
        const basePrices: Record<string, number> = {
          'AAPL': 210, 'TSLA': 300, 'MSFT': 400, 'GOOGL': 180, 
          'AMZN': 180, 'NVDA': 800, 'META': 350, 'MCD': 290
        };
        basePrice = basePrices[symbol] || 200;
      }

      const mockData = generateMockData(range, basePrice);
      setChartData(mockData);
      setPriceChange(calculatePriceChange(mockData));
      setIsUsingMockData(true);
      
      console.log(`✅ Generated ${mockData.length} mock data points for ${symbol}`);
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chart data');
      setChartData([]);
      setPriceChange(null);
      setIsUsingMockData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when symbol or range changes
  useEffect(() => {
    if (symbol) {
      fetchChartData(selectedRange);
    }
  }, [symbol, selectedRange]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            ${data.formattedPrice}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {data.fullDateTime}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Volume: {data.volume.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get chart color based on price change
  const getChartColor = () => {
    if (!priceChange) return '#3B82F6'; // Blue default
    return priceChange.amount >= 0 ? '#10B981' : '#EF4444'; // Green or Red
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              {symbol} Chart
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{companyName}</p>
            
            {/* Price Change Indicator */}
            {priceChange && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {priceChange.amount >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  priceChange.amount >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {priceChange.amount >= 0 ? '+' : ''}{priceChange.amount.toFixed(2)} 
                  ({priceChange.percent.toFixed(2)}%)
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeRanges.find(r => r.value === selectedRange)?.description}
                </span>
                {isUsingMockData && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    Demo Data
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchChartData(selectedRange)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRange === range.value
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={range.description}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        {error && (
          <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to load chart</p>
              <p className="text-sm text-red-500 dark:text-red-500 mt-1">{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading chart data...</p>
            </div>
          </div>
        )}

        {!isLoading && !error && chartData.length > 0 && (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="displayTime" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={getChartColor()}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: getChartColor() }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!isLoading && !error && chartData.length === 0 && (
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No data available</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Try selecting a different time range or symbol
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 