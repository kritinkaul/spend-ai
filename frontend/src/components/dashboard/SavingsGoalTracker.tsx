import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Edit2, Plus, CheckCircle, AlertCircle, DollarSign, Award, Zap } from 'lucide-react';
import { formatCompactCurrency } from '../../lib/utils';

interface Analytics {
  total_spent: number;
  total_earned: number;
  total_transactions: number;
}

interface SavingsGoalTrackerProps {
  analytics: Analytics;
  className?: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'emergency' | 'vacation' | 'house' | 'car' | 'retirement' | 'other';
  color: string;
  icon: any;
  created: string;
}

const GOAL_CATEGORIES = {
  emergency: { name: 'Emergency Fund', icon: AlertCircle, color: 'red' },
  vacation: { name: 'Vacation', icon: Calendar, color: 'blue' },
  house: { name: 'House/Real Estate', icon: Target, color: 'green' },
  car: { name: 'Vehicle', icon: TrendingUp, color: 'purple' },
  retirement: { name: 'Retirement', icon: Award, color: 'indigo' },
  other: { name: 'Other Goal', icon: DollarSign, color: 'gray' }
};

export default function SavingsGoalTracker({ analytics, className = "" }: SavingsGoalTrackerProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('savings-goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    } else {
      // Load demo goals
      setGoals([
        {
          id: 'emergency-fund',
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 6750,
          deadline: '2024-12-31',
          category: 'emergency',
          color: 'red',
          icon: AlertCircle,
          created: new Date().toISOString()
        },
        {
          id: 'vacation-2024',
          name: 'Europe Trip 2024',
          targetAmount: 5000,
          currentAmount: 2100,
          deadline: '2024-06-15',
          category: 'vacation',
          color: 'blue',
          icon: Calendar,
          created: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('savings-goals', JSON.stringify(goals));
  }, [goals]);

  // Calculate monthly savings potential based on income vs expenses
  const calculateMonthlySavings = () => {
    const monthlyIncome = analytics.total_earned;
    const monthlyExpenses = Math.abs(analytics.total_spent);
    return Math.max(0, monthlyIncome - monthlyExpenses);
  };

  const addGoal = (name: string, targetAmount: number, deadline: string, category: keyof typeof GOAL_CATEGORIES) => {
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name,
      targetAmount,
      currentAmount: 0,
      deadline,
      category,
      color: GOAL_CATEGORIES[category].color,
      icon: GOAL_CATEGORIES[category].icon,
      created: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
    setShowAddGoal(false);
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, currentAmount: Math.max(0, amount) } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const getProgressPercentage = (goal: SavingsGoal) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalStatus = (goal: SavingsGoal) => {
    const progress = getProgressPercentage(goal);
    const daysLeft = getDaysUntilDeadline(goal.deadline);
    
    if (progress >= 100) return { status: 'completed', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (daysLeft < 0) return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (daysLeft < 30 && progress < 80) return { status: 'urgent', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (progress > 75) return { status: 'on-track', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { status: 'in-progress', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const monthlySavingsPotential = calculateMonthlySavings();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-emerald-600" />
              Savings Goal Tracker
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Track your progress towards financial goals
            </p>
          </div>
          
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm"
          >
            <Plus className="h-3 w-3" />
            Add Goal
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Overall Progress Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Overall Progress</h4>
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {overallProgress.toFixed(1)}% Complete
            </span>
          </div>
          
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-3 mb-3">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-emerald-700 dark:text-emerald-400">
                <strong>Saved:</strong> {formatCompactCurrency(totalSaved)}
              </p>
            </div>
            <div>
              <p className="text-emerald-700 dark:text-emerald-400">
                <strong>Target:</strong> {formatCompactCurrency(totalTarget)}
              </p>
            </div>
            <div>
              <p className="text-emerald-700 dark:text-emerald-400">
                <strong>Remaining:</strong> {formatCompactCurrency(Math.max(0, totalTarget - totalSaved))}
              </p>
            </div>
          </div>
        </div>

        {/* Savings Potential Insight */}
        {monthlySavingsPotential > 0 && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Monthly Savings Potential</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Based on your income vs expenses, you could save <strong>{formatCompactCurrency(monthlySavingsPotential)}</strong> per month
            </p>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length > 0 ? (
            goals.map(goal => {
              const progress = getProgressPercentage(goal);
              const daysLeft = getDaysUntilDeadline(goal.deadline);
              const status = getGoalStatus(goal);
              const IconComponent = goal.icon;
              
              return (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 text-${goal.color}-600`} />
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {GOAL_CATEGORIES[goal.category].name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.bgColor} ${status.color}`}>
                        {status.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                        {status.status === 'urgent' && <AlertCircle className="h-3 w-3" />}
                        <span className="capitalize">{status.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Details */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>{formatCompactCurrency(goal.currentAmount)} saved</span>
                      <span>{formatCompactCurrency(goal.targetAmount)} goal</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-${goal.color}-500 h-2 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{progress.toFixed(1)}% complete</span>
                      <span>
                        {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`}
                      </span>
                    </div>
                  </div>

                  {/* Quick Add/Edit Amount */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Add amount"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseFloat((e.target as HTMLInputElement).value);
                          if (!isNaN(value) && value > 0) {
                            updateGoalProgress(goal.id, goal.currentAmount + value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => setEditingGoal(editingGoal === goal.id ? null : goal.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Edit Mode */}
                  {editingGoal === goal.id && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="number"
                          value={goal.currentAmount}
                          onChange={(e) => updateGoalProgress(goal.id, parseFloat(e.target.value) || 0)}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="Current amount"
                        />
                        <input
                          type="date"
                          value={goal.deadline}
                          onChange={(e) => {
                            setGoals(prev => prev.map(g => 
                              g.id === goal.id ? { ...g, deadline: e.target.value } : g
                            ));
                          }}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        />
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete Goal
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No savings goals yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Set your first goal to start tracking your progress</p>
            </div>
          )}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <AddGoalModal
            onAdd={addGoal}
            onCancel={() => setShowAddGoal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Add Goal Modal Component
interface AddGoalModalProps {
  onAdd: (name: string, targetAmount: number, deadline: string, category: keyof typeof GOAL_CATEGORIES) => void;
  onCancel: () => void;
}

function AddGoalModal({ onAdd, onCancel }: AddGoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<keyof typeof GOAL_CATEGORIES>('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount);
    if (!isNaN(amount) && amount > 0 && name.trim() && deadline) {
      onAdd(name.trim(), amount, deadline, category);
      setName('');
      setTargetAmount('');
      setDeadline('');
      setCategory('other');
    }
  };

  // Set default deadline to 1 year from now
  useEffect(() => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    setDeadline(oneYearFromNow.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Savings Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Emergency Fund"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Amount
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="10000"
              min="1"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as keyof typeof GOAL_CATEGORIES)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(GOAL_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              Add Goal
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 