import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
console.log('🔧 Frontend API_URL:', API_URL);

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  category?: string;
  date: string;
  type: string;
}

export interface Analytics {
  total_transactions: number;
  total_spent: number;
  total_earned: number;
  avg_expense: number;
  earliest_date: string;
  latest_date: string;
}

export interface Category {
  category: string;
  transaction_count: number;
  total_amount: number;
}

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await axios.get(`${API_URL}/api/transactions`);
    return response.data.transactions;
  },

  getAnalytics: async (): Promise<Analytics> => {
    const response = await axios.get(`${API_URL}/api/analytics`);
    return response.data.analytics;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/api/transactions/categories`);
    return response.data.categories;
  },

  deleteAllData: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${API_URL}/api/analysis/all-data`);
    return response.data;
  }
}; 