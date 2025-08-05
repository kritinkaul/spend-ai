import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Minus, DollarSign, Building, Car, CreditCard, Home, Laptop, PiggyBank, Edit2, Trash2, Save, X } from 'lucide-react';
import { formatCompactCurrency } from '../../lib/utils';

interface Asset {
  id: string;
  name: string;
  value: number;
  category: 'cash' | 'investments' | 'property' | 'vehicles' | 'other';
  icon: any;
  color: string;
}

interface Liability {
  id: string;
  name: string;
  amount: number;
  category: 'credit-cards' | 'loans' | 'mortgage' | 'other';
  icon: any;
  color: string;
}

interface NetWorthTrackerProps {
  className?: string;
}

export default function NetWorthTracker({ className = "" }: NetWorthTrackerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingLiability, setEditingLiability] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedAssets = localStorage.getItem('net-worth-assets');
    const savedLiabilities = localStorage.getItem('net-worth-liabilities');
    
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    } else {
      // Load sample data
      setAssets([
        {
          id: 'checking-account',
          name: 'Checking Account',
          value: 2500,
          category: 'cash',
          icon: Wallet,
          color: 'green'
        },
        {
          id: 'savings-account',
          name: 'Savings Account',
          value: 15000,
          category: 'cash',
          icon: PiggyBank,
          color: 'blue'
        },
        {
          id: 'car-value',
          name: '2019 Honda Civic',
          value: 18000,
          category: 'vehicles',
          icon: Car,
          color: 'purple'
        }
      ]);
    }
    
    if (savedLiabilities) {
      try {
        setLiabilities(JSON.parse(savedLiabilities));
      } catch (error) {
        console.error('Error loading liabilities:', error);
      }
    } else {
      // Load sample data
      setLiabilities([
        {
          id: 'credit-card-debt',
          name: 'Credit Card Debt',
          amount: 3200,
          category: 'credit-cards',
          icon: CreditCard,
          color: 'red'
        },
        {
          id: 'student-loan',
          name: 'Student Loan',
          amount: 12000,
          category: 'loans',
          icon: Building,
          color: 'orange'
        }
      ]);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('net-worth-assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('net-worth-liabilities', JSON.stringify(liabilities));
  }, [liabilities]);

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetCategories = {
    cash: { name: 'Cash & Savings', icon: Wallet, color: 'text-green-600' },
    investments: { name: 'Investments', icon: TrendingUp, color: 'text-blue-600' },
    property: { name: 'Real Estate', icon: Home, color: 'text-purple-600' },
    vehicles: { name: 'Vehicles', icon: Car, color: 'text-orange-600' },
    other: { name: 'Other Assets', icon: Laptop, color: 'text-gray-600' }
  };

  const liabilityCategories = {
    'credit-cards': { name: 'Credit Cards', icon: CreditCard, color: 'text-red-600' },
    loans: { name: 'Loans', icon: Building, color: 'text-orange-600' },
    mortgage: { name: 'Mortgage', icon: Home, color: 'text-purple-600' },
    other: { name: 'Other Debts', icon: DollarSign, color: 'text-gray-600' }
  };

  const addAsset = (name: string, value: number, category: Asset['category']) => {
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name,
      value,
      category,
      icon: assetCategories[category].icon,
      color: assetCategories[category].color.replace('text-', '').replace('-600', '')
    };
    setAssets(prev => [...prev, newAsset]);
    setShowAddAsset(false);
  };

  const addLiability = (name: string, amount: number, category: Liability['category']) => {
    const newLiability: Liability = {
      id: `liability-${Date.now()}`,
      name,
      amount,
      category,
      icon: liabilityCategories[category].icon,
      color: liabilityCategories[category].color.replace('text-', '').replace('-600', '')
    };
    setLiabilities(prev => [...prev, newLiability]);
    setShowAddLiability(false);
  };

  const updateAsset = (id: string, name: string, value: number) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, name, value } : asset
    ));
    setEditingAsset(null);
  };

  const updateLiability = (id: string, name: string, amount: number) => {
    setLiabilities(prev => prev.map(liability => 
      liability.id === id ? { ...liability, name, amount } : liability
    ));
    setEditingLiability(null);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const deleteLiability = (id: string) => {
    setLiabilities(prev => prev.filter(liability => liability.id !== id));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-teal-600" />
              Net Worth Tracker
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Track your assets and liabilities
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Worth</p>
            <p className={`text-xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCompactCurrency(netWorth)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Net Worth Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
            <p className="text-lg font-bold text-green-600">{formatCompactCurrency(totalAssets)}</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Liabilities</p>
            <p className="text-lg font-bold text-red-600">{formatCompactCurrency(totalLiabilities)}</p>
          </div>
          
          <div className={`text-center p-4 rounded-lg ${netWorth >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
            <DollarSign className={`h-6 w-6 mx-auto mb-2 ${netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Net Worth</p>
            <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCompactCurrency(netWorth)}
            </p>
          </div>
        </div>

        {/* Assets Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Assets ({assets.length})
            </h4>
            <button
              onClick={() => setShowAddAsset(true)}
              className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
            >
              <Plus className="h-3 w-3" />
              Add Asset
            </button>
          </div>

          <div className="space-y-2">
            {assets.map(asset => (
              <AssetLiabilityItem
                key={asset.id}
                id={asset.id}
                name={asset.name}
                amount={asset.value}
                category={assetCategories[asset.category]}
                isEditing={editingAsset === asset.id}
                onEdit={() => setEditingAsset(asset.id)}
                onSave={(name, value) => updateAsset(asset.id, name, value)}
                onCancel={() => setEditingAsset(null)}
                onDelete={() => deleteAsset(asset.id)}
                type="asset"
              />
            ))}
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              Liabilities ({liabilities.length})
            </h4>
            <button
              onClick={() => setShowAddLiability(true)}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
            >
              <Plus className="h-3 w-3" />
              Add Liability
            </button>
          </div>

          <div className="space-y-2">
            {liabilities.map(liability => (
              <AssetLiabilityItem
                key={liability.id}
                id={liability.id}
                name={liability.name}
                amount={liability.amount}
                category={liabilityCategories[liability.category]}
                isEditing={editingLiability === liability.id}
                onEdit={() => setEditingLiability(liability.id)}
                onSave={(name, amount) => updateLiability(liability.id, name, amount)}
                onCancel={() => setEditingLiability(null)}
                onDelete={() => deleteLiability(liability.id)}
                type="liability"
              />
            ))}
          </div>
        </div>

        {/* Add Asset Modal */}
        {showAddAsset && (
          <AddItemModal
            title="Add Asset"
            categories={assetCategories}
            onAdd={addAsset}
            onCancel={() => setShowAddAsset(false)}
            type="asset"
          />
        )}

        {/* Add Liability Modal */}
        {showAddLiability && (
          <AddItemModal
            title="Add Liability"
            categories={liabilityCategories}
            onAdd={addLiability}
            onCancel={() => setShowAddLiability(false)}
            type="liability"
          />
        )}
      </div>
    </div>
  );
}

// Asset/Liability Item Component
interface AssetLiabilityItemProps {
  id: string;
  name: string;
  amount: number;
  category: { name: string; icon: any; color: string };
  isEditing: boolean;
  onEdit: () => void;
  onSave: (name: string, amount: number) => void;
  onCancel: () => void;
  onDelete: () => void;
  type: 'asset' | 'liability';
}

function AssetLiabilityItem({ 
  name, amount, category, isEditing, onEdit, onSave, onCancel, onDelete, type 
}: AssetLiabilityItemProps) {
  const [editName, setEditName] = useState(name);
  const [editAmount, setEditAmount] = useState(amount.toString());

  const IconComponent = category.icon;

  const handleSave = () => {
    const value = parseFloat(editAmount);
    if (!isNaN(value) && value >= 0 && editName.trim()) {
      onSave(editName.trim(), value);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <IconComponent className={`h-4 w-4 ${category.color}`} />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
            placeholder="Name"
          />
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
            placeholder="Amount"
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
          >
            <Save className="h-3 w-3" />
          </button>
          <button
            onClick={onCancel}
            className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/30 rounded"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div className="flex items-center gap-3">
        <IconComponent className={`h-4 w-4 ${category.color}`} />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{category.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className={`font-semibold ${type === 'asset' ? 'text-green-600' : 'text-red-600'}`}>
          {formatCompactCurrency(amount)}
        </p>
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// Add Item Modal Component
interface AddItemModalProps {
  title: string;
  categories: any;
  onAdd: (name: string, amount: number, category: any) => void;
  onCancel: () => void;
  type: 'asset' | 'liability';
}

function AddItemModal({ title, categories, onAdd, onCancel, type }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(Object.keys(categories)[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!isNaN(value) && value >= 0 && name.trim()) {
      onAdd(name.trim(), value, category);
      setName('');
      setAmount('');
      setCategory(Object.keys(categories)[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={type === 'asset' ? 'Savings Account' : 'Credit Card Debt'}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(categories).map(([key, cat]: [string, any]) => (
                <option key={key} value={key}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                type === 'asset' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Add {type === 'asset' ? 'Asset' : 'Liability'}
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