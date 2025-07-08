import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';
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

interface BudgetRecommendationsProps {
  analytics: Analytics;
  transactions: Transaction[];
}

export default function BudgetRecommendations({ analytics, transactions }: BudgetRecommendationsProps) {
  // Calculate category spending and recommendations
  const calculateRecommendations = () => {
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    const totalSpent = Math.abs(analytics.total_spent);
    
    // Group spending by category
    const categorySpending = expenseTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    // Calculate percentages and generate recommendations
    const recommendations = Object.entries(categorySpending).map(([category, amount]) => {
      const percentage = (amount / totalSpent) * 100;
      let status: 'good' | 'warning' | 'danger' = 'good';
      let recommendation = '';
      let targetPercentage = 0;

      // Category-specific recommendations based on financial best practices
      switch (category.toLowerCase()) {
        case 'rent':
        case 'housing':
          targetPercentage = 30;
          if (percentage > 40) {
            status = 'danger';
            recommendation = `Housing costs are ${percentage.toFixed(1)}%. Try to keep under 30% of income.`;
          } else if (percentage > 30) {
            status = 'warning';
            recommendation = `Housing at ${percentage.toFixed(1)}% is slightly high. Ideal range is 25-30%.`;
          } else {
            recommendation = `Great! Housing costs are well managed at ${percentage.toFixed(1)}%.`;
          }
          break;
        
        case 'food':
        case 'grocery':
        case 'restaurant':
          targetPercentage = 15;
          if (percentage > 20) {
            status = 'danger';
            recommendation = `Food expenses at ${percentage.toFixed(1)}% are high. Try meal planning to reduce costs.`;
          } else if (percentage > 15) {
            status = 'warning';
            recommendation = `Food costs at ${percentage.toFixed(1)}% could be optimized. Target 10-15%.`;
          } else {
            recommendation = `Food spending at ${percentage.toFixed(1)}% is well controlled.`;
          }
          break;

        case 'gas station':
        case 'transportation':
          targetPercentage = 10;
          if (percentage > 15) {
            status = 'danger';
            recommendation = `Transportation costs at ${percentage.toFixed(1)}% are high. Consider carpooling or public transport.`;
          } else if (percentage > 10) {
            status = 'warning';
            recommendation = `Transport at ${percentage.toFixed(1)}% is moderate. Target under 10%.`;
          } else {
            recommendation = `Transportation spending at ${percentage.toFixed(1)}% is efficient.`;
          }
          break;

        case 'netflix':
        case 'entertainment':
        case 'subscription':
          targetPercentage = 5;
          if (percentage > 10) {
            status = 'danger';
            recommendation = `Entertainment at ${percentage.toFixed(1)}% is excessive. Review subscriptions and cut unused ones.`;
          } else if (percentage > 5) {
            status = 'warning';
            recommendation = `Entertainment at ${percentage.toFixed(1)}% could be reduced. Target under 5%.`;
          } else {
            recommendation = `Entertainment spending at ${percentage.toFixed(1)}% is reasonable.`;
          }
          break;

        default:
          targetPercentage = 10;
          if (percentage > 15) {
            status = 'warning';
            recommendation = `${category} spending at ${percentage.toFixed(1)}% seems high. Review for optimization.`;
          } else {
            recommendation = `${category} spending at ${percentage.toFixed(1)}% appears reasonable.`;
          }
      }

      return {
        category,
        amount,
        percentage,
        targetPercentage,
        status,
        recommendation,
        suggestedBudget: (analytics.total_earned * targetPercentage) / 100
      };
    }).sort((a, b) => b.amount - a.amount);

    return recommendations.slice(0, 4); // Top 4 categories
  };

  const recommendations = calculateRecommendations();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'danger':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Target className="h-5 w-5 mr-2 text-purple-600" />
          Smart Budget Recommendations
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          AI-powered insights for next month's budget
        </p>
      </div>
      
      <div className="p-6">
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.category}
                className={`p-4 rounded-lg border ${getStatusColor(rec.status)} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(rec.status)}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {rec.category}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current: {formatCompactCurrency(rec.amount)} ({rec.percentage.toFixed(1)}% of spending)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Suggested Budget
                    </p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatCompactCurrency(rec.suggestedBudget)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {rec.recommendation}
                </p>

                {/* Progress bar showing current vs target */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Current: {rec.percentage.toFixed(1)}%</span>
                    <span>Target: {rec.targetPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        rec.status === 'good' ? 'bg-green-500' :
                        rec.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(rec.percentage, 100)}%` }}
                    ></div>
                    {/* Target indicator */}
                    <div 
                      className="relative -mt-3 h-3 w-0.5 bg-purple-600"
                      style={{ marginLeft: `${Math.min(rec.targetPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}

            {/* Overall recommendation */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Next Month Action Plan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-800 dark:text-blue-300">
                    <strong>Total Recommended Budget:</strong> {formatCompactCurrency(recommendations.reduce((sum, rec) => sum + rec.suggestedBudget, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-blue-800 dark:text-blue-300">
                    <strong>Potential Savings:</strong> {formatCompactCurrency(Math.max(0, analytics.total_spent - recommendations.reduce((sum, rec) => sum + rec.suggestedBudget, 0)))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No spending data available for recommendations</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add more transactions to get personalized budget advice</p>
          </div>
        )}
      </div>
    </div>
  );
} 