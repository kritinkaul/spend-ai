import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Sample',
      lastName: 'User',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample transactions
  const sampleTransactions = [
    {
      date: new Date('2024-01-15'),
      description: 'Grocery Store',
      amount: 85.50,
      category: 'Food & Dining',
      subcategory: 'Groceries',
      merchant: 'Whole Foods',
      isRecurring: false,
    },
    {
      date: new Date('2024-01-16'),
      description: 'Gas Station',
      amount: 45.00,
      category: 'Transportation',
      subcategory: 'Fuel',
      merchant: 'Shell',
      isRecurring: false,
    },
    {
      date: new Date('2024-01-17'),
      description: 'Netflix Subscription',
      amount: 15.99,
      category: 'Entertainment',
      subcategory: 'Streaming',
      merchant: 'Netflix',
      isRecurring: true,
      frequency: 'monthly',
    },
    {
      date: new Date('2024-01-18'),
      description: 'Coffee Shop',
      amount: 4.50,
      category: 'Food & Dining',
      subcategory: 'Coffee',
      merchant: 'Starbucks',
      isRecurring: false,
    },
    {
      date: new Date('2024-01-19'),
      description: 'Amazon Purchase',
      amount: 29.99,
      category: 'Shopping',
      subcategory: 'Online',
      merchant: 'Amazon',
      isRecurring: false,
    },
  ];

  // Create an upload record
  const upload = await prisma.upload.create({
    data: {
      userId: user.id,
      fileName: 'sample-transactions.csv',
      fileType: 'CSV',
      fileSize: 1024,
      status: 'COMPLETED',
    },
  });

  // Create transactions
  for (const transaction of sampleTransactions) {
    await prisma.transaction.create({
      data: {
        ...transaction,
        uploadId: upload.id,
        userId: user.id,
      },
    });
  }

  console.log('✅ Created sample transactions');

  // Create sample analysis
  const analysis = await prisma.analysis.create({
    data: {
      userId: user.id,
      period: '2024-01',
      totalSpent: 180.98,
      totalIncome: 0,
      netAmount: -180.98,
      categoryBreakdown: JSON.stringify({
        'Food & Dining': 90.00,
        'Transportation': 45.00,
        'Entertainment': 15.99,
        'Shopping': 29.99,
      }),
      topMerchants: JSON.stringify({
        'Whole Foods': 85.50,
        'Shell': 45.00,
        'Amazon': 29.99,
        'Netflix': 15.99,
        'Starbucks': 4.50,
      }),
      recurringPayments: JSON.stringify({
        'Netflix': 15.99,
      }),
      spendingScore: 75,
    },
  });

  console.log('✅ Created sample analysis');

  // Create sample insights
  const insights = [
    {
      type: 'SPENDING_ALERT',
      title: 'High Grocery Spending',
      description: 'Your grocery spending is 20% higher than last month. Consider meal planning to reduce costs.',
      category: 'Food & Dining',
      amount: 85.50,
      priority: 'HIGH',
    },
    {
      type: 'RECURRING_PAYMENT',
      title: 'Recurring Subscription Found',
      description: 'You have a Netflix subscription that renews monthly for $15.99.',
      category: 'Entertainment',
      amount: 15.99,
      priority: 'MEDIUM',
    },
    {
      type: 'SAVINGS_OPPORTUNITY',
      title: 'Coffee Spending',
      description: 'You spend $4.50 on coffee. Consider brewing at home to save money.',
      category: 'Food & Dining',
      amount: 4.50,
      priority: 'LOW',
    },
  ];

  for (const insight of insights) {
    await prisma.insight.create({
      data: {
        ...insight,
        userId: user.id,
      },
    });
  }

  console.log('✅ Created sample insights');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 