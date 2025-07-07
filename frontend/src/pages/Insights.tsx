import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
// Removed unused recharts imports
import { transactionService } from '../services/transactions';

// Interfaces for type safety
interface Analytics {
  total_spent: number;
  total_earned: number;
  avg_expense: number;
}

interface Category {
  category: string;
  total_amount: number;
  transaction_count: number;
}

interface Insight {
  id: number;
  type: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  priority: string;
  actionable: boolean;
  actionItems: string[];
}

const generateInsights = (analytics: Analytics, categories: Category[]): Insight[] => {
    const insights: Insight[] = [];
    let insightId = 1;

    // Insight 1: High spending category
    if (categories.length > 0 && analytics.total_spent > 0) {
      const topCategory = categories[0];
      const spendingPercentage = (topCategory.total_amount / analytics.total_spent) * 100;
      
      if (spendingPercentage > 25) {
        insights.push({
          id: insightId++,
          type: 'SPENDING_ALERT',
          title: `High ${topCategory.category} Spending`,
          description: `You're spending ${spendingPercentage.toFixed(1)}% of your total expenses on ${topCategory.category.toLowerCase()}. Consider setting a budget for this category.`,
          category: topCategory.category,
          amount: topCategory.total_amount,
          priority: 'HIGH',
          actionable: true,
          actionItems: [
            `Set a monthly budget for ${topCategory.category.toLowerCase()}`,
            'Look for ways to reduce spending in this category',
            'Track your spending more closely'
          ],
        });
      }
    }

    // Insight 2: Multiple transactions in same category
    const frequentCategories = categories.filter(cat => cat.transaction_count >= 3);
    if (frequentCategories.length > 0) {
      const frequentCategory = frequentCategories[0];
      insights.push({
        id: insightId++,
        type: 'UNUSUAL_SPENDING',
        title: `Frequent ${frequentCategory.category} Purchases`,
        description: `You made ${frequentCategory.transaction_count} purchases at ${frequentCategory.category} this month. Consider if all were necessary.`,
        category: frequentCategory.category,
        amount: frequentCategory.total_amount,
        priority: 'MEDIUM',
        actionable: true,
        actionItems: [
          'Review if all purchases were necessary',
          'Consider bulk buying to reduce frequency',
          'Set spending limits for this category'
        ],
      });
    }

    // Insight 3: Savings opportunity
    if (analytics.total_spent > 0 && analytics.total_earned > 0) {
      const savingsRate = ((analytics.total_earned - analytics.total_spent) / analytics.total_earned) * 100;
      
      if (savingsRate < 20) {
        insights.push({
          id: insightId++,
          type: 'SAVINGS_OPPORTUNITY',
          title: 'Low Savings Rate',
          description: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
          category: 'Savings',
          amount: analytics.total_earned * 0.2 - (analytics.total_earned - analytics.total_spent),
          priority: 'HIGH',
          actionable: true,
          actionItems: [
            'Create a monthly budget',
            'Automate savings transfers',
            'Review and reduce non-essential expenses'
          ],
        });
      } else {
        insights.push({
          id: insightId++,
          type: 'POSITIVE_TREND',
          title: 'Great Savings Rate!',
          description: `Excellent work! You're saving ${savingsRate.toFixed(1)}% of your income, which is above the recommended 20%.`,
          category: 'Savings',
          amount: analytics.total_earned - analytics.total_spent,
          priority: 'LOW',
          actionable: false,
          actionItems: [],
        });
      }
    }

    // Insight 4: Average transaction size
    if (analytics.avg_expense > 100) {
      insights.push({
        id: insightId++,
        type: 'SPENDING_ALERT',
        title: 'High Average Transaction Size',
        description: `Your average transaction is $${analytics.avg_expense.toFixed(2)}, which is quite high. Consider smaller, more frequent purchases.`,
        category: 'General',
        amount: analytics.avg_expense,
        priority: 'MEDIUM',
        actionable: true,
        actionItems: [
          'Break down large purchases into smaller ones',
          'Wait 24 hours before large purchases',
          'Look for bulk discounts when appropriate'
        ],
      });
    }

    return insights;
};

export default function Insights() {
  // Removed unused selectedPeriod state

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery(
    'analytics',
    () => transactionService.getAnalytics()
  );

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'categories',
    () => transactionService.getCategories()
  );
  
  const insights = useMemo(() => {
    if (analytics && categories) {
      return generateInsights(analytics, categories);
    }
    return [];
  }, [analytics, categories]);

  const isLoading = analyticsLoading || categoriesLoading;
  const error = analyticsError || categoriesError;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SPENDING_ALERT':
        return AlertTriangle;
      case 'SAVINGS_OPPORTUNITY':
        return DollarSign;
      case 'POSITIVE_TREND':
        return TrendingUp;
      case 'UNUSUAL_SPENDING':
        return Target;
      default:
        return Lightbulb;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading insights</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || insights.length === 0) {
    return (
      <div className="text-center py-8">
        <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h2>
        <p className="text-gray-600">Upload some transactions to get personalized financial insights!</p>
      </div>
    );
  }

  const highPriorityCount = insights.filter(i => i.priority === 'HIGH').length;
  const mediumPriorityCount = insights.filter(i => i.priority === 'MEDIUM').length;
  const positiveTrendsCount = insights.filter(i => i.type === 'POSITIVE_TREND').length;
  const potentialSavings = insights
    .filter(i => i.type === 'SAVINGS_OPPORTUNITY')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-600">Personalized financial advice based on your spending patterns.</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight) => {
          const IconComponent = getTypeIcon(insight.type);
          return (
            <div key={insight.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${getPriorityColor(insight.priority)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-500">{insight.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(insight.priority)}`}>
                  {insight.priority}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{insight.description}</p>

              {insight.amount && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Amount: </span>
                  <span className="font-semibold text-gray-900">${insight.amount.toFixed(2)}</span>
                </div>
              )}

              {insight.actionable && insight.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        <span className="text-sm text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{mediumPriorityCount}</div>
            <div className="text-sm text-gray-600">Medium Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{positiveTrendsCount}</div>
            <div className="text-sm text-gray-600">Positive Trends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">${potentialSavings.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Potential Savings</div>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      {insights.filter(i => i.actionable).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Action Plan</h2>
          <div className="space-y-4">
            {insights
              .filter(insight => insight.actionable)
              .slice(0, 3)
              .map((insight, index) => (
                <div key={insight.id} className="flex items-center p-4 bg-primary-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600">{insight.actionItems[0]}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 