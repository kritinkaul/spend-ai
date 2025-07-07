import express from 'express';
import { prisma } from '../db/prisma';
import { transactionService } from '../services/transactionService';

const router = express.Router();

// Default user ID for system operations (no authentication)
const DEFAULT_USER_ID = 'system-user';

router.delete('/all-data', async (req, res, next) => {
  try {
    await transactionService.deleteAllData(DEFAULT_USER_ID);
    res.json({ success: true, message: 'All data deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Move analytics to /api/analytics route (matches frontend expectations)
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await transactionService.getAnalytics(DEFAULT_USER_ID);
    res.json({ analytics });
  } catch (error) {
    next(error);
  }
});

export default router; 