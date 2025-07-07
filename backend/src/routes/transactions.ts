import express from 'express';
import { transactionService } from '../services/transactionService';

const router = express.Router();

// Default user ID for system operations (no authentication)
const DEFAULT_USER_ID = 'system-user';

// Get all transactions for a user
router.get('/', async (req, res, next) => {
  try {
    const transactions = await transactionService.getTransactions(DEFAULT_USER_ID);
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

// Get categories for a user
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await transactionService.getCategories(DEFAULT_USER_ID);
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

export default router; 