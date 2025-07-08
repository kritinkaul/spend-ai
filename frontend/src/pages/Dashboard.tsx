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
  RefreshCw,
  PieChart,
  CheckCircle,
  Zap,
  Bell,
  FileText
} from 'lucide-react';
import { transactionService } from '../services/transactions';
import { stockApi } from '../services/stockApi';
import { formatCompactCurrency, formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
// Import new dashboard components
import BudgetRecommendations from '../components/dashboard/BudgetRecommendations';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import AlertsInsights from '../components/dashboard/AlertsInsights';
import SpendingForecast from '../components/dashboard/SpendingForecast';
import BillReminders from '../components/dashboard/BillReminders';
import NetWorthTracker from '../components/dashboard/NetWorthTracker';
import CurrencyConverter from '../components/dashboard/CurrencyConverter';
import MonthlyHighlights from '../components/dashboard/MonthlyHighlights';
import SavingsGoalTracker from '../components/dashboard/SavingsGoalTracker';
import ExportPDFReport from '../components/dashboard/ExportPDFReport';

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

// Spending Breakdown Card
const SpendingBreakdownCard = ({ analytics, transactions }: { analytics: any, transactions: any[] }) => {
  // Calculate spending by category
  const spendingByCategory = transactions
    ?.filter(t => t.amount < 0)
    .reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(Number(transaction.amount) || 0);
      return acc;
    }, {} as Record<string, number>) || {};

  const categories = Object.entries(spendingByCategory)
    .map(([name, amount]) => ({ name, amount: Number(amount) }))
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-blue-600" />
          Spending Breakdown
        </h3>
      </div>
      <div className="p-6">
        {categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category, index) => {
              const percentage = (Number(category.amount) / Number(analytics.total_spent || 1)) * 100;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCompactCurrency(Number(category.amount))}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index]} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No spending data available</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-gradient-to-t from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center space-y-8">
              {/* Logo and Title */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 animate-bounce">
                    <DollarSign className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  SpendAI
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Your AI-Powered Personal Finance Assistant
                </p>
              </div>

              {/* Main CTA */}
              <div className="space-y-6">
                <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto">
                  Transform your financial data into actionable insights with advanced AI analytics, 
                  smart budgeting recommendations, and comprehensive investment tracking.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/upload"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300"
                  >
                    <Upload className="h-5 w-5 mr-3 group-hover:animate-bounce" />
                    Upload Your First Statement
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </Link>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Free • Secure • Instant Analysis
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What You'll Get
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload your bank statement and unlock powerful financial insights in seconds
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: BarChart3,
                title: "Smart Analytics",
                description: "AI-powered analysis of your spending patterns, trends, and financial behavior",
                gradient: "from-blue-500 to-blue-600",
                delay: "0ms"
              },
              {
                icon: Target,
                title: "Budget Recommendations", 
                description: "Personalized budget suggestions based on financial best practices and your income",
                gradient: "from-purple-500 to-purple-600",
                delay: "100ms"
              },
              {
                icon: TrendingUp,
                title: "Spending Forecasts",
                description: "Predict next month's expenses using advanced machine learning algorithms",
                gradient: "from-green-500 to-green-600",
                delay: "200ms"
              },
              {
                icon: PiggyBank,
                title: "Goal Tracking",
                description: "Set and monitor savings goals with intelligent progress tracking and insights",
                gradient: "from-pink-500 to-pink-600",
                delay: "300ms"
              },
              {
                icon: Bell,
                title: "Smart Alerts",
                description: "Get notified about unusual spending, upcoming bills, and optimization opportunities",
                gradient: "from-orange-500 to-orange-600",
                delay: "400ms"
              },
              {
                icon: FileText,
                title: "Detailed Reports",
                description: "Export comprehensive PDF reports with charts, insights, and recommendations",
                gradient: "from-indigo-500 to-indigo-600",
                delay: "500ms"
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                     style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Process Steps */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload",
                  description: "Upload your bank statement (CSV, Excel, or PDF format)",
                  icon: Upload,
                  color: "blue"
                },
                {
                  step: "2", 
                  title: "Analyze",
                  description: "Our AI instantly processes and categorizes your transactions",
                  icon: Activity,
                  color: "purple"
                },
                {
                  step: "3",
                  title: "Optimize",
                  description: "Get insights, recommendations, and track your financial goals",
                  icon: Target,
                  color: "green"
                }
              ].map((step, index) => (
                <div key={step.step} className="text-center relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600"></div>
                  )}
                  
                  <div className={`w-16 h-16 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className={`w-8 h-8 bg-${step.color}-100 dark:bg-${step.color}-900/30 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className={`text-sm font-bold text-${step.color}-600 dark:text-${step.color}-400`}>{step.step}</span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Why Choose SpendAI?
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: CheckCircle,
                      title: "Bank-Level Security",
                      description: "Your financial data is encrypted and processed securely"
                    },
                    {
                      icon: Zap,
                      title: "Instant Results", 
                      description: "Get insights in seconds, not hours or days"
                    },
                    {
                      icon: Lightbulb,
                      title: "AI-Powered Insights",
                      description: "Advanced algorithms provide personalized recommendations"
                    },
                    {
                      icon: TrendingUp,
                      title: "Investment Tracking",
                      description: "Monitor stocks, track portfolio performance, and get market insights"
                    }
                  ].map((benefit, index) => (
                    <div key={benefit.title} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="relative">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                    <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-lg mb-2"></div>
                      <div className="w-16 h-3 bg-green-400 rounded mb-1"></div>
                      <div className="w-12 h-2 bg-green-300 rounded"></div>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg mb-2"></div>
                      <div className="w-16 h-3 bg-blue-400 rounded mb-1"></div>
                      <div className="w-12 h-2 bg-blue-300 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="w-20 h-3 bg-gray-400 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-3/4 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-1/2 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: "1s" }}></div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Take Control of Your Finances?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of users who have transformed their financial future with SpendAI
                </p>
                
                <Link
                  to="/upload"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300"
                >
                  <Upload className="h-5 w-5 mr-3" />
                  Start Your Financial Journey
                </Link>
                
                <div className="mt-6 text-blue-200 text-sm">
                  Upload your first statement • Get instant insights • It's completely free
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            </div>
          </div>
        </div>
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
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header with Date/Time and Delete Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Your financial overview at a glance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <DateTimeWidget />
          {analytics && analytics.total_transactions > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors min-h-10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </button>
          )}
        </div>
      </div>

      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
              <p className="text-blue-100 text-base sm:text-lg">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard stat={stat} index={index} key={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-600" />
                  Recent Transactions
                </h2>
                <Link to="/analysis" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {recentTransactions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {transaction.amount > 0 ? (
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{transaction.description}</p>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className={`font-semibold text-sm sm:text-lg ${
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
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload a statement to see your transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market Data and Spending Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market News Card */}
          <MarketNewsCard />
          
          {/* Spending Breakdown Card */}
          <SpendingBreakdownCard analytics={analytics} transactions={transactions || []} />
          
          {/* Quick Actions & Financial Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-600" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group block p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 animate-slide-up bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 min-h-16"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                        <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors text-sm sm:text-base">
                          {action.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Financial Health Score */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                  <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Financial Health
                </h3>
                <div className="text-xl sm:text-2xl font-bold">{Math.round(spendingScore)}%</div>
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

      {/* New Dashboard Features - Organized in sections */}
      
      {/* Financial Insights Section */}
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Financial Insights & Planning</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Budget Recommendations */}
          <BudgetRecommendations analytics={analytics} transactions={transactions || []} />
          
          {/* AI Spending Forecast */}
          <SpendingForecast analytics={analytics} transactions={transactions || []} />
        </div>

        {/* Income vs Expense Chart */}
        <IncomeExpenseChart transactions={transactions || []} />
      </div>

      {/* Alerts & Goals Section */}
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Alerts & Goal Tracking</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Alerts & Insights */}
          <AlertsInsights analytics={analytics} transactions={transactions || []} />
          
          {/* Bill Reminders */}
          <BillReminders transactions={transactions || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Savings Goal Tracker */}
          <SavingsGoalTracker analytics={analytics} />
          
          {/* Net Worth Tracker */}
          <NetWorthTracker />
        </div>
      </div>

      {/* Tools & Highlights Section */}
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Tools & Highlights</h2>
        
        {/* Monthly Highlights Carousel */}
        <MonthlyHighlights analytics={analytics} transactions={transactions || []} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Currency Converter */}
          <CurrencyConverter />
          
          {/* Export PDF Report */}
          <ExportPDFReport analytics={analytics} transactions={transactions || []} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete all transaction data? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-10"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors min-h-10"
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