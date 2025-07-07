import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transactionService';
import { AppError } from '../utils/AppError';

export const getAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    if (!userId) {
      return next(new AppError('User not found, please log in.', 401));
    }

    const [summaryData, categoryData, transactions] = await Promise.all([
      transactionService.getAnalytics(userId),
      transactionService.getCategories(userId),
      transactionService.getTransactions(userId)
    ]);

    const spendingByCategory = categoryData.map(c => ({
      name: c.category,
      value: c.total_amount
    }));

    const spendingOverTime = transactions
      .filter(t => t.amount.isNegative())
      .reduce((acc, t) => {
        const month = new Date(t.date).toISOString().slice(0, 7);
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.spent += t.amount.abs().toNumber();
        } else {
          acc.push({ month, spent: t.amount.abs().toNumber(), income: 0 });
        }
        return acc;
      }, [] as { month: string, spent: number, income: number }[]);

    transactions
      .filter(t => t.amount.isPositive())
      .forEach(t => {
        const month = new Date(t.date).toISOString().slice(0, 7);
        const existing = spendingOverTime.find(item => item.month === month);
        if (existing) {
          existing.income += t.amount.toNumber();
        } else {
          spendingOverTime.push({ month, spent: 0, income: t.amount.toNumber() });
        }
      });
    
    spendingOverTime.sort((a, b) => a.month.localeCompare(b.month));

    const categoryBreakdown = categoryData.reduce((acc, c) => {
      acc[c.category] = c.total_amount;
      return acc;
    }, {} as Record<string, number>);


    res.json({
      success: true,
      data: {
        summary: {
          totalSpent: summaryData.total_spent,
          totalIncome: summaryData.total_earned,
          netAmount: summaryData.total_earned - summaryData.total_spent,
          spendingScore: 75, // Placeholder for now
        },
        categoryBreakdown,
        recentTransactions: transactions.slice(0, 5).map(t => ({...t, amount: t.amount.toNumber()})),
        charts: {
          spendingByCategory,
          spendingOverTime,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: {
        totalSpent: 2500.00,
        totalIncome: 3500.00,
        netAmount: 1000.00,
        spendingScore: 75,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAllUserData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    if (!userId) {
      return next(new AppError('User not found, please log in.', 401));
    }
    await transactionService.deleteAllData(userId);
    
    res.status(200).json({ success: true, message: 'All user data has been deleted.' });
  } catch (error) {
    next(error);
  }
}; 