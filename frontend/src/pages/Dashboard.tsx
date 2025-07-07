import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  CreditCard,
  PiggyBank,
  Target,
  Upload,
  BarChart3,
  Lightbulb,
  Loader2,
  AlertTriangle,
  Trash2,
  Clock,
  Newspaper,
  RefreshCw
} from 'lucide-react';
import { transactionService } from '../services/transactions';
import { stockApi } from '../services/stockApi';
import { aiApi } from '../services/aiApi';
import { formatCompactCurrency, formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from 'recharts';

// Removed unused COLORS constant

const StatCard = ({ stat, index }: { stat: any, index: number }) => (
  <div 
    key={stat.name} 
    className={cn(
      `group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-up dark:bg-gray-800 dark:border-gray-700`,
      stat.borderColor
    )}
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.name}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
        <div className="flex items-center">
          {stat.changeType === 'increase' ? (
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
          )}
          <span className={cn(
            `text-sm font-medium`,
            stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          )}>
            {stat.change}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last month</span>
        </div>
      </div>
      <div className={cn(
        `flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-transform duration-300`,
        stat.bgGradient
      )}>
        <stat.icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const MarketNewsCard = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery(
    'financial-news',
    async () => {
      const trending = await stockApi.getTrendingStocks();
      const quotes = await stockApi.getMultipleQuotes(trending.slice(0, 3));
      return { trending, quotes };
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchNews();
    setRefreshing(false);
  };

  if (newsLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Newspaper className="h-5 w-5 mr-2 text-primary-600" />
            Market Movers
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>
      <div className="p-6">
        {newsData?.trending && newsData.quotes ? (
          <div className="space-y-4">
            {newsData.trending.slice(0, 3).map((symbol, index) => {
              const quote = newsData.quotes[symbol];
              if (!quote) return null;
              
              const isPositive = quote.dp >= 0;
              return (
                <div 
                  key={symbol} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${quote.c.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? '+' : ''}{quote.dp.toFixed(2)}%
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isPositive ? '+' : ''}{formatCurrency(quote.d)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Market data unavailable</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check your API configuration</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AIInsightsCard = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights, error } = useQuery(
    'ai-insights',
    async () => {
      const symbols = ['AAPL', 'TSLA', 'NVDA'];
      const insights = await Promise.allSettled(
        symbols.map(symbol => aiApi.generateStockInsights(symbol))
      );
      return insights
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value[0])
        .filter(Boolean);
    },
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchInsights();
    setRefreshing(false);
  };

  if (insightsLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Generating AI insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-purple-600" />
            AI Market Insights
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Insights Unavailable</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {(error as any)?.message?.includes('API key') 
                ? 'Please check your Gemini API key configuration' 
                : 'AI analysis is temporarily unavailable'}
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="space-y-4">
            {insights.slice(0, 2).map((insight, index) => (
              <div 
                key={insight.id} 
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      insight.type === 'bullish' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      insight.type === 'bearish' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {insight.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{insight.confidence}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {insight.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No insights available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">AI analysis will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DateTimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
      <Clock className="h-4 w-4" />
      <span>{currentTime.toLocaleTimeString()}</span>
      <span>•</span>
      <span>{currentTime.toLocaleDateString()}</span>
    </div>
  );
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery(
    'analytics',
    () => transactionService.getAnalytics(),
    {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery(
    'transactions',
    () => transactionService.getTransactions(),
    {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const deleteMutation = useMutation(() => transactionService.deleteAllData(), {
    onSuccess: () => {
      queryClient.invalidateQueries('analytics');
      queryClient.invalidateQueries('transactions');
      setShowDeleteConfirm(false);
    },
  });

  const isLoading = analyticsLoading || transactionsLoading;
  const error = analyticsError || transactionsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto" />
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Could not load dashboard</h3>
        <p className="text-red-600 mb-6">{(error as any).message || 'Network Error'}</p>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Make sure the backend server is running on port 8000</p>
          <p>Check your network connection and try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.total_transactions === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome to SpendAI</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Upload a transaction file to get started with your financial analysis.</p>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Transactions
        </Link>
      </div>
    );
  }

  // Process data for charts
  const recentTransactions = transactions?.slice(0, 5) || [];
  
  const netAmount = (analytics.total_earned || 0) - (analytics.total_spent || 0);
  const spendingScore = (analytics.total_transactions || 0) > 0 ? Math.min(100, Math.max(0, 100 - ((analytics.total_spent || 0) / (analytics.total_earned || 1) * 100))) : 0;
  const isPositiveNet = netAmount >= 0;

  const stats = [
    {
      name: 'Total Spent',
      value: formatCompactCurrency(analytics.total_spent || 0),
      icon: TrendingDown,
      color: 'text-red-600',
      bgGradient: 'from-red-500 to-red-600',
      borderColor: 'border-red-200',
      change: '-12.5%',
      changeType: 'decrease'
    },
    {
      name: 'Total Income',
      value: formatCompactCurrency(analytics.total_earned || 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bgGradient: 'from-green-500 to-green-600',
      borderColor: 'border-green-200',
      change: '+8.2%',
      changeType: 'increase'
    },
    {
      name: 'Net Amount',
      value: formatCompactCurrency(netAmount),
      icon: DollarSign,
      color: isPositiveNet ? 'text-blue-600' : 'text-red-600',
      bgGradient: isPositiveNet ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600',
      borderColor: isPositiveNet ? 'border-blue-200' : 'border-red-200',
      change: isPositiveNet ? '+15.3%' : '-5.7%',
      changeType: isPositiveNet ? 'increase' : 'decrease'
    },
    {
      name: 'Spending Score',
      value: `${Math.round(spendingScore)}/100`,
      icon: Activity,
      color: 'text-purple-600',
      bgGradient: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-200',
      change: '+3.1%',
      changeType: 'increase'
    },
  ];

  const quickActions = [
    {
      title: 'Upload Statement',
      description: 'Upload your latest bank statement for analysis',
      icon: Upload,
      href: '/upload',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      title: 'View Analysis',
      description: 'Explore detailed spending patterns and trends',
      icon: BarChart3,
      href: '/analysis',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      title: 'Stocks & Options',
      description: 'Track your investments and explore trading opportunities',
      icon: TrendingUp,
      href: '/stocks',
      gradient: 'from-orange-500 to-red-600',
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Date/Time and Delete Button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Your financial overview at a glance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <DateTimeWidget />
          {analytics && analytics.total_transactions > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </button>
          )}
        </div>
      </div>

      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
              <p className="text-blue-100 text-lg">
                Here's your financial overview for today
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400/40 via-indigo-400/40 to-purple-400/40 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/20">
                <DollarSign className="h-8 w-8 text-white font-bold drop-shadow-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard stat={stat} index={index} key={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                  Recent Transactions
                </h2>
                <Link to="/analysis" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {transaction.amount > 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold text-lg ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCompactCurrency(Math.abs(transaction.amount))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload a statement to see your transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market Data and AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market News Card */}
          <MarketNewsCard />
          
          {/* AI Insights Card */}
          <AIInsightsCard />
          
          {/* Quick Actions & Financial Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary-600" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 animate-slide-up bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Financial Health Score */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <PiggyBank className="h-5 w-5 mr-2" />
                  Financial Health
                </h3>
                <div className="text-2xl font-bold">{Math.round(spendingScore)}%</div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${spendingScore}%` }}
                ></div>
              </div>
              <p className="text-purple-100 text-sm">
                {spendingScore >= 80 ? 'Excellent! Keep up the great work.' :
                 spendingScore >= 60 ? 'Good! You\'re on the right track.' :
                 spendingScore >= 40 ? 'Fair. Consider reviewing your spending.' :
                 'Needs attention. Focus on reducing expenses.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete all transaction data? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 