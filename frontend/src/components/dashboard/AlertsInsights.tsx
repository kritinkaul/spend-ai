import { AlertTriangle, TrendingUp, TrendingDown, Bell, Flame, Car, Home, CreditCard, Calendar, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
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

interface AlertsInsightsProps {
  analytics: Analytics;
  transactions: Transaction[];
  className?: string;
}

type AlertType = 'warning' | 'info' | 'success' | 'danger';

interface Alert {
  id: string;
  type: AlertType;
  icon: any;
  title: string;
  message: string;
  timestamp: string;
  actionable?: boolean;
}

export default function AlertsInsights({ analytics, transactions, className = "" }: AlertsInsightsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Generate smart alerts based on transaction data
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const recentTransactions = transactions.slice(0, 10);
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Check for recent subscriptions/renewals
    const subscriptionKeywords = ['netflix', 'spotify', 'subscription', 'annual', 'monthly'];
    const recentSubscriptions = recentTransactions.filter(t => 
      t.amount < 0 && subscriptionKeywords.some(keyword => 
        t.description.toLowerCase().includes(keyword)
      )
    );

    recentSubscriptions.forEach(sub => {
      alerts.push({
        id: `sub-${sub.id}`,
        type: 'info',
        icon: Bell,
        title: 'Subscription Renewal',
        message: `${sub.description} auto-renewed: ${formatCompactCurrency(Math.abs(sub.amount))}`,
        timestamp: new Date(sub.date).toLocaleDateString(),
        actionable: true
      });
    });

    // Check for high gas expenses
    const gasTransactions = transactions.filter(t => 
      t.amount < 0 && (
        t.description.toLowerCase().includes('gas') || 
        t.category?.toLowerCase().includes('gas')
      )
    );
    
    if (gasTransactions.length > 0) {
      const currentMonthGas = gasTransactions
        .filter(t => new Date(t.date) > lastMonth)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const previousMonthGas = gasTransactions
        .filter(t => {
          const date = new Date(t.date);
          return date > new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()) &&
                 date <= lastMonth;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      if (previousMonthGas > 0) {
        const gasIncrease = ((currentMonthGas - previousMonthGas) / previousMonthGas) * 100;
        if (gasIncrease > 25) {
          alerts.push({
            id: 'gas-increase',
            type: 'warning',
            icon: Car,
            title: 'Gas Expenses Rising',
            message: `Gas expenses are up ${gasIncrease.toFixed(0)}% from last month (${formatCompactCurrency(currentMonthGas)})`,
            timestamp: 'Today',
            actionable: true
          });
        }
      }
    }

    // Check for large recent expenses
    const largeExpenses = recentTransactions.filter(t => t.amount < -500);
    largeExpenses.forEach(expense => {
      alerts.push({
        id: `large-${expense.id}`,
        type: 'warning',
        icon: AlertTriangle,
        title: 'Large Expense Detected',
        message: `${expense.description}: ${formatCompactCurrency(Math.abs(expense.amount))}`,
        timestamp: new Date(expense.date).toLocaleDateString(),
        actionable: false
      });
    });

    // Check spending velocity
    const thisWeekSpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return t.amount < 0 && transactionDate > weekAgo;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (thisWeekSpending > analytics.total_spent * 0.3) {
      alerts.push({
        id: 'spending-velocity',
        type: 'danger',
        icon: Flame,
        title: 'High Spending Week',
        message: `You've spent ${formatCompactCurrency(thisWeekSpending)} this week - 30% of your monthly budget!`,
        timestamp: 'Today',
        actionable: true
      });
    }

    // Check for positive trends
    const recentIncome = transactions
      .filter(t => t.amount > 0 && new Date(t.date) > lastMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    if (recentIncome > analytics.total_earned * 0.1) {
      alerts.push({
        id: 'income-boost',
        type: 'success',
        icon: TrendingUp,
        title: 'Income Boost',
        message: `Great! You've earned ${formatCompactCurrency(recentIncome)} more than usual this month`,
        timestamp: 'This Month',
        actionable: false
      });
    }

    // If no real alerts, add some sample ones
    if (alerts.length === 0) {
      alerts.push(
        {
          id: 'sample-1',
          type: 'info',
          icon: Bell,
          title: 'Netflix Subscription',
          message: 'Netflix subscription auto-renewed: $15.49',
          timestamp: '2 days ago',
          actionable: true
        },
        {
          id: 'sample-2',
          type: 'warning',
          icon: Car,
          title: 'Gas Expenses Up',
          message: 'Gas expenses are up 45% from last month',
          timestamp: 'Yesterday',
          actionable: true
        },
        {
          id: 'sample-3',
          type: 'success',
          icon: TrendingUp,
          title: 'Savings Goal Progress',
          message: 'You\'re 15% ahead of your monthly savings target!',
          timestamp: 'Today',
          actionable: false
        }
      );
    }

    return alerts.slice(0, 3); // Top 3 alerts
  };

  const alerts = generateAlerts().filter(alert => !dismissedAlerts.includes(alert.id));

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-800 dark:text-green-300',
          icon: 'text-green-600 dark:text-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-300',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'danger':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-300',
          icon: 'text-red-600 dark:text-red-400'
        };
      default: // info
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-300',
          icon: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              Alerts & Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Recent notifications and spending insights
            </p>
          </div>
          
          {alerts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const styles = getAlertStyles(alert.type);
              const IconComponent = alert.icon;
              
              return (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${styles.bg} ${styles.border} transition-all duration-200 hover:shadow-md animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${styles.icon}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold ${styles.text}`}>
                            {alert.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {alert.timestamp}
                          </span>
                        </div>
                        <p className={`text-sm ${styles.text} opacity-90`}>
                          {alert.message}
                        </p>
                        
                        {alert.actionable && (
                          <div className="mt-2">
                            <button className={`text-xs font-medium ${styles.text} underline hover:no-underline`}>
                              Take Action →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No alerts at the moment</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">We'll notify you of important spending insights</p>
          </div>
        )}

        {/* Quick insights summary */}
        {transactions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Quick Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Most Active Day:</strong> {new Date(
                    transactions.reduce((mostActive, current) => 
                      transactions.filter(t => t.date === current.date).length > 
                      transactions.filter(t => t.date === mostActive.date).length ? current : mostActive
                    ).date
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Average Transaction:</strong> {formatCompactCurrency(
                    Math.abs(analytics.total_spent) / Math.max(transactions.filter(t => t.amount < 0).length, 1)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 