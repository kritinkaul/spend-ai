import { prisma } from '../db/prisma';
import fs from 'fs';
import csvParser from 'csv-parser';
import pdfParse from 'pdf-parse';
import { AppError } from '../utils/AppError';
import { Decimal } from '@prisma/client/runtime/library';

interface TransactionData {
  date: string;
  description: string;
  amount: number;
  // ... other fields as per your CSV/PDF structure
}

interface CsvData {
    Date: string;
    Description: string;
    Amount: string;
}

function isValidData(data: any): data is CsvData {
    return data && typeof data.Date === 'string' && typeof data.Description === 'string' && typeof data.Amount === 'string';
}

class TransactionService {
  public async processFile(uploadId: string, filePath: string, fileType: string, userId: string) {
    try {
      await prisma.upload.update({
        where: { id: uploadId },
        data: { status: 'PROCESSING' as const },
      });

      const transactions = await this.parseFile(filePath, fileType);
      
      const transactionPromises = transactions.map(t => {
        return prisma.transaction.create({
          data: {
            uploadId,
            userId,
            date: new Date(t.date),
            description: t.description,
            amount: t.amount,
          },
        });
      });
      
      await Promise.all(transactionPromises);

      await prisma.upload.update({
        where: { id: uploadId },
        data: { status: 'COMPLETED' as const },
      });

    } catch (error) {
      await prisma.upload.update({
        where: { id: uploadId },
        data: { status: 'FAILED' as const },
      });
      console.error(`Failed to process file ${filePath}`, error);
    }
  }

  private async parseFile(filePath: string, fileType: string): Promise<TransactionData[]> {
    if (fileType === 'text/csv') {
      return this.parseCSV(filePath);
    } else if (fileType === 'application/pdf') {
      return this.parsePDF(filePath);
    } else {
      throw new AppError('Unsupported file type', 400);
    }
  }

  private parseCSV(filePath: string): Promise<TransactionData[]> {
    return new Promise((resolve, reject) => {
      const results: TransactionData[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data: unknown) => {
            if (isValidData(data)) {
                const amount = parseFloat(data.Amount);
                if (!isNaN(amount)) {
                    results.push({
                        date: data.Date,
                        description: data.Description,
                        amount: amount,
                    });
                }
            }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async parsePDF(filePath: string): Promise<TransactionData[]> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Basic text extraction - this will need to be very robust
    // This is a placeholder and will likely need significant work based on the PDF format
    const transactions: TransactionData[] = [];
    const lines = data.text.split('\n');

    // Example parsing logic - highly dependent on PDF structure
    lines.forEach(line => {
      const parts = line.split(/\s+/);
      // e.g. "2023-01-15 Starbucks -12.50"
      if (parts.length >= 3 && /\d{4}-\d{2}-\d{2}/.test(parts[0])) {
          const date = parts[0];
          const amount = parseFloat(parts[parts.length - 1]);
          const description = parts.slice(1, -1).join(' ');

          if(!isNaN(amount)) {
            transactions.push({ date, description, amount });
          }
      }
    });

    return transactions;
  }

  public async deleteAllData(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { uploads: true }});

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const uploadIds = user.uploads.map(u => u.id);

    // Delete associated transactions first due to foreign key constraints
    await prisma.transaction.deleteMany({
      where: {
        uploadId: {
          in: uploadIds,
        },
      },
    });

    // Then delete the uploads
    await prisma.upload.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  public async getTransactions(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return transactions;
  }

  public async getAnalytics(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const totalTransactions = transactions.length;
    const totalSpent = transactions
      .filter(t => t.amount.isNegative())
      .reduce((sum, t) => sum.plus(t.amount.abs()), new Decimal(0));
    const totalEarned = transactions
      .filter(t => t.amount.isPositive())
      .reduce((sum, t) => sum.plus(t.amount), new Decimal(0));
    const expenses = transactions.filter(t => t.amount.isNegative());
    const avgExpense = expenses.length > 0
      ? totalSpent.dividedBy(expenses.length)
      : new Decimal(0);
    
    const dates = transactions.map(t => t.date).sort();
    const earliestDate = dates[0]?.toISOString() || new Date().toISOString();
    const latestDate = dates[dates.length - 1]?.toISOString() || new Date().toISOString();

    return {
      total_transactions: totalTransactions,
      total_spent: totalSpent.toNumber(),
      total_earned: totalEarned.toNumber(),
      avg_expense: avgExpense.toNumber(),
      earliest_date: earliestDate,
      latest_date: latestDate,
    };
  }

  public async getCategories(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const categoryMap = new Map<string, { count: number; total: Decimal }>();
    
    transactions.filter(t => t.amount.isNegative()).forEach(t => {
      const category = t.category || 'Uncategorized';
      const amount = t.amount.abs();
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        existing.count += 1;
        existing.total = existing.total.plus(amount);
      } else {
        categoryMap.set(category, { count: 1, total: amount });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        transaction_count: data.count,
        total_amount: data.total.toNumber(),
      }))
      .sort((a, b) => b.total_amount - a.total_amount);
  }
}

export const transactionService = new TransactionService(); 