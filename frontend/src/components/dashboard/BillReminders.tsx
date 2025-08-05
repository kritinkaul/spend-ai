import { Calendar, Bell, CreditCard, Home, Tv, Car, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { formatCompactCurrency } from '../../lib/utils';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category?: string;
  date: string;
}

interface BillRemindersProps {
  transactions: Transaction[];
  className?: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  lastPaid: string;
  nextDue: string;
  daysUntilDue: number;
  frequency: 'monthly' | 'weekly' | 'quarterly' | 'yearly';
  confidence: number;
  icon: any;
  color: string;
  status: 'overdue' | 'due-soon' | 'upcoming' | 'not-due';
}

export default function BillReminders({ transactions, className = "" }: BillRemindersProps) {
  // Identify recurring bills from transactions
  const identifyRecurringBills = (): Bill[] => {
    const bills: Bill[] = [];
    const billPatterns: Array<{
      keywords: string[];
      name: string;
      category: string;
      icon: any;
      color: string;
      frequency: 'monthly' | 'weekly' | 'quarterly' | 'yearly';
    }> = [
      {
        keywords: ['rent', 'lease', 'housing'],
        name: 'Rent',
        category: 'Housing',
        icon: Home,
        color: 'blue',
        frequency: 'monthly'
      },
      {
        keywords: ['netflix', 'streaming'],
        name: 'Netflix',
        category: 'Entertainment',
        icon: Tv,
        color: 'red',
        frequency: 'monthly'
      },
      {
        keywords: ['gas', 'fuel', 'shell', 'exxon', 'chevron'],
        name: 'Gas Station',
        category: 'Transportation',
        icon: Car,
        color: 'green',
        frequency: 'weekly'
      },
      {
        keywords: ['insurance', 'premium'],
        name: 'Insurance',
        category: 'Insurance',
        icon: CreditCard,
        color: 'purple',
        frequency: 'monthly'
      },
      {
        keywords: ['phone', 'mobile', 'cellular', 'verizon', 'att', 't-mobile'],
        name: 'Phone Bill',
        category: 'Utilities',
        icon: Bell,
        color: 'indigo',
        frequency: 'monthly'
      }
    ];

    billPatterns.forEach(pattern => {
      // Find transactions matching this pattern
      const matchingTransactions = transactions.filter(t => 
        t.amount < 0 && pattern.keywords.some(keyword => 
          t.description.toLowerCase().includes(keyword) || 
          (t.category && t.category.toLowerCase().includes(keyword))
        )
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (matchingTransactions.length > 0) {
        const lastTransaction = matchingTransactions[0];
        const amount = Math.abs(lastTransaction.amount);
        const lastPaidDate = new Date(lastTransaction.date);
        
        // Calculate next due date based on frequency
        let nextDueDate = new Date(lastPaidDate);
        switch (pattern.frequency) {
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 3);
            break;
          case 'yearly':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            break;
        }

        const today = new Date();
        const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Determine status
        let status: Bill['status'] = 'upcoming';
        if (daysUntilDue < 0) status = 'overdue';
        else if (daysUntilDue <= 3) status = 'due-soon';
        else if (daysUntilDue <= 7) status = 'upcoming';
        else status = 'not-due';

        // Calculate confidence based on transaction frequency
        let confidence = 50;
        if (matchingTransactions.length >= 3) confidence = 90;
        else if (matchingTransactions.length >= 2) confidence = 75;

        bills.push({
          id: `bill-${pattern.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: pattern.name,
          amount,
          category: pattern.category,
          lastPaid: lastPaidDate.toISOString(),
          nextDue: nextDueDate.toISOString(),
          daysUntilDue,
          frequency: pattern.frequency,
          confidence,
          icon: pattern.icon,
          color: pattern.color,
          status
        });
      }
    });

    // If no bills found, add sample bills
    if (bills.length === 0) {
      const sampleBills: Bill[] = [
        {
          id: 'sample-rent',
          name: 'Rent Payment',
          amount: 1200,
          category: 'Housing',
          lastPaid: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilDue: 5,
          frequency: 'monthly',
          confidence: 95,
          icon: Home,
          color: 'blue',
          status: 'upcoming'
        },
        {
          id: 'sample-netflix',
          name: 'Netflix Subscription',
          amount: 15.49,
          category: 'Entertainment',
          lastPaid: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          nextDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilDue: 2,
          frequency: 'monthly',
          confidence: 90,
          icon: Tv,
          color: 'red',
          status: 'due-soon'
        },
        {
          id: 'sample-insurance',
          name: 'Car Insurance',
          amount: 150,
          category: 'Insurance',
          lastPaid: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilDue: 15,
          frequency: 'monthly',
          confidence: 85,
          icon: CreditCard,
          color: 'purple',
          status: 'not-due'
        }
      ];
      return sampleBills;
    }

    return bills.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  };

  const bills = identifyRecurringBills();

  const getStatusStyles = (status: Bill['status']) => {
    switch (status) {
      case 'overdue':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-300',
          badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
          icon: AlertTriangle
        };
      case 'due-soon':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-300',
          badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
          icon: Clock
        };
      case 'upcoming':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-300',
          badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
          icon: Calendar
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-300',
          badge: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
          icon: CheckCircle
        };
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600',
      red: 'text-red-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
      yellow: 'text-yellow-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  const formatDaysUntilDue = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const urgentBills = bills.filter(bill => bill.status === 'overdue' || bill.status === 'due-soon');
  const upcomingBills = bills.filter(bill => bill.status === 'upcoming' || bill.status === 'not-due');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-rose-600" />
              Bill Reminders
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Upcoming payment due dates
            </p>
          </div>
          
          {urgentBills.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                {urgentBills.length} Urgent
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {bills.length > 0 ? (
          <div className="space-y-4">
            {/* Urgent bills first */}
            {urgentBills.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-red-800 dark:text-red-300">Urgent Bills</h4>
                </div>
                {urgentBills.map((bill, index) => {
                  const styles = getStatusStyles(bill.status);
                  const IconComponent = bill.icon;
                  const StatusIcon = styles.icon;
                  
                  return (
                    <div 
                      key={bill.id}
                      className={`p-4 rounded-lg border ${styles.bg} ${styles.border} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${getColorClasses(bill.color)}`} />
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {bill.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCompactCurrency(bill.amount)} • {bill.category}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`text-xs px-2 py-1 rounded-full ${styles.badge}`}>
                              {formatDaysUntilDue(bill.daysUntilDue)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(bill.nextDue).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {upcomingBills.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>}
              </>
            )}

            {/* Upcoming bills */}
            {upcomingBills.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">Upcoming Bills</h4>
                </div>
                {upcomingBills.slice(0, 3).map((bill, index) => {
                  const styles = getStatusStyles(bill.status);
                  const IconComponent = bill.icon;
                  
                  return (
                    <div 
                      key={bill.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${getColorClasses(bill.color)}`} />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {bill.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCompactCurrency(bill.amount)} • {bill.frequency}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDaysUntilDue(bill.daysUntilDue)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(bill.nextDue).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Total upcoming expenses */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Next 30 Days
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-800 dark:text-blue-300">
                    <strong>Total Due:</strong> {formatCompactCurrency(
                      bills.filter(b => b.daysUntilDue <= 30).reduce((sum, b) => sum + b.amount, 0)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-blue-800 dark:text-blue-300">
                    <strong>Bills Count:</strong> {bills.filter(b => b.daysUntilDue <= 30).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recurring bills detected</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add more transaction data to identify your regular payments</p>
          </div>
        )}
      </div>
    </div>
  );
} 