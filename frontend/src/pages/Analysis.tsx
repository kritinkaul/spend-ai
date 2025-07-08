import { useQuery } from 'react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, TooltipProps, Area, AreaChart } from 'recharts';
import { transactionService } from '../services/transactions';
import { formatCurrency } from '../lib/utils';
import { Loader2, AlertTriangle, PieChart as PieChartIcon, BarChart3, TrendingUp, Repeat, Lightbulb, RefreshCw, DollarSign, Target, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../lib/utils';

// Define a consistent color palette
const COLORS = ['#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4', '#FFEAA7', '#556270', '#C44D58', '#C7F464'];

const PieChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 p-3 rounded-lg shadow-lg dark:bg-gray-800/90">
        <p className="font-bold text-gray-800 dark:text-gray-200">{data.name}</p>
        <p className="text-sm text-primary-600">
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

const BarChartTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 p-3 rounded-lg shadow-lg dark:bg-gray-800/90">
        <p className="font-bold text-gray-800 dark:text-gray-200">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatCurrency(entry.value as number)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AIInsightsCard = ({ transactions, categories }: { transactions: any[], categories: any[] }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights, error } = useQuery(
    ['analysis-ai-insights', transactions?.length, categories?.length],
    async () => {
      if (!transactions?.length || !categories?.length) return null;
      
      const totalSpent = categories.reduce((sum, cat) => sum + Math.abs(cat.total_amount), 0);
      const topCategory = categories[0];
      const transactionCount = transactions.length;
      
      // Generate a simple analysis based on spending patterns
       
       // For now, return a basic analysis since the AI API method is private
       return `Financial Analysis Summary:

📊 Spending Overview:
• Total Amount: ${formatCurrency(totalSpent)}
• Top Category: ${topCategory?.category} (${formatCurrency(Math.abs(topCategory?.total_amount || 0))})
• Transaction Volume: ${transactionCount} transactions

🔍 Key Patterns:
• Your highest spending is in ${topCategory?.category}
• ${categories.length} different spending categories identified
• Average per transaction: ${formatCurrency(totalSpent / transactionCount)}

💡 Recommendations:
• Monitor ${topCategory?.category} spending closely as it represents your largest expense
• Consider setting monthly budgets for each spending category
• Track recurring payments to identify potential savings
• Review transactions regularly to maintain financial awareness

📈 Financial Health:
• Risk Level: ${totalSpent > 3000 ? 'Medium-High' : totalSpent > 1500 ? 'Medium' : 'Low'}
• Focus on budgeting and expense tracking for better financial control`;
    },
    {
      enabled: !!transactions?.length && !!categories?.length,
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

  if (!transactions?.length || !categories?.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-purple-600" />
            AI Financial Insights
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing || insightsLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", (refreshing || insightsLoading) && "animate-spin")} />
          </button>
        </div>
      </div>
      <div className="p-6">
        {insightsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Analyzing your spending patterns...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Analysis Unavailable</h4>
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
              Retry Analysis
            </button>
          </div>
        ) : insights ? (
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {insights}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No insights available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload more transaction data for AI analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SpendingTrendsCard = ({ monthlyData }: { monthlyData: any[] }) => {
  if (!monthlyData?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
          Spending Trends
        </h3>
      </div>
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarChartTooltip />} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#22C55E" 
                strokeWidth={2}
                fill="url(#incomeGradient)" 
                name="Income"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                fill="url(#expensesGradient)" 
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const AnalyticsCards = ({ categories, transactions }: { categories: any[], transactions: any[] }) => {
  const analytics = useMemo(() => {
    if (!categories?.length || !transactions?.length) return null;
    
    const totalSpent = categories.reduce((sum, cat) => sum + Math.abs(cat.total_amount), 0);
    const totalTransactions = transactions.length;
    const averageTransaction = totalSpent / totalTransactions;
    const topCategory = categories[0];
    
    const recurringTransactions = transactions.filter(t => {
      const description = t.description.toLowerCase();
      return description.includes('subscription') || 
             description.includes('netflix') || 
             description.includes('spotify') || 
             description.includes('gym') ||
             description.includes('rent') ||
             description.includes('insurance');
    });
    
    return {
      totalSpent,
      totalTransactions,
      averageTransaction,
      topCategory: topCategory?.category || 'N/A',
      topCategoryAmount: Math.abs(topCategory?.total_amount || 0),
      recurringCount: recurringTransactions.length,
      recurringAmount: recurringTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    };
  }, [categories, transactions]);

  if (!analytics) return null;

  const cards = [
    {
      title: 'Total Spent',
      value: formatCurrency(analytics.totalSpent),
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
      description: `Across ${analytics.totalTransactions} transactions`
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(analytics.averageTransaction),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      description: 'Per transaction average'
    },
    {
      title: 'Top Category',
      value: analytics.topCategory,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      description: formatCurrency(analytics.topCategoryAmount)
    },
    {
      title: 'Recurring Payments',
      value: formatCurrency(analytics.recurringAmount),
      icon: Repeat,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      description: `${analytics.recurringCount} recurring payments`
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
      {cards.map((card, index) => (
        <div 
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.color}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Analysis() {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'categories',
    () => transactionService.getCategories(),
    {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  const { data: allTransactions, isLoading: transactionsLoading, error: transactionsError } = useQuery(
    'transactions_all',
    () => transactionService.getTransactions(),
    {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const isLoading = categoriesLoading || transactionsLoading;
  const error = categoriesError || transactionsError;

  const categoryData = useMemo(() => {
    if (!categories) return [];
    return categories
      .map((cat, index) => ({
        name: cat.category,
        value: Math.abs(cat.total_amount), // Ensure value is positive for charts
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [categories]);

  const monthlyData = useMemo(() => {
    if (!allTransactions) return [];
    const months: { [key: string]: { income: number, expenses: number } } = {};
    
    allTransactions.forEach(tx => {
      const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!months[month]) {
        months[month] = { income: 0, expenses: 0 };
      }
      if (tx.amount > 0) {
        months[month].income += tx.amount;
      } else {
        months[month].expenses += Math.abs(tx.amount);
      }
    });

    return Object.entries(months)
      .map(([month, values]) => ({ month, ...values }))
      .reverse(); // Show most recent months first
  }, [allTransactions]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto" />
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Could not load analysis</h3>
        <p className="text-red-600 mb-6">{(error as any).message || 'Network Error'}</p>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Make sure the backend server is running on port 8000</p>
          <p>Check your network connection and try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!categoryData.length && !monthlyData.length) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Not enough data to display analysis</h3>
        <p className="text-gray-500 dark:text-gray-400">Upload a transaction file to see your spending breakdown.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-6 sm:p-8 text-white">
         <div className="absolute inset-0 bg-black/10"></div>
         <div className="relative z-10">
           <h1 className="text-2xl sm:text-3xl font-bold mb-2">Spending Analysis</h1>
           <p className="text-primary-100 text-base sm:text-lg">
             A detailed breakdown of your financial patterns and trends.
           </p>
         </div>
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
      
      {/* Analytics Cards */}
      <AnalyticsCards categories={categories || []} transactions={allTransactions || []} />
      
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Spending by Category Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4 flex items-center">
                <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-600" />
                Spending by Category
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={window.innerWidth < 640 ? 80 : 100}
                      innerRadius={window.innerWidth < 640 ? 40 : 50}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={5}
                      cornerRadius={8}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4 flex items-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-600" />
                Monthly Income vs Expenses
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#6b7280', fontSize: window.innerWidth < 640 ? 10 : 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value / 1000}k`} 
                      tick={{ fill: '#6b7280', fontSize: window.innerWidth < 640 ? 10 : 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<BarChartTooltip />} />
                    <Legend iconType="circle" />
                    <Bar dataKey="income" fill="#22C55E" name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Spending Trends */}
        <SpendingTrendsCard monthlyData={monthlyData} />
        
        {/* AI Insights */}
        <AIInsightsCard transactions={allTransactions || []} categories={categories || []} />
      </div>
    </div>
  );
} 