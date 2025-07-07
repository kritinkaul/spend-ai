const express = require('express');
const { readTransactions } = require('../controllers/uploadController');
const moment = require('moment');

const router = express.Router();

// GET /api/analytics
router.get('/analytics', (req, res) => {
  try {
    const transactions = readTransactions();
    
    if (!transactions.length) {
      return res.json({
        analytics: {
          total_transactions: 0,
          total_spent: 0,
          total_earned: 0,
          avg_expense: 0,
          earliest_date: null,
          latest_date: null
        }
      });
    }

    // Calculate analytics from real data
    const expenses = transactions.filter(t => t.amount < 0);
    const income = transactions.filter(t => t.amount >= 0);
    
    const totalSpent = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const totalEarned = income.reduce((sum, t) => sum + t.amount, 0);
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
    
    // Get date range
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
    const earliestDate = dates.length > 0 ? moment(dates[0]).format('YYYY-MM-DD') : null;
    const latestDate = dates.length > 0 ? moment(dates[dates.length - 1]).format('YYYY-MM-DD') : null;

    const analytics = {
      total_transactions: transactions.length,
      total_spent: Math.round(totalSpent * 100) / 100,
      total_earned: Math.round(totalEarned * 100) / 100,
      avg_expense: Math.round(avgExpense * 100) / 100,
      earliest_date: earliestDate,
      latest_date: latestDate
    };

    console.log('📊 Returning real analytics data:', analytics);
    res.json({ analytics });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ error: 'Failed to calculate analytics' });
  }
});

module.exports = router; 