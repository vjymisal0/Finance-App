export interface Transaction {
  id: string;
  name: string;
  email: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  type: 'Income' | 'Expense';
  category: string;
  avatar: string;
  userId?: string;
  description?: string;
}

export interface MetricCard {
  title: string;
  amount: number;
  icon: string;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface ChartData {
  month: string;
  income: number;
  expenses: number;
  netIncome?: number;
  transactionCount?: number;
}

export interface FilterOptions {
  dateRange: 'all' | '7days' | '30days' | '90days';
  status: 'all' | 'completed' | 'pending' | 'failed';
  type: 'all' | 'income' | 'expense';
  category: 'all' | string;
  user: 'all' | string;
  amountRange: {
    min: number;
    max: number;
  };
}

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ExportConfig {
  columns: string[];
  dateRange: {
    start: string;
    end: string;
  };
  filters: FilterOptions;
  format: 'csv' | 'xlsx';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  pagination?: PaginationOptions;
}

export interface ChartSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  avgTransactionAmount: number;
  topCategory: {
    name: string;
    amount: number;
  } | null;
  growthRate: number;
}