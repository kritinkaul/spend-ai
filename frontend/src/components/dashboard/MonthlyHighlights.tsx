import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Award, AlertTriangle, Target, Sparkles, DollarSign, Calendar, Crown, Star } from 'lucide-react';
import { formatCompactCurrency } from '../../lib/utils';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category?: string;
  date: string;
}

interface Analytics {
  total_spent: number;
  total_earned: number;
  total_transactions: number;
}

interface MonthlyHighlightsProps {
  analytics: Analytics;
  transactions: Transaction[];
  className?: string;
}

interface Highlight {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  type: 'achievement' | 'insight' | 'warning' | 'goal';
}

export default function MonthlyHighlights({ analytics, transactions, className = "" }: MonthlyHighlightsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate highlights based on transaction data
  const generateHighlights = (): Highlight[] => {
    const highlights: Highlight[] = [];
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    const incomeTransactions = transactions.filter(t => t.amount > 0);

    // Find top spending category
    const categorySpending = expenseTransactions.reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      highlights.push({
        id: 'top-category',
        title: 'Top Spending Category',
        value: topCategory[0],
        description: `${formatCompactCurrency(topCategory[1])} spent this month`,
        icon: Crown,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-700',
        type: 'insight'
      });
    }

    // Find least spending category
    const leastCategory = Object.entries(categorySpending)
      .filter(([,amount]) => amount > 0)
      .sort(([,a], [,b]) => a - b)[0];

    if (leastCategory) {
      highlights.push({
        id: 'least-category',
        title: 'Most Controlled Category',
        value: leastCategory[0],
        description: `Only ${formatCompactCurrency(leastCategory[1])} spent`,
        icon: Target,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-700',
        type: 'achievement'
      });
    }

    // Find highest single expense
    const highestExpense = expenseTransactions
      .sort((a, b) => a.amount - b.amount)[0];

    if (highestExpense) {
      highlights.push({
        id: 'highest-expense',
        title: 'Highest Single Expense',
        value: formatCompactCurrency(Math.abs(highestExpense.amount)),
        description: highestExpense.description,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-700',
        type: 'warning'
      });
    }

    // Calculate monthly growth
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const thisMonthIncome = incomeTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpenses = Math.abs(analytics.total_spent);
    const netThisMonth = thisMonthIncome - thisMonthExpenses;

    if (netThisMonth > 0) {
      highlights.push({
        id: 'positive-growth',
        title: 'Monthly Savings',
        value: formatCompactCurrency(netThisMonth),
        description: 'Positive cash flow this month! 🎉',
        icon: TrendingUp,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-700',
        type: 'achievement'
      });
    } else {
      const overspend = Math.abs(netThisMonth);
      highlights.push({
        id: 'overspending',
        title: 'Monthly Deficit',
        value: formatCompactCurrency(overspend),
        description: 'Spending exceeded income this month',
        icon: TrendingDown,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-700',
        type: 'warning'
      });
    }

    // Transaction count achievement
    if (analytics.total_transactions > 0) {
      highlights.push({
        id: 'transaction-count',
        title: 'Financial Activity',
        value: `${analytics.total_transactions} transactions`,
        description: 'Good job tracking your expenses!',
        icon: Award,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-700',
        type: 'achievement'
      });
    }

    // Average transaction size
    if (expenseTransactions.length > 0) {
      const avgExpense = Math.abs(analytics.total_spent) / expenseTransactions.length;
      highlights.push({
        id: 'avg-expense',
        title: 'Average Transaction',
        value: formatCompactCurrency(avgExpense),
        description: `Across ${expenseTransactions.length} expenses`,
        icon: DollarSign,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-700',
        type: 'insight'
      });
    }

    // If no data, show demo highlights
    if (highlights.length === 0) {
      return [
        {
          id: 'demo-top-category',
          title: 'Top Spending Category',
          value: 'Food & Dining',
          description: '$485 spent this month',
          icon: Crown,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-700',
          type: 'insight'
        },
        {
          id: 'demo-achievement',
          title: 'Savings Achievement',
          value: '$750 saved',
          description: 'You\'re ahead of your monthly goal! 🎯',
          icon: Award,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-700',
          type: 'achievement'
        },
        {
          id: 'demo-growth',
          title: 'Income Growth',
          value: '+12% increase',
          description: 'Compared to last month',
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          type: 'goal'
        },
        {
          id: 'demo-controlled',
          title: 'Most Controlled',
          value: 'Entertainment',
          description: 'Only $45 spent on subscriptions',
          icon: Target,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          type: 'achievement'
        }
      ];
    }

    return highlights;
  };

  const highlights = generateHighlights();

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 280; // Width + gap
      const scrollPosition = index * cardWidth;
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const newIndex = Math.min(highlights.length - 1, currentIndex + 1);
    scrollToIndex(newIndex);
  };

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % highlights.length;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, [highlights.length]);

  const getTypeIndicator = (type: Highlight['type']) => {
    switch (type) {
      case 'achievement':
        return <Star className="h-3 w-3 text-yellow-500" />;
      case 'goal':
        return <Target className="h-3 w-3 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default:
        return <Sparkles className="h-3 w-3 text-purple-500" />;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-violet-600" />
              Monthly Highlights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Key insights from your financial activity
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollRight}
              disabled={currentIndex === highlights.length - 1}
              className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {highlights.map((highlight, index) => {
              const IconComponent = highlight.icon;
              
              return (
                <div
                  key={highlight.id}
                  className={`flex-shrink-0 w-64 p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${highlight.bgColor} ${highlight.borderColor} ${
                    index === currentIndex ? 'ring-2 ring-violet-300 dark:ring-violet-700' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-5 w-5 ${highlight.color}`} />
                      {getTypeIndicator(highlight.type)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {index + 1}/{highlights.length}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                    {highlight.title}
                  </h4>
                  
                  <p className={`text-lg font-bold mb-2 ${highlight.color}`}>
                    {highlight.value}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {highlight.description}
                  </p>
                  
                  {/* Progress indicator for achievements */}
                  {highlight.type === 'achievement' && (
                    <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div className="bg-green-500 h-1 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {highlights.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-violet-600 w-6' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
              <p className="text-lg font-semibold text-green-600">
                {highlights.filter(h => h.type === 'achievement').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Insights</p>
              <p className="text-lg font-semibold text-blue-600">
                {highlights.filter(h => h.type === 'insight').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alerts</p>
              <p className="text-lg font-semibold text-orange-600">
                {highlights.filter(h => h.type === 'warning').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 