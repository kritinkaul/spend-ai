import { Category } from '../types';

export const EXPENSE_CATEGORIES = [
  {
    name: 'Food & Dining',
    keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'food', 'dining', 'grocery'],
    color: '#FF6B6B',
    icon: '🍽️'
  },
  {
    name: 'Transportation',
    keywords: ['uber', 'lyft', 'gas', 'fuel', 'parking', 'toll', 'car'],
    color: '#4ECDC4',
    icon: '🚗'
  },
  {
    name: 'Shopping',
    keywords: ['amazon', 'walmart', 'target', 'best buy', 'online', 'retail'],
    color: '#45B7D1',
    icon: '🛍️'
  },
  {
    name: 'Entertainment',
    keywords: ['netflix', 'spotify', 'hulu', 'movie', 'theater', 'game'],
    color: '#96CEB4',
    icon: '🎬'
  },
  {
    name: 'Health & Fitness',
    keywords: ['gym', 'doctor', 'pharmacy', 'medical', 'insurance'],
    color: '#FFEAA7',
    icon: '💊'
  },
  {
    name: 'Housing',
    keywords: ['rent', 'mortgage', 'utilities', 'electric', 'gas', 'water'],
    color: '#DDA0DD',
    icon: '🏠'
  },
  {
    name: 'Other',
    keywords: ['misc', 'other', 'unknown'],
    color: '#BDC3C7',
    icon: '📦'
  }
];

export const categorizeTransaction = (description: string, amount: number): string => {
  const lowerDescription = description.toLowerCase();
  
  if (amount > 0) {
    return 'Income';
  }

  for (const category of EXPENSE_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (lowerDescription.includes(keyword.toLowerCase())) {
        return category.name;
      }
    }
  }

  return 'Other';
};

export const getCategoryColor = (categoryName: string): string => {
  const category = EXPENSE_CATEGORIES.find(cat => cat.name === categoryName);
  return category?.color || '#BDC3C7';
};

export const getCategoryIcon = (categoryName: string): string => {
  const category = EXPENSE_CATEGORIES.find(cat => cat.name === categoryName);
  return category?.icon || '📦';
}; 