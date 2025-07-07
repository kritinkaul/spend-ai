const express = require('express');
const { readTransactions } = require('../controllers/uploadController');
const moment = require('moment');

const router = express.Router();

// GET /api/transactions
router.get('/transactions', (req, res) => {
  try {
    const transactions = readTransactions();
    
    // Sort transactions by date (most recent first)
    const sortedTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(transaction => ({
        id: transaction.id,
        user_id: 1, // Default user for compatibility
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
        isRecurring: transaction.isRecurring,
        merchant: transaction.merchant,
        uploadId: transaction.uploadId
      }));

    console.log(`💰 Returning ${sortedTransactions.length} real transactions`);
    res.json({ transactions: sortedTransactions });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// GET /api/transactions/categories
router.get('/transactions/categories', (req, res) => {
  try {
    const transactions = readTransactions();
    
    if (!transactions.length) {
      return res.json({ categories: [] });
    }

    // Group transactions by category and calculate totals
    const categoryMap = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category: category,
          transaction_count: 0,
          total_amount: 0
        };
      }
      
      categoryMap[category].transaction_count++;
      categoryMap[category].total_amount += transaction.amount;
    });

    // Convert to array and round amounts
    const categories = Object.values(categoryMap)
      .map(cat => ({
        ...cat,
        total_amount: Math.round(cat.total_amount * 100) / 100
      }))
      .sort((a, b) => Math.abs(b.total_amount) - Math.abs(a.total_amount)); // Sort by absolute amount

    console.log(`📊 Returning ${categories.length} real categories`);
    res.json({ categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// GET /api/transactions/monthly
router.get('/transactions/monthly', (req, res) => {
  try {
    const transactions = readTransactions();
    
    if (!transactions.length) {
      return res.json({ monthly: [] });
    }

    // Group transactions by month
    const monthlyMap = {};
    
    transactions.forEach(transaction => {
      const monthKey = moment(transaction.date).format('YYYY-MM');
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          net: 0,
          transaction_count: 0
        };
      }
      
      if (transaction.amount >= 0) {
        monthlyMap[monthKey].income += transaction.amount;
      } else {
        monthlyMap[monthKey].expenses += Math.abs(transaction.amount);
      }
      
      monthlyMap[monthKey].net += transaction.amount;
      monthlyMap[monthKey].transaction_count++;
    });

    // Convert to array and sort by month
    const monthly = Object.values(monthlyMap)
      .map(month => ({
        ...month,
        income: Math.round(month.income * 100) / 100,
        expenses: Math.round(month.expenses * 100) / 100,
        net: Math.round(month.net * 100) / 100
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    console.log(`📈 Returning ${monthly.length} months of data`);
    res.json({ monthly });
  } catch (error) {
    console.error('Error getting monthly data:', error);
    res.status(500).json({ error: 'Failed to get monthly data' });
  }
});

module.exports = router; 