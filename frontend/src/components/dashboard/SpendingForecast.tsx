import { Brain, TrendingUp, TrendingDown, Calendar, AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';
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

interface SpendingForecastProps {
  analytics: Analytics;
  transactions: Transaction[];
  className?: string;
}

interface CategoryForecast {
  category: string;
  currentSpending: number;
  forecastSpending: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

export default function SpendingForecast({ analytics, transactions, className = "" }: SpendingForecastProps) {
  // Advanced forecasting algorithm
  const generateForecast = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear && t.amount < 0;
    });

    // Get previous months for comparison (last 3 months)
    const historicalData = [];
    for (let i = 1; i <= 3; i++) {
      const month = currentMonth - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = month < 0 ? month + 12 : month;
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === adjustedMonth && date.getFullYear() === year && t.amount < 0;
      });
      
      historicalData.push({
        month: adjustedMonth,
        year,
        transactions: monthTransactions,
        totalSpent: monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      });
    }

    // Group by category
    const categoryData: Record<string, CategoryForecast> = {};
    
    // Analyze current month spending by category
    const currentCategorySpending = currentMonthTransactions.reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Calculate historical averages by category
    const historicalCategoryAverages: Record<string, number> = {};
    Object.keys(currentCategorySpending).forEach(category => {
      const historicalSpending = historicalData.map(month => 
        month.transactions
          .filter(t => (t.category || 'Other') === category)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      );
      
      historicalCategoryAverages[category] = historicalSpending.length > 0 
        ? historicalSpending.reduce((sum, amount) => sum + amount, 0) / historicalSpending.length 
        : 0;
    });

    // Generate forecasts for each category
    Object.entries(currentCategorySpending).forEach(([category, currentAmount]) => {
      const historicalAvg = historicalCategoryAverages[category] || 0;
      const factors: string[] = [];
      let confidence = 75; // Base confidence
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let forecastMultiplier = 1;

      // Analyze trend
      if (historicalAvg > 0) {
        const trendPercent = ((currentAmount - historicalAvg) / historicalAvg) * 100;
        
        if (trendPercent > 15) {
          trend = 'increasing';
          forecastMultiplier = 1.1; // 10% increase
          factors.push('Spending is trending upward');
          confidence += 10;
        } else if (trendPercent < -15) {
          trend = 'decreasing';
          forecastMultiplier = 0.9; // 10% decrease
          factors.push('Spending is trending downward');
          confidence += 10;
        } else {
          factors.push('Spending is relatively stable');
        }
      }

      // Category-specific adjustments
      switch (category.toLowerCase()) {
        case 'rent':
        case 'housing':
          forecastMultiplier = 1; // Housing is usually fixed
          confidence = 95;
          factors.push('Fixed monthly expense');
          break;
        
        case 'netflix':
        case 'subscription':
          forecastMultiplier = 1; // Subscriptions are predictable
          confidence = 90;
          factors.push('Recurring subscription');
          break;
          
        case 'gas station':
        case 'transportation':
          // Gas prices are volatile
          forecastMultiplier += Math.random() * 0.2 - 0.1; // ±10% volatility
          confidence = 60;
          factors.push('Variable due to usage and prices');
          break;
          
        case 'grocery':
        case 'food':
          // Food spending varies
          forecastMultiplier += Math.random() * 0.15 - 0.075; // ±7.5% volatility
          confidence = 70;
          factors.push('Varies with shopping habits');
          break;
          
        default:
          factors.push('Based on recent spending patterns');
      }

      // Seasonal adjustments (simple example)
      const nextMonth = (currentMonth + 1) % 12;
      if (nextMonth === 11) { // December
        forecastMultiplier *= 1.2; // Holiday spending
        factors.push('Holiday season increase expected');
      }

      const forecastSpending = Math.max(0, currentAmount * forecastMultiplier);

      categoryData[category] = {
        category,
        currentSpending: currentAmount,
        forecastSpending,
        confidence: Math.min(95, Math.max(50, confidence)),
        trend,
        factors
      };
    });

    return Object.values(categoryData).sort((a, b) => b.forecastSpending - a.forecastSpending);
  };

  const forecasts = generateForecast();
  const totalForecast = forecasts.reduce((sum, f) => sum + f.forecastSpending, 0);
  const totalCurrent = forecasts.reduce((sum, f) => sum + f.currentSpending, 0);
  const overallChange = totalCurrent > 0 ? ((totalForecast - totalCurrent) / totalCurrent) * 100 : 0;
  const averageConfidence = forecasts.length > 0 ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length : 0;

  // Determine overall forecast status
  const getForecastStatus = () => {
    if (overallChange > 10) return { status: 'increasing', color: 'red', icon: TrendingUp };
    if (overallChange < -5) return { status: 'decreasing', color: 'green', icon: TrendingDown };
    return { status: 'stable', color: 'blue', icon: Activity };
  };

  const { status, color, icon: StatusIcon } = getForecastStatus();

  // If no data, show demo forecast
  if (forecasts.length === 0) {
    const demoForecasts: CategoryForecast[] = [
      {
        category: 'Housing',
        currentSpending: 1200,
        forecastSpending: 1200,
        confidence: 95,
        trend: 'stable',
        factors: ['Fixed monthly rent payment']
      },
      {
        category: 'Food',
        currentSpending: 450,
        forecastSpending: 480,
        confidence: 70,
        trend: 'increasing',
        factors: ['Slight increase expected', 'Based on recent trends']
      },
      {
        category: 'Transportation',
        currentSpending: 200,
        forecastSpending: 220,
        confidence: 60,
        trend: 'increasing',
        factors: ['Gas prices trending up', 'Variable expense']
      }
    ];

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Brain className="h-5 w-5 mr-2 text-indigo-600" />
            AI Spending Forecast
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Demo forecast - upload transactions for personalized predictions</p>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Add more transaction data</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">to get AI-powered spending forecasts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Brain className="h-5 w-5 mr-2 text-indigo-600" />
              AI Spending Forecast
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Predictive analysis for next month
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Confidence</p>
            <p className="text-lg font-bold text-indigo-600">{averageConfidence.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overall forecast summary */}
        <div className={`p-4 rounded-lg border mb-6 ${
          color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
          color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' :
          'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-6 w-6 ${
                color === 'red' ? 'text-red-600' :
                color === 'green' ? 'text-green-600' : 'text-blue-600'
              }`} />
              <div>
                <h4 className={`font-semibold ${
                  color === 'red' ? 'text-red-800 dark:text-red-300' :
                  color === 'green' ? 'text-green-800 dark:text-green-300' :
                  'text-blue-800 dark:text-blue-300'
                }`}>
                  Next Month Forecast
                </h4>
                <p className={`text-sm ${
                  color === 'red' ? 'text-red-700 dark:text-red-400' :
                  color === 'green' ? 'text-green-700 dark:text-green-400' :
                  'text-blue-700 dark:text-blue-400'
                }`}>
                  Expected: {formatCompactCurrency(totalForecast)} 
                  {overallChange !== 0 && (
                    <span className="ml-2">
                      ({overallChange > 0 ? '+' : ''}{overallChange.toFixed(1)}% vs current)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category forecasts */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Category Breakdown
          </h4>
          
          {forecasts.slice(0, 4).map((forecast, index) => (
            <div key={forecast.category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {forecast.trend === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : forecast.trend === 'decreasing' ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-blue-500" />
                  )}
                  <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                    {forecast.category}
                  </h5>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCompactCurrency(forecast.forecastSpending)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {forecast.confidence}% confidence
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Current: {formatCompactCurrency(forecast.currentSpending)}</span>
                <span className={`font-medium ${
                  forecast.forecastSpending > forecast.currentSpending ? 'text-red-600' : 
                  forecast.forecastSpending < forecast.currentSpending ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {forecast.currentSpending > 0 && (
                    <>
                      {forecast.forecastSpending > forecast.currentSpending ? '+' : ''}
                      {((forecast.forecastSpending - forecast.currentSpending) / forecast.currentSpending * 100).toFixed(1)}%
                    </>
                  )}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((forecast.confidence / 100) * 100, 100)}%` }}
                ></div>
              </div>

              {/* Factors */}
              <div className="space-y-1">
                {forecast.factors.slice(0, 2).map((factor, factorIndex) => (
                  <p key={factorIndex} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {factor}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI disclaimer */}
        <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Brain className="h-3 w-3" />
            <span>
              <strong>AI Forecast:</strong> Predictions based on spending patterns and trends. 
              Actual results may vary based on economic conditions and personal choices.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
} 