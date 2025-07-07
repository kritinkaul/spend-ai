// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Upload types
export interface Upload {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadRequest {
  file: any; // Will be properly typed when multer types are available
}

export interface UploadResponse {
  upload: Upload;
  message: string;
}

// Transaction types
export interface Transaction {
  id: string;
  uploadId: string;
  userId: string;
  date: Date;
  description: string;
  amount: number;
  category?: string;
  subcategory?: string;
  merchant?: string;
  isRecurring: boolean;
  frequency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  merchant?: string;
}

// Analysis types
export interface Analysis {
  id: string;
  userId: string;
  period: string;
  totalSpent: number;
  totalIncome: number;
  netAmount: number;
  categoryBreakdown: Record<string, number>;
  topMerchants: Record<string, number>;
  recurringPayments: Record<string, number>;
  spendingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRequest {
  userId: string;
  period?: string;
}

export interface AnalysisResponse {
  analysis: Analysis;
  transactions: Transaction[];
}

// Insight types
export interface Insight {
  id: string;
  userId: string;
  type: 'SPENDING_ALERT' | 'SAVINGS_OPPORTUNITY' | 'SUBSCRIPTION_DETECTED' | 'UNUSUAL_SPENDING' | 'BUDGET_BREACH' | 'POSITIVE_TREND';
  title: string;
  description: string;
  category?: string;
  amount?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsightRequest {
  userId: string;
  analysis: Analysis;
  transactions: Transaction[];
}

export interface InsightResponse {
  insights: Insight[];
}

// Category types
export interface Category {
  name: string;
  keywords: string[];
  color: string;
  icon: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// File processing types
export interface FileProcessingResult {
  transactions: ParsedTransaction[];
  metadata: {
    totalTransactions: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    totalAmount: number;
  };
}

// AI types
export interface AIInsightRequest {
  transactions: Transaction[];
  analysis: Analysis;
  userContext?: {
    income?: number;
    goals?: string[];
    riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface AIInsightResponse {
  insights: {
    type: string;
    title: string;
    description: string;
    category?: string;
    amount?: number;
    priority: string;
    actionable: boolean;
    actionItems?: string[];
  }[];
}

// Dashboard types
export interface DashboardData {
  summary: {
    totalSpent: number;
    totalIncome: number;
    netAmount: number;
    spendingScore: number;
    topCategories: Array<{ name: string; amount: number; percentage: number }>;
  };
  recentTransactions: Transaction[];
  insights: Insight[];
  charts: {
    spendingByCategory: Array<{ category: string; amount: number }>;
    spendingOverTime: Array<{ date: string; amount: number }>;
    incomeVsExpenses: Array<{ month: string; income: number; expenses: number }>;
  };
} 