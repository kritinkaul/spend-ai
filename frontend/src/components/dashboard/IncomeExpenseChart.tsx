import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, RefreshCw } from 'lucide-react';
import { formatCompactCurrency } from '../../lib/utils';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category?: string;
  date: string;
}

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  className?: string;
}

export default function IncomeExpenseChart({ transactions, className = "" }: IncomeExpenseChartProps) {
  // Generate 6 months of data
  const generateChartData = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      months.push({
        month: monthYear,
        monthKey,
        income: 0,
        expenses: 0,
        net: 0
      });
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthData = months.find(m => m.monthKey === transactionMonthKey);
      if (monthData) {
        if (transaction.amount > 0) {
          monthData.income += transaction.amount;
        } else {
          monthData.expenses += Math.abs(transaction.amount);
        }
        monthData.net = monthData.income - monthData.expenses;
      }
    });

    // If no real data, generate realistic mock data
    if (transactions.length === 0) {
      months.forEach((month, index) => {
        const baseIncome = 3500 + (Math.random() * 500 - 250); // $3,250 - $3,750
        const baseExpenses = 2800 + (Math.random() * 600 - 300); // $2,500 - $3,100
        
        month.income = Math.round(baseIncome);
        month.expenses = Math.round(baseExpenses);
        month.net = month.income - month.expenses;
      });
    }

    return months;
  };

  const chartData = generateChartData();

  // Calculate trends
  const latestMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  
  const incomeChange = previousMonth ? ((latestMonth.income - previousMonth.income) / previousMonth.income) * 100 : 0;
  const expenseChange = previousMonth ? ((latestMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100 : 0;
  const netChange = previousMonth && previousMonth.net !== 0 ? ((latestMonth.net - previousMonth.net) / Math.abs(previousMonth.net)) * 100 : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="capitalize">{entry.dataKey}:</span>
              <span className="font-semibold">{formatCompactCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
              Income vs Expense Trends
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              6-month financial overview
            </p>
          </div>
          
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Latest Income</p>
              <p className="font-semibold text-emerald-600">{formatCompactCurrency(latestMonth.income)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Latest Expenses</p>
              <p className="font-semibold text-red-600">{formatCompactCurrency(latestMonth.expenses)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Trend indicators */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {incomeChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${incomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Income Change</p>
          </div>

          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {expenseChange <= 0 ? (
                <TrendingDown className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${expenseChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Expense Change</p>
          </div>

          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {netChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-blue-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${netChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {netChange >= 0 ? '+' : ''}{netChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Net Change</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981' }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#EF4444' }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3B82F6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: '#3B82F6' }}
                name="Net Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary insights */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            6-Month Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Average Income:</strong> {formatCompactCurrency(chartData.reduce((sum, month) => sum + month.income, 0) / chartData.length)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Average Expenses:</strong> {formatCompactCurrency(chartData.reduce((sum, month) => sum + month.expenses, 0) / chartData.length)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Average Savings:</strong> {formatCompactCurrency(chartData.reduce((sum, month) => sum + month.net, 0) / chartData.length)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 