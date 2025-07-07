import { Request, Response, NextFunction } from 'express';

export const generateInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: {
        insights: [
          {
            type: 'SPENDING_ALERT',
            title: 'High Food Spending',
            description: 'You\'re spending 32% on food this month...',
            priority: 'HIGH',
            actionable: true,
            actionItems: ['Try meal planning', 'Use grocery apps'],
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: {
        insights: [
          {
            id: '1',
            type: 'SPENDING_ALERT',
            title: 'High Food Spending',
            description: 'You\'re spending 32% on food this month...',
            priority: 'HIGH',
            isRead: false,
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
}; 